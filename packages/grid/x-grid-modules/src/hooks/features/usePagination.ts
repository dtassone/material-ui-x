import * as React from 'react';
import { useLogger } from '../utils';
import {
  PAGE_CHANGED_EVENT,
  PAGESIZE_CHANGED_EVENT,
  RESIZE,
} from '../../constants/eventsConstants';
import { useApiMethod } from '../root/useApiMethod';
import { useApiEventHandler } from '../root/useApiEventHandler';
import { PageChangedParams } from '../../models/params/pageChangedParams';
import { Rows } from '../../models/rows';
import { InternalColumns } from '../../models/colDef/colDef';
import { GridOptions } from '../../models/gridOptions';
import { PaginationApi } from '../../models/api/paginationApi';
import { ApiRef } from '../../models/api';

export interface PaginationProps {
  page: number;
  pageCount: number;
  pageSize: number;
  rowCount: number;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
}
export type PaginationState = PageChangedParams;
const UPDATE_STATE_ACTION = 'updateState';

function updateStateAction(
  state: Partial<PaginationState>,
): { type: 'updateState'; payload: Partial<PaginationState> } {
  return { type: UPDATE_STATE_ACTION, payload: state };
}

function paginationReducer(
  state: PaginationState,
  action: { type: string; payload?: Partial<PaginationState> },
) {
  if (action.type === UPDATE_STATE_ACTION) {
    return { ...state, ...action.payload };
  }
  throw new Error(`Material-UI: Action ${action.type} not found.`);
}

const getPageCount = (pageSize: number | undefined, rowsCount: number) => {
  return pageSize && rowsCount > 0 ? Math.ceil(rowsCount / pageSize!) : 1;
};

export const usePagination = (
  rows: Rows,
  columns: InternalColumns,
  options: GridOptions,
  apiRef: ApiRef,
): PaginationProps => {
  const logger = useLogger('usePagination');

  const initialState: PaginationState = {
    pageSize: options.paginationPageSize || 0,
    rowCount: rows.length,
    page: 1,
    pageCount: getPageCount(options.paginationPageSize, rows.length),
  };
  const stateRef = React.useRef(initialState);
  const [state, dispatch] = React.useReducer(paginationReducer, initialState);

  const updateState = React.useCallback(
    (stateUpdate: Partial<PaginationState>) => {
      const newState = { ...stateRef.current, ...stateUpdate };
      stateRef.current = newState;
      dispatch(updateStateAction(newState));
    },
    [dispatch],
  );

  const setPage = React.useCallback(
    (page: number) => {
      if (apiRef && apiRef.current) {
        apiRef.current!.renderPage(page);
        const params: PageChangedParams = {
          ...stateRef.current,
          page,
        };
        apiRef.current!.emit(PAGE_CHANGED_EVENT, params);
      }
      if (stateRef.current.page !== page) {
        updateState({ page });
      }
    },
    [updateState, apiRef],
  );

  // We use stateRef in this method to avoid reattaching this method to the api every time the state changes
  const setPageSize = React.useCallback(
    (pageSize: number) => {
      if (stateRef.current.pageSize === pageSize) {
        return;
      }

      const oldPageSize = stateRef.current.pageSize;
      const newPageCount = getPageCount(pageSize, stateRef.current.rowCount);
      const firstRowIdx = (stateRef.current.page - 1) * oldPageSize;
      let newPage = Math.floor(firstRowIdx / pageSize) + 1;
      newPage = newPage > newPageCount ? newPageCount : newPage;
      newPage = newPage < 1 ? 1 : newPage;
      logger.info(
        `PageSize changed to ${pageSize}, setting page to ${newPage}, total page count is ${newPageCount}`,
      );
      const newState: PaginationState = {
        ...stateRef.current,
        page: newPage,
        pageCount: newPageCount,
        pageSize,
      };
      apiRef.current!.emit(PAGESIZE_CHANGED_EVENT, newState as PageChangedParams);

      updateState(newState);
      setPage(newPage);
    },
    [stateRef, apiRef, setPage, updateState, logger],
  );

  const onPageChanged = React.useCallback(
    (handler: (param: PageChangedParams) => void): (() => void) => {
      return apiRef!.current!.registerEvent(PAGE_CHANGED_EVENT, handler);
    },
    [apiRef],
  );
  const onPageSizeChanged = React.useCallback(
    (handler: (param: PageChangedParams) => void): (() => void) => {
      return apiRef!.current!.registerEvent(PAGESIZE_CHANGED_EVENT, handler);
    },
    [apiRef],
  );

  const getAutoPageSize = React.useCallback(() => {
    const containerProps = apiRef?.current?.getContainerPropsState();
    return containerProps?.viewportPageSize;
  }, [apiRef]);

  const resetAutopageSize = React.useCallback(() => {
    const autoPagesize = getAutoPageSize();
    if (autoPagesize) {
      logger.debug(`Setting autoPagesize to ${autoPagesize}`);
      setPageSize(autoPagesize);
    }
  }, [setPageSize, logger, getAutoPageSize]);

  React.useEffect(() => {
    stateRef.current = state;
  }, [state]);

  React.useEffect(() => {
    if (rows.length !== state.rowCount) {
      logger.info(`Options or rows changed, recalculating pageCount and rowCount`);
      const newPageCount = getPageCount(state.pageSize, rows.length);

      updateState({ pageCount: newPageCount, rowCount: rows.length });
      if (state.page > newPageCount) {
        setPage(newPageCount);
      }
    }
  }, [rows.length, logger, updateState, state.rowCount, state.pageSize, setPage, state.page]);

  React.useEffect(() => {
    if (
      !options.paginationAutoPageSize &&
      options.paginationPageSize &&
      options.paginationPageSize !== stateRef.current.pageSize
    ) {
      setPageSize(options.paginationPageSize);
    }
  }, [options.paginationAutoPageSize, options.paginationPageSize, logger, setPageSize]);

  React.useEffect(() => {
    if (options.paginationAutoPageSize && columns.visible.length > 0) {
      resetAutopageSize();
    }
  }, [options.paginationAutoPageSize, resetAutopageSize, columns.visible.length]);

  useApiEventHandler(apiRef, PAGE_CHANGED_EVENT, options.onPageChanged);
  useApiEventHandler(apiRef, PAGESIZE_CHANGED_EVENT, options.onPageSizeChanged);

  const onResize = React.useCallback(() => {
    if (options.paginationAutoPageSize) {
      resetAutopageSize();
    }
  }, [options.paginationAutoPageSize, resetAutopageSize]);

  useApiEventHandler(apiRef, RESIZE, onResize);

  const paginationApi: PaginationApi = {
    setPageSize,
    setPage,
    onPageChanged,
    onPageSizeChanged,
  };

  useApiMethod(apiRef, paginationApi, 'paginationApi');

  return {
    ...state,
    setPage,
    setPageSize,
  };
};
