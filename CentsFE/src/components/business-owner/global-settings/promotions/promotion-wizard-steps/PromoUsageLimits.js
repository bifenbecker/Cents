import React from 'react';

// Commons
import TextField from '../../../../commons/textField/textField';

const PromoUsageLimits = (props) => {
	const { newPromoDetails: { usageLimits } } = props;
	return (
		<div className="promo-usage-container">
			<p className="promo-usage-header">Are there any limits to how many times this discount can be used?</p>
			<div className="promo-usage-options-container">
				<div className="promo-usage-option">
					<input
						type="radio"
						name="usage-option"
						value="none"
						checked={usageLimits.usageType === 'none'}
						onChange={(evt) => {
							props.setUsageLimits(evt.target.value, 'usageType');
						}}
					/>
					<p>None</p>
				</div>
				<div className="promo-usage-option">
					<input
						type="radio"
						name="usage-option"
						value="one-per-customer"
						checked={usageLimits.usageType === 'one-per-customer'}
						onChange={(evt) => {
							props.setUsageLimits(evt.target.value, 'usageType');
						}}
					/>
					<p>Limit one use per customer</p>
				</div>
				<div className="promo-usage-option">
					<input
						type="radio"
						name="usage-option"
						value="multiple-per-customer"
						checked={usageLimits.usageType === 'multiple-per-customer'}
						onChange={(evt) => {
							props.setUsageLimits(evt.target.value, 'usageType');
						}}
					/>
					<p>Limit multiple uses per customer</p>
				</div>
				{usageLimits.usageType === 'multiple-per-customer' ? (
					<TextField
						value={usageLimits.usageValue}
						onChange={(evt) => {
							props.setUsageLimits(evt.target.value, 'usageValue');
						}}
						maxLength={3}
					/>
				) : null}
				{usageLimits.usageType === 'multiple-per-customer' && usageLimits.usageValue < 2 && usageLimits.usageValue !== '' ? (
					<p className="promotion-value-error usageValue">Multiple uses must be 2 or above</p>
				) : (
					<div className="promotion-value-spacer" />
				)}
			</div>
		</div>
	);
};

export default PromoUsageLimits;
