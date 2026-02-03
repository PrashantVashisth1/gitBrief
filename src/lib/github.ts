import { prisma } from "./prisma";
import { Octokit } from "octokit";

export async function getGitHubToken(userId: string) {
  const account = await prisma.account.findFirst({
    where: { 
      userId: userId, 
      provider: "github" 
    },
    orderBy: {
      id: 'desc'
    }
  });

  if (!account || !account.access_token) {
    throw new Error("GitHub account not found or access token missing");
  }

  return account.access_token;
}

export async function getOctokit(userId: string) {
  const token = await getGitHubToken(userId);
  return new Octokit({ auth: token });
}

export async function fetchUserRepos(userId: string, days: number = 1) {
  const octokit = await getOctokit(userId);

  // Calculate the dynamic threshold
  const threshold = new Date();
  threshold.setDate(threshold.getDate() - days);

  // Get the authenticated user's login to distinguish personal vs work repos
  const { data: userProfile } = await octokit.rest.users.getAuthenticated();
  const userLogin = userProfile.login;

  const { data: repos } = await octokit.rest.repos.listForAuthenticatedUser({
    sort: "pushed",
    per_page: 100,
  });

  const isActive = (repo: any) => 
    repo.pushed_at && new Date(repo.pushed_at) > threshold;

  const workspace = repos.filter((repo) => 
    repo.owner.type === "Organization" || 
    (repo.permissions?.push === true && repo.owner.login !== userLogin)
  );

  const personal = repos.filter((repo) => 
    repo.owner.type === "User" && repo.owner.login === userLogin
  );

  console.log("workspace", workspace)
  console.log("active workspace", workspace.filter(isActive));

  return { 
    personal, 
    workspace,
    // Add these lists so the UI can highlight them
    activePersonal: personal.filter(isActive),
    activeWorkspace: workspace.filter(isActive)
  };
}