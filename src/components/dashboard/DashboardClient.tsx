"use client";

import { useState, useEffect } from "react";
import { RepoList, Repo, Commit } from "./RepoList";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import { generateBriefAction, getRepoCommitsAction } from "../../app/actions";
import { isArray } from "util";

interface DashboardClientProps {
  activePersonal: Repo[];
  activeWorkspace: Repo[];
  inactivePersonal: Repo[];
  inactiveWorkspace: Repo[];
  totalRepoCount: number;
  showAll: boolean;
  days: number;
}

export function DashboardClient({
  activePersonal,
  activeWorkspace,
  inactivePersonal,
  inactiveWorkspace,
  totalRepoCount,
  showAll,
  days,
}: DashboardClientProps) {
  // Cache for ALL commits fetched from GitHub
  const [repoCommits, setRepoCommits] = useState<Record<string, Commit[]>>({});
  // Record of repoFullName -> Array of selected commit SHAs
  const [selectedCommits, setSelectedCommits] = useState<
    Record<string, string[]>
  >({});
  const [fetchingRepos, setFetchingRepos] = useState<Set<string>>(new Set());
  const [isGenerating, setIsGenerating] = useState(false);
  const [brief, setBrief] = useState("");
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(brief);
    setCopied(true);
    // Reset the button text after 2 seconds
    setTimeout(() => setCopied(false), 2000);
  };

  // Clear cache when timeframe changes
  useEffect(() => {
    setRepoCommits({});
    setSelectedCommits({});
    setFetchingRepos(new Set());
    setBrief("");
  }, [days]);

  const toggleRepo = async (repo: Repo) => {
    const isFetched = !!repoCommits[repo.full_name];

    if (!isFetched) {
      // Step 1: Fetch commits if not in cache
      setFetchingRepos((prev) => new Set(prev).add(repo.full_name));
      try {
        const commits = await getRepoCommitsAction(repo.full_name, days);
        setRepoCommits((prev) => ({ ...prev, [repo.full_name]: commits }));
        // Auto-select all SHAs on first fetch
        setSelectedCommits((prev) => ({
          ...prev,
          [repo.full_name]: commits.map((c) => c.sha),
        }));
      } catch (error) {
        console.error("Failed to fetch commits", error);
      } finally {
        setFetchingRepos((prev) => {
          const next = new Set(prev);
          next.delete(repo.full_name);
          return next;
        });
      }
    } else {
      // Step 2: If already fetched, just toggle the selection state
      const isCurrentlySelected =
        (selectedCommits[repo.full_name]?.length || 0) > 0;

      setSelectedCommits((prev) => {
        const next = { ...prev };
        if (isCurrentlySelected) {
          // Uncheck everything
          next[repo.full_name] = [];
        } else {
          // Select everything from the cache
          next[repo.full_name] = repoCommits[repo.full_name].map((c) => c.sha);
        }
        return next;
      });
    }
  };

  const toggleCommit = (repoFullName: string, commitSha: string) => {
    setSelectedCommits((prev) => {
      const current = prev[repoFullName] || [];
      const isSelected = current.includes(commitSha);
      const updated = isSelected
        ? current.filter((sha) => sha !== commitSha)
        : [...current, commitSha];
      return { ...prev, [repoFullName]: updated };
    });
  };

  const totalSelectedCount = Object.values(selectedCommits).flat().length;

  const handleGenerate = async () => {
    setIsGenerating(true);
    // Filter the cached commits to only include the ones with selected SHAs
    const finalSelection = Object.keys(selectedCommits).reduce(
      (acc, repoName) => {
        const selectedShas = selectedCommits[repoName];
        const commits = repoCommits[repoName].filter((c) =>
          selectedShas.includes(c.sha),
        );
        if (commits.length > 0) acc[repoName] = commits;
        return acc;
      },
      {} as Record<string, Commit[]>,
    );

    console.log("Generating brief with selected data:", finalSelection);
    const promptData = Object.entries(finalSelection)
      .map(
        ([repo, commits]) =>
          `Repository: ${repo}\n${commits.map((c) => `- ${c.message}`).join("\n")}`,
      )
      .join("\n\n");

    try {
      // 1. Call your new AI action
      const aiResponse = await generateBriefAction(promptData);
      // 2. Save the result to state
      setBrief(aiResponse);
    } catch (error) {
      console.error("AI Generation failed:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <main className="grid md:grid-cols-2 gap-12">
      <div className="space-y-8">
        <div className="space-y-6">
          <RepoList
            title="Active Workspaces"
            repos={activeWorkspace}
            icon="🔥"
            repoCommits={repoCommits}
            selectedCommits={selectedCommits}
            fetchingRepos={fetchingRepos}
            onToggleRepo={toggleRepo}
            onToggleCommit={toggleCommit}
          />
          <RepoList
            title="Active Personal"
            repos={activePersonal}
            icon="🔥"
            repoCommits={repoCommits}
            selectedCommits={selectedCommits}
            fetchingRepos={fetchingRepos}
            onToggleRepo={toggleRepo}
            onToggleCommit={toggleCommit}
          />
        </div>

        <div className="pt-4 border-t border-zinc-900">
          {!showAll ? (
            <Button
              variant="ghost"
              className="text-zinc-500 hover:text-black text-xs gap-2"
              asChild
            >
              <Link href={`?days=${days}&showAll=true`}>
                <ChevronDown className="h-3 w-3" />
                Show all repositories ({totalRepoCount})
              </Link>
            </Button>
          ) : (
            <div className="space-y-8 animate-in slide-in-from-top-2 duration-300">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
                  Other Repositories
                </span>
                <Button
                  variant="ghost"
                  className="text-blue-500 hover:text-blue-600 text-[10px] h-6"
                  asChild
                >
                  <Link href={`?days=${days}`}>Collapse</Link>
                </Button>
              </div>
              <RepoList
                title="Workspaces"
                repos={inactiveWorkspace}
                icon="🏢"
                repoCommits={repoCommits}
                selectedCommits={selectedCommits}
                fetchingRepos={fetchingRepos}
                onToggleRepo={toggleRepo}
                onToggleCommit={toggleCommit}
              />
              <RepoList
                title="Personal"
                repos={inactivePersonal}
                icon="👤"
                repoCommits={repoCommits}
                selectedCommits={selectedCommits}
                fetchingRepos={fetchingRepos}
                onToggleRepo={toggleRepo}
                onToggleCommit={toggleCommit}
              />
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider">
          ✨ AI Brief Draft
        </h3>
        <Card className="bg-zinc-900 border-zinc-800 h-fit sticky top-8">
          {/* Replace the content inside your CardContent in DashboardClient.tsx */}
          <CardContent className="pt-6 space-y-4">
            {brief ? (
              <div className="space-y-4 animate-in fade-in duration-500">
                <textarea
                  value={brief}
                  onChange={(e) => setBrief(e.target.value)}
                  className="w-full h-64 bg-zinc-950 text-zinc-300 p-3 rounded-md border border-zinc-800 text-sm leading-relaxed focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <div className="flex gap-2">
                  <Button
                    onClick={handleCopy}
                    className={`flex-1 transition-all cursor-pointer ${copied ? "bg-green-600 hover:bg-green-500" : "bg-zinc-800 hover:bg-zinc-700"} text-white`}
                  >
                    {copied ? "Copied to Clipboard!" : "Copy to Clipboard"}
                  </Button>
                  <Button
                    onClick={handleGenerate}
                    variant="outline"
                    className="border-zinc-800 text-zinc-800 cursor-pointer"
                  >
                    Regenerate
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <p className="text-zinc-400 text-sm italic">
                  {totalSelectedCount === 0
                    ? "Select repositories and commits on the left to include in your report."
                    : `${totalSelectedCount} commits selected. Ready to generate?`}
                </p>
                <Button
                  onClick={handleGenerate}
                  disabled={totalSelectedCount === 0 || isGenerating}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold"
                >
                  {isGenerating ? "Gemini is writing..." : "Generate Brief"}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
