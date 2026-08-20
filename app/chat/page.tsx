import { ChatInterface } from '@/components/ChatInterface';
import { MobileNav } from '@/components/Sidebar';

export const metadata = { title: 'Healing Chat — Daily Healer' };

export default function ChatPage() {
  return (
    <>
      <div className="h-screen flex flex-col pb-16 md:pb-0">
        <ChatInterface />
      </div>
      <MobileNav />
    </>
  );
}
