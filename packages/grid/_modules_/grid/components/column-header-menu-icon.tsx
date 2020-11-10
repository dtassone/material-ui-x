import * as React from 'react';
import IconButton from '@material-ui/core/IconButton';
import { useGridState } from '../hooks/features/core/useGridState';
import { useIcons } from '../hooks/utils/useIcons';
import { ApiContext } from './api-context';
import { ColDef } from '../models/colDef/colDef';

export interface ColumnHeaderFilterIconProps {
  column: ColDef;
}

export const ColumnHeaderMenuIcon: React.FC<ColumnHeaderFilterIconProps> = React.memo(
  ({ column }) => {
    const icons = useIcons();
    const icon = React.createElement(icons.columnMenu!, {});
    const apiRef = React.useContext(ApiContext);
    const [, setGridState, forceUpdate] = useGridState(apiRef!);

    const menuIconClick = React.useCallback(
      () => {
        setGridState(state=> ({...state, columnMenu: {open: true, field: column.field}}));
        forceUpdate();
      },
      [column.field, forceUpdate, setGridState],
    );

    return (
      <div className={'MuiDataGrid-menuIcon'}>
        <IconButton aria-label="Sort" size="small" onClick={menuIconClick}>
          {icon}
        </IconButton>
      </div>
    );
  },
);
ColumnHeaderMenuIcon.displayName = 'ColumnHeaderFilterIcon';
