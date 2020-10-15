import { GridApi } from '../models/api/apiRef';
import { RowModel, CellValue } from '../models/rows';
import { ColDef } from '../models/colDef/colDef';
import { GridInstanceApi } from '../models/api/gridInstanceApi';
import { CellParams } from '../models/params/cellParams';
import { RowParams } from '../models/params/rowParams';

export function buildCellParams({
  element,
  value,
  rowIndex,
  rowModel,
  colDef,
  api,
}: {
  rowModel: RowModel;
  colDef: ColDef;
  rowIndex?: number;
  value: CellValue;
  api: GridApi;
  element?: HTMLElement;
}): CellParams {
  return {
    element,
    value,
    field: colDef?.field,
    getValue: (field: string) => rowModel.data[field],
    data: rowModel.data,
    rowModel,
    colDef,
    rowIndex,
    api,
  };
}

export function buildRowParams({
  element,
  rowIndex,
  rowModel,
  api,
}: {
  rowModel: RowModel;
  colDef: ColDef;
  rowIndex: number;
  api: GridApi;
  element?: HTMLElement;
}): RowParams {
  return {
    element,
    columns: api.instance.getAllColumns(),
    getValue: (field: string) => rowModel.data[field],
    data: rowModel.data,
    rowModel,
    rowIndex,
    api,
  };
}
