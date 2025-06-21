'use client';

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { User, LogOut, BarChart3, Settings, CreditCard } from 'lucide-react';
import {
  Navbar as ResponsiveNavbar,
  NavBody,
  NavItems,
  MobileNav,
  NavbarLogo,
  NavbarButton,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
} from '@/components/ui/resizable-navbar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

export function Navbar() {
  const { data: session, status } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = status === 'authenticated' ? [
    {
      name: 'Dashboard',
      link: '/dashboard',
    },
    {
      name: 'Transactions',
      link: '/transactions',
    },
    {
      name: 'Profile',
      link: '/profile',
    },
  ] : [];

  return (
    <div className="relative w-full">
      <ResponsiveNavbar>
        {/* Desktop Navigation */}
        <NavBody>
          <NavbarLogo />
          {status === 'authenticated' && <NavItems items={navItems} />}
          <div className="flex items-center gap-4">
            {status === 'authenticated' && session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full bg-gray-800 hover:bg-gray-700 border-none"
                  >
                    <User className="h-4 w-4 text-gray-300" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-gray-900 border-gray-800" align="end">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium text-white">{session.user.username}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator className="bg-gray-800" />
                  <DropdownMenuItem asChild className="text-gray-300 focus:text-white focus:bg-gray-800">
                    <Link href="/dashboard" className="flex items-center">
                      <BarChart3 className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="text-gray-300 focus:text-white focus:bg-gray-800">
                    <Link href="/transactions" className="flex items-center">
                      <CreditCard className="mr-2 h-4 w-4" />
                      Transactions
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="text-gray-300 focus:text-white focus:bg-gray-800">
                    <Link href="/profile" className="flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      Profile Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-800" />
                  <DropdownMenuItem
                    className="text-red-400 focus:text-red-300 focus:bg-gray-800"
                    onClick={() => signOut()}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <NavbarButton href="/sign-in" variant="secondary">
                  Sign In
                </NavbarButton>
                <NavbarButton href="/sign-up" variant="primary">
                  Sign Up
                </NavbarButton>
              </>
            )}
          </div>
        </NavBody>

        {/* Mobile Navigation */}
        <MobileNav>
          <MobileNavHeader>
            <NavbarLogo />
            <MobileNavToggle
              isOpen={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            />
          </MobileNavHeader>

          <MobileNavMenu
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
          >
            {status === 'authenticated' && session ? (
              <>
                <div className="w-full border-b border-gray-800 pb-4">
                  <p className="text-sm text-gray-400">ยินดีต้อนรับ</p>
                  <p className="font-medium text-white">{session.user.username}</p>
                </div>
                {navItems.map((item, idx) => (
                  <Link
                    key={`mobile-link-${idx}`}
                    href={item.link}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="relative text-neutral-600 dark:text-neutral-300 flex items-center space-x-2"
                  >
                    {item.name === 'Dashboard' && <BarChart3 className="h-4 w-4" />}
                    {item.name === 'Transactions' && <CreditCard className="h-4 w-4" />}
                    {item.name === 'Profile' && <Settings className="h-4 w-4" />}
                    <span className="block">{item.name}</span>
                  </Link>
                ))}
                <div className="flex w-full flex-col gap-4 pt-4 border-t border-gray-800">
                  <NavbarButton
                    onClick={() => {
                      signOut();
                      setIsMobileMenuOpen(false);
                    }}
                    variant="secondary"
                    className="w-full justify-center flex items-center space-x-2"
                    as="button"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </NavbarButton>
                </div>
              </>
            ) : (
              <div className="flex w-full flex-col gap-4">
                <NavbarButton
                  href="/sign-in"
                  onClick={() => setIsMobileMenuOpen(false)}
                  variant="secondary"
                  className="w-full"
                >
                  Sign In
                </NavbarButton>
                <NavbarButton
                  href="/sign-up"
                  onClick={() => setIsMobileMenuOpen(false)}
                  variant="primary"
                  className="w-full"
                >
                  Sign Up
                </NavbarButton>
              </div>
            )}
          </MobileNavMenu>
        </MobileNav>
      </ResponsiveNavbar>
    </div>
  );
}