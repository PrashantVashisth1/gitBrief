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

export async function fetchUserRepos(userId: string) {
  const octokit = await getOctokit(userId);

  // Get the authenticated user's login to distinguish personal vs work repos
  const { data: userProfile } = await octokit.rest.users.getAuthenticated();
  const userLogin = userProfile.login;

  console.log(userLogin)

  const { data: repos } = await octokit.rest.repos.listForAuthenticatedUser({
    sort: "pushed",
    per_page: 100,
  });

  const workspace = repos.filter((repo) => 
    repo.owner.type === "Organization" || 
    (repo.permissions?.push === true && repo.owner.login !== userLogin)
  );

  const personal = repos.filter((repo) => 
    repo.owner.type === "User" && repo.owner.login === userLogin
  );

  return { personal, workspace };
}