import { execSync } from 'node:child_process';

function git(cmd: string): string {
  try {
    return execSync(`git ${cmd}`, { encoding: 'utf-8' }).trim();
  } catch {
    return 'unknown';
  }
}

// GitHub Actions exposes GITHUB_SHA / GITHUB_REF_NAME; fall back to local git.
const envSha = process.env.GITHUB_SHA ?? process.env.CF_PAGES_COMMIT_SHA;
const envBranch = process.env.GITHUB_REF_NAME ?? process.env.CF_PAGES_BRANCH;

export const telemetry = {
  builtAt: new Date().toISOString(),
  sha: (envSha ?? git('rev-parse --short HEAD')).slice(0, 7),
  branch: envBranch ?? git('rev-parse --abbrev-ref HEAD'),
};
