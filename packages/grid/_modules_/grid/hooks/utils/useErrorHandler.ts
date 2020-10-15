import * as React from 'react';
import { COMPONENT_ERROR } from '../../constants';
import { ApiRef } from '../../models/api';
import { useGridApi } from '../features/core/useGridApi';

//TODO useGridReducer

export function useErrorHandler(apiRef: ApiRef, props) {
  const [errorState, setErrorState] = React.useState<any>(null);
  const {instance} = useGridApi(apiRef);

  const errorHandler = (args: any) => {
    // We are handling error here, to set up the handler as early as possible and be able to catch error thrown at init time.
    setErrorState(args);
  };
  React.useEffect(() => instance.subscribeEvent(COMPONENT_ERROR, errorHandler), [apiRef]);

  React.useEffect(() => {
    instance.showError(props.error);
  }, [instance, props.error]);

  return errorState;
}
