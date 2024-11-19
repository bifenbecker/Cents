export const createReducer = (initialState, handlers, namespaces = []) => {
  return (state = initialState, action) => {
    if (namespaces.includes(getNamespace(action.type))) {
      if (handlers[action.type]) {
        return handlers[action.type](state, action);
      }
    }
    return state;
  };
};

export const createNamespacer = (namespace) => {
  return (action) => {
    return `${namespace}:${action}`;
  };
};

function getNamespace(action) {
  return action.split(":")[0];
}
