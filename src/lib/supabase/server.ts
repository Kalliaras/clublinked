import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from './database.types'
export async function createClient() {
  const cookieStore = await cookies()
  const client = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have a proxy refreshing
            // user sessions.
          }
        },
      },
    }
  )
  return client
}

export async function getUser() {
    const {auth} = await createClient();
    const userObject = await auth.getUser();
    if (userObject.error || !userObject.data.user) {
        console.error("No user found", userObject.error);
        return null;
    }

    return userObject.data.user;
}
