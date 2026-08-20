'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Heart, MessageCircle, Search, BookOpen, History, Sun, Moon, Flower2,
} from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/',         icon: Heart,         label: 'Daily Healing'  },
  { href: '/chat',     icon: MessageCircle, label: 'Healing Chat'   },
  { href: '/search',   icon: Search,        label: 'Symptom Search' },
  { href: '/journal',  icon: BookOpen,      label: 'My Journal'     },
  { href: '/history',  icon: History,       label: 'History'        },
];

export function Sidebar() {
  const path = usePathname();
  const { theme, toggle } = useTheme();

  return (
    <aside className="hidden md:flex flex-col w-64 min-h-screen border-r border-lavender-100 dark:border-purple-900/40 bg-white/70 dark:bg-[#17142480] backdrop-blur-sm py-6 px-4 gap-2 flex-shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2 px-2 mb-6">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-lavender-400 to-sage-400 flex items-center justify-center shadow-sm">
          <Flower2 className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="font-serif font-semibold text-lavender-800 dark:text-lavender-300 text-sm leading-tight">Daily Healer</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 flex flex-col gap-1">
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = path === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                active
                  ? 'bg-lavender-100 dark:bg-lavender-900/40 text-lavender-700 dark:text-lavender-300 shadow-sm'
                  : 'text-neutral-500 dark:text-purple-400 hover:bg-lavender-50 dark:hover:bg-purple-950/40 hover:text-lavender-700 dark:hover:text-lavender-300'
              )}
            >
              <Icon className={cn('w-4 h-4', active ? 'text-lavender-500' : 'text-neutral-400 dark:text-purple-500')} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="mt-auto pt-4 border-t border-lavender-100 dark:border-purple-900/40">
        <p className="text-[11px] text-neutral-400 dark:text-purple-500 text-center italic mb-3">
          "You have the power to heal your life."
        </p>
        <button
          onClick={toggle}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-neutral-500 dark:text-purple-400 hover:bg-lavender-50 dark:hover:bg-purple-950/40 transition-all"
        >
          {theme === 'light'
            ? <><Moon className="w-4 h-4" /> Dark mode</>
            : <><Sun className="w-4 h-4" /> Light mode</>}
        </button>
      </div>
    </aside>
  );
}

/* Mobile bottom tab bar */
export function MobileNav() {
  const path = usePathname();
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-[#17142490] backdrop-blur-md border-t border-lavender-100 dark:border-purple-900/40 flex items-center justify-around py-2 px-4 z-50">
      {NAV.map(({ href, icon: Icon, label }) => {
        const active = path === href;
        return (
          <Link key={href} href={href} className="flex flex-col items-center gap-0.5">
            <Icon className={cn('w-5 h-5', active ? 'text-lavender-500' : 'text-neutral-400')} />
            <span className={cn('text-[9px]', active ? 'text-lavender-600 font-medium' : 'text-neutral-400')}>
              {label.split(' ')[0]}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
