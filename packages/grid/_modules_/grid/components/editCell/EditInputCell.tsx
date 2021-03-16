import * as React from 'react';
import InputBase, { InputBaseProps } from '@material-ui/core/InputBase';
import { GRID_CELL_EDIT_BLUR } from '../../constants/eventsConstants';
import { GridCellParams } from '../../models/params/gridCellParams';
import { isCellEditCommitKeys } from '../../utils/keyboardUtils';
import { formatDateToLocalInputDate, isDate, mapColDefTypeToInputType } from '../../utils/utils';

export function EditInputCell(props: GridCellParams & InputBaseProps) {
  const {
    id,
    value,
    formattedValue,
    api,
    field,
    row,
    colDef,
    cellMode,
    getValue,
    rowIndex,
    colIndex,
    isEditable,
    ...inputBaseProps
  } = props;

  const [valueState, setValueState] = React.useState(value);

  const onValueChange = React.useCallback(
    (event) => {
      const newValue = event.target.value;
      const editProps = {
        value: colDef.type === 'date' || colDef.type === 'dateTime' ? new Date(newValue) : newValue,
      };
      setValueState(newValue);
      api.setEditCellProps({ id, field, props: editProps });
    },
    [api, colDef.type, field, id],
  );

  const onKeyDown = React.useCallback(
    (event: React.KeyboardEvent) => {
      if (inputBaseProps.error && isCellEditCommitKeys(event.key)) {
        event.preventDefault();
        event.stopPropagation();
      }
    },
    [inputBaseProps.error],
  );
  const onBlur = React.useCallback(
    (event: React.SyntheticEvent) => {
      const params = api.getCellParams(id, field);
      api.publishEvent(GRID_CELL_EDIT_BLUR, params, event);
    },
    [api, field, id],
  );

  const inputType = mapColDefTypeToInputType(colDef.type);
  const inputFormattedValue =
    valueState && isDate(valueState)
      ? formatDateToLocalInputDate({ value: valueState, withTime: colDef.type === 'dateTime' })
      : valueState;

  React.useEffect(() => {
    setValueState(value);
  }, [value]);

  return (
    <InputBase
      autoFocus
      fullWidth
      className="MuiDataGrid-editCellInputBase"
      onKeyDown={onKeyDown}
      value={inputFormattedValue}
      onChange={onValueChange}
      onBlur={onBlur}
      type={inputType}
      {...inputBaseProps}
    />
  );
}
export const renderEditInputCell = (params) => <EditInputCell {...params} />;
