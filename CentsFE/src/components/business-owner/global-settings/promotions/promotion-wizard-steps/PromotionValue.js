import React, { Fragment, useState } from 'react';

// Icons
import promoCodeIcon from '../../../../../assets/images/Icon_Promo_Code.svg';

// Commons
import TextField from '../../../../commons/textField/textField';
import ServicesAndProducts from '../../../../commons/ServicesAndProductsForPromotions/ServicesAndProductsForPromotions';
import { Modal, ModalBody, ModalFooter } from 'reactstrap';

const PromotionValue = (props) => {
	const {
		newPromoDetails: { discountValue, promotionTypes, appliesToType },
		showOrHideProductsAndServicesScreen,
		showProductsAndServicesScreen,
		setDiscountValue,
		itemsCount,
		resetServicesAndProducts,
		setAppliesToType
	} = props;
	const activePromoType = promotionTypes.find((promoType) => promoType.active).value;
	const [ showModal, setShowModal ] = useState(false);

	return (
		<div
			className={`promotion-value-container ${showProductsAndServicesScreen
				? 'services-and-products-screen'
				: null}`}
		>
			{showProductsAndServicesScreen ? (
				<ServicesAndProducts
					onClose={() => {
						setShowModal(true);
					}}
				/>
			) : (
				<Fragment>
					<p className="promotion-value-header">What is the value of this discount?</p>
					<TextField
						label="Discount Value"
						prefix={activePromoType === 'fixed-price-discount' ? '$' : null}
						suffix={activePromoType === 'percentage-discount' ? '%' : null}
						maxLength={6}
						value={discountValue}
						onChange={(evt) => {
							setDiscountValue(evt.target.value);
						}}
					/>
					{activePromoType === 'percentage-discount' && discountValue > 100 ? (
						<p className="promotion-value-error">Percentage discount cannot exceed 100%</p>
					) : (
						<div className="promotion-value-spacer" />
					)}
					<p className="promotion-value-header">Applies to:</p>
					<div className="promotion-value-applies-to-container">
						<div className="promotion-value-applies-to-item">
							<input
								type="radio"
								name="applies-to-item"
								value="entire-order"
								checked={appliesToType === 'entire-order'}
								onChange={(evt) => {
									setAppliesToType(evt.target.value);
								}}
							/>
							<p>Entire Order</p>
						</div>
						<div className="promotion-value-applies-to-item">
							<input
								type="radio"
								name="applies-to-item"
								value="specific-items"
								checked={appliesToType === 'specific-items'}
								onChange={(evt) => {
									setAppliesToType(evt.target.value);
								}}
							/>
							<p>Specific products or services</p>
						</div>
					</div>
					{appliesToType === 'specific-items' ? (
						<div
							className="promotion-value-choose-items-container"
							onClick={() => {
								showOrHideProductsAndServicesScreen(true);
							}}
						>
							<img src={promoCodeIcon} alt={'icon'} />
							<p>{itemsCount === 0 ? 'Choose items' : `${itemsCount} items selected`}</p>
						</div>
					) : null}
				</Fragment>
			)}

			<Modal
				isOpen={showModal}
				toggle={() => {
					setShowModal(!showModal);
				}}
				centered={true}
			>
				<ModalBody>Any unsaved progress will be lost. Are you sure you want to close ?</ModalBody>
				<ModalFooter>
					<button
						className="btn-theme btn-rounded save-button"
						onClick={() => {
							setShowModal(false);
						}}
					>
						GO BACK
					</button>
					<button
						className="btn-theme btn-rounded btn-transparent"
						onClick={() => {
							setShowModal(false);
							showOrHideProductsAndServicesScreen(false);
							resetServicesAndProducts();
						}}
					>
						CLOSE
					</button>
				</ModalFooter>
			</Modal>
		</div>
	);
};

export default PromotionValue;
