import { useCallback, useEffect, useReducer, useState } from 'react';

function reducer(state, action) {
  switch (action.type) {
    case 'start':
      return { ...state, loading: true, error: '' };
    case 'success':
      return { data: action.data, loading: false, error: '' };
    case 'failure':
      return { ...state, loading: false, error: action.error };
    default:
      return state;
  }
}

export default function useAsyncData(load) {
  const [state, dispatch] = useReducer(reducer, { data: null, loading: true, error: '' });
  const [requestNumber, setRequestNumber] = useState(0);

  const reload = useCallback(() => {
    dispatch({ type: 'start' });
    setRequestNumber((number) => number + 1);
  }, []);

  useEffect(() => {
    let active = true;
    dispatch({ type: 'start' });

    load()
      .then((result) => {
        if (active) dispatch({ type: 'success', data: result });
      })
      .catch((requestError) => {
        if (active) dispatch({ type: 'failure', error: requestError.message || 'Unable to load this information.' });
      })

    return () => {
      active = false;
    };
  }, [load, requestNumber]);

  return { ...state, reload };
}
