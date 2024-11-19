import {useCallback} from "react";
import {geocodeByAddress, getLatLng} from "react-places-autocomplete";
import {getTimezoneFromLatLng} from "../../../../api/google";

export const mapGoogleAddressResult = (result) => {
  const address = {
    googlePlacesId: result.place_id,
    address1: null,
    city: null,
    firstLevelSubdivisionCode: null,
    postalCode: null,
    countryCode: null,
  };

  const address1Fields = [
    result.address_components.find((comp) => comp.types.includes("street_number"))
      ?.long_name,
    result.address_components.find((comp) => comp.types.includes("route"))?.long_name,
  ].filter((v) => v);

  // Both street_number and route are mandatory
  address.address1 = address1Fields.length === 2 ? address1Fields.join(" ") : null;

  address.city = result.address_components.find(
    (comp) =>
      comp.types.includes("locality") ||
      comp.types.includes("sublocality") ||
      comp.types.includes("administrative_area_level_3") ||
      comp.types.includes("administrative_area_level_2")
  )?.long_name;

  address.firstLevelSubdivisionCode = result.address_components.find((comp) =>
    comp.types.includes("administrative_area_level_1")
  )?.short_name;

  address.postalCode = result.address_components.find((comp) =>
    comp.types.includes("postal_code")
  )?.short_name;

  address.countryCode = result.address_components.find((comp) =>
    comp.types.includes("country")
  )?.short_name;

  return address;
};

export const getAddressAndLatLng = async (address) => {
  try {
    const [addressResult] = await geocodeByAddress(address);
    const latLng = await getLatLng(addressResult);
    const timeZoneRes = await getTimezoneFromLatLng(latLng);

    return {addressResult, latLng, timeZone: timeZoneRes?.data?.timeZoneId};
  } catch (error) {
    console.error("Error", error);
    throw new Error(
      error === "ZERO_RESULTS"
        ? "Address not found"
        : "Could not get relevant address details"
    );
  }
};

export const getFormattedAddress = (address) => {
  if (Object.keys(address).length !== 0) {
    const {address1, city, firstLevelSubdivisionCode, postalCode} = address;
    return `${
      address1 ? `${address1}, ` : ""
    }${city}, ${firstLevelSubdivisionCode} ${postalCode}`;
  } else {
    return "";
  }
};
