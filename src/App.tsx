import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { TokenModal } from './components/TokenModal';
import { RepoSelector } from './components/RepoSelector';
import { FileExplorer } from './components/FileExplorer';
import { FileEditor } from './components/FileEditor';
import { FileUpload } from './components/FileUpload';
import { PythonWorkbench } from './components/PythonWorkbench';
import { CommitHistory } from './components/CommitHistory';
import { NotificationToast, ToastMessage } from './components/NotificationToast';

import { GitHubUser, ViewTab } from './types';
import { getAuthenticatedUser } from './services/githubApi';
import { Key, FolderGit2, Sparkles, ArrowRight, Code2 } from 'lucide-react';

export default function App() {
  const [token, setToken] = useState<string>(() => {
    return localStorage.getItem('github_studio_token') || '';
  });

  const [user, setUser] = useState<GitHubUser | null>(null);
  const [selectedOwner, setSelectedOwner] = useState<string>('');
  const [selectedRepo, setSelectedRepo] = useState<string>('');
  const [selectedBranch, setSelectedBranch] = useState<string>('main');
  const [activeTab, setActiveTab] = useState<ViewTab>('explorer');

  const [isTokenModalOpen, setIsTokenModalOpen] = useState<boolean>(false);
  const [editorPath, setEditorPath] = useState<string>('');
  const [editorSha, setEditorSha] = useState<string>('');
  const [uploadTargetDir, setUploadTargetDir] = useState<string>('');

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Save token to localStorage and verify user on startup or change
  useEffect(() => {
    if (token) {
      localStorage.setItem('github_studio_token', token);
      getAuthenticatedUser(token)
        .then((userData) => {
          setUser(userData);
          if (!selectedOwner) setSelectedOwner(userData.login);
        })
        .catch(() => {
          setUser(null);
        });
    } else {
      localStorage.removeItem('github_studio_token');
      setUser(null);
      setIsTokenModalOpen(true);
    }
  }, [token]);

  // Open file in Editor
  const handleOpenFile = (path: string, sha: string) => {
    setEditorPath(path);
    setEditorSha(sha);
    setActiveTab('editor');
  };

  // Start Uploading
  const handleStartUpload = (dirPath: string) => {
    setUploadTargetDir(dirPath);
    setActiveTab('upload');
  };

  // Create new file
  const handleStartCreateFile = (dirPath: string) => {
    const defaultPath = dirPath ? `${dirPath}/baru_file.py` : 'main.py';
    setEditorPath(defaultPath);
    setEditorSha('');
    setActiveTab('editor');
  };

  // Navigate to Python tab with prefilled path
  const handleGoToPython = (path: string, content: string) => {
    setEditorPath(path);
    setActiveTab('python');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* App Header */}
      <Header
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openTokenModal={() => setIsTokenModalOpen(true)}
        selectedRepo={selectedRepo}
        selectedBranch={selectedBranch}
      />

      {/* Repository & Branch Selector Bar */}
      <RepoSelector
        token={token}
        user={user}
        selectedOwner={selectedOwner}
        setSelectedOwner={setSelectedOwner}
        selectedRepo={selectedRepo}
        setSelectedRepo={setSelectedRepo}
        selectedBranch={selectedBranch}
        setSelectedBranch={setSelectedBranch}
        showToast={showToast}
        openTokenModal={() => setIsTokenModalOpen(true)}
      />

      {/* Main Container Body */}
      <main className="flex-1 pb-16">
        {!token ? (
          /* Welcome Banner when Token is missing */
          <div className="max-w-4xl mx-auto my-12 px-4 text-center space-y-6">
            <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-3xl inline-block shadow-2xl">
              <FolderGit2 className="w-16 h-16 text-indigo-400 mx-auto" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
                Selamat Datang di GitHub Studio & Python Workbench
              </h2>
              <p className="text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
                Kelola file repositori GitHub Anda secara langsung (Upload, Update, Edit, Hapus) atau hasilkan skrip Python otomatis untuk integrasi sistem Anda.
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setIsTokenModalOpen(true)}
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold px-6 py-3 rounded-2xl shadow-xl shadow-indigo-600/30 transition-all hover:scale-[1.02]"
              >
                <Key className="w-5 h-5" />
                <span>Hubungkan Token GitHub Sekarang</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-8 text-left">
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
                <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-xl w-fit">
                  <FolderGit2 className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-sm text-slate-200">Explorer & Editor</h3>
                <p className="text-xs text-slate-400">
                  Lihat direktori file repo, edit kode dengan diff viewer, dan commit perubahan langsung.
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
                <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl w-fit">
                  <Code2 className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-sm text-slate-200">Skrip Python Otomatis</h3>
                <p className="text-xs text-slate-400">
                  Dapatkan contoh kode Python lengkap (`PyGithub` & `requests`) untuk upload & update file.
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
                <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl w-fit">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-sm text-slate-200">Auto SHA Handling</h3>
                <p className="text-xs text-slate-400">
                  Otomatis mendeteksi SHA file di GitHub untuk mencegah error saat meng-update file yang sudah ada.
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Active Tab Views */
          <div>
            {activeTab === 'explorer' && (
              <FileExplorer
                token={token}
                owner={selectedOwner}
                repo={selectedRepo}
                branch={selectedBranch}
                onOpenFile={handleOpenFile}
                onStartUpload={handleStartUpload}
                onStartCreateFile={handleStartCreateFile}
                showToast={showToast}
                openTokenModal={() => setIsTokenModalOpen(true)}
              />
            )}

            {activeTab === 'upload' && (
              <FileUpload
                token={token}
                owner={selectedOwner}
                repo={selectedRepo}
                branch={selectedBranch}
                targetDir={uploadTargetDir}
                onUploadSuccess={() => setActiveTab('explorer')}
                showToast={showToast}
                openTokenModal={() => setIsTokenModalOpen(true)}
              />
            )}

            {activeTab === 'editor' && (
              <FileEditor
                token={token}
                owner={selectedOwner}
                repo={selectedRepo}
                branch={selectedBranch}
                filePath={editorPath}
                fileSha={editorSha}
                onCommitSuccess={() => setActiveTab('explorer')}
                onGoToPython={handleGoToPython}
                showToast={showToast}
                openTokenModal={() => setIsTokenModalOpen(true)}
              />
            )}

            {activeTab === 'python' && (
              <PythonWorkbench
                token={token}
                owner={selectedOwner}
                repo={selectedRepo}
                branch={selectedBranch}
                initialFilePath={editorPath || 'src/main.py'}
                showToast={showToast}
              />
            )}

            {activeTab === 'history' && (
              <CommitHistory
                token={token}
                owner={selectedOwner}
                repo={selectedRepo}
                branch={selectedBranch}
              />
            )}
          </div>
        )}
      </main>

      {/* Token Modal */}
      <TokenModal
        isOpen={isTokenModalOpen}
        onClose={() => setIsTokenModalOpen(false)}
        token={token}
        setToken={setToken}
        user={user}
        setUser={setUser}
        showToast={showToast}
      />

      {/* Toast Notification Container */}
      <NotificationToast toasts={toasts} onDismiss={handleDismissToast} />
    </div>
  );
}
