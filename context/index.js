// @flow
import actions, { registerActions } from './actionRegistry';
import services, { registerServices } from './serviceRegistry';

export { actions, services };

export const context = {
  actions,
  registerActions,
  services,
  registerServices,
};
