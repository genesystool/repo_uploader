import React, { useState, useEffect } from 'react';
import {
  GitBranch,
  FolderGit2,
  Lock,
  Globe,
  Search,
  RefreshCw,
  PlusCircle,
  ExternalLink,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { GitHubRepo, GitHubBranch, GitHubUser } from '../types';
import {
  getUserRepositories,
  getBranches,
  getRepositoryDetail,
} from '../services/githubApi';

interface RepoSelectorProps {
  token: string;
  user: GitHubUser | null;
  selectedOwner: string;
  setSelectedOwner: (owner: string) => void;
  selectedRepo: string;
  setSelectedRepo: (repo: string) => void;
  selectedBranch: string;
  setSelectedBranch: (branch: string) => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  openTokenModal: () => void;
}

export const RepoSelector: React.FC<RepoSelectorProps> = ({
  token,
  user,
  selectedOwner,
  setSelectedOwner,
  selectedRepo,
  setSelectedRepo,
  selectedBranch,
  setSelectedBranch,
  showToast,
  openTokenModal,
}) => {
  const [repositories, setRepositories] = useState<GitHubRepo[]>([]);
  const [branches, setBranches] = useState<GitHubBranch[]>([]);
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [currentRepoDetail, setCurrentRepoDetail] = useState<GitHubRepo | null>(null);

  // Manual input state
  const [manualRepoInput, setManualRepoInput] = useState(`${selectedOwner}/${selectedRepo}`);
  const [isCustomMode, setIsCustomMode] = useState(false);

  // Fetch repos when token or user changes
  useEffect(() => {
    if (token) {
      fetchRepos();
    }
  }, [token]);

  // Fetch branches and repo details when selected owner/repo changes
  useEffect(() => {
    if (selectedOwner && selectedRepo && token) {
      fetchRepoDetailsAndBranches();
      setManualRepoInput(`${selectedOwner}/${selectedRepo}`);
    }
  }, [selectedOwner, selectedRepo, token]);

  const fetchRepos = async () => {
    if (!token) return;
    setLoadingRepos(true);
    try {
      const repos = await getUserRepositories(token);
      setRepositories(repos);
      
      // Auto select first repo if none selected
      if (repos.length > 0 && (!selectedRepo || !selectedOwner)) {
        setSelectedOwner(repos[0].owner.login);
        setSelectedRepo(repos[0].name);
        setSelectedBranch(repos[0].default_branch || 'main');
      }
    } catch (err: any) {
      console.warn('Gagal memuat repositori:', err.message);
    } finally {
      setLoadingRepos(false);
    }
  };

  const fetchRepoDetailsAndBranches = async () => {
    if (!token || !selectedOwner || !selectedRepo) return;
    setLoadingBranches(true);
    try {
      const [details, branchList] = await Promise.all([
        getRepositoryDetail(token, selectedOwner, selectedRepo).catch(() => null),
        getBranches(token, selectedOwner, selectedRepo).catch(() => []),
      ]);

      if (details) {
        setCurrentRepoDetail(details);
      }
      setBranches(branchList);

      // Verify or fallback selected branch
      if (branchList.length > 0) {
        const branchExists = branchList.some((b) => b.name === selectedBranch);
        if (!branchExists) {
          const defaultName = details?.default_branch || branchList[0].name || 'main';
          setSelectedBranch(defaultName);
        }
      } else {
        if (!selectedBranch) setSelectedBranch('main');
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoadingBranches(false);
    }
  };

  const handleSelectRepo = (full_name: string) => {
    if (!full_name) return;
    const [owner, repoName] = full_name.split('/');
    const foundRepo = repositories.find((r) => r.full_name === full_name);
    setSelectedOwner(owner);
    setSelectedRepo(repoName);
    if (foundRepo) {
      setSelectedBranch(foundRepo.default_branch || 'main');
    }
  };

  const handleApplyManualRepo = () => {
    if (!manualRepoInput.includes('/')) {
      showToast('Format repositori harus "pemilik/nama-repo" (contoh: octocat/Hello-World)', 'error');
      return;
    }
    const [owner, repoName] = manualRepoInput.trim().split('/');
    if (!owner || !repoName) {
      showToast('Format nama repositori tidak valid.', 'error');
      return;
    }
    setSelectedOwner(owner);
    setSelectedRepo(repoName);
    showToast(`Mengalihkan ke repositori ${owner}/${repoName}`, 'info');
  };

  return (
    <div className="bg-slate-900/90 border-b border-slate-800 p-4 text-slate-200">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        
        {/* Repo Picker / Selector */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400">
            <FolderGit2 className="w-4 h-4 text-indigo-400" />
            <span>Repositori Target:</span>
          </div>

          {!isCustomMode ? (
            <div className="flex items-center space-x-2">
              <select
                value={`${selectedOwner}/${selectedRepo}`}
                onChange={(e) => handleSelectRepo(e.target.value)}
                disabled={loadingRepos}
                className="bg-slate-950 border border-slate-700 hover:border-indigo-500 rounded-xl px-3 py-1.5 text-xs text-slate-100 font-medium focus:ring-1 focus:ring-indigo-500 transition-all cursor-pointer min-w-[200px] max-w-[280px] truncate"
              >
                {selectedOwner && selectedRepo && (
                  <option value={`${selectedOwner}/${selectedRepo}`}>
                    {selectedOwner}/{selectedRepo}
                  </option>
                )}
                {repositories
                  .filter((r) => `${r.owner.login}/${r.name}` !== `${selectedOwner}/${selectedRepo}`)
                  .map((r) => (
                    <option key={r.id} value={r.full_name}>
                      {r.full_name} {r.private ? '🔒' : '🌐'}
                    </option>
                  ))}
              </select>

              <button
                onClick={() => setIsCustomMode(true)}
                title="Input nama repo manual"
                className="text-xs text-slate-400 hover:text-slate-200 bg-slate-800/80 hover:bg-slate-700 px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap"
              >
                Input Manual
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={manualRepoInput}
                onChange={(e) => setManualRepoInput(e.target.value)}
                placeholder="pemilik/nama-repo"
                className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-100 font-mono focus:ring-1 focus:ring-indigo-500 min-w-[200px]"
              />
              <button
                onClick={handleApplyManualRepo}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium px-3 py-1.5 rounded-xl transition-colors"
              >
                Terapkan
              </button>
              <button
                onClick={() => setIsCustomMode(false)}
                className="text-xs text-slate-400 hover:text-slate-200 px-2 py-1"
              >
                Batal
              </button>
            </div>
          )}

          {/* Refresh repos button */}
          <button
            onClick={fetchRepos}
            disabled={loadingRepos}
            title="Muat Ulang Repositori"
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingRepos ? 'animate-spin text-indigo-400' : ''}`} />
          </button>
        </div>

        {/* Branch Selector & Repo Metadata */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Branch Picker */}
          <div className="flex items-center space-x-2 bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-1">
            <GitBranch className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-xs text-slate-400">Branch:</span>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              disabled={loadingBranches}
              className="bg-transparent border-none text-xs text-emerald-300 font-semibold focus:outline-none cursor-pointer pr-1"
            >
              {branches.length > 0 ? (
                branches.map((b) => (
                  <option key={b.name} value={b.name} className="bg-slate-900 text-slate-100">
                    {b.name}
                  </option>
                ))
              ) : (
                <option value={selectedBranch || 'main'} className="bg-slate-900 text-slate-100">
                  {selectedBranch || 'main'}
                </option>
              )}
            </select>
          </div>

          {/* Repo Info Badges */}
          {currentRepoDetail && (
            <div className="flex items-center space-x-2 text-xs">
              <span className="flex items-center gap-1 bg-slate-800/80 px-2.5 py-1 rounded-lg text-slate-300">
                {currentRepoDetail.private ? (
                  <>
                    <Lock className="w-3 h-3 text-amber-400" />
                    <span className="text-[11px]">Private</span>
                  </>
                ) : (
                  <>
                    <Globe className="w-3 h-3 text-emerald-400" />
                    <span className="text-[11px]">Public</span>
                  </>
                )}
              </span>

              <a
                href={currentRepoDetail.html_url}
                target="_blank"
                rel="noopener noreferrer"
                title="Buka Repositori di GitHub"
                className="flex items-center space-x-1 text-slate-400 hover:text-indigo-400 bg-slate-800/80 hover:bg-slate-800 px-2.5 py-1 rounded-lg transition-colors"
              >
                <span>GitHub</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
