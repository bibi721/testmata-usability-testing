import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

// Load Inter font with fallback and best practices
const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'sans-serif']
});

// ✅ Moved viewport to its own export (NEW!)
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

// ✅ metadata no longer includes "viewport"
export const metadata: Metadata = {
  title: 'Masada - Ethiopian Usability Testing Platform',
  description: 'Professional usability testing platform designed for Ethiopian tech companies and small businesses. Get actionable insights from real Ethiopian users to improve your web applications and websites.',
  keywords: 'usability testing Ethiopia, Ethiopian user testing, web app testing Ethiopia, UX research Ethiopia, user feedback Ethiopia',
  authors: [{ name: 'Masada' }],
};

export default function RootLayout({
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
            <Footer />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
