import express from "express";
import { preInterviewSchema } from "./types/preInterview";
import { extractGithubUsername, verifyGithubUser } from "./utils/validateUrls";

const app = express();

app.use(express.json());

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

    // TODO: continue pipeline with validated github and linkedin
    res.json({ github, linkedin });
});

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});
