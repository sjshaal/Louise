import { DailyAffirmation } from '@/components/DailyAffirmation';
import { MobileNav } from '@/components/Sidebar';
import { Heart, MessageCircle, Search, BookOpen, Sparkles } from 'lucide-react';
import Link from 'next/link';

const QUICK_CARDS = [
  { href: '/chat',    icon: MessageCircle, label: 'Healing Chat',    desc: 'Share what you\'re experiencing',    color: 'from-lavender-400 to-purple-400' },
  { href: '/search',  icon: Search,        label: 'Symptom Search',  desc: 'Find affirmations by ailment',       color: 'from-sage-400 to-green-400'    },
  { href: '/journal', icon: BookOpen,      label: 'My Journal',      desc: 'Write and reflect with intention',   color: 'from-blush-300 to-pink-400'    },
];

const HAY_QUOTES = [
  '"Every thought we think is creating our future."',
  '"You have the power to heal your life, and you need to know that."',
  '"I am in the right place, at the right time, doing the right thing."',
  '"Love is the great miracle cure. Loving ourselves works miracles in our lives."',
  '"I am willing to release the need to be unworthy. I deserve the very best in life."',
];

export default function HomePage() {
  const quote = HAY_QUOTES[new Date().getDay() % HAY_QUOTES.length];

  return (
    <>
      <div className="max-w-2xl mx-auto px-4 md:px-6 py-8 pb-24 md:pb-8 space-y-6">
        {/* Hero */}
        <div className="text-center py-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-lavender-400 to-sage-400 flex items-center justify-center shadow-lg mx-auto mb-4 animate-float">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-serif text-3xl text-lavender-800 dark:text-lavender-300 mb-2">Daily Healer</h1>
          <p className="text-neutral-500 dark:text-purple-400 text-sm max-w-md mx-auto leading-relaxed">
            Inspired by Louise Hay's <em>You Can Heal Your Life</em> — explore the mind-body connection with compassion.
          </p>
        </div>

        {/* Daily affirmation */}
        <DailyAffirmation />

        {/* Quote */}
        <div className="healing-card p-4 text-center">
          <Sparkles className="w-4 h-4 text-lavender-400 mx-auto mb-2" />
          <p className="font-serif italic text-lavender-600 dark:text-lavender-400 text-sm leading-relaxed">{quote}</p>
          <p className="text-[11px] text-neutral-400 dark:text-purple-500 mt-1">— Louise Hay</p>
        </div>

        {/* Quick nav cards */}
        <div>
          <h2 className="text-xs font-semibold text-neutral-400 dark:text-purple-500 uppercase tracking-wide mb-3 px-1">Begin your healing</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {QUICK_CARDS.map(({ href, icon: Icon, label, desc, color }) => (
              <Link
                key={href}
                href={href}
                className="healing-card p-4 hover:shadow-md transition-all duration-200 group hover:-translate-y-0.5"
              >
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-3 shadow-sm group-hover:shadow-md transition-shadow`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <p className="font-semibold text-sm text-neutral-700 dark:text-purple-200">{label}</p>
                <p className="text-xs text-neutral-400 dark:text-purple-500 mt-0.5 leading-snug">{desc}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="text-center pt-2">
          <p className="text-[11px] text-neutral-300 dark:text-purple-700 leading-relaxed max-w-sm mx-auto">
            All content is for personal growth and reflection only — not medical advice.
            Always consult a qualified healthcare professional for medical concerns.
          </p>
        </div>
      </div>

      <MobileNav />
    </>
  );
}
