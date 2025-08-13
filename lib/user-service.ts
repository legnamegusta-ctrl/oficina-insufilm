// src/lib/user-service.ts
import { db } from './firebase';
import {
  collection, doc, getDoc, setDoc, serverTimestamp,
  query, where, limit, getDocs
} from 'firebase/firestore';

export async function ensureUserDoc(u: { uid: string; email?: string | null }) {
  const ref = doc(db, 'users', u.uid);
  const snap = await getDoc(ref);
  if (snap.exists()) return;

  // se não existe admin ainda, o primeiro vira admin
  const q = query(collection(db, 'users'), where('role', '==', 'admin'), limit(1));
  const existsAdmin = !(await getDocs(q)).empty;

  await setDoc(ref, {
    uid: u.uid,
    email: u.email ?? '',
    role: existsAdmin ? 'atendente' : 'admin',
    createdAt: serverTimestamp(),
  }, { merge: true });
}
