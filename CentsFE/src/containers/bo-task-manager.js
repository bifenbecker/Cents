import {connect} from "react-redux";
import TaskManager from "../components/business-owner/global-settings/task-manager/task-manager";
import actionTypes from "../actionTypes";
import * as taskManagerApi from "../api/business-owner/taskManager";
import {fetchRegions, fetchLocations} from "../api/business-owner/locations";
import {createNamespacer} from "../utils/reducers";
import _ from "lodash";

let tasksActionTypes = actionTypes.businessOwner.globalSettings.taskManager;

const boTaskManagerNameSpacer = createNamespacer("BUSINESS_OWNER_TASK_MANAGER");

const mapStateToProps = (state) => ({
  taskManager: state.businessOwner.globalSettings.taskManager,
});

const mapDispatchToProps = (dispatch) => ({
  fetchTaskList: async (params) => {
    try {
      dispatch({
        type: boTaskManagerNameSpacer(tasksActionTypes.SET_TASK_CALL_IN_PROGRESS),
        payload: true,
      });

      // TODO - SET regionsNeeded flag in local storage and switch the api call based on it
      const tasksPromise = taskManagerApi.getTasks(params);
      const regionsPromise = fetchRegions();
      const locationsPromise = fetchLocations();
      const shiftListPromise = taskManagerApi.getShiftList();

      const [tasksResp, regionsResp, locationsResp, shiftListResp] = await Promise.all([
        tasksPromise,
        regionsPromise,
        locationsPromise,
        shiftListPromise,
      ]);

      dispatch({
        type: boTaskManagerNameSpacer(tasksActionTypes.SET_TASK_LIST),
        payload: {
          tasks: _.get(tasksResp, "data.tasks", []),
          needsRegions: _.get(tasksResp, "data.needsRegions", false),
        },
      });

      dispatch({
        type: boTaskManagerNameSpacer(tasksActionTypes.SET_SHIFTS_LIST),
        payload: _.get(shiftListResp, "data.shifts"),
      });

      dispatch({
        type: boTaskManagerNameSpacer(tasksActionTypes.SET_LOCATIONS_LIST),
        payload: {
          locations: _.get(locationsResp, "data.allLocations", []),
          regions: _.get(regionsResp, "data.regions", []),
          storesWithoutRegions: _.get(regionsResp, "data.stores", []),
        },
      });

      dispatch({
        type: boTaskManagerNameSpacer(tasksActionTypes.SET_TASK_CALL_IN_PROGRESS),
        payload: false,
      });
    } catch (e) {
      //SET Error
      console.log("Error from fetch => ", e);
      dispatch({
        type: boTaskManagerNameSpacer(tasksActionTypes.SET_TASK_LIST_ERROR),
        payload: _.get(e, "response.data.error", "Something went wrong"),
      });

      dispatch({
        type: boTaskManagerNameSpacer(tasksActionTypes.SET_TASK_CALL_IN_PROGRESS),
        payload: false,
      });
    }
  },

  setActiveTask: (taskId) => {
    // Its a new task if task id is -1
    dispatch({
      type: boTaskManagerNameSpacer(tasksActionTypes.SET_ACTIVE_TASK_ID),
      payload: taskId,
    });
  },

  taskFieldChangeHandler: (field, value) => {
    dispatch({
      type: boTaskManagerNameSpacer(tasksActionTypes.UPDATE_ACTIVE_TASK_FIELD),
      payload: {
        field,
        value,
      },
    });
  },

  saveTask: async (task) => {
    dispatch({
      type: boTaskManagerNameSpacer(tasksActionTypes.SET_TASK_SAVE_IN_PROGRESS),
      payload: true,
    });

    try {
      let resp = await taskManagerApi.createOrUpdateTask(task);

      if (!task.id) {
        dispatch({
          type: boTaskManagerNameSpacer(tasksActionTypes.RESET_NEW_TASK),
        });

        console.log(resp);
        dispatch({
          type: boTaskManagerNameSpacer(tasksActionTypes.SET_ACTIVE_TASK_ID),
          payload: _.get(resp, "data.task.id", null),
        });
        dispatch({
          type: boTaskManagerNameSpacer(tasksActionTypes.SET_SHOULD_REFRESH_TASK_LIST),
          payload: true,
        });
      } else {
        dispatch({
          type: boTaskManagerNameSpacer(tasksActionTypes.UPDATE_ACTIVE_TASK),
          payload: resp?.data || {},
        });
      }

      dispatch({
        type: boTaskManagerNameSpacer(tasksActionTypes.SET_TASK_SAVE_ERROR),
        payload: "",
      });

      dispatch({
        type: boTaskManagerNameSpacer(tasksActionTypes.SET_TASK_SAVE_IN_PROGRESS),
        payload: false,
      });
    } catch (e) {
      dispatch({
        type: boTaskManagerNameSpacer(tasksActionTypes.SET_TASK_SAVE_ERROR),
        payload: _.get(e, "response.data.error", "Something went wrong!"),
      });

      dispatch({
        type: boTaskManagerNameSpacer(tasksActionTypes.SET_TASK_SAVE_IN_PROGRESS),
        payload: false,
      });
    }
  },

  setShouldRefreshTaskList: (value) => {
    dispatch({
      type: boTaskManagerNameSpacer(tasksActionTypes.SET_SHOULD_REFRESH_TASK_LIST),
      payload: false,
    });
  },

  resetFullState: () => {
    dispatch({
      type: boTaskManagerNameSpacer(tasksActionTypes.RESET_FULL_STATE),
    });
  },

  setActiveAssignBox: (assignType) => {
    // assignType can be one of 'location', 'day', 'shift' or ''
    dispatch({
      type: boTaskManagerNameSpacer(tasksActionTypes.SET_ACTIVE_ASSIGN_BOX),
      payload: assignType,
    });
  },

  setLocationAssignBoxSelection: (type, value) => {
    // type is region, district or location and value is id
    dispatch({
      type: boTaskManagerNameSpacer(tasksActionTypes.SET_LOCATION_ASSIGN_BOX_SELECTION),
      payload: {
        type,
        value,
      },
    });
  },

  handleLocationAssignCheckboxClick: (
    type,
    value,
    taskId,
    regionId,
    districtId,
    locationId
  ) => {
    dispatch({
      type: boTaskManagerNameSpacer(tasksActionTypes.SET_LOCATION_ASSIGN_CHECKBOX_STATE),
      payload: {
        type,
        value,
        taskId,
        regionId,
        districtId,
        locationId,
      },
    });
  },

  handleLocationOnlyAssignCheckboxClick: (taskId, locationId) => {
    dispatch({
      type: boTaskManagerNameSpacer(
        tasksActionTypes.SET_LOCATION_ONLY_ASSIGN_BOX_SELECTION
      ),
      payload: {
        taskId,
        locationId,
      },
    });
  },

  handleDayAssignCheckboxClick: (taskId, day) => {
    dispatch({
      type: boTaskManagerNameSpacer(tasksActionTypes.SET_DAY_ASSIGN_CHECKBOX_STATE),
      payload: {
        taskId,
        day,
      },
    });
  },

  handleShiftAssignCheckboxClick: (taskId, shiftName) => {
    dispatch({
      type: boTaskManagerNameSpacer(tasksActionTypes.SET_SHIFT_ASSIGN_CHECKBOX_STATE),
      payload: {
        taskId,
        shiftName,
      },
    });
  },

  handleSelectedLocationChange: (taskId, selectedLocations) => {
    dispatch({
      type: boTaskManagerNameSpacer(tasksActionTypes.SET_SELECTED_LOCATIONS),
      payload: {
        taskId,
        selectedLocations,
      },
    });
  },

  archiveTask: async (task, archiveBoolean) => {
    dispatch({
      type: boTaskManagerNameSpacer(tasksActionTypes.SET_TASK_SAVE_IN_PROGRESS),
      payload: true,
    });

    try {
      let resp = await taskManagerApi.archiveTask(task.id, {archiveBoolean});

      if (!task.id) {
        dispatch({
          type: boTaskManagerNameSpacer(tasksActionTypes.RESET_NEW_TASK),
        });

        console.log(resp);
        dispatch({
          type: boTaskManagerNameSpacer(tasksActionTypes.SET_ACTIVE_TASK_ID),
          payload: _.get(resp, "data.task.id", null),
        });
        dispatch({
          type: boTaskManagerNameSpacer(tasksActionTypes.SET_SHOULD_REFRESH_TASK_LIST),
          payload: true,
        });
      } else {
        dispatch({
          type: boTaskManagerNameSpacer(tasksActionTypes.UPDATE_ACTIVE_TASK),
          payload: resp?.data || {},
        });

        dispatch({
          type: boTaskManagerNameSpacer(tasksActionTypes.SET_SHOULD_REFRESH_TASK_LIST),
          payload: true,
        });
      }

      dispatch({
        type: boTaskManagerNameSpacer(tasksActionTypes.SET_TASK_SAVE_ERROR),
        payload: "",
      });

      dispatch({
        type: boTaskManagerNameSpacer(tasksActionTypes.SET_TASK_SAVE_IN_PROGRESS),
        payload: false,
      });
    } catch (e) {
      dispatch({
        type: boTaskManagerNameSpacer(tasksActionTypes.SET_TASK_SAVE_ERROR),
        payload: _.get(e, "response.data.error", "Something went wrong!"),
      });

      dispatch({
        type: boTaskManagerNameSpacer(tasksActionTypes.SET_TASK_SAVE_IN_PROGRESS),
        payload: false,
      });
    }
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(TaskManager);
