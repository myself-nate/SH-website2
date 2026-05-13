import 'dotenv/config';
import { PrismaClient, Prisma } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a PostgreSQL connection pool
const pool = new pg.Pool({
	connectionString: process.env.DATABASE_URL,
}) as any;

// Create Prisma adapter
const adapter = new PrismaPg(pool);

// Initialize Prisma Client with the adapter
const prisma = new PrismaClient({
	adapter,
	log: ['query', 'info', 'warn', 'error'],
});

function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

function toPascalCase(str: string): string {
	return str.charAt(0).toUpperCase() + str.slice(1);
}

function toCamelCase(str: string): string {
	return str.charAt(0).toLowerCase() + str.slice(1);
}

async function insertLocationData(locations: any[]) {
	for (const location of locations) {
		const { id, country, city, state, address, postalCode, coordinates } =
			location;
		try {
			let pointText = coordinates;
			if (Array.isArray(coordinates)) {
				pointText = `POINT(${coordinates[0]} ${coordinates[1]})`;
			}

			await prisma.$executeRaw`
        INSERT INTO "Location" ("id", "country", "city", "state", "address", "postalCode", "coordinates") 
        VALUES (${id}, ${country}, ${city}, ${state}, ${address}, ${postalCode}, ST_GeomFromText(${pointText}, 4326)::geography);
      `;
			console.log(`✅ Inserted location for ${city}`);
		} catch (error) {
			console.error(`❌ Error inserting location for ${city}:`, error);
		}
	}
}

async function resetSequence(modelName: string) {
	const quotedModelName = `"${toPascalCase(modelName)}"`;

	try {
		const maxIdResult = await (prisma as any)[toCamelCase(modelName)].findMany({
			select: { id: true },
			orderBy: { id: 'desc' },
			take: 1,
		});

		if (maxIdResult.length === 0) return;

		const nextId = maxIdResult[0].id + 1;
		await prisma.$executeRaw(
			Prisma.raw(`
        SELECT setval(pg_get_serial_sequence('${quotedModelName}', 'id'), coalesce(max(id)+1, ${nextId}), false) FROM ${quotedModelName};
      `),
		);
		console.log(`Reset sequence for ${modelName} to ${nextId}`);
	} catch (error) {
		console.error(`Error resetting sequence for ${modelName}:`, error);
	}
}

async function deleteAllData(orderedFileNames: string[]) {
	const modelNames = orderedFileNames.map((fileName) => {
		return toPascalCase(path.basename(fileName, path.extname(fileName)));
	});

	for (const modelName of modelNames.reverse()) {
		const modelNameCamel = toCamelCase(modelName);
		const model = (prisma as any)[modelNameCamel];
		if (!model) {
			console.error(`Model ${modelName} not found in Prisma client`);
			continue;
		}
		try {
			await model.deleteMany({});
			console.log(`Cleared data from ${modelName}`);
		} catch (error) {
			console.error(`Error clearing data from ${modelName}:`, error);
		}
	}
}

async function testConnection() {
	try {
		await prisma.$connect();
		console.log('✅ Database connected successfully');

		const result = await prisma.$queryRaw`SELECT PostGIS_version()`;
		console.log('✅ PostGIS is enabled');
	} catch (error) {
		console.error('❌ Database connection failed:', error);
		throw error;
	}
}

async function main() {
	await testConnection();

	const dataDirectory = path.join(__dirname, 'seedData');

	const orderedFileNames = [
		'location.json',
		// 'manager.json',
		'property.json',
		// 'tenant.json',
		// 'lease.json',
		// 'application.json',
		// 'payment.json',
	];

	if (!fs.existsSync(dataDirectory)) {
		console.error(`❌ Seed data directory not found: ${dataDirectory}`);
		console.log(`Current directory: ${__dirname}`);
		process.exit(1);
	}

	await deleteAllData(orderedFileNames);

	for (const fileName of orderedFileNames) {
		const filePath = path.join(dataDirectory, fileName);

		if (!fs.existsSync(filePath)) {
			console.warn(`⚠️  File ${fileName} not found, skipping...`);
			continue;
		}

		const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
		const modelName = toPascalCase(
			path.basename(fileName, path.extname(fileName)),
		);
		const modelNameCamel = toCamelCase(modelName);

		if (modelName === 'Location') {
			await insertLocationData(jsonData);
		} else {
			const model = (prisma as any)[modelNameCamel];
			if (!model) {
				console.error(`❌ Model ${modelName} not found in Prisma client`);
				continue;
			}

			try {
				for (const item of jsonData) {
					await model.create({
						data: item,
					});
				}
				console.log(`✅ Seeded ${modelName} with data from ${fileName}`);
			} catch (error) {
				console.error(`❌ Error seeding data for ${modelName}:`, error);
			}
		}

		await resetSequence(modelName);
		await sleep(1000);
	}

	console.log('🎉 Seeding completed successfully!');
}

main()
	.catch((e) => {
		console.error('❌ Seeding failed:', e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
