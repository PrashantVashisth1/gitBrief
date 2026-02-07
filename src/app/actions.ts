"use server";

import { auth } from "../auth";
import { fetchCommitsForRepo } from "../lib/github";

export async function getRepoCommitsAction(repoFullName: string, days: number) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  return await fetchCommitsForRepo(session.user.id, repoFullName, days);
}