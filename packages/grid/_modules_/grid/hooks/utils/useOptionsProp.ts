import * as React from 'react';
import { GridComponentProps, GridOptionsProp } from '../../GridComponentProps';
import {ApiRef, DEFAULT_GRID_OPTIONS, GridOptions} from '../../models';
import { mergeOptions } from '../../utils';
import {useGridReducer} from "../features/core/useGridReducer";


// REDUCER
export function optionsReducer(
  state: GridOptions,
  action: { type: string; payload?: Partial<GridOptions> },
) {
  switch (action.type) {
    case 'options::UPDATE':
      return mergeOptions(state, action.payload);
    default:
      throw new Error(`Material-UI: Action ${action.type} not found.`);
  }
}

export function useOptionsProp(apiRef: ApiRef, props: GridComponentProps): GridOptions {
  // TODO Refactor to smaller objects
  const options: GridOptionsProp = React.useMemo(
    () => ({
      pageSize: props.pageSize,
      logger: props.logger,
      sortingMode: props.sortingMode,
      autoHeight: props.autoHeight,
      autoPageSize: props.autoPageSize,
      checkboxSelection: props.checkboxSelection,
      columnBuffer: props.columnBuffer,
      columnTypes: props.columnTypes,
      disableSelectionOnClick: props.disableSelectionOnClick,
      disableMultipleColumnsSorting: props.disableMultipleColumnsSorting,
      disableMultipleSelection: props.disableMultipleSelection,
      disableColumnResize: props.disableColumnResize,
      disableExtendRowFullWidth: props.disableExtendRowFullWidth,
      headerHeight: props.headerHeight,
      hideFooter: props.hideFooter,
      hideFooterPagination: props.hideFooterPagination,
      hideFooterRowCount: props.hideFooterRowCount,
      hideFooterSelectedRowCount: props.hideFooterSelectedRowCount,
      icons: props.icons,
      logLevel: props.logLevel,
      onCellClick: props.onCellClick,
      onCellHover: props.onCellHover,
      onColumnHeaderClick: props.onColumnHeaderClick,
      onError: props.onError,
      onPageChange: props.onPageChange,
      onPageSizeChange: props.onPageSizeChange,
      onRowClick: props.onRowClick,
      onRowHover: props.onRowHover,
      onRowSelected: props.onRowSelected,
      onSelectionChange: props.onSelectionChange,
      onSortModelChange: props.onSortModelChange,
      page: props.page,
      pagination: props.pagination,
      paginationMode: props.paginationMode,
      rowCount: props.rowCount,
      rowHeight: props.rowHeight,
      rowsPerPageOptions: props.rowsPerPageOptions,
      scrollbarSize: props.scrollbarSize,
      showCellRightBorder: props.showCellRightBorder,
      showColumnRightBorder: props.showColumnRightBorder,
      sortingOrder: props.sortingOrder,
      sortModel: props.sortModel,
    }),
    [
      props.pageSize,
      props.logger,
      props.sortingMode,
      props.autoHeight,
      props.autoPageSize,
      props.checkboxSelection,
      props.columnBuffer,
      props.columnTypes,
      props.disableSelectionOnClick,
      props.disableMultipleColumnsSorting,
      props.disableMultipleSelection,
      props.disableColumnResize,
      props.disableExtendRowFullWidth,
      props.headerHeight,
      props.hideFooter,
      props.hideFooterPagination,
      props.hideFooterRowCount,
      props.hideFooterSelectedRowCount,
      props.icons,
      props.logLevel,
      props.onCellClick,
      props.onCellHover,
      props.onColumnHeaderClick,
      props.onError,
      props.onPageChange,
      props.onPageSizeChange,
      props.onRowClick,
      props.onRowHover,
      props.onRowSelected,
      props.onSelectionChange,
      props.onSortModelChange,
      props.page,
      props.pagination,
      props.paginationMode,
      props.rowCount,
      props.rowHeight,
      props.rowsPerPageOptions,
      props.scrollbarSize,
      props.showCellRightBorder,
      props.showColumnRightBorder,
      props.sortingOrder,
      props.sortModel,
    ],
  );

  const [optionsState, dispatch] = useGridReducer(apiRef, 'options', optionsReducer, DEFAULT_GRID_OPTIONS)
  //
  // const [internalOptions, setInternalOptions] = React.useState<GridOptions>(
  //   mergeOptions(DEFAULT_GRID_OPTIONS, options),
  // );

  const updateOptions = React.useCallback((newOptions: Partial<GridOptions>)=> {
    dispatch({type: 'options::UPDATE', payload: newOptions})
  }, [dispatch])

  React.useEffect(() => {
    // setInternalOptions((previousState) => mergeOptions(previousState, options));
    updateOptions(options);
  }, [options, updateOptions]);

  // Should we sync paginationState.pageSize with options.pageSize?
  // React.useEffect(() => {
  //   setInternalOptions((previousState) => {
  //     if (previousState.pageSize !== paginationProps.pageSize) {
  //       return { ...previousState, pageSize: paginationProps.pageSize };
  //     }
  //     return previousState;
  //   });
  // }, [paginationProps.pageSize, setInternalOptions]);

  return optionsState;
}
