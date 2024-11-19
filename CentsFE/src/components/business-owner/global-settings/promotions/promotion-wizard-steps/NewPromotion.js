import React from 'react';

// Icons
import promoCodeIcon from '../../../../../assets/images/Icon_Promo_Code.svg';

// Commons
import TextField from '../../../../commons/textField/textField';

const NewPromotion = (props) => {
	const { newPromoDetails: { promotionCode, promotionTypes } } = props;
	return (
		<div className="new-promotion-container">
			<p className="new-promotion-header">Name your promotion</p>
			<div className="new-promotion-form-input-container">
			<img src={promoCodeIcon} alt="icon" className="new-promotion-icon"/>
				<TextField
					label="Promotion Code"
					value={promotionCode}
					onChange={(evt) => {
						props.setPromotionCode(evt.target.value);
					}}
					onBlur={(evt) => {
						props.setPromotionCode(evt.target.value.toUpperCase());
					}}
					maxLength="30"
				/>
			</div>
			<p className="new-promotion-header">Choose promotion type:</p>
			<div className="new-promotion-types-container">
				{promotionTypes.map((promoType, index) => (
					<button
						className={`new-promotion-type-item ${promoType.active ? 'active' : 'inactive'}`}
						key={index}
						onClick={() => {
							props.setPromotionType(promoType);
						}}
						disabled={[ 2, 3 ].includes(index)}
					>
						<p>{promoType.label}</p>
					</button>
				))}
			</div>
		</div>
	);
};

export default NewPromotion;
