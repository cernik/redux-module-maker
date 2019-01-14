// @flow
import { combineReducers, createStore, applyMiddleware, compose } from 'redux';
import axios from 'axios';
import axiosMiddleware from 'redux-axios-middleware';

const client = axios.create({
  baseURL: 'https://api.github.com',
  // baseURL: 'http://localhost:8081',
  responseType: 'json',
});

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose; //eslint-disable-line

export const configureStore = reducers => {
  const rootReducer = combineReducers(reducers);
  const middleware = composeEnhancers(
    ...[applyMiddleware(axiosMiddleware(client))]
  );
  return createStore(rootReducer, middleware);
};
