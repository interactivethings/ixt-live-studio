import { Metric, User } from '@/types/firebase';
import admin from 'firebase-admin';
import { initializeFirebase } from './server';

export const getFirebaseMetric = async (type: string): Promise<Metric<any>> => {
  initializeFirebase();
  const db = admin.firestore();
  const doc = await db.collection('metrics').doc(type).get();
  const data = doc.data() as Metric<any>;
  return data;
};

export const getFirebaseUser = async (id: string): Promise<User> => {
  initializeFirebase();
  const db = admin.firestore();
  const doc = await db.collection('users').doc(id).get();
  const data = doc.data() as User;
  return data;
};
