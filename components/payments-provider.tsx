'use client';

import { createContext, useContext } from 'react';

const PaymentsContext = createContext(false);

export function PaymentsProvider({
  enabled,
  children
}: {
  enabled: boolean;
  children: React.ReactNode;
}) {
  return (
    <PaymentsContext.Provider value={enabled}>
      {children}
    </PaymentsContext.Provider>
  );
}

export function usePaymentsEnabled() {
  return useContext(PaymentsContext);
}
