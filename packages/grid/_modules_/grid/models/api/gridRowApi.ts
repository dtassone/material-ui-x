import { GridCellMode } from '../gridCell';
import { GridRowModel, GridRowId, GridRowModelUpdate } from '../gridRows';
import { GridEditRowsModel } from '../../hooks/features/rows/useGridEditRows';
import { GridCellParams } from '../params/gridCellParams';

/**
 * The Row API interface that is available in the grid [[apiRef]].
 */
export interface GridRowApi {
  /**
   * Get the full set of rows as [[Rows]].
   * @returns [[Rows]]
   */
  getRowModels: () => GridRowModel[];
  /**
   * Get the total number of rows in the grid.
   */
  getRowsCount: () => number;
  /**
   * Return the list of row Ids.
   */
  getAllRowIds: () => GridRowId[];
  /**
   * Set a new set of Rows.
   * @param rows
   */
  setRows: (rows: GridRowModel[]) => void;
  /**
   * Update any properties of the current set of GridRowData[].
   * @param updates
   */
  updateRows: (updates: GridRowModelUpdate[]) => void;
  /**
   * Get the GridRowId of a row at a specific position.
   * @param index
   */
  getRowIdFromRowIndex: (index: number) => GridRowId;
  /**
   * Get the row index of a row with a given id.
   * @param id
   */
  getRowIndexFromId: (id: GridRowId) => number;
  /**
   * Get the [[GridRowModel]] of a given rowId.
   * @param id
   */
  getRowFromId: (id: GridRowId) => GridRowModel;
}

export interface GridEditRowApi {
  setEditRowsModel: (model: GridEditRowsModel) => void;
  setCellMode: (rowId: GridRowId, field: string, mode: GridCellMode) => void;
  isCellEditable: (params: GridCellParams) => boolean;
  setEditCellValue: (update: GridRowModelUpdate) => void;
  commitCellValueChanges: (update: GridRowModelUpdate) => void;
}
