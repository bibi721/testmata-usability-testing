import '../globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/contexts/AuthContext';
import Header from '@/components/Header';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Masada Dashboard - Ethiopian Usability Testing Platform',
  description: 'Manage your Ethiopian user testing campaigns and analyze results from your dashboard.',
  keywords: 'usability testing dashboard, Ethiopian user testing, test management, UX analytics',
  authors: [{ name: 'Masada' }],
  viewport: 'width=device-width, initial-scale=1',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={inter.className}>
        <AuthProvider>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
              {children}
            </main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}