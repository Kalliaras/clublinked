export type InterviewScorecard = {
  id: string;
  analytical_thinking_score: number | null;
  communication_score: number | null;
  teamwork_score: number | null;
  culture_fit_score: number | null;
  recommendation: "advance" | "maybe" | "reject" | null;
  notes: string;
  is_submitted: boolean;
};

export type AdminInterview = {
  id: string;
  submission_id: string;
  interview_round: number;
  interview_time: string | null;
  applicant: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string | null;
    major: string | null;
    academic_year: string | null;
  };
  submitted_feedback_count: number;
  viewer_note: InterviewScorecard | null;
};

export type AdminInterviewsData = {
  club: { id: string; name: string | null; club_image: string | null };
  application_title: string | null;
  admin_clubs: Array<{
    club_id: string;
    name: string | null;
    club_image: string | null;
  }>;
  rounds: number[];
  interviews: AdminInterview[];
};

export type ScorecardInput = {
  analyticalThinking: number | null;
  communication: number | null;
  teamwork: number | null;
  cultureFit: number | null;
  recommendation: "advance" | "maybe" | "reject" | null;
  notes: string;
};
