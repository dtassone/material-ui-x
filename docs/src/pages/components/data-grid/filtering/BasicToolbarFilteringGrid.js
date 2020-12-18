import * as React from 'react';
import { DataGrid } from '@material-ui/data-grid';
import { useDemoData } from '@material-ui/x-grid-data-generator';

const riceFilterModel = {
  items: [{ columnField: 'commodity', operatorValue: 'contains', value: 'rice' }],
};

export default function BasicFilteringGrid() {
  const { data } = useDemoData({
    dataSet: 'Commodity',
    rowLength: 100,
    maxColumns: 6,
  });

  return (
    <div style={{ height: 400, width: '100%' }}>
      <DataGrid {...data} filterModel={riceFilterModel} showToolbar />
    </div>
  );
}