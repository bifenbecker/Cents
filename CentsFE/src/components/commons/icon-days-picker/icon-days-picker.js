import React from 'react';
import {capitalize} from 'lodash';
import PropTypes from 'prop-types';

import LabelDropdown from '../label-dropdown/label-dropdown';
import Checkbox from '../checkbox/checkbox';


const IconDaysPicker = (props) => {

  let {
    activeDays,
    onActiveDaysChange,
    showShortDays,
    showMenuAtBottom,
    hideIcon,
    icon,
    className,
  } = props;

  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const daysShort = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

  const handleItemClick = (clickedDay) => {
    if(!activeDays){
      onActiveDaysChange([clickedDay]);
      return;
    }

    if(activeDays.includes(clickedDay)){
      onActiveDaysChange(activeDays.filter(day=> clickedDay !== day ));
    } else {
      let newActiveDays = [...activeDays, clickedDay];
      onActiveDaysChange(newActiveDays);
    }
  }

  const getLabel = () => {
    let numberOfSelectedDays = activeDays ? activeDays.length : 0;
    if (numberOfSelectedDays) {
      return (
        <p>{`${numberOfSelectedDays === days.length ? "All" : numberOfSelectedDays} Day${
          numberOfSelectedDays !== 1 ? "s" : ""
        } Selected`}</p>
      );
    } else {
      return <p className="grey-text">Select Days</p>;
    }
  };

  const renderDays = () => {
    let selectedDays = activeDays || [];
    let activeDayCount = selectedDays.length;
		let formattedDays = days.map((dayItem, index) => {
			return (
				<div
					key={`${dayItem}-${index}`}
					className={`common-list-item`}
					onClick={() => {
						handleItemClick(dayItem);
					}}
				>
					<Checkbox checked={selectedDays.includes(dayItem)} />
					<p> {capitalize( showShortDays ? daysShort[index] : dayItem)} </p>
				</div>
			);
		});
		formattedDays.unshift(
			<div className="header">
				<p>
					{'Days'}
					<span>
						({activeDayCount}/{7})
					</span>
				</p>
			</div>
		);
		return formattedDays;
  };
  

  return <LabelDropdown
    icon={icon}
    label={getLabel()}
    cardContent={renderDays()} 
    className={`icon-days-picker ${showMenuAtBottom ? 'bottom-menu' : ''} ${hideIcon ? 'no-icon' : ''} ${className ? className : ''}`}
  />

}

IconDaysPicker.propTypes = {
  activeDays: PropTypes.array.isRequired,
  onActiveDaysChange: PropTypes.func.isRequired,
  showShortDays: PropTypes.bool,
  showMenuAtBottom: PropTypes.bool,
  hideIcon: PropTypes.bool,
  icon: PropTypes.bool,
  className: PropTypes.string,
}


export default IconDaysPicker;
