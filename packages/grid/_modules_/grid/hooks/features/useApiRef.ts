import * as React from 'react';
import { ApiRef, GridApi } from '../../models/api/apiRef';
import { getInitialState } from './core/gridState';

const EventEmitter = require('events').EventEmitter;

export function createGridApi(): GridApi {
  return {instance: new EventEmitter(), isInitialised: false, state: getInitialState()};
}

/**
 * Hook that instantiate an ApiRef to pass in component prop.
 */
export function useApiRef(apiRefProp?: ApiRef): ApiRef {
  const internalApiRef = React.useRef<GridApi>(createGridApi());
  const apiRef = React.useMemo(() => apiRefProp || internalApiRef, [apiRefProp, internalApiRef]);

  return apiRef;
}
