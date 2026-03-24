/* global process */

import { Template } from "../types/template";

const ENDPOINT = "https://dblzktjxuyyoojrdruzw.supabase.co/functions/v1/swift-action";

export async function fetchTemplates(): Promise<Template[]> {
  const response = await fetch(ENDPOINT, {
    method: "GET",
    headers: {
      "x-ptn-key": process.env.PTN_API_KEY as string,
      Authorization: `Bearer ${process.env.PTN_AUTH_TOKEN as string}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch templates: ${response.status} ${response.statusText}`);
  }

  const data: Template[] = await response.json();
  return data.filter((t) => t.is_active).sort((a, b) => a.sort_order - b.sort_order);
}
