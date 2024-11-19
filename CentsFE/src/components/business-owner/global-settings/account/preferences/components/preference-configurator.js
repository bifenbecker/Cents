import React, {useState} from "react";
import ConfigSection from "./config-section.js";
import AddSectionModal from "./add-section-modal.js";

const PreferencesConfigurator = ({
  preferencesList,
  onUpdatePreference,
  onAddPreference,
  onRemovePreference,
  onUpdatePreferenceOptions,
  onRemovePreferenceOption,
  onAddPreferenceOption,
  onChangeDefaultOption,
  createError,
  createInProgress,
}) => {
  const [showNewSection, setShowNewSection] = useState(false);

  const updateSection = (section) => {
    onUpdatePreference({
      fieldName: section.fieldName,
      type: section.type,
      id: section.id,
      businessId: section.businessId,
    });
  };

  const removeSection = (section) => {
    onRemovePreference(section);
  };

  const handAddNewSection = (section) => {
    if (section?.fieldName !== "" && section.options?.length > 0) {
      onAddPreference(section);
    }
  };

  const updateOptions = (options) => {
    onUpdatePreferenceOptions(options);
  };

  const removeOption = (option) => {
    onRemovePreferenceOption(option);
  };

  const addOption = (option, sectionId) => {
    if (typeof sectionId !== "undefined") {
      onAddPreferenceOption({...option, businessCustomerPreferenceId: sectionId});
    }
  };

  const changeDefaultOption = (previousDefault, newDefault) => {
    onChangeDefaultOption(previousDefault, newDefault);
  };

  const fieldNameSort = (pref1, pref2) => {
    return pref1.fieldName.localeCompare(pref2.fieldName);
  };

  return (
    <div className="preference-configurator-container list-container">
      <p>
        <small>
          Which options would you like to offer to your customers when setting their
          custom preferences?
        </small>
      </p>
      <div className="section-container">
        {preferencesList.sort(fieldNameSort).map((section, index) => (
          <ConfigSection
            data={section}
            allowRemove={preferencesList.length > 1}
            onRemoveSection={removeSection}
            onUpdateSection={updateSection}
            onUpdateOptions={updateOptions}
            onRemoveOption={removeOption}
            onChangeDefaultOption={changeDefaultOption}
            onAddNewOption={(option) => addOption(option, section.id)}
            key={section.id}
            title={`Section ${index + 1}`}
          />
        ))}
        {showNewSection && (
          <AddSectionModal
            onClose={() => setShowNewSection(false)}
            onSave={handAddNewSection}
            createCallError={createError}
            saveInProgress={createInProgress}
          />
        )}
      </div>
      <div className="add-new-button" onClick={() => setShowNewSection(true)}>
        <p>
          <span>+</span> Add another section
        </p>
      </div>
    </div>
  );
};

export default PreferencesConfigurator;
