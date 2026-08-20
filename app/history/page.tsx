import { HistoryView } from '@/components/HistoryView';
import { MobileNav } from '@/components/Sidebar';
import { History } from 'lucide-react';

export const metadata = { title: 'History — Daily Healer' };

export default function HistoryPage() {
  return (
    <>
      <div className="max-w-2xl mx-auto px-4 md:px-6 py-8 pb-24 md:pb-8">
        <div className="flex items-center gap-2 mb-2">
          <History className="w-5 h-5 text-lavender-400" />
          <h1 className="font-serif text-2xl text-lavender-800 dark:text-lavender-300">Healing History</h1>
        </div>
        <p className="text-sm text-neutral-500 dark:text-purple-400 italic mb-6 leading-relaxed">
          Your journey, visualised. See recurring themes, track your affirmations, and witness your growth over time.
        </p>
        <HistoryView />
      </div>
      <MobileNav />
    </>
  );
}
