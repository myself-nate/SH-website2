import { cleanParams } from '@/lib/utils';
import { Property } from '@/types/prismaTypes';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { FiltersState } from '.';

export const api = createApi({
	baseQuery: fetchBaseQuery({
		baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
	}),
	reducerPath: 'api',
	tagTypes: ['Properties', 'PropertyDetails'],
	endpoints: (build) => ({
		// property related endpoints
		getProperties: build.query<
			Property[],
			Partial<FiltersState> //& { favoriteIds?: number[] }
		>({
			query: (filters) => {
				const params = cleanParams({
					location: filters.location,
					propertyType: filters.propertyType,
					amenities: filters.amenities,
					latitude: filters.coordinates?.[1],
					longitude: filters.coordinates?.[0],
				});

				return { url: 'properties', params };
			},
			providesTags: (result) =>
				result
					? [
							...result.map(({ id }) => ({ type: 'Properties' as const, id })),
							{ type: 'Properties', id: 'LIST' },
						]
					: [{ type: 'Properties', id: 'LIST' }],
		}),

		getProperty: build.query<Property, number>({
			query: (id) => `properties/${id}`,
			providesTags: (result, error, id) => [{ type: 'PropertyDetails', id }],
		}),

		createProperty: build.mutation<Property, FormData>({
			query: (NewProperty) => ({
				url: `properties`,
				method: 'POST',
				body: NewProperty,
			}),
			invalidatesTags: (result) => [
				{ type: 'Properties', id: 'LIST' },
				// {type: 'Managers', id: result?.manager?.id},
			],
		}),
	}),
});

export const {
	useGetPropertiesQuery,
	useGetPropertyQuery,
	useCreatePropertyMutation,
} = api;
