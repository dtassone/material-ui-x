import { GridApi } from '../api/apiRef';

export interface ColParams {
  /**
   * The column field of the column that triggered the event
   */
  field: string;
  /**
   * The column of the current header component.
   */
  colDef: any;
  /**
   * The column index of the current header component.
   */
  colIndex: number;
  /**
   * API ref that let you manipulate the grid.
   */
  api: GridApi;

}
