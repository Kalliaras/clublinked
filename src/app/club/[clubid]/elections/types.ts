export type ElectionMember = {
  id: string;
  title: string;
  is_owner: boolean;
  is_admin: boolean;
  first_name: string | null;
  last_name: string | null;
  major: string | null;
  academic_year: string | null;
};

export type ElectionCandidate = {
  id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  major: string | null;
  academic_year: string | null;
  statement: string;
  selected: boolean;
  vote_count: number | null;
};

export type ElectionPosition = {
  id: string;
  title: string;
  description: string;
  current_holder_id: string;
  current_holder_name: string;
  can_manage: boolean;
  winner_candidate_id: string | null;
  candidates: ElectionCandidate[];
};

export type ClubElection = {
  id: string;
  title: string;
  description: string | null;
  status: "draft" | "active" | "completed" | "cancelled";
  opens_at: string | null;
  closes_at: string;
  completed_at: string | null;
  eligible_voters: number;
  ballots_cast: number;
  positions: ElectionPosition[];
};

export type ElectionSnapshot = {
  viewer: { id: string; title: string; is_owner: boolean; is_admin: boolean };
  members: ElectionMember[];
  elections: ClubElection[];
};

export function memberName(member: Pick<ElectionMember, "first_name" | "last_name">) {
  return [member.first_name, member.last_name].filter(Boolean).join(" ") || "Unnamed member";
}
