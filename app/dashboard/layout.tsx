'use client';

import { ReactNode } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const direction = useSelector((state: RootState) => state.ui.direction);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Header />
        <main className="flex-1 overflow-auto bg-background">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
