import { Template } from "../types/template";

export async function fetchTemplates(): Promise<Template[]> {
  const response = await fetch("/api/templates");

  if (!response.ok) {
    throw new Error(`Failed to fetch templates: ${response.status} ${response.statusText}`);
  }

  const data: Template[] = await response.json();
  return data.filter((t) => t.is_active).sort((a, b) => a.sort_order - b.sort_order);
}
