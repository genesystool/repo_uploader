import {
  GitHubUser,
  GitHubRepo,
  GitHubBranch,
  GitHubContent,
  GitHubCommitDetail,
  CommitPayload,
} from '../types';

// Helper for UTF-8 Base64 encoding/decoding safely in browser
export function stringToBase64(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binString = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binString += String.fromCharCode(bytes[i]);
  }
  return btoa(binString).replace(/\s/g, '');
}

export function base64ToString(base64: string): string {
  try {
    const cleanBase64 = base64.replace(/\s/g, '');
    const binString = atob(cleanBase64);
    const bytes = Uint8Array.from(binString, (m) => m.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  } catch (e) {
    console.error('Failed to decode base64:', e);
    return atob(base64.replace(/\s/g, ''));
  }
}

// Helper to convert File object to Base64
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const commaIdx = result.indexOf(',');
      if (commaIdx !== -1) {
        const base64 = result.substring(commaIdx + 1).replace(/\s/g, '');
        resolve(base64);
      } else {
        resolve(result.replace(/\s/g, ''));
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

/**
  * Clean and normalize remote repository path (removes leading/trailing slashes, backslashes, double slashes)
  */
export function cleanFilePath(path: string): string {
  if (!path) return '';
  return path
    .replace(/\\/g, '/')
    .replace(/\/+/g, '/')
    .trim()
    .replace(/^\//, '')
    .replace(/\/$/, '');
}

function getHeaders(token: string) {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
  };
  if (token && token.trim()) {
    headers['Authorization'] = `token ${token.trim()}`;
  }
  return headers;
}

/**
 * Validate token and get authenticated user info
 */
export async function getAuthenticatedUser(token: string): Promise<GitHubUser> {
  const response = await fetch('https://api.github.com/user', {
    headers: getHeaders(token),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Token GitHub tidak valid atau telah kadaluarsa (401 Unauthorized).');
    }
    throw new Error(`Gagal mengambil data user: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Get user's repositories
 */
export async function getUserRepositories(token: string): Promise<GitHubRepo[]> {
  const response = await fetch('https://api.github.com/user/repos?sort=updated&per_page=100', {
    headers: getHeaders(token),
  });

  if (!response.ok) {
    throw new Error(`Gagal mengambil repositori: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Get single repository detail
 */
export async function getRepositoryDetail(token: string, owner: string, repo: string): Promise<GitHubRepo> {
  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
    headers: getHeaders(token),
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`Repositori ${owner}/${repo} tidak ditemukan atau privat.`);
    }
    throw new Error(`Gagal mengambil repositori ${owner}/${repo}: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Get branches for repository
 */
export async function getBranches(token: string, owner: string, repo: string): Promise<GitHubBranch[]> {
  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/branches`, {
    headers: getHeaders(token),
  });

  if (!response.ok) {
    return [];
  }

  return await response.json();
}

/**
 * Get contents of a directory or file metadata
 */
export async function getRepositoryContents(
  token: string,
  owner: string,
  repo: string,
  path: string = '',
  branch: string = 'main'
): Promise<GitHubContent | GitHubContent[]> {
  const cleanPath = cleanFilePath(path);
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${cleanPath}?ref=${encodeURIComponent(branch)}`;

  const response = await fetch(url, {
    headers: getHeaders(token),
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`Jalur/File '${cleanPath || 'root'}' tidak ditemukan di branch '${branch}'.`);
    }
    throw new Error(`Gagal mengambil konten: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Check if a file exists and get its SHA (used for auto-detecting updates vs creates)
 */
export async function getFileSha(
  token: string,
  owner: string,
  repo: string,
  path: string,
  branch: string = 'main'
): Promise<string | null> {
  const cleanPath = cleanFilePath(path);
  if (!cleanPath) return null;

  try {
    const content = await getRepositoryContents(token, owner, repo, cleanPath, branch);
    if (!Array.isArray(content) && content.type === 'file') {
      return content.sha;
    }
    return null;
  } catch (e) {
    // 404 means file doesn't exist yet
    return null;
  }
}

/**
 * Upload new file OR update existing file in GitHub repository with automatic SHA handling
 */
export async function createOrUpdateFile(
  token: string,
  payload: CommitPayload
): Promise<{ content: GitHubContent; commit: any }> {
  const { owner, repo, path, message, content, branch, committer } = payload;
  const cleanPath = cleanFilePath(path);
  let sha = payload.sha;

  if (!cleanPath) {
    throw new Error('Jalur (path) file tidak boleh kosong.');
  }

  // 1. Auto-fetch current SHA from GitHub if not provided
  if (!sha) {
    sha = (await getFileSha(token, owner, repo, cleanPath, branch)) || undefined;
  }

  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${cleanPath}`;
  const cleanContent = content ? content.replace(/\s/g, '') : '';

  const bodyData: any = {
    message: message || (sha ? `Update ${cleanPath}` : `Add ${cleanPath}`),
    content: cleanContent,
    branch: branch || 'main',
  };

  if (sha) {
    bodyData.sha = sha;
  }

  if (committer && committer.name && committer.email) {
    bodyData.committer = committer;
  }

  let response = await fetch(url, {
    method: 'PUT',
    headers: {
      ...getHeaders(token),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(bodyData),
  });

  let resJson = await response.json();

  // 2. Auto-recovery: If 422 or 409 (SHA missing/mismatch/conflict), fetch latest SHA and retry once
  if (!response.ok && (response.status === 422 || response.status === 409)) {
    console.warn(`[Auto-SHA Recovery] Refetching SHA for '${cleanPath}'...`);
    const latestSha = await getFileSha(token, owner, repo, cleanPath, branch);
    if (latestSha && latestSha !== sha) {
      bodyData.sha = latestSha;
      response = await fetch(url, {
        method: 'PUT',
        headers: {
          ...getHeaders(token),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bodyData),
      });
      resJson = await response.json();
    }
  }

  if (!response.ok) {
    const errorMsg = resJson.message || response.statusText;
    if (response.status === 401) {
      throw new Error('Token GitHub tidak valid atau telah kadaluarsa (401 Unauthorized). Silakan perbarui Token.');
    }
    if (response.status === 403) {
      throw new Error(`Akses ditolak (403 Forbidden). Pastikan Token memiliki hak akses 'repo' atau 'Contents: Read & write' untuk ${owner}/${repo}.`);
    }
    if (response.status === 404) {
      throw new Error(`Repositori '${owner}/${repo}', branch '${branch}', atau jalur '${cleanPath}' tidak ditemukan di GitHub (404 Not Found).`);
    }
    if (response.status === 422) {
      throw new Error(`Gagal menyimpan file '${cleanPath}' (422 Unprocessable Entity): ${errorMsg}. Pastikan file tidak melebihi 100MB.`);
    }
    throw new Error(`Gagal menyimpan file '${cleanPath}': ${errorMsg}`);
  }

  return resJson;
}

/**
 * Delete a file from repository
 */
export async function deleteFile(
  token: string,
  owner: string,
  repo: string,
  path: string,
  sha: string,
  message: string,
  branch: string = 'main'
): Promise<any> {
  const cleanPath = cleanFilePath(path);
  let targetSha = sha;

  if (!targetSha) {
    targetSha = (await getFileSha(token, owner, repo, cleanPath, branch)) || '';
  }

  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${cleanPath}`;

  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      ...getHeaders(token),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: message || `Delete ${cleanPath}`,
      sha: targetSha,
      branch: branch || 'main',
    }),
  });

  if (!response.ok) {
    const resJson = await response.json();
    throw new Error(`Gagal menghapus file '${cleanPath}': ${resJson.message || response.statusText}`);
  }

  return await response.json();
}

/**
 * Fetch commit history for repo or specific file
 */
export async function getCommits(
  token: string,
  owner: string,
  repo: string,
  path?: string,
  branch: string = 'main'
): Promise<GitHubCommitDetail[]> {
  let url = `https://api.github.com/repos/${owner}/${repo}/commits?sha=${encodeURIComponent(branch)}&per_page=30`;
  if (path) {
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    url += `&path=${encodeURIComponent(cleanPath)}`;
  }

  const response = await fetch(url, {
    headers: getHeaders(token),
  });

  if (!response.ok) {
    return [];
  }

  return await response.json();
}
