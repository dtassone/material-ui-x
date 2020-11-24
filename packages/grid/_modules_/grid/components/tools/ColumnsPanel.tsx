import { FormControl, IconButton, Switch } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import TextField from '@material-ui/core/TextField';
import * as React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { allColumnsSelector } from '../../hooks/features/columns/columnsSelector';
import { useGridSelector } from '../../hooks/features/core/useGridSelector';
import { PREVENT_HIDE_PREFERENCES } from '../../constants/index';
import { ApiContext } from '../api-context';
import { DragIcon } from '../icons/index';

const useStyles = makeStyles(() => ({
  columnsListContainer: {
    paddingTop: 8,
    paddingLeft: 12,
  },
  column: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '2px 4px',
  },
  switch: {
    marginRight: 4,
  },
  dragIconRoot: {
    justifyContent: 'flex-end',
  },
}));

export const ColumnsPanel: React.FC<{}> = () => {
  const classes = useStyles();

  const apiRef = React.useContext(ApiContext);
  const searchTextRef = React.useRef<HTMLInputElement>(null);
  const columns = useGridSelector(apiRef, allColumnsSelector);
  const [searchValue, setSearchValue] = React.useState('');

  const dontHidePreferences = React.useCallback(
    (event: React.ChangeEvent<{}>) => {
      apiRef!.current.publishEvent(PREVENT_HIDE_PREFERENCES, {});
      event.preventDefault();
    },
    [apiRef],
  );

  const toggleColumn = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      dontHidePreferences(event);
      apiRef!.current.toggleColumn(event.target.name, !event.target.checked);
    },
    [apiRef, dontHidePreferences],
  );

  const toggleAllColumns = React.useCallback(
    (value: boolean) => {
      apiRef!.current.updateColumns(
        columns.map((col) => {
          col.hide = value;
          return col;
        }),
      );
    },
    [apiRef, columns],
  );
  const showAllColumns = React.useCallback(() => toggleAllColumns(false), [toggleAllColumns]);
  const hideAllColumns = React.useCallback(() => toggleAllColumns(true), [toggleAllColumns]);

  const onSearchColumnValueChange = React.useCallback((event) => {
    setSearchValue(event.target.value.toLowerCase());
  }, []);

  const currentColumns = React.useMemo(
    () =>
      !searchValue
        ? columns
        : columns.filter(
            (column) =>
              column.field.toLowerCase().indexOf(searchValue) > -1 ||
              (column.headerName && column.headerName.toLowerCase().indexOf(searchValue) > -1),
          ),
    [columns, searchValue],
  );

  React.useEffect(() => {
    if (searchTextRef && searchTextRef.current) {
      searchTextRef!.current!.focus();
    }
  });

  return (
    <React.Fragment>
      <div className="panelHeader">
        <TextField
          ref={searchTextRef}
          label={'Find column'}
          placeholder={'Column Title'}
          value={searchValue}
          onChange={onSearchColumnValueChange}
          type={'text'}
          autoFocus
          fullWidth
        />
      </div>
      <div className="panelMainContainer">
        <div className={classes.columnsListContainer}>
          {currentColumns.map((column) => (
            <div key={column.field} className={classes.column}>
              <FormControlLabel
                control={
                  <Switch
                    className={classes.switch}
                    checked={!column.hide}
                    onChange={toggleColumn}
                    name={column.field}
                    color="primary"
                    size="small"
                  />
                }
                label={column.headerName || column.field}
              />
              <FormControl className={classes.dragIconRoot}>
                <IconButton aria-label="Drag to reorder column" title="Reorder Column" size="small">
                  <DragIcon />
                </IconButton>
              </FormControl>
            </div>
          ))}
        </div>
      </div>
      <div className="panelFooter">
        <Button onClick={hideAllColumns} color="primary">
          Hide All
        </Button>
        <Button onClick={showAllColumns} color="primary">
          Show All
        </Button>
      </div>
    </React.Fragment>
  );
};