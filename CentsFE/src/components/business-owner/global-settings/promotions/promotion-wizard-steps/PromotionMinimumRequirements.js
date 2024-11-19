import React from 'react';

// Commons
import TextField from '../../../../commons/textField/textField';

const PromotionMinimumRequirements = (props) => {
	const { newPromoDetails: { minRequirements: { reqType, reqValues: { minPurchaseAmount, minQuantity } } } } = props;
	return (
		<div className="promo-min-req-container">
			<p className="promo-min-req-header">Are there any minimum requirements?</p>
			<div className="promo-min-req-options-container">
				<div className="promo-min-req-option">
					<input
						type="radio"
						name="min-req-option"
						value="none"
						checked={reqType === 'none'}
						onChange={(evt) => {
							props.setMinRequirements(evt.target);
						}}
					/>
					<p>None</p>
				</div>
				<div className="promo-min-req-option-with-input">
					<div className="promo-min-req-option">
						<input
							type="radio"
							name="min-req-option"
							value="min-purchase-amount"
							checked={reqType === 'min-purchase-amount'}
							onChange={(evt) => {
								props.setMinRequirements(evt.target);
							}}
						/>
						<p>Minimum purchase amount</p>
					</div>
					{reqType === 'min-purchase-amount' ? (
						<div className="promo-min-req-input">
							<TextField
								prefix="$"
								name="minPurchaseAmount"
								value={minPurchaseAmount}
								onChange={(evt) => {
									props.setMinRequirements(evt.target);
								}}
								maxLength={6}
							/>
						</div>
					) : null}
				</div>
				<div className="promo-min-req-option-with-input">
					<div className="promo-min-req-option">
						<input
							type="radio"
							name="min-req-option"
							value="min-quantity"
							checked={reqType === 'min-quantity'}
							onChange={(evt) => {
								props.setMinRequirements(evt.target);
							}}
						/>
						<p>Minimum quantity of items</p>
					</div>
					{reqType === 'min-quantity' ? (
						<div className="promo-min-req-input">
							<TextField
								label="Quantity"
								name="minQuantity"
								value={minQuantity}
								onChange={(evt) => {
									props.setMinRequirements(evt.target);
								}}
								maxLength={3}
							/>
						</div>
					) : null}
				</div>
			</div>
		</div>
	);
};

export default PromotionMinimumRequirements;
