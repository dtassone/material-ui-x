import * as React from 'react';
import { ElementSize } from '../../models';
import { debounce } from '../../utils';
import { useGridState } from '../features/core/useGridState';
import { useLogger } from './useLogger';

export function useResizeContainer(apiRef): (size: ElementSize) => void {
  const gridLogger = useLogger('useResizeContainer');
  const [, setGridState] = useGridState(apiRef);

  const onResize = React.useCallback(
    (size: ElementSize) => {
      if (size.height === 0) {
        gridLogger.warn(
          [
            'The parent of the grid has an empty height.',
            'You need to make sure the container has an intrinsic height.',
            'The grid displays with a height of 0px.',
            '',
            'You can find a solution in the docs:',
            'https://material-ui.com/components/data-grid/rendering/#layout',
          ].join('\n'),
        );
      }
      if (size.width === 0) {
        gridLogger.warn(
          [
            'The parent of the grid has an empty width.',
            'You need to make sure the container has an intrinsic width.',
            'The grid displays with a width of 0px.',
            '',
            'You can find a solution in the docs:',
            'https://material-ui.com/components/data-grid/rendering/#layout',
          ].join('\n'),
        );
      }

      gridLogger.info('resized...', size);

      setGridState(state=> ({...state, rootContainerSize: size}));
      setImmediate(() => apiRef!.current.resize(size));
    },
    [gridLogger, setGridState, apiRef],
  );
  const debouncedOnResize = React.useMemo(() => debounce(onResize, 100), [onResize]) as any;

  React.useEffect(() => {
    return () => {
      gridLogger.info('canceling resize...');
      debouncedOnResize.cancel();
    };
  }, [gridLogger, debouncedOnResize]);

  return debouncedOnResize;
}
