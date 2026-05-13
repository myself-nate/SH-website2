import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface FiltersState {
	location: string;
	propertyType: string;
	amenities: string[];
	coordinates: [number, number];
}

interface InitialStateTypes {
	filters: FiltersState;
	isFiltersFullOpen: boolean;
	viewMode: 'grid' | 'list';
}

export const initialState: InitialStateTypes = {
	filters: {
		location: 'Buzau',
		// location: 'Los Angeles',
		propertyType: 'any',
		amenities: [],
		coordinates: [26.82, 45.15],
		// coordinates: [-118.25, 34.05],
	},
	isFiltersFullOpen: false,
	viewMode: 'grid',
};

export const globalSlice = createSlice({
	name: 'global',
	initialState,
	reducers: {
		setFilters: (state, action: PayloadAction<Partial<FiltersState>>) => {
			state.filters = { ...state.filters, ...action.payload };
		},
		toggleFiltersFullOpen: (state) => {
			state.isFiltersFullOpen = !state.isFiltersFullOpen;
		},
		setViewMode: (state, action: PayloadAction<'grid' | 'list'>) => {
			state.viewMode = action.payload;
		},
	},
});

export const { setFilters, toggleFiltersFullOpen, setViewMode } =
	globalSlice.actions;

export default globalSlice.reducer;
