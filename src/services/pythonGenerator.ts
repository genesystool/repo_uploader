interface PythonScriptOptions {
  token?: string;
  owner?: string;
  repo?: string;
  branch?: string;
  filePath?: string;
  commitMessage?: string;
  authorName?: string;
  authorEmail?: string;
}

export function generatePyGithubScript(opts: PythonScriptOptions): string {
  const token = opts.token || 'YOUR_GITHUB_PERSONAL_ACCESS_TOKEN';
  const repoName = `${opts.owner || 'OWNER'}/${opts.repo || 'REPOSITORY'}`;
  const branch = opts.branch || 'main';
  const filePath = opts.filePath || 'example.txt';
  const commitMsg = opts.commitMessage || 'Upload/Update file via Python';

  return `# =========================================================
#  GitHub File Upload & Update using PyGithub
#  Prerequisites: pip install PyGithub
# =========================================================

import os
import base64
from github import Github, GithubException

# Configuration
GITHUB_TOKEN = "${token}"
REPO_NAME = "${repoName}"
BRANCH = "${branch}"
TARGET_FILE_PATH = "${filePath}"
COMMIT_MESSAGE = "${commitMsg}"

# Local file path to upload (change this to your local file)
LOCAL_FILE_PATH = "my_local_file.txt"

def upload_or_update_file():
    # 1. Initialize Github Client
    g = Github(GITHUB_TOKEN)
    
    try:
        # 2. Get Repository
        repo = g.get_repo(REPO_NAME)
        print(f"Connected to repository: {repo.full_name}")
        
        # 3. Read content from local file or variable
        if os.path.exists(LOCAL_FILE_PATH):
            with open(LOCAL_FILE_PATH, "r", encoding="utf-8") as f:
                content = f.read()
            print(f"Read {len(content)} characters from {LOCAL_FILE_PATH}")
        else:
            content = "Hello World from Python!"
            print(f"Local file not found, using default content.")

        # 4. Check if the file already exists in repository
        try:
            existing_file = repo.get_contents(TARGET_FILE_PATH, ref=BRANCH)
            print(f"File '{TARGET_FILE_PATH}' exists (SHA: {existing_file.sha}). Updating...")
            
            # Update Existing File
            result = repo.update_file(
                path=TARGET_FILE_PATH,
                message=f"[UPDATE] {COMMIT_MESSAGE}",
                content=content,
                sha=existing_file.sha,
                branch=BRANCH
            )
            print(f"SUCCESS: File updated! Commit SHA: {result['commit'].sha}")

        except GithubException as e:
            if e.status == 404:
                print(f"File '{TARGET_FILE_PATH}' does not exist. Creating new file...")
                
                # Create New File
                result = repo.create_file(
                    path=TARGET_FILE_PATH,
                    message=f"[CREATE] {COMMIT_MESSAGE}",
                    content=content,
                    branch=BRANCH
                )
                print(f"SUCCESS: File created! Commit SHA: {result['commit'].sha}")
            else:
                raise e

    except GithubException as ge:
        print(f"GitHub API Error [{ge.status}]: {ge.data.get('message', str(ge))}")
    except Exception as ex:
        print(f"An error occurred: {ex}")

if __name__ == "__main__":
    upload_or_update_file()
`;
}

export function generateRequestsScript(opts: PythonScriptOptions): string {
  const token = opts.token || 'YOUR_GITHUB_PERSONAL_ACCESS_TOKEN';
  const owner = opts.owner || 'OWNER';
  const repo = opts.repo || 'REPOSITORY';
  const branch = opts.branch || 'main';
  const filePath = opts.filePath || 'example.txt';
  const commitMsg = opts.commitMessage || 'Upload/Update file via Python requests';

  return `# =========================================================
#  GitHub File Upload & Update using Python 'requests'
#  Prerequisites: pip install requests
# =========================================================

import requests
import base64
import os

GITHUB_TOKEN = "${token}"
OWNER = "${owner}"
REPO = "${repo}"
BRANCH = "${branch}"
FILE_PATH = "${filePath}"
COMMIT_MESSAGE = "${commitMsg}"

headers = {
    "Authorization": f"token {GITHUB_TOKEN}",
    "Accept": "application/vnd.github.v3+json"
}

def upload_or_update_via_requests(local_file="my_file.txt", text_content=None):
    url = f"https://api.github.com/repos/{OWNER}/{REPO}/contents/{FILE_PATH}"
    
    # Prepare Content & Encode Base64
    if text_content is not None:
        raw_bytes = text_content.encode('utf-8')
    elif os.path.exists(local_file):
        with open(local_file, "rb") as f:
            raw_bytes = f.read()
    else:
        raw_bytes = b"Hello from Python Requests API!"
        
    encoded_content = base64.b64encode(raw_bytes).decode('utf-8')

    # Step 1: Check if file exists to get SHA
    get_res = requests.get(f"{url}?ref={BRANCH}", headers=headers)
    sha = None
    
    if get_res.status_code == 200:
        file_info = get_res.json()
        sha = file_info.get("sha")
        print(f"File exists on GitHub (SHA: {sha}). Updating...")
    elif get_res.status_code == 404:
        print("File does not exist. Creating new file...")
    else:
        print(f"Error checking file status: {get_res.status_code} {get_res.text}")
        return

    # Step 2: PUT Request to Create/Update
    payload = {
        "message": COMMIT_MESSAGE,
        "content": encoded_content,
        "branch": BRANCH
    }
    if sha:
        payload["sha"] = sha

    put_res = requests.put(url, headers=headers, json=payload)
    
    if put_res.status_code in [200, 201]:
        res_data = put_res.json()
        commit_sha = res_data["commit"]["sha"]
        action = "Updated" if sha else "Created"
        print(f"SUCCESS! {action} '{FILE_PATH}'. Commit SHA: {commit_sha}")
    else:
        print(f"FAILED ({put_res.status_code}): {put_res.json().get('message')}")

if __name__ == "__main__":
    upload_or_update_via_requests()
`;
}

export function generateFolderSyncScript(opts: PythonScriptOptions): string {
  const token = opts.token || 'YOUR_GITHUB_PERSONAL_ACCESS_TOKEN';
  const repoName = `${opts.owner || 'OWNER'}/${opts.repo || 'REPOSITORY'}`;
  const branch = opts.branch || 'main';

  return `# =========================================================
#  Upload/Sync Entire Local Directory to GitHub Repository
#  Prerequisites: pip install PyGithub
# =========================================================

import os
import glob
from github import Github, GithubException

GITHUB_TOKEN = "${token}"
REPO_NAME = "${repoName}"
BRANCH = "${branch}"

# Local folder path to sync
LOCAL_DIR = "./my_project"
# Target folder in repository (leave empty for repo root)
REMOTE_PREFIX = "uploads"

def sync_directory_to_github():
    g = Github(GITHUB_TOKEN)
    repo = g.get_repo(REPO_NAME)
    print(f"Connected to repo: {repo.full_name}")

    if not os.path.exists(LOCAL_DIR):
        print(f"Directory '{LOCAL_DIR}' does not exist locally.")
        return

    for root, dirs, files in os.walk(LOCAL_DIR):
        for file in files:
            local_path = os.path.join(root, file)
            
            # Calculate relative path for GitHub
            rel_path = os.path.relpath(local_path, LOCAL_DIR).replace("\\\\", "/")
            if REMOTE_PREFIX:
                remote_path = f"{REMOTE_PREFIX}/{rel_path}"
            else:
                remote_path = rel_path

            # Read content
            with open(local_path, "rb") as f:
                content_bytes = f.read()

            try:
                # Text vs Binary check
                try:
                    content_str = content_bytes.decode("utf-8")
                    is_text = True
                except UnicodeDecodeError:
                    is_text = False

                # Check if exists
                sha = None
                try:
                    existing = repo.get_contents(remote_path, ref=BRANCH)
                    sha = existing.sha
                except GithubException:
                    pass

                if sha:
                    print(f"Updating: {remote_path}")
                    if is_text:
                        repo.update_file(remote_path, f"Update {remote_path}", content_str, sha, branch=BRANCH)
                    else:
                        repo.update_file(remote_path, f"Update binary {remote_path}", content_bytes, sha, branch=BRANCH)
                else:
                    print(f"Creating: {remote_path}")
                    if is_text:
                        repo.create_file(remote_path, f"Add {remote_path}", content_str, branch=BRANCH)
                    else:
                        repo.create_file(remote_path, f"Add binary {remote_path}", content_bytes, branch=BRANCH)

                print(f"  ✓ {remote_path} uploaded successfully.")

            except Exception as e:
                print(f"  ✗ Failed to upload {remote_path}: {e}")

if __name__ == "__main__":
    sync_directory_to_github()
`;
}

export function generateCliScript(opts: PythonScriptOptions): string {
  const token = opts.token || '';
  const owner = opts.owner || '';
  const repo = opts.repo || '';

  return `#!/usr/bin/env python3
"""
GitHub File Upload & Update CLI Tool
Usage:
  python github_uploader.py --token YOUR_PAT --repo owner/repo --file local_file.txt --path remote_file.txt
"""

import argparse
import base64
import os
import sys
import json
import urllib.request
import urllib.error

def upload_file(token, repo_full_name, local_file, remote_path, message, branch):
    if not os.path.exists(local_file):
        print(f"Error: Local file '{local_file}' not found.")
        sys.exit(1)

    url = f"https://api.github.com/repos/{repo_full_name}/contents/{remote_path.lstrip('/')}"
    
    with open(local_file, "rb") as f:
        file_bytes = f.read()
    
    encoded_content = base64.b64encode(file_bytes).decode('utf-8')

    headers = {
        "Authorization": f"token {token}",
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "Python-GitHub-Uploader-CLI"
    }

    # Check if exists to get SHA
    sha = None
    req_get = urllib.request.Request(f"{url}?ref={branch}", headers=headers, method="GET")
    try:
        with urllib.request.urlopen(req_get) as response:
            if response.status == 200:
                data = json.loads(response.read().decode('utf-8'))
                sha = data.get("sha")
                print(f"Found existing file in repo (SHA: {sha}). Mode: UPDATE")
    except urllib.error.HTTPError as e:
        if e.code == 404:
            print("File does not exist in repo. Mode: CREATE")
        else:
            print(f"HTTP Error checking file: {e.code} {e.reason}")
            sys.exit(1)

    # Build PUT payload
    payload = {
        "message": message or ("Update " + remote_path if sha else "Add " + remote_path),
        "content": encoded_content,
        "branch": branch
    }
    if sha:
        payload["sha"] = sha

    json_data = json.dumps(payload).encode('utf-8')
    headers["Content-Type"] = "application/json"

    req_put = urllib.request.Request(url, data=json_data, headers=headers, method="PUT")
    
    try:
        with urllib.request.urlopen(req_put) as response:
            res_body = json.loads(response.read().decode('utf-8'))
            commit_sha = res_body["commit"]["sha"]
            action = "Updated" if sha else "Uploaded"
            print(f"✓ Success! {action} '{remote_path}' to '{repo_full_name}' on branch '{branch}'.")
            print(f"  Commit SHA: {commit_sha}")
    except urllib.error.HTTPError as e:
        err_msg = e.read().decode('utf-8')
        print(f"✗ Failed ({e.code}): {err_msg}")
        sys.exit(1)

def main():
    parser = argparse.ArgumentParser(description="Upload or update files on GitHub repository using Python.")
    parser.add_argument("--token", default="${token}", help="GitHub Personal Access Token")
    parser.add_argument("--repo", default="${owner}/${repo}", help="Target repository in format 'owner/repo'")
    parser.add_argument("--file", required=True, help="Path to local file to upload")
    parser.add_argument("--path", help="Target remote file path in repository (default: same as local filename)")
    parser.add_argument("--message", help="Commit message")
    parser.add_argument("--branch", default="main", help="Target branch (default: main)")

    args = parser.parse_args()

    token = args.token or os.environ.get("GITHUB_TOKEN")
    if not token:
        print("Error: GitHub token required. Pass via --token or set GITHUB_TOKEN environment variable.")
        sys.exit(1)

    if not args.repo or "/" not in args.repo:
        print("Error: Target repository required in format 'owner/repo'.")
        sys.exit(1)

    remote_path = args.path or os.path.basename(args.file)

    upload_file(
        token=token,
        repo_full_name=args.repo,
        local_file=args.file,
        remote_path=remote_path,
        message=args.message,
        branch=args.branch
    )

if __name__ == "__main__":
    main()
`;
}
