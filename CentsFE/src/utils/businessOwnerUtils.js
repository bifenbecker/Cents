import moment from "moment";

// Return the string to be used on left pane header, based on selected locations
export const getLocationString = (selectedLocations, locationList) => {
  if (!locationList.length || !selectedLocations.length) {
    return "";
  }
  if (selectedLocations.length === 1) {
    let selectedLocation = locationList.find((loc) => loc.id === selectedLocations[0]);
    return selectedLocation?.address || "";
  }
  return `${
    selectedLocations.length === locationList.length ? "all" : selectedLocations?.length
  } locations`;
};

export const getTimeDifference = (timeLog) => {
  if (timeLog.checkOutTime) {
    let differenceInMinutes = moment
      .utc(timeLog.checkOutTime)
      .diff(moment.utc(timeLog.checkInTime), "minutes");
    let hours = Math.floor(differenceInMinutes / 60);
    let minutes = Math.ceil(differenceInMinutes % 60);
    let formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    return hours + ":" + formattedMinutes;
  } else {
    return "-";
  }
};

export const convertTo12Hours = (utcString) => {
  if (utcString === null) {
    return "";
  }
  if (!utcString) {
    return utcString;
  }

  let utcDateTime = new Date(utcString);

  const hours = utcDateTime.getUTCHours();
  const minutes = utcDateTime.getUTCMinutes();
  let timeIn12 = "";
  if (hours < 12) {
    // AM case
    timeIn12 = [`${hours}`.padStart(2, "0"), `${minutes}`.padStart(2, "0") + " AM"].join(
      ":"
    );
    if (hours === 0) {
      timeIn12 = timeIn12.replace("00", "12");
    }
  } else {
    // PM case
    if (hours === 12) {
      timeIn12 = `${hours}:${minutes < 10 ? `0${minutes}` : minutes} PM`;
    } else {
      timeIn12 = `${hours - 12 < 10 ? `0${hours - 12}` : `${hours - 12}`}:${
        minutes < 10 ? `0${minutes}` : minutes
      } PM`;
    }
  }
  return timeIn12;
};

export const hasStoresInRegions = (regions) => {
  if (!regions?.length) return false;
  return regions.some((region) => {
    return region.districts.some((district) => district?.stores?.length);
  });
};
