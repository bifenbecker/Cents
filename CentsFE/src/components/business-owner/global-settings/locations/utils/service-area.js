export const validateZones = (zones) => {
  const zoneNames = zones.map(({name}) => name);
  // check if zones have distinct names
  if (new Set(zoneNames).size !== zoneNames.length) {
    return {
      isValid: false,
      error: `Please add distinct zone names`,
    };
  }
  const zonesWithoutZipcodes = zones.filter((zone) => !zone?.zipCodes?.length);
  if (zonesWithoutZipcodes?.length) {
    if (zonesWithoutZipcodes?.length === 1) {
      return {
        isValid: false,
        error: `Please enter zipcode(s) for the zone: ${zonesWithoutZipcodes[0]?.name}`,
      };
    }
    return {
      isValid: false,
      error: `Please enter zipcode(s) for the following zones: ${zonesWithoutZipcodes
        .map((v) => v.name)
        .join(", ")}`,
    };
  }
  return {isValid: true};
};

export const getNewZone = (index = 1) => ({
  name: `Zone ${index}`,
  zipCodes: [],
});

export const isSaveDisabled = (hasZones, zipCodeList, zones) => {
  if (!hasZones) {
    return !zipCodeList.length;
  } else {
    return !(
      zones.every(({name}) => name) && zones.some(({zipCodes}) => zipCodes.length)
    );
  }
};
