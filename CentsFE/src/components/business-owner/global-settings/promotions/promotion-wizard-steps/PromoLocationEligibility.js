import React, { useEffect } from 'react';

// Commons
import LocationAssignDropdown from '../../../../commons/location-assign-dropdown/location-assign-dropdown';

const PromoLocationEligibility = (props) => {
	useEffect(() => {
		props.fetchLocationsList();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
	return (
		<div className="promo-loc-elig-container">
			<p className="promo-loc-elig-header">Where can this discount be used?</p>
			<div className="promo-loc-elig-options-container">
				<div className="promo-loc-elig-option">
					<input
						type="radio"
						name="eligibility-option"
						value="any-location"
						checked={props.newPromoDetails.locationEligibility === 'any-location'}
						onChange={(evt) => {
							props.setLocationEligibility(evt.target.value);
						}}
					/>
					<p>Any Location</p>
				</div>
				<div className="promo-loc-elig-option">
					<input
						type="radio"
						name="eligibility-option"
						value="specific-locations"
						checked={props.newPromoDetails.locationEligibility === 'specific-locations'}
						onChange={(evt) => {
							props.setLocationEligibility(evt.target.value);
						}}
					/>
					<p>Specific Locations</p>
				</div>
			</div>
			{props.newPromoDetails.locationEligibility === 'specific-locations' ? (
				<LocationAssignDropdown
					allLocations={props.allLocations}
					needsRegions={props.allLocations.needsRegions}
					selectedLocations={props.selectedLocations}
					onChange={(location) => {
						props.setSelectedLocation(location);
					}}
				/>
			) : null}
		</div>
	);
};

export default PromoLocationEligibility;
