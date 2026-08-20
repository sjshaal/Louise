import { SymptomSearch } from '@/components/SymptomSearch';
import { MobileNav } from '@/components/Sidebar';
import { Search } from 'lucide-react';

export const metadata = { title: 'Symptom Search — Daily Healer' };

export default function SearchPage() {
  return (
    <>
      <div className="max-w-2xl mx-auto px-4 md:px-6 py-8 pb-24 md:pb-8">
        <div className="flex items-center gap-2 mb-6">
          <Search className="w-5 h-5 text-lavender-400" />
          <h1 className="font-serif text-2xl text-lavender-800 dark:text-lavender-300">Symptom Search</h1>
        </div>
        <p className="text-sm text-neutral-500 dark:text-purple-400 italic mb-6 leading-relaxed">
          Search by body part, symptom, or emotion to discover the mental patterns Louise Hay associated with each condition — and the affirmations to transform them.
        </p>
        <SymptomSearch />
      </div>
      <MobileNav />
    </>
  );
}
