import express from "express";
import cors from "cors";
import axios from "axios";
import { preInterviewSchema } from "./types/preInterview";
import { extractGithubUsername, verifyGithubUser } from "./utils/validateUrls";

const app = express();

app.use(cors());
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

    console.log("githubUsername", githubUsername);
    console.log("githubExists", githubExists);
    // if (!githubExists) {
    //     res.status(400).json({
    //         error: "Validation failed",
    //         issues: { github: [`GitHub user "${githubUsername}" does not exist`] },
    //     });
    //     return;
    // }
    const GithubRepo = await axios.get(`https://api.github.com/users/${githubUsername}/repos`);
    const GithubRepos = GithubRepo.data.map((repo: any) => repo.name); 


    // TODO: continue pipeline with validated github and linkedin
    res.json({ github, linkedin });
});

app.listen(8000, () => {
    console.log("Server is running on port 8000");
});
