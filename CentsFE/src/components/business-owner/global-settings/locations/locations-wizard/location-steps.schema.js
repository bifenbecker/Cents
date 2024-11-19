import * as yup from "yup";

export { default as resetPasswordSchema } from "../reset-password/reset-password.validation";

export const businessDetailsSchema = yup.object().shape({
  taxRate: yup.object().nullable(),
  dcaLicense: yup
    .string()
    .max(15)
    .matches(
      /^$|^(?!.*[-]{2})(?=.*[A-Za-z\d]$)[A-Za-z\d][A-Za-z\d-]*$/,
      "DCA number should only have letters, numbers and dashes(Should not be at start or end or consecutive)"
    ),
});

export const locationDetailsSchema = yup.object().shape({
  name: yup.string().max(50).required("Name is a required field"),
  phoneNumber: yup
    .string()
    .required("Phone is a required field")
    .max(16, "Invalid phone number"),
  address: yup.string().max(35).required("Address is a required field"),
  city: yup.string().required("City is a required field"),
  state: yup.string().required("State is a required field"),
  zipCode: yup.string().matches(/^[0-9]{5}(?:-[0-9]{4})?$/, "Invalid zip code"),
  districtId: yup
    .number()
    .nullable()
    .notRequired()
    .when("needsRegions", {
      is: true,
      then: yup
        .number()
        .typeError("District is required")
        .required("District is required"),
      otherwise: yup.number().nullable().notRequired(),
    }),
});
