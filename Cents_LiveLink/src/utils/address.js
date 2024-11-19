export const formatAddress = address => {
  if (address) {
    const {address1, city, firstLevelSubdivisionCode, postalCode} = address;
    return [
      address1 || "",
      city || "",
      [firstLevelSubdivisionCode || "", postalCode || ""].filter(v => v).join(" "),
    ]
      .filter(v => v)
      .join(", ");
  }
};

export const createAddressPayload = addressObj => {
  let newAddressObj = {
    address1: addressObj.address1,
    address2: addressObj.address2,
    city: addressObj.city,
    firstLevelSubdivisionCode: addressObj.firstLevelSubdivisionCode,
    postalCode: addressObj.postalCode,
    countryCode: addressObj.countryCode,
    instructions: addressObj.instructions,
    leaveAtDoor: addressObj.leaveAtDoor,
  };
  return newAddressObj;
};
