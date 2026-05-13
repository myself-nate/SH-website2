import { cleanParams, cn, formatEnumString } from '@/lib/utils';
import { FiltersState, initialState, setFilters } from '@/state';
import { useAppSelector } from '@/state/redux';
import { usePathname, useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { debounce } from 'lodash';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { AmenityIcons, PropertyTypeIcons } from '@/lib/constants';
import { Label } from '@aws-amplify/ui-react';

const FiltersFull = () => {
	const dispatch = useDispatch();
	const router = useRouter();
	const pathname = usePathname();
	const filters = useAppSelector((state) => state.global.filters);
	const [localFilters, setLocalFilters] = useState(initialState.filters);
	const isFiltersFullOpen = useAppSelector(
		(state) => state.global.isFiltersFullOpen,
	);

	const updateURL = debounce((newFilters: FiltersState) => {
		const cleanFilters = cleanParams(newFilters);
		const updatedSearchParams = new URLSearchParams();

		Object.entries(cleanFilters).forEach(([keyframes, value]) => {
			updatedSearchParams.set(
				keyframes,
				Array.isArray(value) ? value.join(',') : value.toString(),
			);
		});

		router.push(`${pathname}?${updatedSearchParams.toString()}`);
	});

	const handleSubmit = () => {
		dispatch(setFilters(localFilters));
		updateURL(localFilters);
	};

	const handleReset = () => {
		setLocalFilters(initialState.filters);
		dispatch(setFilters(initialState.filters));
		updateURL(initialState.filters);
	};

	const handleAmenityChange = (amenity: AmenityEnum) => {
		setLocalFilters((prev) => ({
			...prev,
			amenities: prev.amenities.includes(amenity)
				? prev.amenities.filter((a) => a !== amenity)
				: [...prev.amenities, amenity],
		}));
	};

	const handleLocationSearch = async () => {
		try {
			const response = await fetch(
				`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
					localFilters.location,
				)}.json?access_token=${
					process.env.NEXT_PUBLIC_ACCESS_TOKEN
				}&fuzzyMatch=true`,
			);
			const data = await response.json();
			if (data.features && data.features.length > 0) {
				const [lng, lat] = data.features[0].center;
				setLocalFilters((prev) => ({
					...prev,
					coordinates: [lng, lat],
				}));
			}
		} catch (err) {
			console.log('Error search location:', err);
		}
	};

	if (!isFiltersFullOpen) return null;

	return (
		<div className="bg-white rounded-lg px-4 h-full overflow-auto pb-10">
			<div className="flex flex-col space-y-6">
				{/* Location */}
				<div>
					<h4 className="font-bold mb-2">Location</h4>
					<div className="flex items-center">
						<Input
							placeholder="Introdu locatia"
							value={filters.location}
							onChange={(e) =>
								setLocalFilters((prev) => ({
									...prev,
									location: e.target.value,
								}))
							}
							className="rounded-l-xl rounded-r-none border-r-0"
						/>
						<Button
							onClick={handleLocationSearch}
							className="rounded-r-xl rounded-l-none border-l-none border-black shadow-none border hover:bg-primary-700 hover:text-primary-50"
						>
							<Search className="w-4 h-4" />
						</Button>
					</div>
				</div>

				{/* Property Type */}
				<div>
					<h4 className="font-bold mb-2">Tip magazin</h4>
					<div className="grid grid-cols-2 gap-4">
						{Object.entries(PropertyTypeIcons).map(([type, Icon]) => (
							<div
								key={type}
								className={cn(
									'flex flex-col items-center justify-center p-4 border rounded-xl cursor-pointer',
									localFilters.propertyType === type
										? 'border-black!'
										: 'border-gray-200!',
								)}
								onClick={() =>
									setLocalFilters((prev) => ({
										...prev,
										propertyType: type as PropertyTypeEnum,
									}))
								}
							>
								<Icon className="w-6 h-6 mb-2" />
								<span>{type}</span>
							</div>
						))}
					</div>
				</div>

				{/* Amenities */}
				<div>
					<h4 className="font-bold mb-2">Facilitati</h4>
					<div className="flex flex-wrap gap-2">
						{Object.entries(AmenityIcons).map(([amenity, Icon]) => (
							<div
								key={amenity}
								className={cn(
									'flex items-center space-x-2 p-2 border rounded-lg hover:cursor-pointer',
									localFilters.amenities.includes(amenity as AmenityEnum)
										? 'border-black!'
										: 'border-gray-200!',
								)}
								onClick={() => handleAmenityChange(amenity as AmenityEnum)}
							>
								<Icon className="w-5 h-5 hover:cursor-pointer" />
								<Label className="hover:cursor-pointer">
									{formatEnumString(amenity)}
								</Label>
							</div>
						))}
					</div>
				</div>

				{/* Apply and Reset buttons */}
				<div className="flex gap-4 mt-6">
					<Button
						onClick={handleSubmit}
						className="flex-1 bg-primary-700 text-white rounded-xl"
					>
						APLICA
					</Button>
					<Button
						onClick={handleReset}
						variant="outline"
						className="flex-1 rounded-xl"
					>
						Reseteaza filtre
					</Button>
				</div>
			</div>
		</div>
	);
};

export default FiltersFull;
