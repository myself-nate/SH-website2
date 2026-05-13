import type { Request, Response } from 'express';
import { Prisma, PrismaClient } from '@prisma/client';
import { wktToGeoJSON } from '@terraformer/wkt';
import { Upload } from '@aws-sdk/lib-storage';
import { S3Client } from '@aws-sdk/client-s3';
// import { Location } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();

const s3Client = new S3Client({
	region: process.env.AWS_REGION || 'eu-central-1',
});

export const getProperties = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const { propertyType, amenities, latitude, longitude } = req.query;

		let whereConditions: Prisma.Sql[] = [];

		if (propertyType && propertyType !== 'any') {
			whereConditions.push(
				Prisma.sql`p."propertyType" = ${propertyType}::"PropertyType"`,
			);
		}

		if (amenities && amenities !== 'any') {
			const amenitiesArray = (amenities as string).split(',');
			whereConditions.push(Prisma.sql`p.amenities @> ${amenitiesArray}`);
		}

		if (latitude && longitude) {
			const lat = parseFloat(latitude as string);
			const lng = parseFloat(longitude as string);
			const radiusInKilometers = 1000;
			const degrees = radiusInKilometers / 111; //Converts km to degrees

			whereConditions.push(
				Prisma.sql`ST_DWithin(
				l.coordinates::geometry,
				ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326),
				${degrees}
				)`,
			);
		}

		const completeQuery = Prisma.sql`
			SELECT
			p.*,
			json_build_object(
				'id', l.id,
				'address', l.address,
				'city', l.city,
				'state', l.state,
				'country', l.country,
				'postalCode', l."postalCode",
				'coordinates', json_build_object(
					'longitude', ST_X(l."coordinates"::geometry),
					'latitude', ST_Y(l."coordinates"::geometry)
				)
			) as location
			 FROM "Property" p
			 JOIN "Location" l ON p."locationId" = l.id
			 ${
					whereConditions.length > 0
						? Prisma.sql`WHERE ${Prisma.join(whereConditions, ' AND ')}`
						: Prisma.empty
				}
		`;

		const properties = await prisma.$queryRaw(completeQuery);

		res.json(properties);
	} catch (error: any) {
		res
			.status(500)
			.json({ message: `Error retrieving properties: ${error.message}` });
	}
};

export const getProperty = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const { id } = req.params;
		const property = await prisma.property.findUnique({
			where: { id: Number(id) },
			include: {
				location: true,
			},
		});

		if (!property) {
			res.status(404).json({ message: 'Property not found' });
			return;
		}

		if (!property.location) {
			res.status(404).json({ message: 'Location not found for this property' });
			return;
		}

		if (property) {
			const coordinates: { coordinates: string }[] =
				await prisma.$queryRaw`SELECT ST_asText(coordinates) as coordinates from "Location" where id = ${property.location.id}`;

			if (
				!coordinates ||
				coordinates.length === 0 ||
				!coordinates[0]?.coordinates
			) {
				console.log('No coordinates found for location:', property.location.id);
				// Return property without coordinates instead of failing
				res.json(property);
				return;
			}

			const geoJSON: any = wktToGeoJSON(coordinates[0]?.coordinates || '');
			const longitude = geoJSON.coordinates[0];
			const latitude = geoJSON.coordinates[1];

			// let geoJSON: any;
			// try {
			// 	geoJSON = wktToGeoJSON(coordinates[0].coordinates);
			// } catch (wktError) {
			// 	console.error('wktToGeoJSON error:', wktError);
			// 	console.log('Raw coordinates:', coordinates[0].coordinates);
			// 	res
			// 		.status(500)
			// 		.json({ message: `Error parsing coordinates: ${wktError.message}` });
			// 	return;
			// }

			// const longitude = geoJSON.coordinates[0];
			// const latitude = geoJSON.coordinates[1];

			const propertyWithCoordinates = {
				...property,
				location: {
					...property.location,
					coordinates: {
						longitude,
						latitude,
					},
				},
			};
			res.json(propertyWithCoordinates);
		}
	} catch (err: any) {
		res
			.status(500)
			.json({ message: `Error retrieving property: ${err.message}` });
	}
};

export const createProperty = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const files = req.files as Express.Multer.File[];
		const { address, city, state, country, postalCode, ...propertyData } =
			req.body;

		// const photoUrls = await Promise.all(
		// 	files.map(async (file) => {
		// 		const uploadParams = {
		// 			Bucket: process.env.S3_BUCKET_NAME!,
		// 			Key: `properties/${Date.now()}-${file.originalname}`,
		// 			Body: file.buffer,
		// 			ContentType: file.mimetype,
		// 		};

		// 		const uploadResult = await new Upload({
		// 			client: s3Client,
		// 			params: uploadParams,
		// 		}).done();

		// 		return uploadResult.Location;
		// 	}),
		// );

		const geocodingUrl = `https://nominatim.openstreetmap.org/search?${new URLSearchParams(
			{
				street: address,
				city,
				country,
				postalcode: postalCode,
				format: 'json',
				limit: '1',
			},
		).toString()}`;
		const geocodingResponse = await axios.get(geocodingUrl, {
			headers: {
				'User-Agent': 'SHwebApp (justsomedummyemail@gmail.com',
			},
		});
		const [longitude, latitude] =
			geocodingResponse.data[0]?.lon && geocodingResponse.data[0]?.lat
				? [
						parseFloat(geocodingResponse.data[0]?.lon),
						parseFloat(geocodingResponse.data[0]?.lat),
					]
				: [0, 0];

		// create location
		type Location = Prisma.LocationGetPayload<{}>;
		const results = await prisma.$queryRaw<Location[]>`
			INSERT INTO "Location" (address, city, state, country, "postalCode", coordinates)
			VALUES (${address}, ${city}, ${state}, ${country}, ${postalCode}, ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326))
			RETURNING id, address, city, state, country, "postalCode", ST_AsText(coordinates) as coordinates;
		`;

		const location = results[0];
		if (!location) {
			throw new Error('Failed to create location');
		}

		// create property
		const newProperty = await prisma.property.create({
			data: {
				...propertyData,
				// photoUrls,
				locationId: location.id,
				amenities:
					typeof propertyData.amenities === 'string'
						? propertyData.amenities.split(',')
						: [],
				// highlights:
				// 	typeof propertyData.highlights === 'string'
				// 		? propertyData.highlights.split(',')
				// 		: [],
			},
			include: {
				location: true,
			},
		});

		res.status(201).json(newProperty);
	} catch (err: any) {
		res
			.status(500)
			.json({ message: `Error creating property: ${err.message}` });
	}
};
