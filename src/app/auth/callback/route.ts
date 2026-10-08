import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// This route handles the OAuth/email-verification callback from Supabase.
// Supabase redirects here with a `code` param after email confirmation.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // If something went wrong, send back to login with error
  return NextResponse.redirect(`${origin}/auth/login?error=Could+not+verify+email.+Try+signing+in+directly.`)
}
