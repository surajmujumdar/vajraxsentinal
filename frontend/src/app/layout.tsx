import type { Metadata } from 'next'
import { Outfit, JetBrains_Mono, Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'
import SamAICopilot from '@/components/SamAICopilot'
import NotificationToast from '@/components/NotificationToast'
import LanguageTranslator from '@/components/LanguageTranslator'
import ErrorBoundary from '@/components/ErrorBoundary'

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  display: 'swap'
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap'
})

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap'
})

export const metadata: Metadata = {
  title: 'VAJRA',
  description: 'AI Powered Threat Intelligence & Risk Analysis',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`dark ${outfit.variable} ${jetbrainsMono.variable} ${plusJakarta.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@400;500;600;700;800&family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap" rel="stylesheet" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                function purgeNetlify() {
                  const selectors = [
                    '#netlify-drawer',
                    'netlify-drawer',
                    '[data-netlify-drawer]',
                    'iframe#netlify-drawer',
                    '.netlify-badge',
                    '#netlify-badge'
                  ];
                  selectors.forEach(sel => {
                    document.querySelectorAll(sel).forEach(el => el.remove());
                  });
                }
                if (typeof window !== 'undefined') {
                  purgeNetlify();
                  window.addEventListener('DOMContentLoaded', purgeNetlify);
                  window.addEventListener('load', purgeNetlify);
                  const observer = new MutationObserver(purgeNetlify);
                  observer.observe(document.documentElement, { childList: true, subtree: true });
                }
              })();
            `,
          }}
        />
      </head>
      <body style={{ fontFamily: "var(--font-outfit), 'Outfit', 'Plus Jakarta Sans', sans-serif" }}>
        <ErrorBoundary>
          <LanguageTranslator />
          <NotificationToast />
          {children}
          <SamAICopilot />
        </ErrorBoundary>
      </body>
    </html>
  )
}
