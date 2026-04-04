import type { Metadata } from 'next';
import { Space_Mono, Outfit } from 'next/font/google';
import QueryProvider from '@/providers/QueryProvider';
import './globals.css';

const spaceMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  variable: '--font-display',
});

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-body',
});

export const metadata: Metadata = {
  title: 'Denis Shtabnoy — Senior Software Engineer',
  description:
    'Senior Software Engineer building high-scale web applications. 10+ years of React, TypeScript, Vue.js, Node.js. Currently breaking things at Kaufland e-commerce.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${spaceMono.variable} ${outfit.variable}`}>
      <body className="font-body">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
