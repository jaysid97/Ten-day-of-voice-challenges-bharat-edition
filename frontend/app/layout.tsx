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
          <header className="fixed top-0 left-0 z-50 flex w-full items-center justify-between border-b border-white/10 bg-slate-950/80 px-6 py-3.5 backdrop-blur-xl">
            <div className="flex items-center space-x-3">
              {/* Shiksha Graduation Emblem */}
              <div className="relative flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 via-orange-500 to-sky-400 p-0.5 shadow-lg shadow-amber-500/20">
                <div className="flex size-full items-center justify-center rounded-[10px] bg-slate-950">
                  <svg className="size-5 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 3L1 9L12 15L23 9L12 3Z" fill="currentColor" fillOpacity="0.2" />
                    <path d="M5 13.1V17.5C5 19.5 8.1 21 12 21C15.9 21 19 19.5 19 17.5V13.1" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
              </div>

              <div>
                <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-sky-400 bg-clip-text text-transparent text-base font-black tracking-wide">
                  Shiksha AI
                </span>
                <span className="ml-2 text-[10px] font-mono tracking-widest text-amber-300 uppercase bg-amber-950/80 border border-amber-500/30 px-2.5 py-0.5 rounded-full shadow-sm">
                  BHARAT EDTECH
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden items-center space-x-2 rounded-full border border-rose-500/40 bg-rose-950/60 px-3 py-1 text-xs font-medium text-rose-300 sm:flex">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex size-2 rounded-full bg-rose-500"></span>
                </span>
                <span>HUMAN ESCALATIONS • DAY 7</span>
              </div>

              <span className="hidden font-mono text-xs font-semibold text-slate-400 md:inline-block">
                Murf Falcon TTS &amp; Gemini
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
