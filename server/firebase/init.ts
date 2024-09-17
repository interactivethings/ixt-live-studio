import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: 'AIzaSyD_Y2_mOiscMhtjcbM_CpuinIu_1jJHj04',
  authDomain: 'livestudio-fc37b.firebaseapp.com',
  projectId: 'livestudio-fc37b',
  databaseURL:
    'https://livestudio-fc37b-default-rtdb.europe-west1.firebasedatabase.app/',
  storageBucket: 'livestudio-fc37b.appspot.com',
  messagingSenderId: '857320830511',
  appId: '1:857320830511:web:877a6446d8f2e7869238da',
};

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
