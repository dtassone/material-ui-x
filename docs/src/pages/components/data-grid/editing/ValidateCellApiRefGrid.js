import * as React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { useGridApiRef, XGrid } from '@material-ui/x-grid';
import { randomEmail, randomTraderName } from '@material-ui/x-grid-data-generator';

const columns = [
  { field: 'name', headerName: 'Name', width: 180, editable: true },
  { field: 'email', headerName: 'Email', width: 200, editable: true },
];

const rows = [
  {
    id: 1,
    name: randomTraderName(),
    email: randomEmail(),
  },
  {
    id: 2,
    name: randomTraderName(),
    email: randomEmail(),
  },
  {
    id: 3,
    name: randomTraderName(),
    email: randomEmail(),
  },
  {
    id: 4,
    name: randomTraderName(),
    email: randomEmail(),
  },
  {
    id: 5,
    name: randomTraderName(),
    email: randomEmail(),
  },
];

const useStyles = makeStyles({
  root: {
    '& .MuiDataGrid-cellEditing': {
      backgroundColor: 'rgb(255,215,115, 0.19)',
      color: '#1a3e72',
    },
    '& .Mui-error': {
      backgroundColor: 'rgb(126,10,15, 0.1)',
      color: '#750f0f',
    },
  },
});

function validateEmail(email) {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

export default function ValidateCellApiRefGrid() {
  const apiRef = useGridApiRef();
  const classes = useStyles();

  const handleEditCellChange = React.useCallback(
    ({ id, field, props }, event) => {
      if (field === 'email') {
        const data = props; // Fix eslint value is missing in prop-types for JS files
        const isValid = validateEmail(data.value);
        apiRef.current.setEditCellProps({
          id,
          field,
          props: { ...props, error: !isValid },
        });

        // Prevent the native behavior.
        event?.stopPropagation();
      }
    },
    [apiRef],
  );

  return (
    <div style={{ height: 400, width: '100%' }}>
      <XGrid
        apiRef={apiRef}
        className={classes.root}
        rows={rows}
        columns={columns}
        onEditCellChange={handleEditCellChange}
      />
    </div>
  );
}
