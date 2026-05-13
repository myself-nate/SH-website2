import {
	FiltersState,
	setFilters,
	setViewMode,
	toggleFiltersFullOpen,
} from '@/state';
import { useAppSelector } from '@/state/redux';
import { usePathname, useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { debounce } from 'lodash';
import { cleanParams, cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Filter, Grid, List, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { PropertyTypeIcons } from '@/lib/constants';

const FiltersBar = () => {
	const dispatch = useDispatch();
	const router = useRouter();
	const pathname = usePathname();
	const filters = useAppSelector((state) => state.global.filters);
	const isFiltersFullOpen = useAppSelector(
		(state) => state.global.isFiltersFullOpen,
	);
	const viewMode = useAppSelector((state) => state.global.viewMode);
	const [searchInput, setSearchInput] = useState(filters.location);

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

	const handleFilterChange = (
		key: string,
		value: any,
		// isMin: boolean | null,
	) => {
		let newValue = value;

		if (key === 'coordinates') {
			newValue = value === 'any' ? [0, 0] : value.map(Number);
		} else {
			newValue = value === 'any' ? 'any' : value;
		}

		const newFilters = { ...filters, [key]: newValue };
		dispatch(setFilters(newFilters));
		updateURL(newFilters);
	};

	const handleLocationSearch = async () => {
		try {
			const response = await fetch(
				`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
					searchInput,
				)}.json?access_token=${
					process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
				}&fuzzyMatch=true`,
			);
			const data = await response.json();
			if (data.features && data.features.length > 0) {
				const [lng, lat] = data.features[0].center;
				dispatch(
					setFilters({
						location: searchInput,
						coordinates: [lng, lat],
					}),
				);
			}
		} catch (err) {
			console.log('Error search location:', err);
		}
	};

	return (
		<div className="flex justify-between items-center w-full py-5">
			{/* Filters */}
			<div className="flex justify-between items-center gap-4 p-2">
				{/* All Filters */}
				<Button
					variant="outline"
					className={cn(
						'gap-2 rounded-xl border-primary-400 hover:bg-primary-500 hover:text-primary-100',
						isFiltersFullOpen && 'bg-primary-700 text-primary-100',
					)}
					onClick={() => dispatch(toggleFiltersFullOpen())}
				>
					<Filter className="w-4 h-4" />
					<span>All Filters</span>
				</Button>

				{/* Search Locations */}
				<div className="flex items-center">
					<Input
						placeholder="Cauta locatie"
						value={searchInput}
						onChange={(e) => setSearchInput(e.target.value)}
						className="w-40 rounded-xl rounded-r-none border-primary-400 border-r-0"
					/>
					<Button
						onClick={handleLocationSearch}
						className={
							'rounded-r-xl rounded-l-none border-l-none border-primary-400 shadow-none border hover:bg-primary-700 hover:text-primary-50'
						}
					>
						<Search className="w-4 h-4" />
					</Button>
				</div>

				{/* Property Type */}
				<Select
					value={filters.propertyType || 'any'}
					onValueChange={(value) =>
						handleFilterChange(
							'propertyType',
							value, //, null
						)
					}
				>
					<SelectTrigger className="w-32 rounded-xl border-primary-400">
						<SelectValue placeholder="Tip magazin" />
					</SelectTrigger>
					<SelectContent className="bg-white">
						<SelectItem value="any">Orice tip de magazin</SelectItem>
						{Object.entries(PropertyTypeIcons).map(([type, Icon]) => (
							<SelectItem key={type} value={type}>
								<div className="flex items-center">
									<Icon className="w-4 h-4 mr-2" />
									<span>{type}</span>
								</div>
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			{/* View Mode */}
			<div className="flex justify-between items-center gap-4 p-2">
				<div className="flex border rounded-xl">
					<Button
						variant="ghost"
						className={cn(
							'px-3 py-1 rounded-none rounded-l-xl hover:bg-primary-600 hover:text-primary-50',
							viewMode === 'list' ? 'bg-primary-700 text-primary-50' : '',
						)}
						onClick={() => dispatch(setViewMode('list'))}
					>
						<List className="w-5 h-5" />
					</Button>
					<Button
						variant="ghost"
						className={cn(
							'px-3 py-1 rounded-none rounded-r-xl hover:bg-primary-600 hover:text-primary-50',
							viewMode === 'grid' ? 'bg-primary-700 text-primary-50' : '',
						)}
						onClick={() => dispatch(setViewMode('grid'))}
					>
						<Grid className="w-5 h-5" />
					</Button>
				</div>
			</div>
		</div>
	);
};

export default FiltersBar;
