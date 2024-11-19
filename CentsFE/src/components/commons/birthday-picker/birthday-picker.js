import React from 'react';
import _ from 'lodash';


const BirthdayPicker = React.forwardRef((props, ref) => {
    
    const month_day_count_mapping = {
        1: 31,
        2: 29,
        3: 31,
        4: 30,
        5: 31,
        6: 30,
        7: 31,
        8: 31,
        9: 30,
        10: 31,
        11: 30,
        12: 31
    }

    const get_zero_prepended_string = (num) => {
        if(num < 10){
            return `0${num}`;
        }
        else{
            return `${num}`;
        }
    }

    // This function accepts birthday string in MM/DD format
    // and return the date string
    const get_date_from_birthday = (birthday) => {
        if(_.isNil(birthday)){
            return "DD"
        }
        let stringArr = birthday.split("/");
        if(stringArr && stringArr.length === 2){
            let month = stringArr[0] ? stringArr[0] : "MM";
            let day = stringArr[1] ? stringArr[1] : "DD";
            if(month === "MM" || parseInt(day) > month_day_count_mapping[parseInt(month)] ){
                return "DD";
            }
            return day;
        }
        else{
            return "DD"
        }
    }
    const get_month_from_birthday = (birthday) => {
        if(_.isNil(birthday)){
            return "MM"
        }
        let stringArr = birthday.split("/");
        if(stringArr && stringArr.length === 2){
            return stringArr[0] ? stringArr[0] : "MM";
        }
        else{
            return "MM"
        }
    }

    const handleValueChange = (field, value) => {
        let newBirthday;
        let oldBirthday = props.value;
        if(field === 'month'){
            let day = get_date_from_birthday(oldBirthday);
            newBirthday = `${value}/${day}`;
            day = get_date_from_birthday(newBirthday); // To check if the day is still valid for the new month
            newBirthday = `${value}/${day}`;
            
        }
        else{
            let month = get_month_from_birthday(oldBirthday);
            newBirthday = `${month}/${value}`
        }
        console.log(newBirthday);
        if(props.onChange){
            props.onChange(newBirthday);
        }
    }

    const _render_dropdown_options = (field, birthday) => {
        let selectedMonth = get_month_from_birthday(birthday);
        let selectedDay = get_date_from_birthday(birthday);

        let count;
        let options = [];
        if(field === "month"){
            count = 12;
            options.push(
                <option
                    key = {`month-mm`}
                    className={`birthday-picker-dropdown-option}`}
                    hidden
                >
                    {"MM"}
                </option>
            )
        }
        else{
            count = month_day_count_mapping[parseInt(selectedMonth)];
            if(!count){
                count = 31;
            }

            options.push(
                <option
                    key = {`month-dd`}
                    className={`birthday-picker-dropdown-option}`}
                    hidden
                >
                    {"DD"}
                </option>
            )
        }

        for(let i = 1; i <= count; i++){
            
            // Setting is active flag
            let isActive = false;
            if( 
                (field === 'month' && parseInt(selectedMonth) === i)
                ||
                ( field === 'day' && parseInt(selectedDay) === i)
            ){
                isActive = true;
            }

            options.push(
                <option
                    key = {`${field}-${i}`}
                    className={`birthday-picker-dropdown-option${isActive ? ' active': ''}`}
                >
                    {get_zero_prepended_string(i)}
                </option>
            )
        }

        return options
    }

    return (
        <div
            className={`birthday-picker-container ${props.disabled ? "disabled" : ""}`}
            tabIndex={0}
            ref={ref}
        >
            <select 
                className = "birthday-picker-dropdown"
                onChange = {(e)=>{handleValueChange("month", e.target.value)}}
                value = { get_month_from_birthday(props.value)}
            >
                {_render_dropdown_options("month", props.value)}
            </select>            
            <span> / </span>
            <select 
                className = "birthday-picker-dropdown"
                onChange = {(e)=>{handleValueChange("day", e.target.value)}}
                value = { get_date_from_birthday(props.value) }
            >
                {_render_dropdown_options("day", props.value)}
            </select>
            
        </div>
    );
});


export default BirthdayPicker;