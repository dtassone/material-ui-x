import * as React from 'react';
import Checkbox from '@material-ui/core/Checkbox';
import { SelectionChangeParams } from '../models/params/selectionChangeParams';
import { ColParams } from '../models/params/colParams';
import { CellParams } from '../models/params/cellParams';

export const HeaderCheckbox: React.FC<ColParams> = ({ api }) => {
  const selectedRows = api.instance.getSelectedRows();
  const allRowsCount = api.instance.getAllRowIds().length;
  const isCurrentIndeterminate = selectedRows.length > 0 && selectedRows.length !== allRowsCount;
  const isCurrentChecked = selectedRows.length === allRowsCount || isCurrentIndeterminate;

  const [isChecked, setChecked] = React.useState(isCurrentChecked);
  const [isIndeterminate, setIndeterminate] = React.useState(isCurrentIndeterminate);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
    setChecked(checked);
    api.instance.selectRows(api.instance.getAllRowIds(), checked);
  };
  const selectionChange = React.useCallback(
    (event: SelectionChangeParams) => {
      const isAllSelected =
        api.instance.getAllRowIds().length === event.rows.length && event.rows.length > 0;
      const hasNoneSelected = event.rows.length === 0;
      setChecked(isAllSelected || !hasNoneSelected);
      setIndeterminate(!isAllSelected && !hasNoneSelected);
    },
    [api],
  );

  React.useEffect(() => {
    return api.instance.onSelectionChange(selectionChange);
  }, [api, selectionChange]);

  return (
    <Checkbox
      indeterminate={isIndeterminate}
      checked={isChecked}
      onChange={handleChange}
      className="MuiDataGrid-checkboxInput"
      color="primary"
      inputProps={{ 'aria-label': 'Select All Rows checkbox' }}
    />
  );
};
HeaderCheckbox.displayName = 'HeaderCheckbox';

export const CellCheckboxRenderer: React.FC<CellParams> = React.memo(({ api, rowModel, value }) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
    api.instance.selectRow(rowModel.id, checked, true);
  };

  return (
    <Checkbox
      checked={!!value}
      onChange={handleChange}
      className="MuiDataGrid-checkboxInput"
      color="primary"
      inputProps={{ 'aria-label': 'Select Row checkbox' }}
    />
  );
});
CellCheckboxRenderer.displayName = 'CellCheckboxRenderer';
