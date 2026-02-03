import { Checkbox } from "../ui/checkbox";

interface Repo {
  id: number;
  name: string;
  owner: { login: string };
  updated_at: string | null; 
}

interface RepoListProps {
  title: string;
  repos: Repo[];
  icon: string;
}

export function RepoList({ title, repos, icon }: RepoListProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider flex items-center gap-2">
        <span>{icon}</span> {title}
      </h3>
      <div className="space-y-2">
        {repos.length > 0 ? (
          repos.map((repo) => (
            <div 
              key={repo.id} 
              className="flex items-center space-x-3 bg-zinc-900/50 p-3 rounded-lg border border-zinc-800 hover:border-zinc-700 transition-colors"
            >
              <Checkbox id={`repo-${repo.id}`} />
              <div className="grid gap-0.5">
                <label 
                  htmlFor={`repo-${repo.id}`} 
                  className="text-sm font-medium text-white cursor-pointer"
                >
                  {repo.name}
                </label>
                <span className="text-xs text-zinc-500">
                  {repo.owner.login} • {repo.updated_at ? new Date(repo.updated_at).toLocaleDateString() : 'Recently Active'}
                </span>
              </div>
            </div>
          ))
        ) : (
          <p className="text-xs text-zinc-600 italic px-2">No repositories found.</p>
        )}
      </div>
    </div>
  );
}