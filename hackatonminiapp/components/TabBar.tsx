'use client';
import { usePathname, useRouter } from 'next/navigation';
import { HiHome, HiPlusCircle, HiUser } from 'react-icons/hi';

const tabs = [
  { label: 'Grupos', icon: HiHome, href: '/' },
  { label: 'Nova', icon: HiPlusCircle, href: '/new' },
  { label: 'Perfil', icon: HiUser, href: '/profile' },
];

export default function TabBar() {
  const path = usePathname();
  const router = useRouter();
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t flex">
      {tabs.map(tab => {
        const active = path === tab.href;
        return (
          <button
            key={tab.href}
            onClick={() => router.push(tab.href)}
            className={`flex-1 py-2 flex flex-col items-center justify-center ${active ? 'text-blue-600' : 'text-gray-500'}`}
          >
            <tab.icon size={24} />
            <span className="text-xs mt-1">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}