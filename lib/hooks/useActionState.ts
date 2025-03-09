'use client';

import { useState, useTransition } from 'react';

/**
 * A hook for managing state in server actions with loading state
 * @param action The server action function that takes state and payload
 * @param initialState The initial state
 * @returns [state, dispatch, isPending] tuple
 */
export function useActionState<State, Payload>(
  action: (state: State, payload: Payload) => Promise<State>,
  initialState: State
): [State, (payload: Payload) => void, boolean] {
  const [state, setState] = useState<State>(initialState);
  const [isPending, startTransition] = useTransition();

  const dispatch = (payload: Payload) => {
    startTransition(async () => {
      const result = await action(state, payload);
      setState(result);
    });
  };

  return [state, dispatch, isPending];
} 