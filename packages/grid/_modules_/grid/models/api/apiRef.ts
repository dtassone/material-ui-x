import * as React from 'react';
import { GridState } from '../../hooks/features/core/gridState';
import { GridInstanceApi } from './gridInstanceApi';

export interface GridApi {
	instance: GridInstanceApi;
	state: GridState;

	/**
	 * Property that comes true when the grid has its EventEmitter initialised.
	 */
	isInitialised: boolean;
}

/**
 * The apiRef component prop type.
 */
export type ApiRef = React.MutableRefObject<GridApi>;
