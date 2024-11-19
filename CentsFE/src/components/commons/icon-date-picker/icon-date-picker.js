import React, { useState, useEffect, useRef } from 'react';
import {DayPickerRangeController, DayPickerSingleDateController} from 'react-dates';
import moment from 'moment';
import { isString } from 'lodash';
import PropTypes from 'prop-types';

import 'react-dates/lib/css/_datepicker.css';
// As of react-dates version 13.0.0, we need to import the below to initialize styling classes.
import 'react-dates/initialize';

import ToggleSwitch from '../toggle-switch/toggleSwitch';


const IconDatePicker = (props) => {

  const [isOpen, setIsOpen] = useState(false);
  const [rangeCalFocusedInput, setRangeCalFocusedInput] = useState(null);
  const [dayCalFocused, setDayCalFocused] = useState(true);
  const mountedRef = useRef(false);

  const {
    className,
    icon,
    hasEndDate,
    startDate,
    endDate,
    onDateChange,
    onHasEndDateChange,
    numberOfMonths,
  } = props;


  useEffect(()=>{
    const clickHandler = (e) => {
      
      let isClickedInCalendarContainer = false;

      for(let element of e.path){
        if( isString(element.className) && (element.className?.includes('calendar-container') || element.className?.includes('icon-date-picker'))){
          isClickedInCalendarContainer = true;
        };
      }

      if(!isClickedInCalendarContainer){
        setIsOpen(false);
      }
    }
    document.addEventListener('click', clickHandler);

    return () => {
      document.removeEventListener('click', clickHandler);
    }
  },[]);

  useEffect(() => {
    if(!isOpen){
      setRangeCalFocusedInput(null);
    }

    setRangeCalFocusedInput('startDate');
  }, [setRangeCalFocusedInput, isOpen]);

  useEffect(() => {
    if (mountedRef.current) {
      if (!hasEndDate) {
        onDateChange({
          startDate: startDate,
          endDate: null,
        });
      } else if (startDate) {
        setRangeCalFocusedInput("endDate");
      }
    }
  }, [hasEndDate]); // eslint-disable-line react-hooks/exhaustive-deps
  // Disabled es-lint warning to prevent onDateChange being called every time startDate changes

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const handleDatesChange = (datesObj) => {
    if(!hasEndDate){
      onDateChange({
        startDate: datesObj ? datesObj.format('YYYY-MM-DDT00:00:00.000[Z]') : null,
        endDate: null,
      });
    } else {
      onDateChange({
        startDate: datesObj.startDate ? datesObj.startDate.format('YYYY-MM-DDT00:00:00.000[Z]') : null,
        endDate: datesObj.endDate ? datesObj.endDate.format('YYYY-MM-DDT23:59:59.000[Z]') : null,
      });
    }
  }

  const renderCalendar = () => {
    let momentStartDate = startDate ? moment(startDate).subtract(moment().utcOffset(), 'minutes') : null;
    let momentEndDate = endDate ? moment(endDate).subtract(moment().utcOffset(), 'minutes') : null;
    if(props.hasEndDate){
      return <DayPickerRangeController
        startDate={momentStartDate}
        endDate={momentEndDate}
        onDatesChange={handleDatesChange}
        focusedInput={rangeCalFocusedInput}
        onFocusChange={focusedInput => {setRangeCalFocusedInput(focusedInput || 'startDate')}}
        numberOfMonths={ numberOfMonths || 2}
        isOutsideRange={day => day < moment().startOf('day') ? true : false }
        minimumNights={0}
      />;
    }
    return <DayPickerSingleDateController
      date={momentStartDate}
      onDateChange={handleDatesChange}
      onFocusChange={() => setDayCalFocused(true)} // Forcing it be focused as per docs
      focused={dayCalFocused}
      numberOfMonths={ numberOfMonths || 2}
      isOutsideRange={day => day < moment().startOf('day') ? true : false}
    />;
  }

  const getFormattedDate = (date, isEndDate) => {
    if(!date){
      return `${isEndDate ? 'End' : 'Start'} Date`
    }
    return moment(date).subtract(moment().utcOffset(), 'minutes').format('MM/DD/YYYY');
  }

  const renderDateString = () => {
    return `${!hasEndDate && startDate ? 'Starts ' : ''} ${getFormattedDate(startDate, false)} ${hasEndDate ? ` -> ${getFormattedDate(endDate, true)}` : ''}`
  }

  return(
    <div 
      className={`icon-date-picker ${className ? className : ''} ${isOpen ? 'open' : ''} ${hasEndDate ? 'hasEndDate': ''}`}
      onClick={()=>{setIsOpen(!isOpen)}}
    >
      {icon && <img className={'icon'} alt={'icon'} src={icon}/>}
      <p className='date-text'>{renderDateString()}</p>
      {
        isOpen &&
        <div className='calendar-container'>
          {renderCalendar()}
          <div className='calendar-footer' onClick={e=>e.stopPropagation()}>
            <ToggleSwitch 
              checked={hasEndDate}
              onChange={(value)=>{onHasEndDateChange && onHasEndDateChange(value)}}
            />
            <p>Add an end date</p>
          </div>
        </div>
      }

      <p className='custom-indicator'>{'>'}</p>
  </div>
  )
}


IconDatePicker.propTypes = {
  className: PropTypes.string,
    icon: PropTypes.string,
    hasEndDate: PropTypes.bool,
    startDate: PropTypes.string,
    endDate: PropTypes.string,
    onDateChange: PropTypes.func.isRequired,
    onHasEndDateChange: PropTypes.func.isRequired,
    numberOfMonths: PropTypes.number,
}

export default IconDatePicker;
