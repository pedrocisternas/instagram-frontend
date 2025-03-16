'use client'

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  HomeIcon, 
  ChartBarIcon,
  Square3Stack3DIcon,
  ArrowLeftOnRectangleIcon,
  DevicePhoneMobileIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import CompactSyncButton from '@/components/buttons/CompactSyncButton'
import AuthStatus from '@/components/auth/AuthStatus';
import { useSyncStore } from '@/store/sync';
import { useAuthStore } from '@/store/auth';

// List of allowed domains from next.config.js
const ALLOWED_DOMAINS = [
  'scontent.fscl13-2.fna.fbcdn.net',
  'scontent.cdninstagram.com',
  'scontent-mia3-1.cdninstagram.com',
  'scontent-mia3-2.cdninstagram.com',
  'instagram.fscl13-1.fna.fbcdn.net',
  'instagram.fscl13-2.fna.fbcdn.net',
  'graph.facebook.com',
  'platform-lookaside.fbsbx.com',
  'scontent.xx.fbcdn.net',
];

// Additional domains with wildcards (match anything ending with these)
const ALLOWED_DOMAIN_PATTERNS = [
  '.fbcdn.net',
  '.cdninstagram.com',
];

const menuItems = [
  {
    name: 'Home',
    icon: HomeIcon,
    path: '/home',
  },
  {
    name: 'Posts',
    icon: DevicePhoneMobileIcon,
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
];

export default function Sidebar() {
  const pathname = usePathname();
  const { isSyncing, syncMetrics, lastUpdate } = useSyncStore();
  const { user, authState } = useAuthStore();
  const [imageError, setImageError] = useState(false);
  const [validatedImageUrl, setValidatedImageUrl] = useState("/images/logo.png");

  // Validate and set the profile image URL
  useEffect(() => {
    if (authState !== 'authenticated' || !user?.profile_picture) {
      setValidatedImageUrl("/images/logo.png");
      return;
    }

    try {
      // Check if URL is valid
      const url = new URL(user.profile_picture);
      
      // Check if the domain is allowed
      const hostname = url.hostname;
      const isAllowedDomain = ALLOWED_DOMAINS.includes(hostname) || 
        ALLOWED_DOMAIN_PATTERNS.some(pattern => hostname.endsWith(pattern));
      
      if (isAllowedDomain) {
        setValidatedImageUrl(user.profile_picture);
      } else {
        console.warn(`Image domain not allowed: ${hostname}`);
        setValidatedImageUrl("/images/logo.png");
      }
    } catch (error) {
      // Invalid URL format
      console.warn(`Invalid profile picture URL: ${user.profile_picture}`);
      setValidatedImageUrl("/images/logo.png");
    }
  }, [user, authState]);

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

  // Function to handle image loading errors
  const handleImageError = () => {
    console.warn('Profile image failed to load, using fallback');
    setImageError(true);
  };

  return (
    <div className="w-20 h-screen bg-white border-r border-gray-200 fixed left-0 top-0">
      <div className="flex flex-col h-full">
        <div className="p-4 border-b border-gray-200">
          <div className="w-10 h-10 rounded-full overflow-hidden">
            {imageError ? (
              // Show a user icon if image fails to load
              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <UserCircleIcon className="h-8 w-8 text-gray-400" />
              </div>
            ) : (
              // Try to load the image with error handling
              <Image
                src={validatedImageUrl}
                alt={authState === 'authenticated' ? "Profile picture" : "Logo"}
                width={40}
                height={40}
                className="object-cover"
                onError={handleImageError}
                priority={true}
              />
            )}
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