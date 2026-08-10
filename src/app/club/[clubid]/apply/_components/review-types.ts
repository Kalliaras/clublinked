export type ApplicationReview = {
  submission: {
    id: string;
    status: "pending" | "interview" | "accepted" | "rejected";
    submitted_at: string;
  };
  club: {
    id: string;
    name: string | null;
    club_image: string | null;
  };
  application: {
    id: string;
    title: string;
    description: string | null;
  };
  student: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string | null;
    major: string | null;
    academic_year: string | null;
    resume: string | null;
  };
  questions: Array<{
    id: string;
    question_text: string;
    question_type: string;
    is_required: boolean;
    order: number;
    answer_text: string | null;
  }>;
  interview: {
    id: string;
    interview_time: string | null;
    interview_round: number;
  } | null;
};
