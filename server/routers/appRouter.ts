import { initTRPC } from '@trpc/server';
import { firebaseAPI } from '../firebase/api';
const t = initTRPC.create();
export const appRouter = t.router({
  firebaseAPI,
});
