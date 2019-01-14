// @flow
import { extractServices, extractActions, extractReducers } from './extract';

import { context } from './context';

export { configureStore } from './store';

export const reduxContext = context;

const createActions = (name, action) => {
  const TYPE = action.toUpperCase();
  return {
    [TYPE]: `${name}/${TYPE}`,
    [`${TYPE}_SUCCESS`]: `${name}/${TYPE}_SUCCESS`,
    [`${TYPE}_FAIL`]: `${name}/${TYPE}_FAIL`,
  };
};

export const createActionTypes = name => actions =>
  actions.reduce(
    (acc, action) => ({ ...acc, ...createActions(name, action) }),
    {}
  );

const initActions = name => (actionNames = [], service, extraActions = {}) =>
  actionNames.reduce(
    (acc, action) => ({
      [action]: payload => ({
        type: `${name}/${action.toUpperCase()}`,
        payload,
      }),
      // createAsyncAction(
      //   action[actionName],
      //   async (payload, dispatch, getState) => {
      //     const response = await service[actionName](payload);
      //     return response;
      //   }
      // ),
      ...acc,
    }),
    extraActions
  );

const initReducerDefault = types => {
  const initialState = {
    list: [],
    isFetching: false,
  };

  const reducer = (state = initialState, action) => {
    const { type, payload } = action;
    switch (type) {
      case types.LOAD:
        return { ...state, isFetching: true };
      case types.LOAD_SUCCESS:
        return { ...state, isFetching: false, list: payload.data };
      case types.LOAD_FAIL:
        return {
          ...state,
          isFetching: false,
          error: 'Error while fetching data',
        };
      default:
        return state;
    }
  };

  return reducer;
};

const createServices = (actions = [], provider = {}) =>
  actions.reduce((acc, action) => ({ ...acc, [action]: provider[action] }), {});

const configureModule = name => (config, services = { actionNames: [] }) => {
  const { actionNames, initReducer, moduleActions } = config;
  const types = createActionTypes(name)(actionNames);
  const actions = initActions(name)(actionNames, services, moduleActions);
  const reducer = initReducer ? initReducer(types) : initReducerDefault(types);

  return { actions, reducer, types };
};

const defaultProvider = {
  repos: {
    load: () => {},
  },
  users: {
    load: () => {},
  },
};

const createModule = name => config => {
  const provider = defaultProvider[name] || {};
  const services = createServices(config.actionNames, provider);
  const module = configureModule(name)(config, services);

  return { ...module, services };
};

const createModules = (reducers = []) =>
  reducers.reduce((acc, reducerConfig) => {
    const { name, ...rest } = reducerConfig;
    const module = createModule(name)(rest);
    return { ...acc, [name]: module };
  }, {});

export const configureModules = (config = { reducers: [] }) => {
  const { reducers } = config;
  const modules = createModules(reducers);

  const services = extractServices(modules);
  const actions = extractActions(modules);

  context.registerServices(services);
  context.registerActions(actions);
  return {
    services,
    actions,
    reducers: extractReducers(modules),
  };
};
