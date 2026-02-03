import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Github, LogOut, ChevronDown, ChevronUp } from "lucide-react";
import { auth, signIn, signOut } from "../auth";
import { fetchUserRepos } from "../lib/github";
import { RepoList } from "../components/dashboard/RepoList";
import { TimeframeSelector } from "../components/dashboard/TimeframeSelector";
import Link from "next/link";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ days?: string; showAll?: string }>;
}) {
  const session = await auth();
  const params = await searchParams;

  // 1. Landing Page for Guest Users
  if (!session?.user) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
        <div className="text-center max-w-2xl space-y-6 mb-12">
          <h1 className="text-6xl font-bold tracking-tighter">
            Git<span className="text-blue-500">Brief</span>
          </h1>
          <p className="text-zinc-400 text-xl">Your daily standup, written by AI.</p>
          <form action={async () => { "use server"; await signIn("github"); }}>
            <Button size="lg" className="bg-white text-black hover:bg-zinc-200 cursor-pointer">
              <Github className="mr-2 h-5 w-5" />
              Login with GitHub
            </Button>
          </form>
        </div>
      </div>
    );
  }

  // 2. Extract settings from URL
  const days = parseInt(params.days || "1");
  const showAll = params.showAll === "true";

  // 3. Fetch data (Make sure github.ts returns these 4 distinct arrays)
  const { 
    activePersonal, 
    activeWorkspace, 
    workspace, 
    personal 
  } = await fetchUserRepos(session.user.id!, days);

  // Filter out the active ones from the "All" lists to avoid duplicates in the UI
  const inactiveWorkspace = workspace.filter(w => !activeWorkspace.some(aw => aw.id === w.id));
  const inactivePersonal = personal.filter(p => !activePersonal.some(ap => ap.id === p.id));

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center p-8">
      <div className="w-full max-w-6xl space-y-8">
        
        {/* Header Section */}
        <header className="flex justify-between items-center border-b border-zinc-800 pb-6">
          <div className="flex items-center gap-4">
            <img 
              src={session.user.image!} 
              className="h-12 w-12 rounded-full border border-zinc-700" 
              alt="Profile" 
            />
            <div>
              <h2 className="text-lg font-bold">Good morning, {session.user.name?.split(' ')[0]}</h2>
              <p className="text-xs text-zinc-500">{session.user.email}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <TimeframeSelector />

            <form action={async () => { "use server"; await signOut(); }}>
              <Button variant="ghost" size="icon" className="text-zinc-500 hover:text-red-400 cursor-pointer">
                <LogOut className="h-5 w-5" />
              </Button>
            </form>
          </div>
        </header>

        {/* Dashboard Grid */}
        <main className="grid md:grid-cols-2 gap-12">
          
          {/* Column 1: Repositories */}
          <div className="space-y-8">
            {/* ACTIVE REPOS SECTION */}
            <div className="space-y-6">
              <RepoList 
                title={activeWorkspace.length > 0 ? "Active Workspaces" : "Workspaces"} 
                repos={activeWorkspace} 
                icon="🔥" 
              />
              <RepoList 
                title={activePersonal.length > 0 ? "Active Personal" : "Personal"} 
                repos={activePersonal} 
                icon="🔥" 
              />
              
              {activeWorkspace.length === 0 && activePersonal.length === 0 && (
                <div className="bg-zinc-900/30 border border-dashed border-zinc-800 rounded-xl p-8 text-center">
                   <p className="text-zinc-500 text-sm italic">
                    No code changes found in the last {days} {days === 1 ? 'day' : 'days'}.
                  </p>
                </div>
              )}
            </div>

            {/* TOGGLE SECTION FOR ALL REPOS */}
            <div className="pt-4 border-t border-zinc-900">
              {!showAll ? (
                <Button variant="ghost" className="text-zinc-500 hover:text-white text-xs gap-2" asChild>
                  <Link href={`?days=${days}&showAll=true`}>
                    <ChevronDown className="h-3 w-3" /> 
                    Show all repositories ({personal.length + workspace.length})
                  </Link>
                </Button>
              ) : (
                <div className="space-y-8 animate-in slide-in-from-top-2 duration-300">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Other Repositories</span>
                    <Button variant="ghost" className="text-blue-500 hover:text-blue-400 text-[10px] h-6" asChild>
                      <Link href={`?days=${days}`}>Collapse</Link>
                    </Button>
                  </div>
                  <RepoList title="Workspaces" repos={inactiveWorkspace} icon="🏢" />
                  <RepoList title="Personal" repos={inactivePersonal} icon="👤" />
                </div>
              )}
            </div>
          </div>

          {/* Column 2: AI Draft Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider">✨ AI Brief Draft</h3>
            <Card className="bg-zinc-900 border-zinc-800 h-fit sticky top-8">
              <CardContent className="pt-6 space-y-4">
                <p className="text-zinc-400 text-sm italic">
                  Select the repositories on the left to include in your AI-generated standup report.
                </p>
                <Button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold">
                  Generate Brief
                </Button>
              </CardContent>
            </Card>
          </div>

        </main>
      </div>
    </div>
  );
}