import { ApiRef, GridApi } from '../../../models/api/apiRef';

export const useGridApi = (apiRef: ApiRef): GridApi => {
  return apiRef.current;
};
