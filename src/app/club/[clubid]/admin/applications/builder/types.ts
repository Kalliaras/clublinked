export type QuestionType = "text" | "textarea" | "multiple_choice";

export type ApplicationQuestionDraft = {
  clientId: string;
  id: string | null;
  questionText: string;
  questionType: QuestionType;
  isRequired: boolean;
  options: string[];
};

export type ApplicationBuilderData = {
  club: { id: string; name: string | null };
  application: {
    id: string;
    title: string;
    description: string | null;
    is_active: boolean;
    questions: Array<{
      id: string;
      question_text: string;
      question_type: string;
      is_required: boolean;
      options: unknown;
      order: number;
    }>;
  } | null;
};
