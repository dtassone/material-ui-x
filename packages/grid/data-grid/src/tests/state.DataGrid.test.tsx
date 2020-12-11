import * as React from 'react';
import { createClientRenderStrictMode } from 'test/utils/index';
import { expect } from 'chai';
import { DataGrid } from '@material-ui/data-grid';
import { getColumnValues } from 'test/utils/helperFn';

describe('<DataGrid />', () => {
  // TODO v5: replace with createClientRender
  const render = createClientRenderStrictMode();

  const baselineProps = {
    rows: [
      {
        id: 0,
        brand: 'Nike',
      },
      {
        id: 1,
        brand: 'Adidas',
      },
      {
        id: 2,
        brand: 'Puma',
      },
    ],
    columns: [{ field: 'brand' }],
  };

  describe('state', () => {
    before(function beforeHook() {
      if (/jsdom/.test(window.navigator.userAgent)) {
        // Need layouting
        this.skip();
      }
    });
    it('should allow to control the state using useState', async () => {
      function GridStateTest({ direction, sortedRows }) {
        const gridState = {
          sorting: { sortModel: [{ field: 'brand', sort: direction }], sortedRows },
        };

        return (
          <div style={{ width: 300, height: 500 }}>
            <DataGrid {...baselineProps} state={gridState} />
          </div>
        );
      }

      const { setProps } = render(<GridStateTest direction={'desc'} sortedRows={[2, 0, 1]} />);
      expect(getColumnValues()).to.deep.equal(['Puma', 'Nike', 'Adidas']);
      setProps({ direction: 'asc', sortedRows: [1, 0, 2] });
      expect(getColumnValues()).to.deep.equal(['Puma', 'Nike', 'Adidas'].reverse());
    });
  });
});
