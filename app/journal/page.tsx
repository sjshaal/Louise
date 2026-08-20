import { JournalEntryWidget } from '@/components/JournalEntry';
import { MobileNav } from '@/components/Sidebar';
import { BookOpen } from 'lucide-react';

export const metadata = { title: 'My Journal — Daily Healer' };

export default function JournalPage() {
  return (
    <>
      <div className="max-w-2xl mx-auto px-4 md:px-6 py-8 pb-24 md:pb-8">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="w-5 h-5 text-lavender-400" />
          <h1 className="font-serif text-2xl text-lavender-800 dark:text-lavender-300">My Journal</h1>
        </div>
        <p className="text-sm text-neutral-500 dark:text-purple-400 italic mb-6 leading-relaxed">
          Your private healing space. Journal entries are embedded into RuVector — over time, patterns emerge and your healing becomes more personalised.
        </p>
        <JournalEntryWidget />
      </div>
      <MobileNav />
    </>
  );
}
