import Modal from "../../../../../commons/modal/modal.js";
import React, {useEffect, useState} from "react";
import ConfigSection from "./config-section.js";
import BlockingLoader from "../../../../../commons/blocking-loader/blocking-loader.js";
import {useDispatch} from "react-redux";
import _ from "lodash";

import {
  BoGSAccountNamespacer,
  preferencesActionTypes,
} from "../../../../../../containers/bo-account-customer-preferences.js";

const emptySection = {
  fieldName: "",
  options: [],
  type: "single",
};

const AddSectionModal = ({onClose, onSave, saveInProgress, createCallError}) => {
  const [section, setSection] = useState(emptySection);
  const [isValid, setValid] = useState(false);
  const [isSaving, setSaving] = useState(false);
  const [error, setError] = useState(createCallError);
  const dispatch = useDispatch();

  const handleClose = () => { // eslint-disable-line
    setSection(emptySection);
    dispatch({
      type: BoGSAccountNamespacer(preferencesActionTypes.ADD_PREFERENCES_CALL_ERROR),
      payload: "",
    });
    onClose();
  };

  useEffect(() => {
    if (!isSaving && saveInProgress) {
      setSaving(true);
    }

    if (isSaving && !saveInProgress && createCallError) {
      setSaving(false);
      setError(createCallError);
    }

    if (isSaving && !saveInProgress && !createCallError) {
      setSaving(false);
      handleClose();
    }
  }, [isSaving, createCallError, saveInProgress, setSaving, handleClose]);

  const checkSubmit = (newSection) => {
    const isValid = newSection?.options?.every((optionObj) => optionObj?.value?.trim());

    setValid(
      newSection.fieldName.trim() !== "" && newSection?.options?.length > 0 && isValid
    );
  };

  const handleSectionUpdate = (updatedSection) => {
    setSection(updatedSection);
    checkSubmit(updatedSection);
  };

  const handleAddNewOption = (option) => {
    const options = _.cloneDeep(section.options);
    options.push(option);
    const updatedSection = {...section, options};
    setSection(updatedSection);
    checkSubmit(updatedSection);
  };

  const handleSave = async () => {
    if (isValid) {
      onSave(section);
    }
  };

  return (
    <Modal>
      {isSaving && <BlockingLoader />}
      <div className="add-section-popup-container">
        <div className="add-section-header">Add new section</div>
        <div className="add-section-content">
          <ConfigSection
            data={section}
            allowRemove={false}
            onUpdateSection={handleSectionUpdate}
            title="New preference name"
            autoFocus={true}
            onAddNewOption={handleAddNewOption}
            isNew={true}
            setValid={setValid}
            sectionData={section}
          />
        </div>
        {error && (
          <div className="add-section-error">
            Something went wrong while adding new section, please try again later.
          </div>
        )}
        <div className="add-section-footer">
          <p onClick={handleClose} className="btn-cancel">
            cancel
          </p>
          <button
            disabled={!isValid}
            className="btn-theme form-save-button"
            onClick={handleSave}
          >
            save
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default AddSectionModal;
