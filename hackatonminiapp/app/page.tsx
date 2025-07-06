'use client';
import { retrieveRawInitData } from '@telegram-apps/sdk';
import { useEffect, useState } from 'react';

type ValidationResponse = {
  valid: boolean;
  initData?: {
    user?: {
      first_name: string;
      last_name?: string;
      username?: string;
      photo_url?: string;
    };
  };
  error?: string;
};

export default function Home() {
  const [result, setResult] = useState<ValidationResponse | null>(null);

  useEffect(() => {
    const raw = retrieveRawInitData();
    fetch('/api/validate', {
      method: 'POST',
      headers: {
        Authorization: `tma ${raw}`
      }
    })
      .then(res => res.json())
      .then((json: ValidationResponse) => setResult(json))
      .catch(() => setResult({ valid: false }));
  }, []);

  if (!result) return <div>Carregando...</div>;
  if (!result.valid) return <div>Dados não confiáveis</div>;

  const user = result.initData?.user;
  return (
    <div style={{ textAlign: 'center', padding: '2rem' }}>
      {user?.photo_url && (
        <img
          src={user.photo_url}
          alt="Foto do usuário"
          style={{ borderRadius: '50%', width: 120, height: 120 }}
        />
      )}
      <h1>
        {user?.first_name} {user?.last_name ?? ''}
      </h1>
      <p>Email: {user?.username ? `${user.username}@telegram.org` : '—'}</p>
      <p style={{ fontWeight: 'bold' }}>Confiável: Sim</p>
    </div>
  );
}
