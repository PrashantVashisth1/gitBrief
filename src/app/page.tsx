import { Button } from "../components/ui/button";
import { Github, LogOut } from "lucide-react";
import { auth, signIn, signOut } from "../auth";
import { fetchUserRepos } from "../lib/github";
import { TimeframeSelector } from "../components/dashboard/TimeframeSelector";
import { DashboardClient } from "../components/dashboard/DashboardClient";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ days?: string; showAll?: string }>;
}) {
  const session = await auth();
  const params = await searchParams;

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

  const days = parseInt(params.days || "1");
  const showAll = params.showAll === "true";

  const { 
    activePersonal, 
    activeWorkspace, 
    workspace, 
    personal 
  } = await fetchUserRepos(session.user.id!, days);

  const inactiveWorkspace = workspace.filter(w => !activeWorkspace.some(aw => aw.id === w.id));
  const inactivePersonal = personal.filter(p => !activePersonal.some(ap => ap.id === p.id));

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center p-8">
      <div className="w-full max-w-6xl space-y-8">
        
        <header className="flex justify-between items-center border-b border-zinc-800 pb-6">
          <div className="flex items-center gap-4">
            <img src={session.user.image!} className="h-12 w-12 rounded-full border border-zinc-700" alt="Profile" />
            <div>
              <h2 className="text-lg font-bold">Good Morning, {session.user.name?.split(' ')[0]}</h2>
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

        {/* Dashboard Logic is now handled by the Client Component */}
        <DashboardClient 
          activePersonal={activePersonal}
          activeWorkspace={activeWorkspace}
          inactivePersonal={inactivePersonal}
          inactiveWorkspace={inactiveWorkspace}
          totalRepoCount={personal.length + workspace.length}
          showAll={showAll}
          days={days}
        />
      </div>
    </div>
  );
}