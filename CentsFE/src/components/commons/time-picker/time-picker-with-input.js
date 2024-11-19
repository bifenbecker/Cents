import React, {useEffect, useMemo, useRef, useState} from "react";
import moment from "moment-timezone";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faChevronDown} from "@fortawesome/free-solid-svg-icons";
import {Dropdown, DropdownItem, DropdownMenu, DropdownToggle} from "reactstrap";
import PropTypes from "prop-types";

import {useToggle} from "../../../utils/hooks";
import {buildOption, buildInputOption, validateTimeFactory} from "./utils";

import TextField from "../textField/textField";

// const totalMins = 60 * 24;

const TimePickerWithInput = (props) => {
  const {
    value,
    showError,
    onChange,
    interval = 30,
    minTime = moment.utc().toISOString(),
    maxTime,
    nextDayLabel = "Next Day",
    label = "Time",
    required,
    className,
    small,
    includeMinTime,
    includeMaxTime,
    focusOnSelect,
    disabled,
    timezone,
    showTimezone,
    asyncValidateTimeChange,
    isWrappedComponent,
    inputFieldClassName,
    updateMaterialWrapperFocus,
    timing,
    dropdownContainerLabel,
    forceOpenMenu,
    setForceOpenMenu,
    // TODO: Should work on this later, if required.
    // excludeRanges = [],
  } = props;
  const {isOpen, toggle} = useToggle();

  const momentMinTime = useMemo(() => moment.utc(minTime).tz(timezone), [
    minTime,
    timezone,
  ]);
  const momentMaxTime = useMemo(
    () => (maxTime ? moment.utc(maxTime).tz(timezone) : null),
    [maxTime, timezone]
  );

  const [timeInputOpt, setTimeInputOpt] = useState({
    label: null,
    value: "",
  });
  const [activeOption, setActiveOption] = useState();
  const [error, setError] = useState();
  const menuRef = useRef();

  const requiredError = useMemo(() => `${label} is required`, [label]);

  useEffect(() => {
    setTimeInputOpt((state) =>
      state.value === value
        ? state
        : buildInputOption(value ? moment.utc(value).tz(timezone) : null)
    );
  }, [value, nextDayLabel, timezone]);

  useEffect(() => {
    if (forceOpenMenu && !isOpen) {
      toggle();
      setForceOpenMenu(false);
    }
  }, [forceOpenMenu, isOpen, setForceOpenMenu, toggle]);

  const options = useMemo(() => {
    if (disabled) {
      return [];
    }

    const times = [];
    const startOfTheDay = moment.utc(momentMinTime).tz(timezone).startOf("day");
    /*
      Multiplier tells the max options would be built.
      Eg: totalMins = 1440, interval = 30, multiplier = 1440/30 = 48 times.
      Add if required.
      const multiplier = totalMins / interval;
    */
    /*
      Finds out how many mins have passed
      from the start of the day to the min time given
      Eg: minTime = 10AM, diff = 10AM - 00AM = 10 hours = 600 mins
    */
    const minsPassedSinceStartOfDay = momentMinTime.diff(startOfTheDay, "minutes");

    /*
      The multiplier start will tell us from which option should we start.
      It can be calculated by dividing the diff with interval
      Eg: diff = 600, interval = 30, start multiplier = 600/30 = 20.
      If min time should be included, then ceil the multiplier.
      Eg: if min time = 10:55 => options should start from 11:00,
          if min time = 11:00 => options should start from 11:00
      If min time should not be included, then floor the multiplier and add 1.
      Eg: if min time = 10:55 => options should start from 11:00,
          if min time = 11:00 => options should start from 11:30
    */
    const multiplierStart = includeMinTime
      ? Math.ceil(minsPassedSinceStartOfDay / interval)
      : Math.floor(minsPassedSinceStartOfDay / interval) + 1;

    /*
      If maxTime is not given, then, by default, the max time would be (24 hours - 1 sec) from now.
      Eg: minTime: 10AM, then maxTime = 09:59:59 AM(Next day)
    */
    const newMaxTime =
      momentMaxTime ||
      moment.utc(momentMinTime).tz(timezone).add(1, "day").subtract(1, "second");

    /*
      Need to cap the end multiplier before given or calculated max time.
      Eg: min time = 00:00AM, maxTime = 12:00PM, start multiplier = 40, interval = 15
      end multipler = 12PM - 00AM/30 = 720mins/30 = 24
      If max time should be included, then just floor the multiplier
      Eg: if max time = 10:55 => options should end from 10:30,
          if min time = 11:00 => options should end from 11:00
      If max time should not be included, then ceil the multiplier and subtract 1.
      Eg: if max time = 10:55 => options should end from 10:30,
          if max time = 11:00 => options should end from 10:30
    */
    const maxMinsPassedSinceStartOfDay = newMaxTime.diff(startOfTheDay, "minutes");

    const multiplierEnd = includeMaxTime
      ? Math.floor(maxMinsPassedSinceStartOfDay / interval)
      : Math.ceil(maxMinsPassedSinceStartOfDay / interval) - 1;

    for (let i = multiplierStart; i <= multiplierEnd; i++) {
      /*
        Current time can be calculated by the current multipler number with interval
        and adding that number of mins to the start of the day of min time.
        Eg1: i = 02, interval = 15, time = 12:00AM + 02*15 mins = 12:30AM
        Eg2: i = 40, interval = 15, time = 12:00AM + 40*15 mins = 10:00AM
      */

      const currentTime = moment
        .utc(startOfTheDay)
        .tz(timezone)
        .add(i * interval, "minutes");
      // We are also creating refs here, so that we can use these refs
      // to bring the option into view when typed in the input
      times.push(
        buildOption(currentTime, momentMinTime, nextDayLabel, {
          ref: React.createRef(),
        })
      );
    }
    return times;
  }, [
    disabled,
    interval,
    momentMinTime,
    momentMaxTime,
    nextDayLabel,
    includeMinTime,
    includeMaxTime,
    timezone,
  ]);

  useEffect(() => {
    // When input changes, we need to scroll to an input,
    // if available, so that they can select a time if required
    if (isOpen && timeInputOpt.label) {
      const firstItem = options.find(
        (opt) => timeInputOpt.value && opt.value === timeInputOpt.value
      );
      if (firstItem?.ref) {
        /*
          For small, each option is 28px and there would be 5 options visible at a time. Hence 28*2
          There is extra 2px for the container padding and 2px of the non-visible last option.
          TODO: Need to define the same for normal size, if required.
        */
        setActiveOption(firstItem?.label);
        const additionalOffsetFromTop = 28 * 2 + 4;
        menuRef.current.scrollTo(
          0,
          firstItem.ref.current.offsetTop - additionalOffsetFromTop
        );
      } else {
        setActiveOption();
      }
    }
  }, [isOpen, timeInputOpt, options]);

  const validateTime = validateTimeFactory({
    includeMinTime,
    momentMinTime,
    includeMaxTime,
    momentMaxTime:
      momentMaxTime ||
      moment.utc(momentMinTime).tz(timezone).add(1, "day").subtract(1, "second"),
    nextDayLabel,
    timezone,
  });

  const onInputBlur = (event) => {
    // Input blur will trigger everytime, the focus of the input is gone.
    // This will happen, when we click on the dropdown item.
    // Hence, other dropdown item, if anything else is clicked,
    // then call the input blur and change the time input
    if (event.relatedTarget && event.relatedTarget.classList[0] === "dropdown-item") {
      // Force the focus after the input is updated from dropdown-item.
      // This would fix the focus jittering thing.
      if (focusOnSelect) event.target.focus();
      return;
    }

    const {value: dateInput} = event.target;

    // If required, then raise an error in this input.
    // Else, set it to empty by default.
    if (!dateInput) {
      if (required) {
        onTimeChangeError({error: requiredError});
      } else {
        onTimeChange();
      }
      return;
    }

    const {momentDate, isValid, error} = validateTime({
      dateInput,
    });

    if (isValid) {
      onTimeChange(momentDate);
    } else {
      onTimeChangeError({error: error || "Something went wrong"});
    }
  };

  const onInputChange = (event) => {
    const {value: dateInput} = event.target;

    // If required, then raise an error in this input.
    // Else, set it to empty by default.
    if (!dateInput) {
      setTimeInputOpt({
        label: null,
        value: "",
      });
      if (required) {
        setError(requiredError);
      }
      return;
    }

    const {momentDate, isValid, error} = validateTime({
      dateInput,
    });

    setTimeInputOpt({
      label: dateInput,
      value: momentDate?.toISOString(),
    });

    setError(isValid ? null : error || "Something went wrong");
  };

  const onTimeChange = async (newDate = null) => {
    setError();
    const isValid = asyncValidateTimeChange
      ? await asyncValidateTimeChange(newDate?.toISOString())
      : true;
    if (isValid) {
      onChange(newDate?.toISOString());
      if (isWrappedComponent) {
        if (!timing?.endTime) {
          onChangeHandler(newDate);
        }
      }

      setTimeInputOpt(
        buildInputOption(newDate ? moment.utc(newDate).tz(timezone) : null)
      );
    }
  };
  const onChangeHandler = (value) => {
    const newTimeValue = moment.utc(value).tz(timezone).add(60, "minutes");
    onChange(newTimeValue?.toISOString(), "setDefaultEndTime");
  };

  const onTimeSelect = (option) => {
    const {momentDate, isValid, error} = validateTime({option});

    if (isValid) {
      onTimeChange(momentDate);
    } else {
      onTimeChangeError({error: error || "Something went wrong"});
    }
  };

  // On error, revert it back to previous value.
  const onTimeChangeError = ({error: msg}) => {
    const newOption = buildInputOption(value ? moment.utc(value).tz(timezone) : null);
    setError(required && !newOption.value ? requiredError : null);
    setTimeInputOpt(newOption);
    onChange(newOption.value);
  };

  const getSuffixLabel = (timeInputOptValue) => {
    let timeDifference = moment(
      moment.utc(timeInputOptValue).tz(timezone).format("YYYY-MM-DD")
    ).diff(momentMinTime.format("YYYY-MM-DD"), "days");
    if (timeDifference === 0) {
      return null;
    } else if (timeDifference === 1) {
      return nextDayLabel;
    } else if (timeDifference > 1) {
      return `(+${timeDifference})`;
    } else {
      return `(-${timeDifference})`;
    }
  };

  return (
    <div className="time-picker-with-input-dropdown-container">
      <Dropdown
        isOpen={isOpen}
        toggle={() => {
          if (!disabled) {
            toggle();
            if (isWrappedComponent) {
              updateMaterialWrapperFocus(isOpen);
            }
          }
        }}
        className={["time-picker-with-input-dropdown", small ? "small" : "", className]
          .filter((cx) => cx)
          .join(" ")}
      >
        <DropdownToggle tag="div" className="time-input-toggle-container">
          <TextField
            label={label}
            value={timeInputOpt.label || ""}
            onChange={onInputChange}
            onBlur={onInputBlur}
            suffix={
              <>
                {timeInputOpt.value && getSuffixLabel(timeInputOpt.value)}
                &nbsp;
                {showTimezone ? moment.tz(timezone).format("z") : null}
                &nbsp;
                {isWrappedComponent ? null : <FontAwesomeIcon icon={faChevronDown} />}
              </>
            }
            error={error}
            className={["time-input", inputFieldClassName].filter((cx) => cx).join(" ")}
            disabled={disabled}
            isWrappedComponent={isWrappedComponent}
          />
        </DropdownToggle>
        <DropdownMenu>
          <div className="dropdown-menu-container wrapper-dropdown" ref={menuRef}>
            {dropdownContainerLabel && (
              <span className="dropdown-label-disabled">{dropdownContainerLabel}</span>
            )}
            {options.map((opt) => (
              <DropdownItem
                key={opt.label}
                onClick={() => onTimeSelect(opt)}
                active={activeOption === opt.label}
              >
                <span ref={opt.ref}>{opt.label}</span>
              </DropdownItem>
            ))}
          </div>
        </DropdownMenu>
      </Dropdown>
      {showError && error && (
        <div
          className={["error-message", small ? "small" : ""].filter((cx) => cx).join(" ")}
        >
          {error}
        </div>
      )}
    </div>
  );
};

TimePickerWithInput.propTypes = {
  value: PropTypes.any,
  minTime: PropTypes.any,
  maxTime: PropTypes.any,
  interval: PropTypes.number,
  label: PropTypes.string,
  className: PropTypes.string,
  excludeRanges: PropTypes.array,
  nextDayLabel: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  small: PropTypes.bool,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  showError: PropTypes.bool,
  focusOnSelect: PropTypes.bool,
  includeMinTime: PropTypes.bool,
  includeMaxTime: PropTypes.bool,
  showTimezone: PropTypes.bool,
  revertOnError: PropTypes.bool,
  timezone: PropTypes.string,
  asyncValidateTimeChange: PropTypes.func,
  isWrappedComponent: PropTypes.bool,
  inputFieldClassName: PropTypes.string,
  updateMaterialWrapperFocus: PropTypes.func,
  timing: PropTypes.object,
  dropdownContainerLabel: PropTypes.string,
  forceOpenMenu: PropTypes.bool,
  setForceOpenMenu: PropTypes.func,
};

TimePickerWithInput.defaultProps = {
  interval: 30,
  timezone: moment.tz.guess(),
  minTime: moment.utc().toISOString(),
  nextDayLabel: "Next Day",
  label: "Time",
  isWrappedComponent: false,
  inputFieldClassName: "",
  forceOpenMenu: false,
  setForceOpenMenu: () => {},
};

export default TimePickerWithInput;
