import { Template } from "../types/template";

export async function fetchTemplates(): Promise<Template[]> {
  const response = await fetch("/api/templates");

  if (!response.ok) {
    throw new Error(`Failed to fetch templates: ${response.status} ${response.statusText}`);
  }

  const raw = await response.json();
  // Supabase returns "Name" (capital N) — normalise to lowercase keys
  const data: Template[] = raw.map((t: Record<string, unknown>) => ({
    ...t,
    name: (t["name"] ?? t["Name"]) as string,
  }));
  return data.filter((t) => t.is_active).sort((a, b) => a.sort_order - b.sort_order);
}
