import { Sidebar } from '@/components/layout/Sidebar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-ava-grey-10">
      <Sidebar />
      <div className="ml-60 min-h-screen">
        {children}
      </div>
    </div>
  );
}
