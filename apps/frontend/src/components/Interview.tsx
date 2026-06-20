import { useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type LocationState = { github: string; linkedin: string };

async function fetchQuestions(github: string, linkedin: string): Promise<string[]> {
  const { data } = await api.post<{ questions: string[] }>("/api/v1/pre-interview", { github, linkedin });
  return data.questions;
}

export function Interview() {
  const navigate = useNavigate();
  const { state } = useLocation() as { state: LocationState };

  const { data: questions, isLoading, isError } = useQuery({
    queryKey: ["questions", state?.github, state?.linkedin],
    queryFn: () => fetchQuestions(state.github, state.linkedin),
    enabled: !!state?.github && !!state?.linkedin,
  });

  if (!state?.github) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <p className="text-slate-400">No profile data found. <button onClick={() => navigate("/")} className="text-indigo-400 underline">Go back</button></p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-slate-800/50 border-slate-700 shadow-2xl backdrop-blur-sm">
        <CardHeader className="pb-4 border-b border-slate-700">
          <CardTitle className="text-2xl font-bold text-white">Your Interview</CardTitle>
          <p className="text-slate-400 text-sm mt-1">Based on your GitHub & LinkedIn profiles</p>
        </CardHeader>
        <CardContent className="pt-6">
          {isLoading && (
            <div className="flex flex-col items-center gap-4 py-10">
              <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-slate-400 text-sm">Generating your personalized questions...</p>
            </div>
          )}

          {isError && (
            <p className="text-red-400 text-center py-8">Failed to load questions. Please try again.</p>
          )}

          {questions && (
            <ol className="space-y-4">
              {questions.map((q, i) => (
                <li key={i} className="flex gap-4 p-4 rounded-lg bg-slate-700/40 border border-slate-600/50">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-indigo-600 text-white text-sm flex items-center justify-center font-semibold">
                    {i + 1}
                  </span>
                  <p className="text-slate-200 leading-relaxed">{q}</p>
                </li>
              ))}
            </ol>
          )}

          {questions && (
            <div className="flex gap-3 mt-8">
              <Button
                variant="outline"
                onClick={() => navigate("/")}
                className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
              >
                Start Over
              </Button>
              <Button
                onClick={() => navigate("/result", { state: { questions, ...state } })}
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/40"
              >
                Finish & See Results
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
