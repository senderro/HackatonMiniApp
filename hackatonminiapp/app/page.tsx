'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { HiChevronRight } from 'react-icons/hi';

type Group = { id: string; name: string; balance: number };

export default function Home() {
  const [groups, setGroups] = useState<Group[]>([]);
  useEffect(() => {
    setGroups([
      { id: '1', name: 'Almoço Amigos', balance: -25.5 },
      { id: '2', name: 'Viagem SP', balance: 40 },
    ]);
  }, []);

  return (
    <div className="p-4 space-y-4">
      {groups.map(g => (
        <Link
          key={g.id}
          href={`/group/${g.id}`}
          className="bg-white rounded-lg shadow p-4 flex justify-between items-center hover:shadow-md"
        >
          <div>
            <h2 className="font-semibold text-lg">{g.name}</h2>
            <p className="text-sm text-gray-500">Detalhes do grupo</p>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`${g.balance >= 0 ? 'text-green-600' : 'text-red-600'} font-semibold`}>R$ {g.balance.toFixed(2)}</span>
            <HiChevronRight />
          </div>
        </Link>
      ))}
    </div>
  );
}
