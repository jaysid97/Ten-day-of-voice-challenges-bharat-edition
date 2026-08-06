import { Public_Sans } from 'next/font/google';
import localFont from 'next/font/local';
import { headers } from 'next/headers';
import { ThemeProvider } from '@/components/app/theme-provider';
import { ThemeToggle } from '@/components/app/theme-toggle';
import { cn } from '@/lib/shadcn/utils';
import { getAppConfig, getStyles } from '@/lib/utils';
import '@/styles/globals.css';

const publicSans = Public_Sans({
  variable: '--font-public-sans',
  subsets: ['latin'],
});

const commitMono = localFont({
  display: 'swap',
  variable: '--font-commit-mono',
  src: [
    {
      path: '../fonts/CommitMono-400-Regular.otf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../fonts/CommitMono-700-Regular.otf',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../fonts/CommitMono-400-Italic.otf',
      weight: '400',
      style: 'italic',
    },
    {
      path: '../fonts/CommitMono-700-Italic.otf',
      weight: '700',
      style: 'italic',
    },
  ],
});

interface RootLayoutProps {
  children: React.ReactNode;
}

export default async function RootLayout({ children }: RootLayoutProps) {
  const hdrs = await headers();
  const appConfig = await getAppConfig(hdrs);
  const styles = getStyles(appConfig);
  const { pageTitle, pageDescription } = appConfig;

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        publicSans.variable,
        commitMono.variable,
        'dark scroll-smooth font-sans antialiased'
      )}
    >
      <head>
        {styles && <style>{styles}</style>}
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
      </head>
      <body className="relative min-h-screen overflow-x-hidden bg-slate-950 text-slate-100">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          {/* Header Bar */}
          <header className="fixed top-0 left-0 z-50 flex w-full items-center justify-between border-b border-white/10 bg-slate-950/70 px-6 py-4 backdrop-blur-md">
            <div className="flex items-center space-x-3">
              {/* Chakra emblem icon */}
              <div className="relative flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 via-orange-500 to-cyan-500 p-0.5 shadow-lg shadow-amber-500/20">
                <div className="flex size-full items-center justify-center rounded-[10px] bg-slate-950">
                  <svg className="size-5 text-amber-400 chakra-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
                    <line x1="12" y1="3" x2="12" y2="21" stroke="currentColor" strokeWidth="1" />
                    <line x1="3" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="1" />
                    <line x1="5.6" y1="5.6" x2="18.4" y2="18.4" stroke="currentColor" strokeWidth="1" />
                    <line x1="18.4" y1="5.6" x2="5.6" y2="18.4" stroke="currentColor" strokeWidth="1" />
                  </svg>
                </div>
              </div>

              <div>
                <span className="saffron-gradient-text text-base font-extrabold tracking-wide">
                  IndicVox AI
                </span>
                <span className="ml-2 text-[10px] font-mono tracking-widest text-cyan-400 uppercase bg-cyan-950/80 border border-cyan-500/30 px-2 py-0.5 rounded-full">
                  BHARAT EDITION
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden items-center space-x-2 rounded-full border border-emerald-500/30 bg-emerald-950/50 px-3 py-1 text-xs font-medium text-emerald-400 sm:flex">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex size-2 rounded-full bg-emerald-500"></span>
                </span>
                <span>BHARAT VOICE ENGINE LIVE</span>
              </div>

              <span className="hidden font-mono text-xs font-semibold text-slate-400 md:inline-block">
                Gemini 3.5 & Murf Falcon
              </span>
            </div>
          </header>

          {children}

          <div className="group fixed bottom-4 right-4 z-50">
            <ThemeToggle className="shadow-lg border border-white/10 bg-slate-900/80 backdrop-blur-md" />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
