import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { CalendarIcon, Github, LogOut } from "lucide-react";
import { auth, signIn, signOut } from "../auth";
import { fetchUserRepos } from "../lib/github";
import { RepoList } from "../components/dashboard/RepoList";

export default async function Home() {
  const session = await auth();

  // Landing Page for Guest Users
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

  // Fetch real GitHub data for the logged-in user
  const { personal, workspace } = await fetchUserRepos(session.user.id!);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center p-8">
      <div className="w-full max-w-6xl space-y-8">
        
        {/* Header Section */}
        <header className="flex justify-between items-center border-b border-zinc-800 pb-6">
          <div className="flex items-center gap-4">
            <img src={session.user.image!} className="h-12 w-12 rounded-full border border-zinc-700" alt="Profile" />
            <div>
              <h2 className="text-lg font-bold">Good morning, {session.user.name?.split(' ')[0]}</h2>
              <p className="text-xs text-zinc-500">{session.user.email}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" size="sm" className="bg-zinc-900 border-zinc-700">
              <CalendarIcon className="mr-2 h-4 w-4" /> Today
            </Button>
            <form action={async () => { "use server"; await signOut(); }}>
              <Button variant="ghost" size="icon" className="text-zinc-500 hover:text-red-400 cursor-pointer">
                <LogOut className="h-5 w-5" />
              </Button>
            </form>
          </div>
        </header>

        {/* Dashboard Grid */}
        <main className="grid md:grid-cols-2 gap-12">
          
          {/* Column 1: Real Repositories */}
          <div className="space-y-8">
            <RepoList title="Workspaces" repos={workspace} icon="🏢" />
            <RepoList title="Personal" repos={personal} icon="👤" />
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