import {createNamespacer, createReducer} from "../../../utils/reducers";
import actionTypes from "../../../actionTypes";
import _ from "lodash";

const tasksActionTypes = actionTypes.businessOwner.globalSettings.taskManager;

const BoTaskManagerNamespacer = createNamespacer("BUSINESS_OWNER_TASK_MANAGER");

const initialState = {
  tasks: [],
  allShifts: [],
  locations: {},
  tasksCallInProgress: false,
  taskListError: "",
  activeTaskId: null, // -1 -> New task, null -> No Task,
  taskSaveInProgress: false,
  taskSaveError: "",
  shouldRefreshTaskList: false,
  newTask: {
    name: "",
    description: "",
    // isPhotoNeeded: false,
    assignedLocations: [],
    assignedDays: [],
    assignedShifts: [],
  },
  activeAssignBox: "",
  locationAssignBoxSelectedContent: {
    selectedRegionId: "",
    selectedDistrictId: "",
  },
  needsRegions: false,
};

const handlers = {
  [BoTaskManagerNamespacer(tasksActionTypes.SET_TASK_LIST)]: (state, action) => {
    if (
      !state.activeTaskId ||
      !action.payload.tasks.find((task) => task.id === state.activeTaskId)
    ) {
      return {
        ...state,
        tasks: action.payload.tasks,
        needsRegions: action.payload.needsRegions,
        activeTaskId: action.payload.tasks[0] && action.payload.tasks[0].id,
      };
    } else {
      return {
        ...state,
        tasks: action.payload.tasks,
        needsRegions: action.payload.needsRegions,
      };
    }
  },

  [BoTaskManagerNamespacer(tasksActionTypes.SET_LOCATIONS_LIST)]: (state, action) => {
    return {
      ...state,
      locations: {
        ...state.locations,
        locations: action.payload.locations,
        regions: action.payload.regions,
        storesWithoutRegions: action.payload.storesWithoutRegions,
      },
    };
  },

  [BoTaskManagerNamespacer(tasksActionTypes.SET_SHIFTS_LIST)]: (state, action) => {
    return {
      ...state,
      allShifts: action.payload,
    };
  },

  [BoTaskManagerNamespacer(tasksActionTypes.SET_TASK_CALL_IN_PROGRESS)]: (
    state,
    action
  ) => {
    return {
      ...state,
      tasksCallInProgress: action.payload,
    };
  },

  [BoTaskManagerNamespacer(tasksActionTypes.SET_TASK_LIST_ERROR)]: (state, action) => {
    return {
      ...state,
      taskListError: action.payload,
    };
  },

  [BoTaskManagerNamespacer(tasksActionTypes.SET_ACTIVE_TASK_ID)]: (state, action) => {
    if (action.payload === -1) {
      const allLocations = [];
      if (state.locations.locations.length > 0) {
        for (let loc of state.locations.locations) {
          allLocations.push(loc.id);
        }
      } else if (state.locations.regions.length > 0) {
        for (let region of state.locations.regions) {
          for (let district of region.districts) {
            for (let location of district.stores) {
              allLocations.push(location.id);
            }
          }
        }
      }

      const allShifts = state.allShifts.map((shift) => {
        return {
          ...shift,
          isAssigned: true,
        };
      });
      return {
        ...state,
        newTask: {
          ...state.newTask,
          assignedShifts: allShifts,
          assignedLocations: allLocations,
          assignedDays: [0, 1, 2, 3, 4, 5, 6],
        },
        activeTaskId: action.payload,
      };
    } else {
      return {
        ...state,
        activeTaskId: action.payload,
      };
    }
  },

  [BoTaskManagerNamespacer(tasksActionTypes.RESET_FULL_STATE)]: () => {
    return {...initialState};
  },

  [BoTaskManagerNamespacer(tasksActionTypes.UPDATE_ACTIVE_TASK_FIELD)]: (
    state,
    action
  ) => {
    if (state.activeTaskId === -1) {
      //New Task
      let task = {...state.newTask};
      task[action.payload.field] = action.payload.value;
      return {
        ...state,
        newTask: task,
      };
    } else {
      // Updating existing task
      let taskIndex = state.tasks.findIndex((task) => task.id === state.activeTaskId);
      if (taskIndex === -1) {
        // Something screwed up
        return {
          ...state,
        };
      }

      let task = {...state.tasks[taskIndex]};

      task[action.payload.field] = action.payload.value;

      let tasks = state.tasks.slice();
      tasks[taskIndex] = task;

      return {
        ...state,
        tasks,
      };
    }
  },

  [BoTaskManagerNamespacer(tasksActionTypes.SET_TASK_SAVE_IN_PROGRESS)]: (
    state,
    action
  ) => {
    return {
      ...state,
      taskSaveInProgress: action.payload,
    };
  },

  [BoTaskManagerNamespacer(tasksActionTypes.UPDATE_ACTIVE_TASK)]: (state, action) => {
    const {task} = action?.payload || {};
    let taskIndex = state.tasks.findIndex((item) => item?.id === task?.id);
    if (taskIndex === -1) {
      // Something screwed up
      return {
        ...state,
      };
    }

    task.assignedShifts =
      state?.allShifts?.map(({name}) => {
        return {
          name,
          isAssigned:
            task.assignedShifts.findIndex((shiftName) => shiftName === name) > -1,
        };
      }) || [];

    let tasks = state.tasks.slice();
    tasks[taskIndex] = task;

    return {
      ...state,
      tasks,
      activeTaskId: task.id,
    };
  },

  [BoTaskManagerNamespacer(tasksActionTypes.SET_TASK_SAVE_ERROR)]: (state, action) => {
    return {
      ...state,
      taskSaveError: action.payload,
    };
  },

  [BoTaskManagerNamespacer(tasksActionTypes.SET_SHOULD_REFRESH_TASK_LIST)]: (
    state,
    action
  ) => {
    return {
      ...state,
      shouldRefreshTaskList: action.payload,
    };
  },

  [BoTaskManagerNamespacer(tasksActionTypes.RESET_NEW_TASK)]: (state, action) => {
    return {
      ...state,
      newTask: {...initialState.newTask},
    };
  },

  [BoTaskManagerNamespacer(tasksActionTypes.SET_ACTIVE_ASSIGN_BOX)]: (state, action) => {
    return {
      ...state,
      activeAssignBox: action.payload,
    };
  },

  [BoTaskManagerNamespacer(tasksActionTypes.SET_LOCATION_ASSIGN_BOX_SELECTION)]: (
    state,
    action
  ) => {
    const fieldMapping = {
      region: "selectedRegion",
      district: "selectedDistrict",
    };

    return {
      ...state,
      locationAssignBoxSelectedContent: {
        ...state.locationAssignBoxSelectedContent,
        [fieldMapping[action.payload.type]]: action.payload.value,
      },
    };
  },

  [BoTaskManagerNamespacer(tasksActionTypes.SET_LOCATION_ASSIGN_CHECKBOX_STATE)]: (
    state,
    action
  ) => {
    let params = {...action.payload};
    let task;
    let tasks = state.tasks.slice();
    if (state.activeTaskId === -1) {
      task = state.newTask;
    } else {
      task = tasks.find((task) => task.id === params.taskId);
    }
    let assignedLocations = _.get(task, "assignedLocations");
    const regions = _.get(state, "locations.regions");

    if (!task) {
      return {...state};
    }
    if (params.type === "location") {
      const locationIndex = task.assignedLocations.indexOf(params.locationId);
      if (locationIndex === -1) {
        task.assignedLocations.push(params.locationId);
      } else {
        task.assignedLocations.splice(locationIndex, 1);
      }
    } else if (params.type === "district") {
      const region = regions.find((region) => region.id === params.regionId);
      const district = region.districts.find((dist) => dist.id === params.districtId);

      if (!params.value) {
        for (const location of district.stores) {
          let locationIndex = assignedLocations.indexOf(location.id);
          if (locationIndex !== -1) {
            assignedLocations.splice(locationIndex, 1);
          }
        }
      } else {
        for (const location of district.stores) {
          let locationIndex = assignedLocations.indexOf(location.id);
          if (locationIndex === -1) {
            assignedLocations.push(location.id);
          }
        }
      }
      task.assignedLocations = assignedLocations;
    } else if (params.type === "region") {
      let region = regions.find((region) => region.id === params.regionId);

      for (let district of region.districts) {
        if (!params.value) {
          for (const location of district.stores) {
            let locationIndex = assignedLocations.indexOf(location.id);
            if (locationIndex !== -1) {
              assignedLocations.splice(locationIndex, 1);
            }
          }
        } else {
          for (const location of district.stores) {
            let locationIndex = assignedLocations.indexOf(location.id);
            if (locationIndex === -1) {
              assignedLocations.push(location.id);
            }
          }
        }
      }
    }

    if (state.activeTaskId === -1) {
      return {
        ...state,
        newTask: task,
      };
    } else {
      return {
        ...state,
        tasks,
      };
    }
  },

  [BoTaskManagerNamespacer(tasksActionTypes.SET_LOCATION_ONLY_ASSIGN_BOX_SELECTION)]: (
    state,
    action
  ) => {
    let params = {...action.payload}; // taskId, locationId
    let tasks = state.tasks.slice();
    let task;
    if (state.activeTaskId === -1) {
      task = state.newTask;
    } else {
      task = tasks.find((task) => task.id === params.taskId);
    }

    if (!_.get(task, "assignedLocations")) {
      return {
        ...state,
      };
    }
    const locationIndex = task.assignedLocations.indexOf(params.locationId);
    if (locationIndex === -1) {
      task.assignedLocations.push(params.locationId);
    } else {
      task.assignedLocations.splice(locationIndex, 1);
    }

    if (state.activeTaskId === -1) {
      return {
        ...state,
        newTask: task,
      };
    } else {
      return {
        ...state,
        tasks,
      };
    }
  },

  [BoTaskManagerNamespacer(tasksActionTypes.SET_DAY_ASSIGN_CHECKBOX_STATE)]: (
    state,
    action
  ) => {
    let params = {...action.payload};
    let tasks = state.tasks.slice();
    let task;
    if (state.activeTaskId === -1) {
      task = state.newTask;
    } else {
      task = tasks.find((task) => task.id === params.taskId);
    }

    if (task.assignedDays.includes(params.day)) {
      let index = task.assignedDays.indexOf(params.day);
      task.assignedDays.splice(index, 1);
    } else {
      task.assignedDays.push(params.day);
    }

    if (state.activeTaskId === -1) {
      return {
        ...state,
        newTask: task,
      };
    } else {
      return {
        ...state,
        tasks,
      };
    }
  },

  [BoTaskManagerNamespacer(tasksActionTypes.SET_SHIFT_ASSIGN_CHECKBOX_STATE)]: (
    state,
    action
  ) => {
    let params = {...action.payload};
    let tasks = state.tasks.slice();
    let task;
    if (state.activeTaskId === -1) {
      task = state.newTask;
    } else {
      task = tasks.find((task) => task.id === params.taskId);
    }

    let shift = task.assignedShifts.find((shift) => shift.name === params.shiftName);

    shift.isAssigned = !shift.isAssigned;

    if (state.activeTaskId === -1) {
      return {
        ...state,
        newTask: task,
      };
    } else {
      return {
        ...state,
        tasks,
      };
    }
  },

  [BoTaskManagerNamespacer(tasksActionTypes.SET_SELECTED_LOCATIONS)]: (state, action) => {
    let params = {...action.payload};
    let tasks = state.tasks.slice();
    let task;

    if (state.activeTaskId === -1) {
      task = state.newTask;
    } else {
      task = tasks.find((task) => task.id === params.taskId);
    }
    task.assignedLocations = params.selectedLocations;

    if (state.activeTaskId === -1) {
      return {
        ...state,
        newTask: task,
      };
    } else {
      return {
        ...state,
        tasks,
      };
    }
  },
};

export default createReducer(initialState, handlers, ["BUSINESS_OWNER_TASK_MANAGER"]);
