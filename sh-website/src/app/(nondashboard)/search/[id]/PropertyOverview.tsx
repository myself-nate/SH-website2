import { useGetPropertyQuery } from '@/state/api';
import { MapPin, Star } from 'lucide-react';
import React from 'react';

const PropertyOverview = ({ propertyId }: PropertyOverviewProps) => {
	const {
		data: property,
		isError,
		isLoading,
		status,
	} = useGetPropertyQuery(propertyId);

	if (isLoading) return <>Se incarca...</>;
	if (isError || !property) {
		return <>Locatie negasita</>;
	}

	return (
		<div>
			<div className="mb-4">
				<div className="text-sm text-gray-500 mb-1">
					{property.location?.country} / {property.location?.state} /{' '}
					<span className="font-semibold text-gray-600">
						{property.location?.city}
					</span>
				</div>
				<h1 className="text-3xl font-bold my-5">{property.name}</h1>
				<div className="flex justify-between items-center">
					<span className="flex items-center text-gray-500">
						<MapPin className="w-4 h-4 mr-1 text-gray-700" />
						{property.location?.city}, {property.location?.state},{' '}
						{property.location?.country}
					</span>
					<div className="flex justify-between items-center gap-3">
						{/* <span className="flex items-center text-yellow-500">
							<Star className="w-4 h-4 mr-1 fill-current" />
							{property.averageRating.toFixed(1)} ({property.numberOfReviews}{' '}
							Reviews)
						</span> */}
						<span className="text-green-600">Locatie verificata</span>
					</div>
				</div>
			</div>

			{/* Summary */}
			<div className="my-16">
				<h2 className="text-xl font-semibold mb-5">Despre {property.name}</h2>
				<p className="text-gray-500 leading-7">
					{property.description}
					„Bine ai venit la {property.name} – locul unde stilul contemporan
					îmbrățișează natura. Povestea noastră a început în 2020, dintr-o
					dorință simplă, dar puternică: să demonstrăm că moda poate fi atât
					frumoasă, cât și responsabilă. Fiecare piesă din magazinul nostru este
					creată din materiale eco-friendly, precum bumbac organic, fibre de
					bambus și poliester reciclat. De la hanoracele oversized, perfecte
					pentru zilele leneșe de acasă, la rochiile vaporoase de vară și blugii
					comozi, dar rezistenți – colecția noastră este gândită pentru omul
					modern, care prețuiește calitatea, confortul și originea etică a
					hainelor. La {property.name}, nu vinzi doar haine. Oferim o atitudine:
					una de slow fashion, de consum conștient și de bucurie pură în
					simplitate. Intrați pe website, explorați culorile pământii și
					texturile prietenoase. Pentru că fiecare fir contează – la fel ca și
					alegerile tale.”
				</p>
			</div>
		</div>
	);
};

export default PropertyOverview;
