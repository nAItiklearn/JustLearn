export type Category = 
  | "Psychology & Human Behavior"
  | "Tech & Computer Science"
  | "Science, Biology & Nature"
  | "Economics & Game Theory"
  | "History & Design Mysteries";

export interface Topic {
  id: string;
  title: string;
  category: Category;
  hook: string;
  difficulty: "Easy" | "Medium" | "Hard";
  times_completed: number;
  created_at?: string;
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
  created_at: string;
  user_rating?: number | null; // Current viewer's rating if any
}

export interface Rating {
  id: string;
  summary_id: string;
  voter_id: string;
  score: number; // 1 to 10
  created_at: string;
}
