import * as React from 'react';
import {
  GRID_COLUMNS_CHANGE,
  GRID_FILTER_MODEL_CHANGE,
  GRID_ROWS_SET,
  GRID_ROWS_UPDATE,
} from '../../../constants/eventsConstants';
import { GridComponentProps } from '../../../GridComponentProps';
import { GridApiRef } from '../../../models/api/gridApiRef';
import { GridFilterApi } from '../../../models/api/gridFilterApi';
import { GridFeatureModeConstant } from '../../../models/gridFeatureMode';
import { GridFilterItem, GridLinkOperator } from '../../../models/gridFilterItem';
import { GridFilterModelParams } from '../../../models/params/gridFilterModelParams';
import { GridRowId, GridRowModel } from '../../../models/gridRows';
import { isDeepEqual } from '../../../utils/utils';
import { useGridApiEventHandler } from '../../root/useGridApiEventHandler';
import { useGridApiMethod } from '../../root/useGridApiMethod';
import { optionsSelector } from '../../utils/optionsSelector';
import { useLogger } from '../../utils/useLogger';
import { filterableGridColumnsIdsSelector } from '../columns/gridColumnsSelector';
import { useGridSelector } from '../core/useGridSelector';
import { useGridState } from '../core/useGridState';
import { GridPreferencePanelsValue } from '../preferencesPanel/gridPreferencePanelsValue';
import { sortedGridRowsSelector } from '../sorting/gridSortingSelector';
import {
  GridFilterModel,
  GridFilterModelState,
  getInitialGridFilterState,
} from './gridFilterModelState';
import { getInitialVisibleGridRowsState } from './visibleGridRowsState';
import { visibleSortedGridRowsSelector } from './gridFilterSelector';

export const useGridFilter = (
  apiRef: GridApiRef,
  props: Pick<GridComponentProps, 'rows' | 'filterModel' | 'onFilterModelChange'>,
): void => {
  const logger = useLogger('useGridFilter');
  const [gridState, setGridState, forceUpdate] = useGridState(apiRef);
  const filterableColumnsIds = useGridSelector(apiRef, filterableGridColumnsIdsSelector);
  const options = useGridSelector(apiRef, optionsSelector);

  const getFilterModelParams = React.useCallback(
    (): GridFilterModelParams => ({
      filterModel: apiRef.current.getState<GridFilterModelState>('filter'),
      api: apiRef.current,
      columns: apiRef.current.getAllColumns(),
      rows: apiRef.current.getRowModels(),
      visibleRows: apiRef.current.getVisibleRowModels(),
    }),
    [apiRef],
  );

  const clearFilteredRows = React.useCallback(() => {
    logger.debug('clearing filtered rows');
    setGridState((state) => ({
      ...state,
      visibleRows: getInitialVisibleGridRowsState(),
    }));
  }, [logger, setGridState]);

  const applyFilter = React.useCallback(
    (filterItem: GridFilterItem, linkOperator: GridLinkOperator = GridLinkOperator.And) => {
      if (!filterItem.columnField || !filterItem.operatorValue) {
        return;
      }

      const column = apiRef.current.getColumn(filterItem.columnField);
      if (!column) {
        return;
      }

      const parsedValue = column.valueParser
        ? column.valueParser(filterItem.value)
        : filterItem.value;
      const newFilterItem = { ...filterItem, value: parsedValue };

      logger.debug(
        `Filtering column: ${newFilterItem.columnField} ${newFilterItem.operatorValue} ${newFilterItem.value} `,
      );

      const filterOperators = column.filterOperators;
      if (!filterOperators?.length) {
        throw new Error(`Material-UI: No filter operators found for column '${column.field}'.`);
      }

      const filterOperator = filterOperators.find(
        (operator) => operator.value === newFilterItem.operatorValue,
      )!;
      if (!filterOperator) {
        throw new Error(
          `Material-UI: No filter operator found for column '${column.field}' and operator value '${newFilterItem.operatorValue}'.`,
        );
      }

      const applyFilterOnRow = filterOperator.getApplyFilterFn(newFilterItem, column)!;
      if (typeof applyFilterOnRow !== 'function') {
        return;
      }

      setGridState((state) => {
        const visibleRowsLookup = { ...state.visibleRows.visibleRowsLookup };

        // We run the selector on the state here to avoid rendering the rows and then filtering again.
        // This way we have latest rows on the first rendering
        const rows = sortedGridRowsSelector(state);

        rows.forEach((row: GridRowModel, id: GridRowId) => {
          const params = apiRef.current.getCellParams(id, newFilterItem.columnField!);

          const isShown = applyFilterOnRow(params);
          if (visibleRowsLookup[id] == null) {
            visibleRowsLookup[id] = isShown;
          } else {
            visibleRowsLookup[id] =
              linkOperator === GridLinkOperator.And
                ? visibleRowsLookup[id] && isShown
                : visibleRowsLookup[id] || isShown;
          }
        });

        return {
          ...state,
          visibleRows: {
            ...state.visibleRows,
            visibleRowsLookup,
            visibleRows: Object.entries(visibleRowsLookup)
              .filter(([, isVisible]) => isVisible)
              .map(([id]) => id),
          },
        };
      });
      forceUpdate();
    },
    [apiRef, forceUpdate, logger, setGridState],
  );

  const applyFilters = React.useCallback(() => {
    if (options.filterMode === GridFeatureModeConstant.server) {
      forceUpdate();
      return;
    }

    clearFilteredRows();

    const { items, linkOperator } = apiRef.current.state.filter;
    items.forEach((filterItem) => {
      apiRef.current.applyFilter(filterItem, linkOperator);
    });
    forceUpdate();
  }, [apiRef, clearFilteredRows, forceUpdate, options.filterMode]);

  const upsertFilter = React.useCallback(
    (item: GridFilterItem) => {
      logger.debug('Upserting filter');

      setGridState((state) => {
        const items = [...state.filter.items];
        const newItem = { ...item };
        const itemIndex = items.findIndex((filterItem) => filterItem.id === newItem.id);

        if (items.length === 1 && isDeepEqual(items[0], {})) {
          // we replace the first filter as it's empty
          items[0] = newItem;
        } else if (itemIndex === -1) {
          items.push(newItem);
        } else {
          items[itemIndex] = newItem;
        }

        if (newItem.id == null) {
          newItem.id = Math.round(Math.random() * 1e5);
        }

        if (newItem.columnField == null) {
          newItem.columnField = filterableColumnsIds[0];
        }
        if (newItem.columnField != null && newItem.operatorValue == null) {
          // we select a default operator
          const column = apiRef!.current!.getColumn(newItem.columnField);
          newItem.operatorValue = column && column!.filterOperators![0].value!;
        }
        if (options.disableMultipleColumnsFiltering && items.length > 1) {
          items.length = 1;
        }
        const newState = {
          ...state,
          filter: { ...state.filter, items },
        };
        return newState;
      });
      applyFilters();
    },
    [
      logger,
      setGridState,
      apiRef,
      applyFilters,
      options.disableMultipleColumnsFiltering,
      filterableColumnsIds,
    ],
  );

  const deleteFilter = React.useCallback(
    (item: GridFilterItem) => {
      logger.debug(`Deleting filter on column ${item.columnField} with value ${item.value}`);
      let hasNoItem = false;
      setGridState((state) => {
        const items = [...state.filter.items.filter((filterItem) => filterItem.id !== item.id)];
        hasNoItem = items.length === 0;
        const newState = {
          ...state,
          filter: { ...state.filter, items },
        };
        return newState;
      });
      if (hasNoItem) {
        upsertFilter({});
      }
      applyFilters();
      // apiRef.current.publishEvent(GRID_FILTER_MODEL_CHANGE, getFilterModelParams());
    },
    [applyFilters, logger, setGridState, upsertFilter],
  );

  const showFilterPanel = React.useCallback(
    (targetColumnField?: string) => {
      logger.debug('Displaying filter panel');
      if (targetColumnField) {
        const lastFilter =
          gridState.filter.items.length > 0
            ? gridState.filter.items[gridState.filter.items.length - 1]
            : null;
        if (!lastFilter || lastFilter.columnField !== targetColumnField) {
          apiRef!.current.upsertFilter({ columnField: targetColumnField });
        }
      }
      apiRef.current.showPreferences(GridPreferencePanelsValue.filters);
    },
    [apiRef, gridState.filter.items, logger],
  );
  const hideFilterPanel = React.useCallback(() => {
    logger.debug('Hiding filter panel');
    apiRef?.current.hidePreferences();
  }, [apiRef, logger]);

  const applyFilterLinkOperator = React.useCallback(
    (linkOperator: GridLinkOperator = GridLinkOperator.And) => {
      logger.debug('Applying filter link operator');
      setGridState((state) => ({
        ...state,
        filter: { ...state.filter, linkOperator },
      }));
      applyFilters();
      // apiRef.current.publishEvent(GRID_FILTER_MODEL_CHANGE, getFilterModelParams());
    },
    [applyFilters, logger, setGridState],
  );

  const clearFilterModel = React.useCallback(() => {
    clearFilteredRows();
    logger.debug('Clearing filter model');
    setGridState((state) => ({ ...state, filter: getInitialGridFilterState() }));
  }, [clearFilteredRows, logger, setGridState]);

  const setFilterModel = React.useCallback(
    (model: GridFilterModel) => {
      clearFilterModel();
      logger.debug('Setting filter model');
      applyFilterLinkOperator(model.linkOperator);
      model.items.forEach((item) => upsertFilter(item));
      // apiRef.current.publishEvent(GRID_FILTER_MODEL_CHANGE, getFilterModelParams());
    },
    [applyFilterLinkOperator, clearFilterModel, logger, upsertFilter],
  );

  const getVisibleRowModels = React.useCallback(
    () => visibleSortedGridRowsSelector(apiRef.current.state),
    [apiRef],
  );

  useGridApiMethod<GridFilterApi>(
    apiRef,
    {
      applyFilterLinkOperator,
      applyFilters,
      applyFilter,
      deleteFilter,
      upsertFilter,
      setFilterModel,
      showFilterPanel,
      hideFilterPanel,
      getVisibleRowModels,
    },
    'FilterApi',
  );

  useGridApiEventHandler(apiRef, GRID_ROWS_SET, apiRef.current.applyFilters);
  useGridApiEventHandler(apiRef, GRID_ROWS_UPDATE, apiRef.current.applyFilters);

  React.useEffect(() => {
    if (!props.filterModel) {
      return;
    }
    const filterModel = props.filterModel;
    const oldFilterModel = apiRef.current.state.filter;
    if (filterModel && !isDeepEqual(filterModel, oldFilterModel)) {
      logger.debug('filterModel prop changed, applying filters');
      // we use apiRef to avoid watching setFilterModel as it will trigger an update on every state change
      apiRef.current.setFilterModel(filterModel);
    }
  }, [apiRef, logger, props.filterModel]);

  React.useEffect(() => {
    if (apiRef.current) {
      logger.debug('Rows prop changed, applying filters');
      clearFilteredRows();
      apiRef.current.applyFilters();
    }
  }, [apiRef, clearFilteredRows, logger, props.rows]);

  const onColUpdated = React.useCallback(() => {
    logger.debug('onColUpdated - GridColumns changed, applying filters');
    const filterState = apiRef.current.getState<GridFilterModelState>('filter');
    const columnsIds = filterableGridColumnsIdsSelector(apiRef.current.state);
    logger.debug('GridColumns changed, applying filters');

    filterState.items.forEach((filter) => {
      if (!columnsIds.find((field) => field === filter.columnField)) {
        apiRef.current.deleteFilter(filter);
      }
    });
    apiRef.current.applyFilters();
  }, [apiRef, logger]);

  React.useEffect(() => {
    apiRef.current.registerControlState<GridFilterModel, GridFilterModelState>({
      stateId: 'filter',
      propModel: props.filterModel,
      propOnChange: props.onFilterModelChange,
      stateSelector: (state) => state.filter,
      // TODO here we don't need the callback arg.
      // Should we also call applyFilters?
      onChangeCallback: (model) => apiRef.current.publishEvent(GRID_FILTER_MODEL_CHANGE, model),
    });
  }, [apiRef, getFilterModelParams, props.filterModel, props.onFilterModelChange]);

  useGridApiEventHandler(apiRef, GRID_COLUMNS_CHANGE, onColUpdated);
};
