import React from 'react';
import {
  FolderGit2,
  Key,
  Code2,
  UploadCloud,
  FileCode,
  History,
  CheckCircle2,
  XCircle,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { GitHubUser, ViewTab } from '../types';

interface HeaderProps {
  user: GitHubUser | null;
  activeTab: ViewTab;
  setActiveTab: (tab: ViewTab) => void;
  openTokenModal: () => void;
  selectedRepo: string;
  selectedBranch: string;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  activeTab,
  setActiveTab,
  openTokenModal,
  selectedRepo,
  selectedBranch,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-30 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-tr from-indigo-500 to-purple-600 p-2.5 rounded-xl shadow-lg shadow-indigo-500/20">
              <FolderGit2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-bold text-lg text-slate-100 tracking-tight">
                  GitHub Studio
                </h1>
                <span className="text-xs bg-indigo-500/20 text-indigo-300 font-medium px-2 py-0.5 rounded-full border border-indigo-500/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-indigo-400" />
                  Python Support
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Upload & Update Repository File dengan Python & GUI
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800/80">
            <button
              onClick={() => setActiveTab('explorer')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'explorer'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <FolderGit2 className="w-4 h-4" />
              <span>Explorer File</span>
            </button>

            <button
              onClick={() => setActiveTab('upload')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'upload'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload / Update</span>
            </button>

            <button
              onClick={() => setActiveTab('editor')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'editor'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <FileCode className="w-4 h-4" />
              <span>Editor Kode</span>
            </button>

            <button
              onClick={() => setActiveTab('python')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'python'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-emerald-400/90 hover:text-emerald-300 hover:bg-slate-800/50'
              }`}
            >
              <Code2 className="w-4 h-4 text-emerald-400" />
              <span>Skrip Python</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'history'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Riwayat Commit</span>
            </button>
          </nav>

          {/* User Status / Token Config */}
          <div className="flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-3 bg-slate-800/60 border border-slate-700/60 rounded-xl px-3 py-1.5">
                <img
                  src={user.avatar_url}
                  alt={user.login}
                  className="w-7 h-7 rounded-full ring-2 ring-indigo-500/50"
                />
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-semibold text-slate-200 flex items-center gap-1">
                    {user.login}
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 inline" />
                  </div>
                  <span className="text-[10px] text-slate-400">
                    Token Terhubung
                  </span>
                </div>
                <button
                  onClick={openTokenModal}
                  title="Pengaturan Token GitHub"
                  className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <Key className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={openTokenModal}
                className="flex items-center space-x-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white text-xs font-medium px-3.5 py-2 rounded-xl shadow-md transition-all"
              >
                <Key className="w-4 h-4" />
                <span>Atur Token GitHub</span>
                <XCircle className="w-3.5 h-3.5 opacity-80" />
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="md:hidden flex items-center space-x-1 py-2 overflow-x-auto border-t border-slate-800">
          <button
            onClick={() => setActiveTab('explorer')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
              activeTab === 'explorer'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            Explorer
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
              activeTab === 'upload'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            Upload/Update
          </button>
          <button
            onClick={() => setActiveTab('editor')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
              activeTab === 'editor'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            Editor
          </button>
          <button
            onClick={() => setActiveTab('python')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
              activeTab === 'python'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            Skrip Python
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
              activeTab === 'history'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            History
          </button>
        </div>
      </div>
    </header>
  );
};
