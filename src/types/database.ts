export type Category = 
  | "Psychology & Human Behavior"
  | "Tech & Computer Science"
  | "Science, Biology & Nature"
  | "Economics & Game Theory"
  | "History & Design Mysteries";

export interface StartingResource {
  title: string;
  url: string;
  domain: string;
  summary: string;
}

export interface Topic {
  id: string;
  title: string;
  category: Category;
  hook: string;
  difficulty: "Easy" | "Medium" | "Hard";
  duration_minutes?: number;
  learning_objective?: string;
  starting_resource?: StartingResource;
  times_completed: number;
  created_at?: string;
}

export interface FeedbackItem {
  id: string;
  voter_id: string;
  voter_name: string;
  accuracy: number;     // 1 to 10
  clarity: number;      // 1 to 10
  completeness: number; // 1 to 10
  overall: number;      // average of the three
  comment?: string;
  is_correction?: boolean;
  created_at: string;
}

export interface Summary {
  id: string;
  topic_id: string;
  topic_title: string;
  category?: Category;
  author_id: string;
  author_name: string;
  content: string;
  paper_note_image_url?: string | null;
  average_score: number;
  ratings_count: number;
  accuracy_avg?: number;
  clarity_avg?: number;
  completeness_avg?: number;
  feedback_items?: FeedbackItem[];
  voter_ids?: string[];
  created_at: string;
  user_rating?: number | null; // Current viewer's overall rating if any
  user_feedback?: FeedbackItem | null;
}

export interface Rating {
  id: string;
  summary_id: string;
  voter_id: string;
  voter_name?: string;
  score: number; // 1 to 10
  accuracy?: number;
  clarity?: number;
  completeness?: number;
  comment?: string;
  is_correction?: boolean;
  created_at: string;
}
