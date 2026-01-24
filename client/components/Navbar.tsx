"use client";

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import PillNav from './PillNav';

export default function Navbar() {
  const { data: session, status } = useSession();

  return (
    <div className="w-full flex justify-center">
      <PillNav
        logo="/logo.png"
        logoAlt="Company Logo"
        items={[
          { label: 'Home', href: '/' },
          { label: 'About', href: '/about' },
          { label: 'Services', href: '/services' },
          { label: 'Contact', href: '/contact' }
        ]}
        activeHref="/"
        className="custom-nav"
        ease="power2.easeOut"
        baseColor="#1E3A8A"
        pillColor="#FFFFFF"
        hoveredPillTextColor="#22C55E"
        pillTextColor="#1E3A8A"
        initialLoadAnimation={true}
        onMobileMenuClick={() => {}}
      />
      
      <div className="absolute top-4 right-4 z-100">
        {status === 'loading' ? (
          <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
        ) : session ? (
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700 hidden sm:block">
              {session.user?.name || session.user?.email}
            </span>
            <button
              onClick={() => signOut()}
              className="px-4 py-2 bg-[#1E3A8A] text-white rounded-full text-sm font-semibold hover:bg-[#22C55E] transition-colors"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <Link
            href="/auth/login"
            className="px-4 py-2 bg-[#1E3A8A] text-white rounded-full text-sm font-semibold hover:bg-[#22C55E] transition-colors"
          >
            Sign In
          </Link>
        )}
      </div>
    </div>
  );
}