// src/app/api/trpc/route.ts
import { appRouter } from '@/server/routers/appRouter';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';

export const runtime = 'nodejs';

const handler = (request: Request) => {
  return fetchRequestHandler({
    endpoint: '/api/trpc',
    req: request,
    router: appRouter,
    createContext: () => ({}),
  });
};

export { handler as GET, handler as POST };
