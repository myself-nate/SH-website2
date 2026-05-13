import {
	Wifi,
	Waves,
	Dumbbell,
	Car,
	PawPrint,
	Tv,
	Thermometer,
	Cigarette,
	Cable,
	Maximize,
	Bath,
	Phone,
	Sprout,
	Hammer,
	Bus,
	Mountain,
	VolumeX,
	Home,
	Warehouse,
	Building,
	Castle,
	Trees,
	LucideIcon,
	Shirt,
	Toilet,
	CupSoda,
} from 'lucide-react';

export enum AmenityEnum {
	CabineDeProba = 'CabineDeProba',
	Toaleta = 'Toaleta',
	ApaPotabila = 'ApaPotabila',
	WiFi = 'WiFi',
}

export const AmenityIcons: Record<AmenityEnum, LucideIcon> = {
	CabineDeProba: Shirt,
	Toaleta: Toilet,
	ApaPotabila: CupSoda,
	// HighSpeedInternet: Wifi,
	// HardwoodFloors: Home,
	// WalkInClosets: Maximize,
	// Microwave: Tv,
	// Refrigerator: Thermometer,
	// Pool: Waves,
	// Gym: Dumbbell,
	// Parking: Car,
	// PetsAllowed: PawPrint,
	WiFi: Wifi,
};

export enum HighlightEnum {
	HighSpeedInternetAccess = 'HighSpeedInternetAccess',
	WasherDryer = 'WasherDryer',
	AirConditioning = 'AirConditioning',
	Heating = 'Heating',
	SmokeFree = 'SmokeFree',
	CableReady = 'CableReady',
	SatelliteTV = 'SatelliteTV',
	DoubleVanities = 'DoubleVanities',
	TubShower = 'TubShower',
	Intercom = 'Intercom',
	SprinklerSystem = 'SprinklerSystem',
	RecentlyRenovated = 'RecentlyRenovated',
	CloseToTransit = 'CloseToTransit',
	GreatView = 'GreatView',
	QuietNeighborhood = 'QuietNeighborhood',
}

export const HighlightIcons: Record<HighlightEnum, LucideIcon> = {
	HighSpeedInternetAccess: Wifi,
	WasherDryer: Waves,
	AirConditioning: Thermometer,
	Heating: Thermometer,
	SmokeFree: Cigarette,
	CableReady: Cable,
	SatelliteTV: Tv,
	DoubleVanities: Maximize,
	TubShower: Bath,
	Intercom: Phone,
	SprinklerSystem: Sprout,
	RecentlyRenovated: Hammer,
	CloseToTransit: Bus,
	GreatView: Mountain,
	QuietNeighborhood: VolumeX,
};

export enum PropertyTypeEnum {
	SHStore = 'SHStore',
	ClothingShop = 'ClothingShop',
	NormalStore = 'NormalStore',
	Store = 'Store',
	LuxuryStore = 'LuxuryStore',
	TinyStore = 'TinyStore',
}

export const PropertyTypeIcons: Record<PropertyTypeEnum, LucideIcon> = {
	SHStore: Home,
	ClothingShop: Warehouse,
	NormalStore: Building,
	Store: Castle,
	LuxuryStore: Home,
	TinyStore: Trees,
};

// Add this constant at the end of the file
export const NAVBAR_HEIGHT = 49; // in pixels

// Test users for development
export const testUsers = {
	tenant: {
		username: 'Carol White',
		userId: 'us-east-2:76543210-90ab-cdef-1234-567890abcdef',
		signInDetails: {
			loginId: 'carol.white@example.com',
			authFlowType: 'USER_SRP_AUTH',
		},
	},
	tenantRole: 'tenant',
	manager: {
		username: 'John Smith',
		userId: 'us-east-2:12345678-90ab-cdef-1234-567890abcdef',
		signInDetails: {
			loginId: 'john.smith@example.com',
			authFlowType: 'USER_SRP_AUTH',
		},
	},
	managerRole: 'manager',
};
