import express from "express";
import cors from "cors";
import { preInterviewSchema } from "./types/preInterview";
import { extractGithubUsername, verifyGithubUser } from "./utils/validateUrls";
import { scrapeGithubProfile } from "./utils/githubScraper";
import { prisma } from "./db";
import { initSideband } from "./sideband";
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.text({ type: ["application/sdp", "text/plain"] }));

const sessionConfig = JSON.stringify({
    type: "realtime",
    model: "gpt-realtime-2",
    audio: { output: { voice: "marin" } },
  });

app.post("/api/v1/pre-interview", async (req, res) => {
    const result = preInterviewSchema.safeParse(req.body);

    if (!result.success) {
        res.status(400).json({
            error: "Validation failed",
            issues: result.error.flatten().fieldErrors,
        });
        return;
    }

    const { github, linkedin } = result.data;

    const githubUsername = extractGithubUsername(github)!;
    const githubExists = await verifyGithubUser(githubUsername);

    if (!githubExists) {
        res.status(400).json({
            error: "Validation failed",
            issues: { github: [`GitHub user "${githubUsername}" does not exist`] },
        });
        return;
    }

    const githubProfile = await scrapeGithubProfile(githubUsername);

    const interview = await prisma.interview.create({
        data: {
            githubMetaData: JSON.stringify(githubProfile),
            status: "Pre",
        },
    });

    // TODO: pass githubProfile to the model to generate interview questions
    res.json({ interviewId: interview.id, githubProfile, linkedin });
});

app.post("/session/:interviewId", async (req, res) => {
    const { interviewId } = req.params;
    const fd = new FormData();
    fd.set("sdp", req.body);
    fd.set("session", sessionConfig);

    try {
      const sdpResponse = await fetch("https://api.openai.com/v1/realtime/calls", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "OpenAI-Safety-Identifier": "hashed-user-id",
        },
        body: fd,
      });

      const body = await sdpResponse.text();

      if (!sdpResponse.ok) {
        console.error("OpenAI /realtime/calls error:", sdpResponse.status, body);
        res.status(sdpResponse.status).json({ error: "OpenAI error", detail: body });
        return;
      }
      const location = sdpResponse.headers.get("Location");
      const callId = location?.split("/").pop();

      console.log("callId", callId);

      res.setHeader("Content-Type", "application/sdp");
      res.send(body);
      initSideband(callId!, interviewId);
    } catch (error) {
      console.error("Token generation error:", error);
      res.status(500).json({ error: "Failed to generate token" });
    }
  });

app.listen(8000, () => {
    console.log("Server is running on port 8000");
});
