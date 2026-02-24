import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ProfileClient from './ProfileClient';

type Profile = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  major: string | null;
  year: string | null;
  created_at: string;
};

export default async function ProfilePage({ params }: { params: Promise<{ profileid: string }> }) {
  const { profileid } = await params;

  const supabase = await createClient();
  const { data: profile, error } = await supabase
    .from('profile')
    .select('*')
    .eq('id', profileid)
    .single();

  if (error || !profile) {
    notFound();
  }

  return <ProfileClient profile={profile as Profile} />;
}