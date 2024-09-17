import { Metric } from '@/types/firebase';
import admin from 'firebase-admin';
import { initializeFirebase } from './server';

export const getFirebaseMetric = async (type: string): Promise<Metric> => {
  initializeFirebase();
  const db = admin.firestore();
  const doc = await db.collection('metrics').doc(type).get();
  const data = doc.data() as Metric;
  return data;
};
