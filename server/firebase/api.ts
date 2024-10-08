import { initTRPC } from '@trpc/server';
import z from 'zod';
import { getFirebaseMetric, getFirebaseUser } from './utils';

const t = initTRPC.create();
export const firebaseAPI = t.router({
  getMetric: t.procedure.input(z.string()).query(async ({ input }) => {
    return await getFirebaseMetric(input);
  }),
  getUser: t.procedure.input(z.string()).query(async ({ input }) => {
    return await getFirebaseUser(input)
  })
});
