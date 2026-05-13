'use client';

import { CustomFormField } from '@/components/FormField';
import Header from '@/components/Header';
import { Form } from '@/components/ui/form';
import { PropertyFormData, propertySchema } from '@/lib/schemas';
import { useCreatePropertyMutation } from '@/state/api';
import { PropertyTypeEnum, AmenityEnum } from '@/lib/constants';
import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';

const NewProperty = () => {
	const [createProperty] = useCreatePropertyMutation();
	// const { data: authUser } = useGetAuthUserQuery();

	const form = useForm<PropertyFormData>({
		resolver: zodResolver(propertySchema),
		defaultValues: {
			name: '',
			description: '',
			photoUrls: [],
			amenities: '',
			address: '',
			city: '',
			state: '',
			country: '',
			postalCode: '',
		},
	});

	const onSubmit = async (data: PropertyFormData) => {
		const formData = new FormData();
		Object.entries(data).forEach(([key, value]) => {
			if (key === 'photoUrls') {
				const files = value as File[];
				files.forEach((file: File) => {
					formData.append('photos', file);
				});
			} else if (Array.isArray(value)) {
				formData.append(key, JSON.stringify(value));
			} else {
				formData.append(key, String(value));
			}
		});

		await createProperty(formData);
	};

	return (
		<div className="dashboard-container">
			<Header
				title="Adauga Magazin Nou"
				subtitle="Creeaza un nou magazin pentru baza de date cu informatii detaliate"
			/>
			<div className="bg-white rounded-xl p-6">
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="p-4 space-y-10"
					>
						{/* Basic Information */}
						<div>
							<h2 className="text-lg font-semibold mb-4">Informatii de baza</h2>
							<div className="space-y-4">
								<CustomFormField name="name" label="Nume Magazin" />
								<CustomFormField
									name="description"
									label="Descriere"
									type="textarea"
								/>
							</div>
						</div>

						<hr className="my-6 border-gray-200" />

						{/* Property Details */}
						<div className="space-y-6">
							<h2 className="text-lg font-semibold mb-4">Detalii Magazin</h2>
							<div className="mt-4">
								<CustomFormField
									name="propertyType"
									label="Tip Magazin"
									type="select"
									options={Object.keys(PropertyTypeEnum).map((type) => ({
										value: type,
										label: type,
									}))}
								/>
							</div>
						</div>

						<hr className="my-6 border-gray-200" />

						{/* Amenities */}
						<div>
							<h2 className="text-lg font-semibold mb-4">Facilitati</h2>
							<div className="space-y-6">
								<CustomFormField
									name="amenities"
									label="Facilitati"
									type="select"
									options={Object.keys(AmenityEnum).map((amenity) => ({
										value: amenity,
										label: amenity,
									}))}
								/>
							</div>
						</div>

						<hr className="my-6 border-gray-200" />

						{/* Photos */}
						<div>
							<h2 className="text-lg font-semibold mb-4">Fotografii</h2>
							<CustomFormField
								name="photoUrls"
								label="Poze Magazin"
								type="file"
								accept="image/*"
							/>
						</div>

						<hr className="my-6 border-gray-200" />

						{/* Additional Information */}
						<div className="space-y-6">
							<h2 className="text-lg font-semibold mb-4">
								Informatii suplimentare
							</h2>
							<CustomFormField name="address" label="Adresa" />
							<div className="flex justify-between gap-4">
								<CustomFormField name="city" label="Oras" className="w-full" />
								<CustomFormField
									name="state"
									label="Judet"
									className="w-full"
								/>
								<CustomFormField
									name="postalCode"
									label="Cod Postal"
									className="w-full"
								/>
							</div>
							<CustomFormField name="country" label="Tara" />
						</div>

						<Button
							type="submit"
							className="bg-primary-700 text-white w-full mt-8"
						>
							Creeaza Magazin
						</Button>
					</form>
				</Form>
			</div>
		</div>
	);
};

export default NewProperty;
