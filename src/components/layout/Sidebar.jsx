'use client'

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  HomeIcon, 
  ChartBarIcon,
  Square3Stack3DIcon,
  AdjustmentsHorizontalIcon,
  ArrowLeftOnRectangleIcon
} from '@heroicons/react/24/outline';
import { APP_CONFIG } from '@/config/app';
import Image from 'next/image';
import CompactSyncButton from '@/components/buttons/CompactSyncButton'
import AuthStatus from '@/components/auth/AuthStatus';
import { useSyncStore } from '@/store/sync';
import { useAuthStore } from '@/store/auth';

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
  {
    name: 'Rankings',
    icon: Square3Stack3DIcon,
    path: '/rankings',
  },
  {
    name: 'Home',
    icon: AdjustmentsHorizontalIcon,
    path: '/home',
  },
  {
    name: 'Login',
    icon: ArrowLeftOnRectangleIcon,
    path: '/login',
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { isSyncing, syncMetrics, lastUpdate } = useSyncStore();
  const { user, authState } = useAuthStore();

  const handleSync = async () => {
    if (!user?.id) {
      console.error('No user ID available for sync');
      return;
    }

    try {
      const data = await syncMetrics(user.id);
      const syncEvent = new CustomEvent('metrics-synced', { detail: data });
      window.dispatchEvent(syncEvent);
    } catch (error) {
      console.error('Error syncing:', error);
    }
  };

  return (
    <div className="w-20 h-screen bg-white border-r border-gray-200 fixed left-0 top-0">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="w-10 h-10 rounded-full overflow-hidden">
            <Image
              src={user?.profile_picture || "/images/profile.jpg"}
              alt="Profile picture"
              width={40}
              height={40}
              className="object-cover"
            />
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
                  flex items-center justify-center p-3 rounded-lg transition-colors w-14
                  ${isActive 
                    ? 'bg-primary text-white' 
                    : 'text-gray-700 hover:bg-gray-100'
                  }
                `}
                title={item.name}
              >
                <item.icon className="h-5 w-5 shrink-0" />
              </Link>
            );
          })}
        </nav>

        {/* Botones de acción en el footer */}
        <div className="p-4 border-t border-gray-200 space-y-4">
            <CompactSyncButton
              isSyncing={isSyncing}
              onSync={handleSync}
              lastUpdate={lastUpdate}
              />
          {/* {authState === 'authenticated' && (
          )} */}
          <AuthStatus />
        </div>
      </div>
    </div>
  );
}