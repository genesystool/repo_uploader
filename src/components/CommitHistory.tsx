import React, { useState, useEffect } from 'react';
import {
  History,
  GitCommit,
  ExternalLink,
  Loader2,
  AlertCircle,
  RefreshCw,
  User,
} from 'lucide-react';
import { GitHubCommitDetail } from '../types';
import { getCommits } from '../services/githubApi';

interface CommitHistoryProps {
  token: string;
  owner: string;
  repo: string;
  branch: string;
}

export const CommitHistory: React.FC<CommitHistoryProps> = ({
  token,
  owner,
  repo,
  branch,
}) => {
  const [commits, setCommits] = useState<GitHubCommitDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token && owner && repo) {
      loadCommits();
    }
  }, [token, owner, repo, branch]);

  const loadCommits = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getCommits(token, owner, repo, undefined, branch);
      setCommits(data);
    } catch (err: any) {
      setError(err.message || 'Gagal mengambil riwayat commit.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleString('id-ID', {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-5">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-indigo-500/20 text-indigo-400 rounded-xl">
            <History className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-semibold text-base text-slate-100">
              Riwayat Commit Repository
            </h2>
            <p className="text-xs text-slate-400">
              Daftar commit terbaru di branch <strong className="text-emerald-400">{branch}</strong>
            </p>
          </div>
        </div>

        <button
          onClick={loadCommits}
          disabled={loading}
          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
        </button>
      </div>

      {/* Commit List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            <p className="text-xs">Memuat riwayat commit...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-rose-300 space-y-2">
            <AlertCircle className="w-6 h-6 mx-auto text-rose-400" />
            <p className="text-xs font-semibold">{error}</p>
          </div>
        ) : commits.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            Belum ada commit yang tercatat di branch ini.
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {commits.map((c) => (
              <div
                key={c.sha}
                className="p-4 hover:bg-slate-800/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-start space-x-3">
                  {c.author?.avatar_url ? (
                    <img
                      src={c.author.avatar_url}
                      alt={c.commit.author.name}
                      className="w-8 h-8 rounded-full ring-1 ring-slate-700 mt-0.5 shrink-0"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                  )}

                  <div>
                    <p className="font-semibold text-slate-200 text-sm leading-snug">
                      {c.commit.message}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400 pt-1">
                      <span className="font-medium text-indigo-300">
                        {c.commit.author.name}
                      </span>
                      <span>•</span>
                      <span>{formatDate(c.commit.author.date)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <span className="font-mono bg-slate-950 border border-slate-800 px-2.5 py-1 rounded-lg text-indigo-400 text-[11px]">
                    {c.sha.substring(0, 7)}
                  </span>
                  <a
                    href={c.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Lihat Commit di GitHub"
                    className="p-1.5 text-slate-400 hover:text-indigo-300 hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
