import { useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useRef } from "react";

type LocationState = { github: string; linkedin: string };

async function fetchQuestions(github: string, linkedin: string): Promise<string[]> {
  const { data } = await api.post<{ questions: string[] }>("/api/v1/pre-interview", { github, linkedin });
  return data.questions;
}
export function Interview() {
  const navigate = useNavigate();
  const { state } = useLocation() as { state: LocationState };
  const audioElement = useRef<HTMLAudioElement>(null);

  const { data: questions, isLoading, isError } = useQuery({
    queryKey: ["questions", state?.github, state?.linkedin],
    queryFn: () => fetchQuestions(state.github, state.linkedin),
    enabled: !!state?.github && !!state?.linkedin,
  });

  useEffect(() => {
    const pc = new RTCPeerConnection();
    let closed = false;

    pc.ontrack = (e) => {
      if (audioElement.current) {
        audioElement.current.srcObject = e.streams[0]!;
      }
    };

    (async () => {
      const ms = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (closed) return;

      pc.addTrack(ms.getTracks()[0]!);
      pc.createDataChannel("oai-events");

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      if (closed) return;

      const sdpResponse = await api.post<string>("/session/:interviewId", offer.sdp, {
        headers: { "Content-Type": "application/sdp" },
        responseType: "text",
      });
      if (closed) return;
    
      await pc.setRemoteDescription({
        type: "answer",
        sdp: sdpResponse.data,
      });
    })();

    return () => {
      closed = true;
      pc.close();
    };
  }, []);

  if (!state?.github) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <p className="text-slate-400">No profile data found. <button onClick={() => navigate("/")} className="text-indigo-400 underline">Go back</button></p>
      </div>
    );
  }

  return (
    <div>
      <audio ref={audioElement} autoPlay />
    </div>
  );
}
