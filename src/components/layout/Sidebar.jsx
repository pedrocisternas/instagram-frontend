'use client'

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  HomeIcon, 
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import { APP_CONFIG } from '@/config/app';
import Image from 'next/image';

const menuItems = [
  {
    name: 'Posts',
    icon: HomeIcon,
    path: '/',
  },
  {
    name: 'Analytics',
    icon: ChartBarIcon,
    path: '/analytics',
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-20 h-screen bg-white border-r border-gray-200 fixed left-0 top-0">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-center">
            <div className="w-10 h-10 rounded-full overflow-hidden">
              <Image
                src="/images/profile.jpg"
                alt="Profile picture"
                width={40}
                height={40}
                className="object-cover"
              />
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2 space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`
                  flex items-center justify-center p-3 rounded-lg transition-colors
                  ${isActive 
                    ? 'bg-primary text-white' 
                    : 'text-gray-700 hover:bg-gray-100'
                  }
                `}
                title={item.name}
              >
                <item.icon className="h-5 w-5" />
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}