import { appRouter } from '@/server/routers/appRouter';
import { createTRPCReact, httpBatchLink } from '@trpc/react-query';

export type AppRouter = typeof appRouter;

export const trpc = createTRPCReact<AppRouter>();

export const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: '/api/trpc', // URL to your tRPC API
    }),
  ],
});
