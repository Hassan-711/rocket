import type { Metadata } from 'next'
import { Nunito } from 'next/font/google'
import { ThemeProvider } from '@/components/shared/ThemeProvider'
import { Toaster } from '@/components/ui/toaster'
import '@/styles/globals.css'

const nunito = Nunito({ 
  subsets: ['latin'], 
  weight: ['400', '500', '600', '700', '800', '900'],
  display: 'swap' 
})

export const metadata: Metadata = {
  title: {
    default: 'Rise — Personal OS for Builders',
    template: '%s | Rise',
  },
  description: 'Track your career, studies, tasks, and growth.',
  icons: { icon: '/favicon.svg' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${nunito.className} min-h-screen text-slate-800 relative overflow-x-hidden bg-slate-50 dark:bg-slate-950`}>
        
        {/* GUARANTEED VISIBLE BACKGROUND LAYER */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          {/* Main smooth base gradient - Fixed the white bulb issue */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-100/90 via-purple-100/60 to-blue-100/70 dark:from-indigo-950/30 dark:via-slate-950 dark:to-slate-950" />
          
          {/* Glowing blobs - Extended to meet in the middle */}
          <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-purple-400/30 dark:bg-purple-600/10 blur-[130px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-blue-400/30 dark:bg-blue-600/10 blur-[130px]" />
          
          {/* Center bridge blob to kill the stark white spot completely */}
          <div className="absolute top-[20%] left-[20%] w-[60vw] h-[60vw] rounded-full bg-indigo-300/20 dark:bg-transparent blur-[130px]" />
          
          {/* Subtle SaaS dot grid overlay */}
          <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] dark:opacity-[0.02] mix-blend-multiply dark:mix-blend-screen" />
        </div>

        <div className="relative z-10">
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem={true}
            disableTransitionOnChange
          >
            {children}
            <Toaster />
          </ThemeProvider>
        </div>
      </body>
    </html>
  )
}