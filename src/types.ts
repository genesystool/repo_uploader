export interface GitHubUser {
  login: string;
  id: number;
  avatar_url: string;
  name: string | null;
  email: string | null;
  public_repos: number;
  html_url: string;
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  owner: {
    login: string;
    avatar_url: string;
  };
  private: boolean;
  html_url: string;
  default_branch: string;
  description: string | null;
  updated_at: string;
  stargazers_count: number;
  forks_count: number;
  size: number;
}

export interface GitHubBranch {
  name: string;
  commit: {
    sha: string;
    url: string;
  };
  protected: boolean;
}

export interface GitHubContent {
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  html_url: string;
  git_url: string;
  download_url: string | null;
  type: 'file' | 'dir' | 'symlink' | 'submodule';
  content?: string;
  encoding?: string;
  _links?: {
    self: string;
    git: string;
    html: string;
  };
}

export interface GitHubCommitAuthor {
  name: string;
  email: string;
  date?: string;
}

export interface GitHubCommitDetail {
  sha: string;
  commit: {
    author: GitHubCommitAuthor;
    committer: GitHubCommitAuthor;
    message: string;
  };
  html_url: string;
  author: {
    login: string;
    avatar_url: string;
  } | null;
}

export interface FileToUpload {
  id: string;
  file?: File;
  path: string; // Remote path in repository
  content: string; // Text content or base64
  isBinary: boolean;
  existingSha?: string; // If file exists in repo, SHA is required for update
  status: 'idle' | 'checking' | 'ready' | 'uploading' | 'success' | 'error';
  errorMessage?: string;
  size: number;
}

export interface CommitPayload {
  owner: string;
  repo: string;
  path: string;
  message: string;
  content: string; // base64 encoded or raw text converted to base64
  sha?: string; // required if updating
  branch?: string;
  committer?: {
    name: string;
    email: string;
  };
}

export interface AppSettings {
  token: string;
  owner: string;
  repo: string;
  branch: string;
  autoSaveToken: boolean;
  defaultCommitMessage: string;
}

export type ViewTab = 'explorer' | 'upload' | 'editor' | 'python' | 'history' | 'tutorial';
