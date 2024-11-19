import moment from "moment-timezone";

export {convertTo12Hours} from "../../../utils/businessOwnerUtils";

export const ALLOWED_FORMATS = [
  "h",
  "ha",
  "hh",
  "hha",
  "h:a",
  "hh:a",
  "h:m",
  "h:ma",
  "h:mm",
  "h:mma",
  "hh:m",
  "hh:ma",
  "hh:mm",
  "hh:mma",
];

export const buildLabel = (currentTime, givenTime, nextDayLabel) => {
  if (!currentTime) {
    return;
  }

  const formattedTime = currentTime.format("hh:mm A");

  return currentTime.isSame(givenTime, "day")
    ? formattedTime
    : `${formattedTime} - ${nextDayLabel}`;
};

export const buildOption = (currentTime, givenTime, nextDayLabel, options = {}) => {
  return {
    label: buildLabel(currentTime, givenTime, nextDayLabel),
    value: currentTime ? currentTime?.toISOString() : null,
    ...options,
  };
};

export const buildInputOption = (value) => {
  if (!value) {
    return {label: null, value: ""};
  }
  return {
    label: value.format("hh:mm A"),
    value: value.toISOString(),
  };
};

export const getParsedTimeFromInput = (label, date, timezone) => {
  const trimmedInput = label.toLowerCase().replace(/\s/, "");
  let newDate;
  let hasAMorPM = false;

  ALLOWED_FORMATS.forEach((f) => {
    let parsedDate = moment.tz(trimmedInput, f, true, timezone);
    if (parsedDate.isValid()) {
      newDate = moment
        .utc(date)
        .tz(timezone)
        .hours(parsedDate.hours())
        .minutes(parsedDate.minutes());
      hasAMorPM = f.includes("a");
      return;
    }
  });

  return {date: newDate ? moment.utc(newDate).tz(timezone) : null, hasAMorPM};
};

export const validateTimeFactory = ({
  includeMinTime,
  momentMinTime,
  includeMaxTime,
  momentMaxTime,
  nextDayLabel,
  timezone,
}) => {
  const rangeError = {
    isValid: false,
    error: `should be between ${moment
      .utc(momentMinTime)
      .tz(timezone)
      .add(includeMinTime ? 0 : 1, "minutes")
      .format("hh:mm A")} and ${buildLabel(
      moment
        .utc(momentMaxTime)
        .tz(timezone)
        .add(includeMaxTime ? 0 : 1, "minutes"),
      momentMinTime,
      nextDayLabel
    )}`,
  };

  return ({dateInput, option}) => {
    let momentDate;
    let hasAMorPM;

    if (option) {
      momentDate = moment.utc(option?.value).tz(timezone);
    } else {
      const parsedDateOptions = getParsedTimeFromInput(
        dateInput,
        momentMinTime,
        timezone
      );
      momentDate = parsedDateOptions.date;
      hasAMorPM = parsedDateOptions.hasAMorPM;
    }

    if (!momentDate) {
      return {isValid: false, error: "Invalid Format"};
    }

    // Check if the date is in between min time and max time.
    const inclusivity = [includeMinTime ? "[" : "(", includeMaxTime ? "]" : ")"];

    if (
      momentDate.isBetween(momentMinTime, momentMaxTime, undefined, inclusivity.join(""))
    ) {
      return {momentDate, isValid: true};
    }

    if (option) {
      return rangeError;
    }

    momentDate = hasAMorPM
      ? moment.utc(momentDate).tz(timezone).add(1, "day")
      : moment.utc(momentDate).tz(timezone).add(12, "hours");

    if (
      momentDate.isBetween(momentMinTime, momentMaxTime, undefined, inclusivity.join(""))
    ) {
      return {momentDate, isValid: true};
    } else {
      return rangeError;
    }
  };
};
