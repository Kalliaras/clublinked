import { notFound } from 'next/navigation';
import { createClient, getUser } from '@/lib/supabase/server';
import ProfileClient from './_components/profile-client';

type Profile = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  university_id: string;
  major: string | null;
  academic_year: string | null;
  bio: string | null;
  created_at: string;
};

type Role = {
  title: string;
  club_name: string;
};

type Interest = {
  name: string;
};

type Skill = {
  name: string;
};

export default async function ProfilePage({ params }: { params: Promise<{ slug: string; profileid: string }> }) {
  const { slug, profileid } = await params;

  const supabase = await createClient();

  // Determine current user to know if we're viewing our own profile
  const currentUser = await getUser();
  const isOwner = currentUser?.id === profileid;

  // Fetch profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', profileid)
    .single();

  if (profileError || !profile) {
    notFound();
  }

  // Fetch user roles
  const { data: userRoles } = await supabase
    .from('user_roles')
    .select('title, club_id')
    .eq('user_id', profileid);

  const clubIds = userRoles?.map(r => r.club_id).filter(Boolean) || [];
  const { data: clubsData } = clubIds.length > 0 ? await supabase
    .from('clubs')
    .select('id, name')
    .in('id', clubIds) : { data: [] };

  const clubsMap = new Map(clubsData?.map(c => [c.id, c.name]) || []);
  const roles: Role[] = userRoles?.map(role => ({
    title: role.title,
    club_name: clubsMap.get(role.club_id) || 'Unknown Club'
  })) || [];

  // Fetch user interests
  const { data: userInterests } = await supabase
    .from('user_interests')
    .select('interest_id')
    .eq('user_id', profileid);

  const interestIds = userInterests?.map(i => i.interest_id).filter(Boolean) || [];
  const { data: interestTags } = interestIds.length > 0 ? await supabase
    .from('interest_tags')
    .select('id, name')
    .in('id', interestIds) : { data: [] };

  const interestsMap = new Map(interestTags?.map(t => [t.id, t.name]) || []);
  const interests: Interest[] = userInterests?.map(interest => ({
    name: interestsMap.get(interest.interest_id) || 'Unknown Interest'
  })) || [];

  // Fetch user skills
  const { data: userSkills } = await supabase
    .from('user_skills')
    .select('skill_id')
    .eq('user_id', profileid);

  const skillIds = userSkills?.map(s => s.skill_id).filter(Boolean) || [];
  const { data: skillTags } = skillIds.length > 0 ? await supabase
    .from('skill_tags')
    .select('id, name')
    .in('id', skillIds) : { data: [] };

  const skillsMap = new Map(skillTags?.map(t => [t.id, t.name]) || []);
  const skills: Skill[] = userSkills?.map(skill => ({
    name: skillsMap.get(skill.skill_id) || 'Unknown Skill'
  })) || [];

  return <ProfileClient profile={profile as Profile} roles={roles} interests={interests} skills={skills} isOwner={isOwner} slug={slug} />;
}
