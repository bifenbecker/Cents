export const validateFormFactory = (schema) => async (fields, setErrors) => {
  try {
    await schema.validate(fields, {
      abortEarly: false,
    });
    return true;
  } catch (error) {
    const finalErrors =
      error?.inner?.reduce((fieldErrors, vErrors) => {
        fieldErrors[vErrors.path] = fieldErrors[vErrors.path] || [];
        fieldErrors[vErrors.path] = [...fieldErrors[vErrors.path], vErrors.message];
        return fieldErrors;
      }, {}) || {};
    setErrors(finalErrors);
    return false;
  }
};

export const displayErrorMessages = (fieldErrors) =>
  Object.values(fieldErrors)
    .flat()
    .filter((e) => e)
    .join(". ");
