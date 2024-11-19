import React from 'react';

// Commons
import calendarIcon from '../../../../../assets/images/calendar.svg';
import IconDatePicker from '../../../../commons/icon-date-picker/icon-date-picker';
import IconDaysPicker from '../../../../commons/icon-days-picker/icon-days-picker';

const PromoActiveDays = ({
	activeDays,
	startDate,
	endDate,
	hasEndDate,
	onDateChange,
	onHasEndDateChange,
	setActiveDays
}) => {
	
	return (
		<div className="promo-active-days-container">
			<p className="promo-active-days-header">When will this discount be active?</p>
			<IconDatePicker
				icon={calendarIcon}
				hasEndDate={hasEndDate}
				startDate={startDate}
				endDate={endDate}
				onDateChange={onDateChange}
				onHasEndDateChange={onHasEndDateChange}
				numberOfMonths={1}
			/>
			<p className="promo-active-days-header">Which days of the week can it be used?</p>
			{/* <div>
				<LabelDropdown icon={calendarIcon} label={'Select Days'} cardContent={renderDays()} />
			</div> */}
			<IconDaysPicker
				activeDays={activeDays}
				onActiveDaysChange={(activeDays) => {
					setActiveDays(activeDays);
				}}
				showMenuAtBottom={true}
				hideIcon={false}
				icon={calendarIcon}
			/>
		</div>
	);
};

export default PromoActiveDays;
