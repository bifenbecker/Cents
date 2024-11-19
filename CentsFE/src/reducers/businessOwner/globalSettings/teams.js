import {createNamespacer, createReducer} from "../../../utils/reducers";
import actionTypes from "../../../actionTypes";

const initialState = {
  teamMembers: [],
  activeTeamMemberDetails: {},
  teamMembersListError: "",
  teamMembersCallInProgress: false,
  activeTeamMemberId: null,
  showNewTeamMemberWizard: false,
  allLocations: {
    regions: [],
    locations: [],
    storesWithoutRegions: [],
    needsRegions: false,
  },
  newTeamMember: {
    firstName: "",
    lastName: "",
    email: "",
    employeeCode: null,
  },
  newTeamMemberWizardStep: 1,
  wizardErrors: {
    firstName: "",
    lastName: "",
    email: "",
  },
  wizardCallInProgress: false,
  refreshTeamList: false,
  activeTeamMemberErrors: {
    fullName: "",
    employeeCode: "",
    email: "",
    phone: "",
    role: "",
    birthday: "",
    isManager: "",
    adminAccess: "",
  },
  showIsManagerPopUp: false,
  searchInProgress: false,
  searchText: "",
  teamMemberDetailsCallInProgress: false,
  teamMemberDetailsError: "",
  suggestedEmployeeCode: null,
  unarchivedTeamMembers: [],
};

const nameSpace = "TEAMS";
const teamsNameSpacer = createNamespacer(nameSpace);
const teamsAT = actionTypes.businessOwner.globalSettings.teams;

const handlers = {
  [teamsNameSpacer(teamsAT.SET_TEAM_MEMBER_LIST)]: (state, action) => {
    if (state.activeTeamMemberId === null) {
      return {
        ...state,
        teamMembers: action.payload.teamMembers,
        activeTeamMemberId:
          action.payload.unarchivedTeamMembers[0]?.id ||
          action.payload.teamMembers[0]?.id,
        unarchivedTeamMembers: action.payload.unarchivedTeamMembers,
      };
    }
    return {
      ...state,
      teamMembers: action.payload.teamMembers,
      unarchivedTeamMembers: action.payload.unarchivedTeamMembers,
    };
  },

  [teamsNameSpacer(teamsAT.SET_ALL_LOCATIONS)]: (state, action) => {
    return {
      ...state,
      allLocations: {...action.payload},
    };
  },

  [teamsNameSpacer(teamsAT.SET_TEAM_LIST_CALL_IN_PROGRESS)]: (state, action) => {
    return {
      ...state,
      teamMembersCallInProgress: action.payload,
    };
  },

  [teamsNameSpacer(teamsAT.SET_TEAM_MEMBER_LIST_ERROR)]: (state, action) => {
    return {
      ...state,
      teamMembersListError: action.payload,
    };
  },

  [teamsNameSpacer(teamsAT.SET_TEAM_MEMBER_DETAILS_CALL_IN_PROGRESS)]: (
    state,
    action
  ) => {
    return {
      ...state,
      teamMemberDetailsCallInProgress: action.payload,
    };
  },

  [teamsNameSpacer(teamsAT.SET_ACTIVE_TEAM_MEMBER_DETAILS_ERROR)]: (state, action) => {
    return {
      ...state,
      teamMemberDetailsError: action.payload,
    };
  },

  [teamsNameSpacer(teamsAT.SET_ACTIVE_TEAM_MEMBER_DETAILS)]: (state, action) => {
    return {
      ...state,
      activeTeamMemberDetails: action.payload,
    };
  },

  [teamsNameSpacer(teamsAT.SET_ACTIVE_TEAM_MEMBER)]: (state, action) => {
    return {
      ...state,
      activeTeamMemberId: action.payload,
      activeTeamMemberDetails: {},
    };
  },

  [teamsNameSpacer(teamsAT.SET_SHOW_NEW_WIZARD)]: (state, action) => {
    let additionalStateValue = {};
    if (action.payload) {
      additionalStateValue.activeTeamMemberId = null;
    } else {
      if (state.activeTeamMemberId === null) {
        additionalStateValue.activeTeamMemberId = state.teamMembers[0]
          ? state.teamMembers[0].id
          : null;
      }
    }
    return {
      ...state,
      showNewTeamMemberWizard: action.payload,
      ...additionalStateValue,
    };
  },

  [teamsNameSpacer(teamsAT.SET_WIZARD_FIELD_DATA)]: (state, action) => {
    return {
      ...state,
      newTeamMember: {
        ...state.newTeamMember,
        [action.payload.field]: action.payload.value,
      },
    };
  },

  [teamsNameSpacer(teamsAT.SET_WIZARD_STEP)]: (state, action) => {
    return {
      ...state,
      newTeamMemberWizardStep: action.payload,
    };
  },

  [teamsNameSpacer(teamsAT.RESET_NEW_TEAM_MEMBER)]: (state, action) => {
    return {
      ...state,
      newTeamMember: initialState.newTeamMember,
      newTeamMemberWizardStep: initialState.newTeamMemberWizardStep,
      wizardErrors: initialState.wizardErrors,
      wizardApiError: initialState.wizardApiError,
    };
  },

  [teamsNameSpacer(teamsAT.SET_WIZARD_FIELD_ERROR)]: (state, action) => {
    return {
      ...state,
      wizardErrors: {
        ...action.payload,
      },
    };
  },

  [teamsNameSpacer(teamsAT.SET_WIZARD_API_ERROR)]: (state, action) => {
    return {
      ...state,
      wizardApiError: action.payload,
    };
  },

  [teamsNameSpacer(teamsAT.SET_WIZARD_CALL_IN_PROGRESS)]: (state, action) => {
    return {
      ...state,
      wizardCallInProgress: action.payload,
    };
  },

  [teamsNameSpacer(teamsAT.REFRESH_TEAM_LIST)]: (state, action) => {
    return {
      ...state,
      refreshTeamList: action.payload,
    };
  },

  [teamsNameSpacer(teamsAT.SET_TEAM_MEMBER_FIELD)]: (state, action) => {
    let activeTeamMemberDetails = state.activeTeamMemberDetails;
    activeTeamMemberDetails[action.payload.field] = action.payload.value;
    if (action.payload.field === "fullName") {
      let teamMembers = state.teamMembers.slice();
      const teamMemberIndex = teamMembers.findIndex(
        (teamMember) => teamMember.id === activeTeamMemberDetails.id
      );
      if (teamMemberIndex === -1) {
        return {
          ...state,
        };
      }
      const teamMember = {...teamMembers[teamMemberIndex]};
      teamMember[action.payload.field] = action.payload.value;
      teamMembers[teamMemberIndex] = teamMember;

      return {
        ...state,
        activeTeamMemberDetails,
        teamMembers,
      };
    }

    return {
      ...state,
      activeTeamMemberDetails,
    };
  },

  [teamsNameSpacer(teamsAT.SET_ACTIVE_TEAM_MEMBER_ERROR)]: (state, action) => {
    return {
      ...state,
      activeTeamMemberErrors: {
        ...state.activeTeamMemberErrors,
        [action.payload.field]: action.payload.value,
      },
    };
  },

  [teamsNameSpacer(teamsAT.RESET_ACTIVE_TEAM_MEMBER_ERRORS)]: (state, action) => {
    return {
      ...state,
      activeTeamMemberErrors: {...initialState.activeTeamMemberErrors},
    };
  },
  [teamsNameSpacer(teamsAT.RESET_ACTIVE_TEAM_MEMBER_DETAILS)]: (state, action) => {
    return {
      ...state,
      activeTeamMemberDetails: {...initialState.activeTeamMemberDetails},
    };
  },

  [teamsNameSpacer(teamsAT.SET_MANAGER_ACCESS_POP_UP_VISIBILITY)]: (state, action) => {
    return {
      ...state,
      showIsManagerPopUp: action.payload,
    };
  },

  [teamsNameSpacer(teamsAT.SET_SEARCH_IN_PROGRESS)]: (state, action) => {
    const {activeTeamMemberId, teamMembers, unarchivedTeamMembers, searchText} = state;

    const searchRelatedFields = {
      searchText: action.payload ? searchText : "",
      // Reset the below fields, when landed on search page initially only.
      // Else, keep them as they are.
      activeTeamMemberId: action.payload && searchText ? activeTeamMemberId : null,
      teamMembers: action.payload && searchText ? teamMembers : [],
      unarchivedTeamMembers: action.payload && searchText ? unarchivedTeamMembers : [],
    };

    return {
      ...state,
      searchInProgress: action.payload,
      ...searchRelatedFields,
    };
  },

  [teamsNameSpacer(teamsAT.SET_TEAM_MEMBER_SEARCH_TEXT)]: (state, action) => {
    let {activeTeamMemberId, teamMembers, unarchivedTeamMembers} = state;

    // If there is no search text and also because the teamMembers array
    // will be being cleared, clear active team member id,
    if (!action.payload) {
      teamMembers = [];
      unarchivedTeamMembers = [];
      activeTeamMemberId = null;
    }

    return {
      ...state,
      teamMembers,
      unarchivedTeamMembers,
      activeTeamMemberId,
      searchText: action.payload,
    };
  },

  [teamsNameSpacer(teamsAT.SET_SUGGESTED_EMPLOYEE_CODE)]: (state, action) => {
    return {
      ...state,
      suggestedEmployeeCode: action.payload,
      newTeamMember: {
        ...state.newTeamMember,
        employeeCode: action.payload,
      },
    };
  },

  [teamsNameSpacer(teamsAT.SET_ARCHIVE_ERROR)]: (state, action) => {
    return {
      ...state,
      archiveError: action.payload,
    };
  },
};

export default createReducer(initialState, handlers, [nameSpace]);
