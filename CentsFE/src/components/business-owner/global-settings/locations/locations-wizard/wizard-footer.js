import React from "react";
import FooterWithSave from "../common/footer-with-save";

const WizardFooter = (props) => {
  const {addLocationStep} = props;

  return (
    <FooterWithSave {...props} saveBtnLabel={addLocationStep === 3 ? "SAVE" : "NEXT"} />
  );
};

export default WizardFooter;
