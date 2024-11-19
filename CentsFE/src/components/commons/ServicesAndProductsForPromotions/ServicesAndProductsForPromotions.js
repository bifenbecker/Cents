import React, { Fragment } from 'react';
// Container
import ServicesAndProducts from '../../../containers/bo-locations-services-and-products';
// Icon
import exitIcon from '../../../assets/images/Icon_Exit_Side_Panel.svg';

const ServicesAndProductsForPromotions = (props) => {
	const { onClose, isDetails, resetPromotionsServiceProducts } = props;
	return (
		<Fragment>
			<img src={exitIcon} alt="icon" onClick={onClose} className="promotion-exit-icon" />
			<ServicesAndProducts fromPromotions={true} isDetails={isDetails} resetPromotionsServiceProducts={resetPromotionsServiceProducts}/>
		</Fragment>
	);
};

export default ServicesAndProductsForPromotions;
