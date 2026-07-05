import { ideaSchema, type Idea } from "../domain/contracts";
import { loadIdeas, saveIdeaLocally } from "./storage";
import { supabase } from "./supabase";

type IdeaRow = {
  id: string;
  user_id: string;
  raw_text: string;
  status: Idea["status"];
  title: string;
  questions: Idea["questions"];
  answers: Idea["answers"];
  analysis: Idea["analysis"];
  completed_actions: number[];
  created_at: string;
  updated_at: string;
};

const toRow = (idea: Idea, userId: string): IdeaRow => ({
  id: idea.id,
  user_id: userId,
  raw_text: idea.rawText,
  status: idea.status,
  title: idea.title,
  questions: idea.questions,
  answers: idea.answers,
  analysis: idea.analysis,
  completed_actions: idea.completedActions,
  created_at: idea.createdAt,
  updated_at: idea.updatedAt,
});

const fromRow = (row: IdeaRow): Idea =>
  ideaSchema.parse({
    id: row.id,
    userId: row.user_id,
    rawText: row.raw_text,
    status: row.status,
    title: row.title,
    questions: row.questions,
    answers: row.answers,
    analysis: row.analysis,
    completedActions: row.completed_actions,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  });

export async function saveIdea(idea: Idea, userId?: string) {
  saveIdeaLocally(idea);
  if (!supabase || !userId) return;

  const { error } = await supabase.from("ideas").upsert(toRow(idea, userId));
  if (error) throw error;
}

export async function syncIdeas(userId: string): Promise<Idea[]> {
  if (!supabase) return loadIdeas();

  const local = loadIdeas();
  if (local.length) {
    const rows = local.map((idea) => toRow(idea, userId));
    const { error } = await supabase.from("ideas").upsert(rows);
    if (error) throw error;
  }

  const { data, error } = await supabase
    .from("ideas")
    .select("*")
    .order("updated_at", { ascending: false });
  if (error) throw error;

  const remote = (data as IdeaRow[]).map(fromRow);
  remote.forEach(saveIdeaLocally);
  return loadIdeas();
}
