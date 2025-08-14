import '../globals.css';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import Header from '@/components/Header';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Masada Dashboard - Ethiopian Usability Testing Platform',
  description: 'Manage your Ethiopian user testing campaigns and analyze results from your dashboard.',
  keywords: 'usability testing dashboard, Ethiopian user testing, test management, UX analytics',
  authors: [{ name: 'Masada' }],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}