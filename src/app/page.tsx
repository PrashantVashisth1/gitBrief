import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Checkbox } from "../components/ui/checkbox";
import { CalendarIcon, Github, LogOut } from "lucide-react";
// 1. Import auth and signOut
import { auth, signIn, signOut } from "../auth";

export default async function Home() {
  // 2. Fetch the session on the server
  const session = await auth();

  // 3. LOGIC: If the user is NOT logged in, show the Landing Page
  if (!session?.user) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
        <div className="text-center max-w-2xl space-y-6 mb-12">
          <h1 className="text-6xl font-bold tracking-tighter">
            Git<span className="text-blue-500">Brief</span>
          </h1>
          <p className="text-zinc-400 text-xl">
            Your daily standup, written by AI.
          </p>
          <form
            action={async () => {
              "use server";
              await signIn("github");
            }}
          >
            <Button size="lg" className="bg-white text-black hover:bg-zinc-200 cursor-pointer">
              <Github className="mr-2 h-5 w-5" />
              Login with GitHub
            </Button>
          </form>
        </div>
      </div>
    );
  }

  // 4. LOGIC: If the user IS logged in, show the real Dashboard
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl opacity-90">
        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
          
          {/* Real Header Bar using Session Data */}
          <div className="flex justify-between items-center mb-6 border-b border-zinc-800 pb-4">
            <div className="flex items-center gap-3">
              {/* Show the real GitHub Avatar */}
              <img 
                src={session.user.image || ""} 
                alt="Avatar" 
                className="h-10 w-10 rounded-full border border-zinc-700"
              />
              <div>
                <span className="font-medium block text-white">
                  Good morning, {session.user.name?.split(' ')[0]}
                </span>
                <span className="text-xs text-zinc-500">{session.user.email}</span>
              </div>
            </div>
            
            <div className="flex gap-2">
               <Button variant="outline" className="text-zinc-400 border-zinc-700">
                <CalendarIcon className="mr-2 h-4 w-4" />
                Today
              </Button>
              {/* Logout Button */}
              <form
                action={async () => {
                  "use server";
                  await signOut();
                }}
              >
                <Button variant="ghost" size="icon" className="text-zinc-500 hover:text-red-400 cursor-pointer">
                  <LogOut className="h-5 w-5" />
                </Button>
              </form>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* The rest of your Repo List and AI Draft UI goes here... */}
            <div className="space-y-6">
               <div className="p-8 border-2 border-dashed border-zinc-800 rounded-lg text-center">
                  <p className="text-zinc-500">Coming Soon: Your real GitHub repositories will appear here.</p>
               </div>
            </div>

            <div className="space-y-4">
               <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider">✨ AI Draft</h3>
               <Card className="bg-zinc-900 border-zinc-800 h-full">
                <CardContent className="pt-6">
                  <p className="text-zinc-500 text-sm">Click "Generate Update" to see your first brief.</p>
                </CardContent>
               </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}