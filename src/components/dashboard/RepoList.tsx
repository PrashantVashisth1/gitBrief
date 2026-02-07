import { Checkbox } from "../ui/checkbox";
import { Loader2 } from "lucide-react";

export interface Repo {
  id: number;
  name: string;
  full_name: string;
  owner: { login: string };
  updated_at: string | null; 
}

export interface Commit {
  sha: string;
  message: string;
  date: string;
}

interface RepoListProps {
  title: string;
  repos: Repo[];
  icon: string;
  repoCommits: Record<string, Commit[]>; // Cache of all fetched data
  selectedCommits: Record<string, string[]>; // List of checked SHAs
  fetchingRepos: Set<string>;
  onToggleRepo: (repo: Repo) => void;
  onToggleCommit: (repoFullName: string, commitSha: string) => void;
}

export function RepoList({ 
  title, 
  repos, 
  icon, 
  repoCommits, 
  selectedCommits, 
  fetchingRepos, 
  onToggleRepo, 
  onToggleCommit 
}: RepoListProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider flex items-center gap-2">
        <span>{icon}</span> {title}
      </h3>
      <div className="space-y-4">
        {repos.length > 0 ? (
          repos.map((repo) => {
            const hasFetched = !!repoCommits[repo.full_name];
            const isFetching = fetchingRepos.has(repo.full_name);
            const commits = repoCommits[repo.full_name] || [];
            const selectedShas = selectedCommits[repo.full_name] || [];

            return (
              <div key={repo.id} className="space-y-2">
                <div className="flex items-center space-x-3 bg-zinc-900/50 p-3 rounded-lg border border-zinc-800 hover:border-zinc-700 transition-colors">
                  <Checkbox 
                    id={`repo-${repo.id}`} 
                    checked={selectedShas.length > 0}
                    onCheckedChange={() => onToggleRepo(repo)}
                  />
                  <div className="grid gap-0.5 flex-1">
                    <label htmlFor={`repo-${repo.id}`} className="text-sm font-medium text-white cursor-pointer select-none flex items-center gap-2">
                      {repo.name}
                      {isFetching && <Loader2 className="h-3 w-3 animate-spin text-blue-500" />}
                    </label>
                    <span className="text-xs text-zinc-500">{repo.owner.login}</span>
                  </div>
                </div>

                {/* Show list if we have data in the cache */}
                {hasFetched && (
                  <div className="ml-8 space-y-2 border-l border-zinc-800 pl-4 animate-in fade-in slide-in-from-left-2 duration-300">
                    {commits.length > 0 ? (
                      commits.map((commit) => (
                        <div key={commit.sha} className="flex items-start gap-3 py-1">
                          <Checkbox 
                            id={`commit-${commit.sha}`}
                            checked={selectedShas.includes(commit.sha)}
                            onCheckedChange={() => onToggleCommit(repo.full_name, commit.sha)}
                          />
                          <div className="grid gap-1">
                            <label htmlFor={`commit-${commit.sha}`} className="text-xs text-zinc-400 cursor-pointer leading-tight">
                              {commit.message}
                            </label>
                            <span className="text-[10px] text-zinc-600">
                              {new Date(commit.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : !isFetching && (
                      <p className="text-[10px] text-zinc-600 italic">No commits found from you in this timeframe.</p>
                    )}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <p className="text-xs text-zinc-600 italic px-2">No repositories found.</p>
        )}
      </div>
    </div>
  );
}