const isGitHubPages = process.env.IS_GITHUB_PAGES === "true";

export default {
  basePath: isGitHubPages ? "/string-parser/" : "/",
  // ... any other Waku configurations
};
