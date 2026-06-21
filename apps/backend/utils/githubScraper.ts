import axios from "axios";

const gh = axios.create({
  baseURL: "https://api.github.com",
  headers: { Accept: "application/vnd.github+json" },
});

interface GithubUser {
  name: string | null;
  login: string;
  bio: string | null;
  company: string | null;
  location: string | null;
  blog: string | null;
  public_repos: number;
  followers: number;
  following: number;
}

interface GithubRepo {
  name: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  topics: string[];
  html_url: string;
}

export interface GithubProfile {
  user: {
    name: string | null;
    username: string;
    bio: string | null;
    company: string | null;
    location: string | null;
    blog: string | null;
    publicRepos: number;
    followers: number;
  };
  topRepos: {
    name: string;
    description: string | null;
    language: string | null;
    stars: number;
    forks: number;
    topics: string[];
    url: string;
  }[];
  languages: string[];
}

export async function scrapeGithubProfile(username: string): Promise<GithubProfile> {
  const [userRes, reposRes] = await Promise.all([
    gh.get<GithubUser>(`/users/${username}`),
    gh.get<GithubRepo[]>(`/users/${username}/repos`, {
      params: { sort: "stars", per_page: 8 },
    }),
  ]);

  const user = userRes.data;
  const repos = reposRes.data;

  const topRepos = repos.map((repo) => ({
    name: repo.name,
    description: repo.description,
    language: repo.language,
    stars: repo.stargazers_count,
    forks: repo.forks_count,
    topics: repo.topics ?? [],
    url: repo.html_url,
  }));

  // deduplicated language list ordered by frequency
  const langCounts: Record<string, number> = {};
  for (const repo of repos) {
    if (repo.language) {
      langCounts[repo.language] = (langCounts[repo.language] ?? 0) + 1;
    }
  }
  const languages = Object.entries(langCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([lang]) => lang);

  return {
    user: {
      name: user.name,
      username: user.login,
      bio: user.bio,
      company: user.company,
      location: user.location,
      blog: user.blog,
      publicRepos: user.public_repos,
      followers: user.followers,
    },
    topRepos,
    languages,
  };
}
