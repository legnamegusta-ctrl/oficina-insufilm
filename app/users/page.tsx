'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

type Row = { id: string; email?: string; role?: string };

export default function UsersPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const snap = await getDocs(collection(db, 'users'));
        if (!alive) return;
        setRows(snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })));
      } catch (e: any) {
        setErr(e?.message || 'Falha ao carregar usuários');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  if (loading) return <main className="p-6">Carregando…</main>;
  if (err) return <main className="p-6 text-red-600">{err}</main>;

  return (
    <main className="p-6">
      <h1 className="text-xl font-semibold mb-3">Usuários</h1>
      <ul className="grid gap-2">
        {rows.map(r => (
          <li key={r.id} className="border rounded p-3">
            <div><b>ID:</b> {r.id}</div>
            <div><b>Email:</b> {r.email || '-'}</div>
            <div><b>Papel:</b> {r.role || '-'}</div>
          </li>
        ))}
      </ul>
    </main>
  );
}
