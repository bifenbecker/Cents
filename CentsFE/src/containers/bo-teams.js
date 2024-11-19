import {connect} from "react-redux";
import * as yup from "yup";
import Teams from "../components/business-owner/global-settings/teams/teams";
import {createNamespacer} from "../utils/reducers";
import actionTypes from "../actionTypes";
import * as teamsApi from "../api/business-owner/teams";
import _ from "lodash";
import axios from "axios";
import {fetchRegions, fetchLocations} from "../api/business-owner/locations";
import get from "lodash/get";

const mapStateToProps = (state) => {
  return {
    ...state.businessOwner.globalSettings.teams,
  };
};

let teamsNameSpacer = createNamespacer("TEAMS");
let teamsAT = actionTypes.businessOwner.globalSettings.teams;

const validateWizardData = (wizardData, step) => {
  const stepOneSchema = yup.object().shape({
    firstName: yup.string().required("First name is a required field"),
    lastName: yup.string().required("Last name is a required field"),
  });

  const stepTwoSchema = yup.object().shape({
    email: yup
      .string()
      .email("Invalid email address")
      .required("Email is a required field"),
  });

  const stepThreeSchema = yup.object().shape({
    employeeCode: yup
      .number()
      .typeError("Invalid employee code - must be a number")
      .required("Employee code is a required field"),
  });

  if (step === 1) {
    return stepOneSchema.validate(wizardData, {abortEarly: false});
  } else if (step === 2) {
    return stepTwoSchema.validate(wizardData, {abortEarly: false});
  } else if (step === 3) {
    return stepThreeSchema.validate(wizardData, {abortEarly: false});
  }
};

const validateTeamMemberEdit = (field, value) => {
  const validateBirthdayString = (value) => {
    const stringArray = value.split("/");
    if (stringArray.length !== 2) {
      return false;
    } else if (_.isNaN(parseInt(stringArray[0])) || _.isNaN(parseInt(stringArray[1]))) {
      return false;
    } else if (parseInt(stringArray[0]) > 12 || parseInt(stringArray[1]) > 31) {
      return false;
    } else {
      return true;
    }
  };

  const schema = yup.object().shape({
    fullName: yup.string().required("Name is a required field"),
    employeeCode: yup.string().required("Employee code is required"),
    email: yup
      .string()
      .email("Invalid email address")
      .required("Email is a required field"),
    phone: yup
      .string()
      .required("Phone is a required field")
      .max(16, "Invalid phone number"),
    role: yup.string(),
    birthday: yup
      .string()
      .test("birthday-validator", "Invalid birthday value", (value) => {
        return validateBirthdayString(value);
      }),
    isManager: yup.boolean().required(),
    adminAccess: yup.boolean().required(),
    assignedLocations: yup.array(),
    isDeleted: yup.boolean().default(false),
  });

  return schema.validateSyncAt(field, {[field]: value});
};

const validateAndPutTeamMember = (
  id,
  field,
  value,
  dispatch,
  setTeamDetailsEditInProgress
) => {
  try {
    validateTeamMemberEdit(field, value);
    dispatch({
      type: teamsNameSpacer(teamsAT.SET_ACTIVE_TEAM_MEMBER_ERROR),
      payload: {
        field,
        value: "",
      },
    });
    setTeamDetailsEditInProgress && setTeamDetailsEditInProgress(true);
    teamsApi
      .updateTeamMember(id, field, value)
      .then((resp) => {
        // TODO - what to check in response
        dispatch({
          type: teamsNameSpacer(teamsAT.SET_ACTIVE_TEAM_MEMBER_DETAILS),
          payload: _.get(resp, "data.details", {}),
        });
        setTeamDetailsEditInProgress && setTeamDetailsEditInProgress(false);
      })
      .catch((e) => {
        // Axios error
        if (!axios.isCancel(e)) {
          // Error occured - Not an error because of cancelling request
          dispatch({
            type: teamsNameSpacer(teamsAT.SET_ACTIVE_TEAM_MEMBER_ERROR),
            payload: {
              field,
              value: get(e, "response.data.error", "Something went wrong"),
            },
          });
          setTeamDetailsEditInProgress && setTeamDetailsEditInProgress(false);
        }
      });
  } catch (e) {
    // Validation error
    dispatch({
      type: teamsNameSpacer(teamsAT.SET_ACTIVE_TEAM_MEMBER_ERROR),
      payload: {
        field,
        value: e.message,
      },
    });
    setTeamDetailsEditInProgress && setTeamDetailsEditInProgress(false);
  }
};

const searchTeamMembersCall = _.debounce(async ({searchText, dispatch}) => {
  if (!searchText) {
    dispatch({
      type: teamsNameSpacer(teamsAT.SET_TEAM_MEMBER_LIST),
      payload: {
        teamMembers: [],
        unarchivedTeamMembers: [],
      },
    });
    return;
  }

  try {
    dispatch({
      type: teamsNameSpacer(teamsAT.REFRESH_TEAM_LIST),
      payload: false,
    });
    dispatch({
      type: teamsNameSpacer(teamsAT.SET_TEAM_LIST_CALL_IN_PROGRESS),
      payload: true,
    });
    dispatch({
      type: teamsNameSpacer(teamsAT.SET_ACTIVE_TEAM_MEMBER),
      payload: null,
    });

    const resp = await teamsApi.searchTeamMembers({keyword: searchText});

    const unarchivedTeamMembers = resp.data.teamMembers.filter((teamMember) => {
      return teamMember.isDeleted === false;
    });

    dispatch({
      type: teamsNameSpacer(teamsAT.SET_TEAM_MEMBER_LIST),
      payload: {
        teamMembers: _.get(resp, "data.teamMembers", []),
        unarchivedTeamMembers: unarchivedTeamMembers,
      },
    });
    dispatch({
      type: teamsNameSpacer(teamsAT.SET_TEAM_MEMBER_LIST_ERROR),
      payload: "",
    });
  } catch (e) {
    dispatch({
      type: teamsNameSpacer(teamsAT.SET_TEAM_MEMBER_LIST),
      payload: {
        teamMembers: [],
        unarchivedTeamMembers: [],
      },
    });
    dispatch({
      type: teamsNameSpacer(teamsAT.SET_TEAM_MEMBER_LIST_ERROR),
      payload: _.get(e, "response.data.error", "Something went wrong"),
    });
  } finally {
    dispatch({
      type: teamsNameSpacer(teamsAT.SET_TEAM_LIST_CALL_IN_PROGRESS),
      payload: false,
    });
  }
}, 500);

const mapDispatchToProps = (dispatch) => {
  return {
    fetchTeamMembers: async () => {
      try {
        dispatch({
          type: teamsNameSpacer(teamsAT.REFRESH_TEAM_LIST),
          payload: false,
        });
        dispatch({
          type: teamsNameSpacer(teamsAT.SET_TEAM_LIST_CALL_IN_PROGRESS),
          payload: true,
        });
        const teamsPromise = teamsApi.fetchTeamMembersList();
        const regionsPromise = fetchRegions();
        const locationsPromise = fetchLocations();

        const [resp, regionsResp, locationsResp] = await Promise.all([
          teamsPromise,
          regionsPromise,
          locationsPromise,
        ]);

        const unarchivedTeamMembers = resp.data.teamMembers.filter((teamMember) => {
          return teamMember.isDeleted === false;
        });

        dispatch({
          type: teamsNameSpacer(teamsAT.SET_TEAM_MEMBER_LIST),
          payload: {
            teamMembers: _.get(resp, "data.teamMembers", []),
            unarchivedTeamMembers: unarchivedTeamMembers,
          },
        });
        dispatch({
          type: teamsNameSpacer(teamsAT.SET_ALL_LOCATIONS),
          payload: {
            locations: _.get(locationsResp, "data.allLocations", []),
            regions: _.get(regionsResp, "data.regions", []),
            needsRegions: _.get(locationsResp, "data.needsRegions"),
            storesWithoutRegions: _.get(regionsResp, "data.stores", []),
          },
        });
        dispatch({
          type: teamsNameSpacer(teamsAT.SET_TEAM_MEMBER_LIST_ERROR),
          payload: "",
        });
        dispatch({
          type: teamsNameSpacer(teamsAT.SET_TEAM_LIST_CALL_IN_PROGRESS),
          payload: false,
        });
      } catch (e) {
        dispatch({
          type: teamsNameSpacer(teamsAT.SET_TEAM_MEMBER_LIST),
          payload: {
            teamMembers: [],
            unarchivedTeamMembers: [],
          },
        });
        dispatch({
          type: teamsNameSpacer(teamsAT.SET_TEAM_MEMBER_LIST_ERROR),
          payload: _.get(e, "response.data.error", "Something went wrong"),
        });
        dispatch({
          type: teamsNameSpacer(teamsAT.SET_TEAM_LIST_CALL_IN_PROGRESS),
          payload: false,
        });
      }
    },

    fetchActiveTeamMemberDetails: async (id) => {
      try {
        dispatch({
          type: teamsNameSpacer(teamsAT.SET_TEAM_MEMBER_DETAILS_CALL_IN_PROGRESS),
          payload: true,
        });

        dispatch({
          type: teamsNameSpacer(teamsAT.RESET_ACTIVE_TEAM_MEMBER_ERRORS),
        });

        let resp = await teamsApi.fetchActiveTeamMemberDetails(id);

        dispatch({
          type: teamsNameSpacer(teamsAT.SET_ACTIVE_TEAM_MEMBER_DETAILS),
          payload: _.get(resp, "data.details", {}),
        });

        dispatch({
          type: teamsNameSpacer(teamsAT.SET_ACTIVE_TEAM_MEMBER_DETAILS_ERROR),
          payload: "",
        });

        dispatch({
          type: teamsNameSpacer(teamsAT.SET_TEAM_MEMBER_DETAILS_CALL_IN_PROGRESS),
          payload: false,
        });
      } catch (error) {
        dispatch({
          type: teamsNameSpacer(teamsAT.SET_ACTIVE_TEAM_MEMBER_DETAILS),
          payload: [],
        });
        dispatch({
          type: teamsNameSpacer(teamsAT.SET_ACTIVE_TEAM_MEMBER_DETAILS_ERROR),
          payload: _.get(error, "response.data.error", "Something went wrong"),
        });
        dispatch({
          type: teamsNameSpacer(teamsAT.SET_TEAM_MEMBER_DETAILS_CALL_IN_PROGRESS),
          payload: false,
        });
      }
    },

    setActiveTeamMember: (id) => {
      dispatch({
        type: teamsNameSpacer(teamsAT.SET_ACTIVE_TEAM_MEMBER),
        payload: id,
      });
      dispatch({
        type: teamsNameSpacer(teamsAT.RESET_NEW_TEAM_MEMBER),
      });
      dispatch({
        type: teamsNameSpacer(teamsAT.SET_SHOW_NEW_WIZARD),
        payload: false,
      });
      dispatch({
        type: teamsNameSpacer(teamsAT.RESET_ACTIVE_TEAM_MEMBER_ERRORS),
      });
    },

    resetActiveTeamMemberdetails: () => {
      dispatch({
        type: teamsNameSpacer(teamsAT.RESET_ACTIVE_TEAM_MEMBER_DETAILS),
      });
    },

    showHideNewTeamMemberWizard: (value) => {
      if (!value) {
        dispatch({
          type: teamsNameSpacer(teamsAT.RESET_NEW_TEAM_MEMBER),
        });
      }
      dispatch({
        type: teamsNameSpacer(teamsAT.SET_SHOW_NEW_WIZARD),
        payload: value,
      });
    },

    wizardFieldChangeHandler: (field, value) => {
      dispatch({
        type: teamsNameSpacer(teamsAT.SET_WIZARD_FIELD_DATA),
        payload: {
          field,
          value,
        },
      });
    },

    onNextClick: async (wizardData, currentStep) => {
      let wizardErrors = {};
      try {
        await validateWizardData(wizardData, currentStep);
        if (currentStep === 1 || currentStep === 2) {
          dispatch({
            type: teamsNameSpacer(teamsAT.SET_WIZARD_FIELD_ERROR),
            payload: {},
          });
          dispatch({
            type: teamsNameSpacer(teamsAT.SET_WIZARD_STEP),
            payload: currentStep + 1,
          });
        } else {
          try {
            dispatch({
              type: teamsNameSpacer(teamsAT.SET_WIZARD_CALL_IN_PROGRESS),
              payload: true,
            });
            let resp = await teamsApi.createNewTeamMember(wizardData);

            dispatch({
              type: teamsNameSpacer(teamsAT.REFRESH_TEAM_LIST),
              payload: true,
            });
            dispatch({
              type: teamsNameSpacer(teamsAT.RESET_NEW_TEAM_MEMBER),
            });
            dispatch({
              type: teamsNameSpacer(teamsAT.SET_SHOW_NEW_WIZARD),
              payload: false,
            });
            dispatch({
              type: teamsNameSpacer(teamsAT.SET_WIZARD_CALL_IN_PROGRESS),
              payload: false,
            });
            dispatch({
              type: teamsNameSpacer(teamsAT.SET_ACTIVE_TEAM_MEMBER),
              payload: _.get(resp, "data.details.id", null),
            });
          } catch (e) {
            // Handle API errors
            wizardErrors = e.response.data;
            dispatch({
              type: teamsNameSpacer(teamsAT.SET_WIZARD_API_ERROR),
              payload: get(e, "response.data.error", "Something went wrong."),
            });
            dispatch({
              type: teamsNameSpacer(teamsAT.SET_WIZARD_CALL_IN_PROGRESS),
              payload: false,
            });
          }
        }
      } catch (e) {
        // Handle validation errors
        let wizardErrors = {};
        for (let error of e.inner) {
          wizardErrors[error.path] = error.errors[0];
        }

        dispatch({
          type: teamsNameSpacer(teamsAT.SET_WIZARD_FIELD_ERROR),
          payload: wizardErrors,
        });
      } finally {
        return wizardErrors;
      }
    },

    resetNewTeamMember: () => {
      dispatch({
        type: teamsNameSpacer(teamsAT.RESET_NEW_TEAM_MEMBER),
      });
    },

    handleTeamMemberFieldChange: (id, field, value, setTeamDetailsEditInProgress) => {
      if (field === "fullName" || field === "birthday") {
        dispatch({
          type: teamsNameSpacer(teamsAT.SET_TEAM_MEMBER_FIELD),
          payload: {
            field,
            value,
          },
        });
      }

      validateAndPutTeamMember(id, field, value, dispatch, setTeamDetailsEditInProgress);
    },

    showHideIsManagerPopUp: (value) => {
      dispatch({
        type: teamsNameSpacer(teamsAT.SET_MANAGER_ACCESS_POP_UP_VISIBILITY),
        payload: value,
      });
    },

    handleSearchUnmount: () => {
      dispatch({
        type: teamsNameSpacer(teamsAT.SET_TEAM_MEMBER_SEARCH_TEXT),
        payload: "",
      });

      dispatch({
        type: teamsNameSpacer(teamsAT.SET_TEAM_MEMBER_LIST),
        payload: {
          teamMembers: [],
          unarchivedTeamMembers: [],
        },
      });

      dispatch({
        type: teamsNameSpacer(teamsAT.SET_SEARCH_IN_PROGRESS),
        payload: false,
      });
    },

    handleTeamMemberSearch: async (searchText) => {
      dispatch({
        type: teamsNameSpacer(teamsAT.SET_TEAM_MEMBER_SEARCH_TEXT),
        payload: searchText,
      });
      // The empty search text case is being handled in this debounce call.
      // This will fix the unneccessary last API call
      // when the searchText is removed letter by letter
      searchTeamMembersCall({searchText, dispatch});
    },

    setSearchInProgress: (value) => {
      dispatch({
        type: teamsNameSpacer(teamsAT.SET_SEARCH_IN_PROGRESS),
        payload: value,
      });
    },

    getSuggestedEmployeeCode: async () => {
      try {
        let resp = await teamsApi.getSuggestedEmployeeCode();

        dispatch({
          type: teamsNameSpacer(teamsAT.SET_SUGGESTED_EMPLOYEE_CODE),
          payload: _.get(resp, "data.suggestedCode", {}),
        });

        dispatch({
          type: teamsNameSpacer(teamsAT.SET_SUGGESTED_EMPLOYEE_CODE_ERROR),
          payload: "",
        });
      } catch (error) {
        dispatch({
          type: teamsNameSpacer(teamsAT.SET_SUGGESTED_EMPLOYEE_CODE_ERROR),
          payload: _.get(error, "response.data.error", "Something went wrong"),
        });
      }
    },

    setArchiveError: (value) => {
      dispatch({
        type: teamsNameSpacer(teamsAT.SET_ARCHIVE_ERROR),
        payload: value,
      });
    },

    archiveTeamMember: async (teamMember, archiveBoolean) => {
      try {
        let resp = await teamsApi.archiveTeamMember(teamMember.id, {archiveBoolean});

        if (!teamMember.id) {
          dispatch({
            type: teamsNameSpacer(teamsAT.RESET_NEW_TEAM_MEMBER),
          });

          dispatch({
            type: teamsNameSpacer(teamsAT.SET_ACTIVE_TEAM_MEMBER),
            payload: _.get(resp, "data.teamMember.id", null),
          });
          dispatch({
            type: teamsNameSpacer(teamsAT.REFRESH_TEAM_LIST),
            payload: true,
          });
        } else {
          dispatch({
            type: teamsNameSpacer(teamsAT.REFRESH_TEAM_LIST),
            payload: true,
          });
        }
      } catch (e) {
        dispatch({
          type: teamsNameSpacer(teamsAT.SET_ARCHIVE_ERROR),
          payload: e?.response?.data?.error || "Something went wrong!",
        });
      }
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Teams);
