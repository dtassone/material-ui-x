import * as React from 'react';
import { DataGrid, RowId } from '@material-ui/data-grid';
import { useDemoData } from '@material-ui/x-grid-data-generator';

export default function ControlledSelectionGrid() {
  const { data } = useDemoData({
    dataSet: 'Commodity',
    rowLength: 10,
    maxColumns: 6,
  });

  // TODO: https://github.com/mui-org/material-ui-x/issues/246
  const [selectionModel, setSelectionModel] = React.useState<RowId[]>([]);

  return (
    <div style={{ height: 400, width: '100%' }}>
      <DataGrid
        checkboxSelection
        onSelectionChange={(newSelection) => {
          setSelectionModel(newSelection.selectedRows.map((row) => row.id));
        }}
        selectionModel={selectionModel}
        {...data}
      />
    </div>
  );
}
