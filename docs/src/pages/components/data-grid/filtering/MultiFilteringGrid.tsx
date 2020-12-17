import { FilterModel, LinkOperator, XGrid } from '@material-ui/x-grid';
import { useDemoData } from '@material-ui/x-grid-data-generator';
import * as React from 'react';

const filterModel: FilterModel = {
  items: [
    { columnField: 'commodity', operatorValue: 'contains', value: 'rice' },
    { columnField: 'quantity', operatorValue: '>=', value: '20000' },
  ],
};

export default function MultiFilteringGrid() {
  const { data } = useDemoData({
    dataSet: 'Commodity',
    rowLength: 100,
    maxColumns: 6,
  });

  return (
    <div style={{ height: 400, width: '100%' }}>
      <XGrid {...data} filterModel={filterModel} />
    </div>
  );
}
