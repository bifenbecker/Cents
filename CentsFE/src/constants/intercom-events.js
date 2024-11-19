export const INTERCOM_EVENTS = Object.freeze({
  addLocation: "add-location",
  avatar: "avatar",
  customers: "customers",
  downloadReport: "download-report",
  dryCleaning: "dry-cleaning",
  laundromatDropdown: "laundromat-dropdown",
  laundryServices: "laundry-services",
  tasks: "tasks",
  location3DotMenu: "location-3-dot-menu",
  machineWizard: "machine-wizard",
  promotions: "promotions",
  settings: "settings",
  signIn: "sign-in",
  team: "team",
});

export const INTERCOM_EVENTS_TEMPLATES = Object.freeze({
  addNewLocation: "Pushed {{Button Name}} Button to add new location",
  tasksAction: "{{Task Action}} {{Task Name}} Task",
  avatar: "Avatar",
  downloadReport: "Download report",
  trackLocationForm: "Pushed {{Button Name}} Button on {{Wizard Step}} wizard screen",
  machineWizard: {
    wizardStepButton: `"{{buttonName}}" button {{wizardStep}} wizard page`,
    washerDryer: "Washer/Dryer",
    addingNew: "Adding New Machine",
  },
  laundromatLocationsDropdown: "Laundromats: locations have been changed",
  laundryServices: {
    buttonAdd: "Adding New Laundry Service",
    buttonArchive: "Archive Service",
    wizardButton: 'Add Service Wizard "{{buttonName}}" button page {{wizardStep}}',
  },
  settings: "Settings",
  signIn: "User login",
  location3DotMenu: {
    locationTabletLogin: "Location Tablet login",
    configureCashOptions: "Configure Cash Options",
    checkedInEmployees: "Checked in employees",
  },
  team: {
    addNewTeamMember: "Team member {{First name}} {{Last name}} has been added",
    enableManager: "Manager role for {{Full name}} has been enabled",
    enableAdminAccess: "Admin access was provided to {{Full name}}",
    teamReportExport: "Team report has been exported",
    timeCardEdit: "Time card has been edited",
  },
  customers: {
    exportListReport: "Customer list report has been exported",
    toggleCommercialCustomer: "Commercial customer has been {{Commercial status}}",
    issueCredit: "Credit has been issued",
    removeCardOnFile: "Card on file was deleted",
  },
  dryCleaning: {
    addNewService: "Adding new dry cleaning service",
    archiveService: "Archive service",
  },
  promotion: {
    addNew: "Add new promotion",
    activate: "Activate existing promotion",
    deactivate: "Deactivate promotion",
  },
});

export const DEFAULT_INTERCOM_VALUES = {
  NO_RECORD: "no record",
};
