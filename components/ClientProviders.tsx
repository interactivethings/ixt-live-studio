'use client';
import { trpc, trpcClient } from '@/utils/trpc';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { FC, ReactNode } from 'react';

const ClientProviders: FC<{ children: ReactNode }> = ({ children }) => {
  const queryClient = new QueryClient();

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
};

export default ClientProviders;
