import '../globals.css';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import TesterHeader from '@/components/TesterHeader';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Masada Tester Dashboard - Ethiopian User Testing Platform',
  description: 'Earn money by testing Ethiopian apps and websites. Join our community of Ethiopian testers and help improve digital products.',
  keywords: 'user testing jobs Ethiopia, earn money testing apps, Ethiopian tester jobs, usability testing Ethiopia',
  authors: [{ name: 'Masada' }],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function TesterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <TesterHeader />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}