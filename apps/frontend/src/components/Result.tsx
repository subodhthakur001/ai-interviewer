import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type LocationState = { questions: string[]; github: string; linkedin: string };

export function Result() {
  const navigate = useNavigate();
  const { state } = useLocation() as { state: LocationState };

  if (!state?.questions) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <p className="text-slate-400">
          No results found.{" "}
          <button onClick={() => navigate("/")} className="text-indigo-400 underline">
            Go back
          </button>
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-slate-800/50 border-slate-700 shadow-2xl backdrop-blur-sm">
        <CardHeader className="pb-4 border-b border-slate-700 text-center">
          <div className="mx-auto mb-3 w-16 h-16 rounded-full bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center">
            <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <CardTitle className="text-2xl font-bold text-white">Interview Complete</CardTitle>
          <p className="text-slate-400 text-sm mt-1">Here's a summary of your session</p>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-slate-700/40 border border-slate-600/50">
              <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">GitHub</p>
              <p className="text-slate-200 text-sm truncate">{state.github}</p>
            </div>
            <div className="p-4 rounded-lg bg-slate-700/40 border border-slate-600/50">
              <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">LinkedIn</p>
              <p className="text-slate-200 text-sm truncate">{state.linkedin}</p>
            </div>
          </div>

          <div>
            <p className="text-slate-300 font-medium mb-3">Questions Covered</p>
            <ol className="space-y-2">
              {state.questions.map((q, i) => (
                <li key={i} className="flex gap-3 text-sm text-slate-400">
                  <span className="flex-shrink-0 text-indigo-400 font-medium">{i + 1}.</span>
                  <span>{q}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => navigate("/")}
              className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
            >
              New Interview
            </Button>
            <Button
              onClick={() => navigate("/interview", { state: { github: state.github, linkedin: state.linkedin } })}
              className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/40"
            >
              Retry Interview
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
