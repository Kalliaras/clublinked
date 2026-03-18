"use server";

import { createClient } from "@/lib/supabase/server";

export const UpdateBioAction = async (
  userId: string,
  bio: string | null
): Promise<{ errorMessage?: string } | null> => {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("profile")
      .update({ bio })
      .eq("id", userId);
    if (error) throw error;
    return null;
  } catch (error) {
    console.error("Error updating bio:", error);
    return { errorMessage: (error as Error).message };
  }
};

export const UpdateInterestsAction = async (
  userId: string,
  interests: string[]
): Promise<{ errorMessage?: string } | null> => {
  try {
    const supabase = await createClient();

    // remove old interests
    const { error: delError } = await supabase
      .from("user_interests")
      .delete()
      .eq("user_id", userId);
    if (delError) throw delError;

    // insert new interests (upsert tags first)
    for (const name of interests) {
      const trimmed = name.trim();
      if (!trimmed) continue;
      const { data, error: tagError } = await supabase
        .from("interest_tags")
        .upsert<{ name: string }>({ name: trimmed }, { onConflict: "name" })
        .select("id")
        .single();
      if (tagError) throw tagError;
      const tag = data as { id: string } | null;
      if (tag && tag.id) {
        await supabase.from("user_interests").insert({
          user_id: userId,
          interest_id: tag.id,
        });
      }

    }
    return null;
  } catch (error) {
    console.error("Error updating interests:", error);
    return { errorMessage: (error as Error).message };
  }
};

export const UpdateSkillsAction = async (
  userId: string,
  skills: string[]
): Promise<{ errorMessage?: string } | null> => {
  try {
    const supabase = await createClient();

    // remove old skills
    const { error: delError } = await supabase
      .from("user_skills")
      .delete()
      .eq("user_id", userId);
    if (delError) throw delError;

    for (const name of skills) {
      const trimmed = name.trim();
      if (!trimmed) continue;
      const { data, error: tagError } = await supabase
        .from("skill_tags")
        .upsert<{ name: string }>({ name: trimmed }, { onConflict: "name" })
        .select("id")
        .single();
      if (tagError) throw tagError;
      const tag = data as { id: string } | null;
      if (tag && tag.id) {
        await supabase.from("user_skills").insert({
          user_id: userId,
          skill_id: tag.id,
        });
      }
    }
    return null;
  } catch (error) {
    console.error("Error updating skills:", error);
    return { errorMessage: (error as Error).message };
  }
};
