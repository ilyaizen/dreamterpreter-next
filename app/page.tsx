import { ChatInterface } from '@/components/ChatInterface';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <h1 className="mb-4 text-2xl font-bold">Dreamterpreter AI Chatbot</h1>
      <ChatInterface />
    </div>
  );
}
