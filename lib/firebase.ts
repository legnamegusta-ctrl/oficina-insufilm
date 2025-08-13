// lib/firebase.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, type Auth } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, type Firestore } from 'firebase/firestore';
import { getStorage, connectStorageEmulator, type FirebaseStorage } from 'firebase/storage';

const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};

const app = getApps().length ? getApp() : initializeApp(config);

export const db: Firestore = getFirestore(app);
export const storage: FirebaseStorage = getStorage(app);

// Em SSR não há window; só use `auth` em componentes "use client"
export const auth: Auth = (typeof window !== 'undefined')
  ? getAuth(app)
  : (null as unknown as Auth);

// Emuladores (dev)
if (process.env.NEXT_PUBLIC_USE_EMULATORS === 'true') {
  try { connectFirestoreEmulator(db, '127.0.0.1', 8080); } catch {}
  try { connectStorageEmulator(storage, '127.0.0.1', 9199); } catch {}
  if (typeof window !== 'undefined' && auth) {
    try {
      connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
    } catch {}
  }
}
