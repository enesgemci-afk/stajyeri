import type { ReactNode } from 'react';
import { Inter, Space_Grotesk } from 'next/font/google';

// UI UX Pro Max Skill — SaaS Dashboard tipografisi: Space Grotesk + Inter
const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-inter',
  display: 'swap',
});
const grotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-grotesk',
  display: 'swap',
});

export default function IsverenPanelLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`${inter.variable} ${grotesk.variable} [font-family:var(--font-inter)]`}>
      {children}
    </div>
  );
}
