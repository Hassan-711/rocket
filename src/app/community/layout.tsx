import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AppShell } from '@/components/layout/AppShell'

export const metadata = {
  title: 'Community | Rise',
  description: 'Connect with Study Buddies',
}

export default async function CommunityLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')
  return <AppShell title="Community Circles">{children}</AppShell>
}
