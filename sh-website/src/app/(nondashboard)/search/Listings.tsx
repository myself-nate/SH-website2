import Card from '@/components/Card';
import CardCompact from '@/components/CardCompact';
import { useGetPropertiesQuery } from '@/state/api';
import { useAppSelector } from '@/state/redux';
import { Property } from '@/types/prismaTypes';
import React from 'react';

const Listings = () => {
	const viewMode = useAppSelector((state) => state.global.viewMode);
	const filters = useAppSelector((state) => state.global.filters);

	const {
		data: properties,
		isLoading,
		isError,
	} = useGetPropertiesQuery(filters);

	if (isLoading) return <>Se incarca...</>;
	if (isError || !properties) return <div>Nu s-a putut incarca locatiile</div>;

	return (
		<div className="w-full">
			<h3 className="text-sm px-4 font-bold">
				{properties.length}{' '}
				<span className="text-gray-700 font-normal">
					locatii in {filters.location}
				</span>
			</h3>
			<div className="flex">
				<div className="p-4 w-full">
					{properties?.map((property) =>
						viewMode === 'grid' ? (
							<Card
								key={property.id}
								property={property}
								// isFavorite={
								//     authUser?.userInfo.favorites.some(
								//         (fav: Property) => fav.id === property.id
								//     ) || false
								// }
								propertyLink={`search/${property.id}`}
							/>
						) : (
							<CardCompact
								key={property.id}
								property={property}
								// isFavorite={
								//     authUser?.userInfo.favorites.some(
								//         (fav: Property) => fav.id === property.id
								//     ) || false
								// }
								propertyLink={`search/${property.id}`}
							/>
						),
					)}
				</div>
			</div>
		</div>
	);
};

export default Listings;
