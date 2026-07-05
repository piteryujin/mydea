import { ideaSchema, type Idea } from "../domain/contracts";

const STORAGE_KEY = "mydea:ideas:v1";
const GUEST_EMAIL_KEY = "mydea:guest-email";

export function loadIdeas(): Idea[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    return ideaSchema.array().parse(parsed);
  } catch {
    return [];
  }
}

export function saveIdeaLocally(idea: Idea): Idea[] {
  const ideas = loadIdeas();
  const index = ideas.findIndex((item) => item.id === idea.id);
  const next =
    index >= 0
      ? ideas.map((item) => (item.id === idea.id ? idea : item))
      : [idea, ...ideas];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

export function deleteIdeaLocally(id: string): Idea[] {
  const next = loadIdeas().filter((idea) => idea.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

export function getIdeaById(id: string): Idea | null {
  return loadIdeas().find((idea) => idea.id === id) ?? null;
}

export function setGuestEmail(email: string) {
  localStorage.setItem(GUEST_EMAIL_KEY, email);
}

export function getGuestEmail() {
  return localStorage.getItem(GUEST_EMAIL_KEY);
}

export function clearGuestEmail() {
  localStorage.removeItem(GUEST_EMAIL_KEY);
}
