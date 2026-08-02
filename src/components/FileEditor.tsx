import React, { useState, useEffect } from 'react';
import {
  Save,
  FileCode,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Code2,
  GitCommit,
  Split,
  FileText,
  Copy,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import {
  getRepositoryContents,
  createOrUpdateFile,
  stringToBase64,
  base64ToString,
  getFileSha,
  cleanFilePath,
} from '../services/githubApi';

interface FileEditorProps {
  token: string;
  owner: string;
  repo: string;
  branch: string;
  filePath: string;
  fileSha?: string;
  initialContent?: string;
  onCommitSuccess: () => void;
  onGoToPython: (path: string, content: string) => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  openTokenModal: () => void;
}

export const FileEditor: React.FC<FileEditorProps> = ({
  token,
  owner,
  repo,
  branch,
  filePath: initialPath,
  fileSha: initialSha,
  initialContent = '',
  onCommitSuccess,
  onGoToPython,
  showToast,
  openTokenModal,
}) => {
  const [filePath, setFilePath] = useState(initialPath || 'src/main.py');
  const [content, setContent] = useState(initialContent);
  const [originalContent, setOriginalContent] = useState(initialContent);
  const [sha, setSha] = useState<string | undefined>(initialSha);
  const [commitMsg, setCommitMsg] = useState('Update file via GitHub Studio');
  const [committerName, setCommitterName] = useState('');
  const [committerEmail, setCommitterEmail] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showDiff, setShowDiff] = useState(false);
  const [fileIsNew, setFileIsNew] = useState(!initialSha);

  useEffect(() => {
    setFilePath(initialPath || 'src/main.py');
    setSha(initialSha);
    if (initialPath && token) {
      loadFileFromRepo(initialPath);
    }
  }, [initialPath, initialSha, owner, repo, branch, token]);

  const loadFileFromRepo = async (path: string) => {
    if (!token || !path) return;
    setLoading(true);
    try {
      const data = await getRepositoryContents(token, owner, repo, path, branch);
      if (!Array.isArray(data) && data.type === 'file') {
        let textContent = '';
        if (data.content && data.encoding === 'base64') {
          textContent = base64ToString(data.content);
        }
        setContent(textContent);
        setOriginalContent(textContent);
        setSha(data.sha);
        setFileIsNew(false);
        setCommitMsg(`Update ${path}`);
      }
    } catch (err: any) {
      // File doesn't exist yet
      setSha(undefined);
      setFileIsNew(true);
      setCommitMsg(`Add ${path}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckFileSha = async () => {
    const cleanedPath = cleanFilePath(filePath);
    if (!token || !cleanedPath) return;
    setLoading(true);
    try {
      const currentSha = await getFileSha(token, owner, repo, cleanedPath, branch);
      if (currentSha) {
        setSha(currentSha);
        setFileIsNew(false);
        showToast(`File '${cleanedPath}' ditemukan di GitHub. Mode: UPDATE`, 'info');
      } else {
        setSha(undefined);
        setFileIsNew(true);
        showToast(`File '${cleanedPath}' belum ada di repo. Mode: BUAT FILE BARU`, 'info');
      }
    } catch (e) {
      setSha(undefined);
      setFileIsNew(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      showToast('Token GitHub diperlukan untuk menyimpan.', 'error');
      openTokenModal();
      return;
    }

    const cleanedPath = cleanFilePath(filePath);
    if (!cleanedPath) {
      showToast('Jalur (path) file tidak boleh kosong.', 'error');
      return;
    }

    setSaving(true);
    try {
      // Re-check SHA to ensure fresh SHA before saving
      let targetSha = sha;
      if (!targetSha) {
        targetSha = (await getFileSha(token, owner, repo, cleanedPath, branch)) || undefined;
      }

      const base64Content = stringToBase64(content);

      await createOrUpdateFile(token, {
        owner,
        repo,
        path: cleanedPath,
        message: commitMsg || (targetSha ? `Update ${cleanedPath}` : `Add ${cleanedPath}`),
        content: base64Content,
        sha: targetSha,
        branch,
        committer:
          committerName && committerEmail
            ? { name: committerName, email: committerEmail }
            : undefined,
      });

      showToast(`Berhasil menyimpan '${cleanedPath}' ke branch '${branch}'!`, 'success');
      setOriginalContent(content);
      onCommitSuccess();
    } catch (err: any) {
      showToast(`Gagal menyimpan file: ${err.message}`, 'error');
    } finally {
      setSaving(false);
    }
  };

  const lines = content.split('\n');

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-5">
      {/* Header Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-indigo-500/20 text-indigo-400 rounded-xl">
            <FileCode className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-semibold text-base text-slate-100 flex items-center gap-2">
              Editor & Commit File
              {fileIsNew ? (
                <span className="text-[11px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  File Baru
                </span>
              ) : (
                <span className="text-[11px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full">
                  Mode Update (SHA: {sha?.substring(0, 7)})
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-400">
              Ubah isi file lalu commit langsung ke repositori GitHub Anda.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => onGoToPython(filePath, content)}
            className="flex items-center space-x-1.5 bg-emerald-950/80 hover:bg-emerald-900/80 border border-emerald-500/30 text-emerald-300 text-xs font-semibold px-3 py-2 rounded-xl transition-all"
          >
            <Code2 className="w-4 h-4 text-emerald-400" />
            <span>Generate Python untuk File Ini</span>
          </button>

          <button
            type="button"
            onClick={() => setShowDiff(!showDiff)}
            className={`flex items-center space-x-1.5 text-xs font-medium px-3 py-2 rounded-xl border transition-all ${
              showDiff
                ? 'bg-indigo-600 border-indigo-500 text-white'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
            }`}
          >
            <Split className="w-4 h-4" />
            <span>{showDiff ? 'Sembunyikan Diff' : 'Pratinjau Diff'}</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        {/* Path Input & Commit Message Bar */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* File Path */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Jalur File di Repository (Remote Path)
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={filePath}
                  onChange={(e) => setFilePath(e.target.value)}
                  placeholder="contoh: src/script.py atau README.md"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleCheckFileSha}
                  disabled={loading}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl font-medium whitespace-nowrap transition-colors"
                >
                  Cek Status File
                </button>
              </div>
            </div>

            {/* Commit Message */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Pesan Commit
              </label>
              <input
                type="text"
                value={commitMsg}
                onChange={(e) => setCommitMsg(e.target.value)}
                placeholder="misal: Update fungsi helper di main.py"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Editor Area or Diff View */}
        {!showDiff ? (
          <div className="bg-slate-950 border border-slate-800 rounded-2xl shadow-xl overflow-hidden font-mono text-xs flex">
            {/* Line Numbers */}
            <div className="bg-slate-900/80 text-slate-600 select-none py-3 px-2 text-right border-r border-slate-800/80 font-mono text-xs leading-5 min-w-[40px]">
              {lines.map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>

            {/* Main Code Area */}
            <div className="flex-1 relative">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Ketik atau tempel kode di sini..."
                rows={20}
                className="w-full bg-transparent p-3 text-slate-100 placeholder-slate-600 focus:outline-none resize-y leading-5 font-mono"
              />
            </div>
          </div>
        ) : (
          /* Simple Diff Preview */
          <div className="bg-slate-950 border border-slate-800 rounded-2xl shadow-xl p-4 space-y-2">
            <h4 className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
              <Split className="w-4 h-4 text-indigo-400" />
              Perbandingan Perubahan (Original vs Baru)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl max-h-96 overflow-y-auto">
                <p className="text-[11px] font-semibold text-slate-400 border-b border-slate-800 pb-1 mb-2">
                  Original di Repo ({originalContent ? `${originalContent.length} karakter` : 'Kosong'})
                </p>
                <pre className="whitespace-pre-wrap text-slate-400">{originalContent || '(Belum ada isi)'}</pre>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl max-h-96 overflow-y-auto">
                <p className="text-[11px] font-semibold text-indigo-300 border-b border-slate-800 pb-1 mb-2">
                  Versi Baru Ditulis ({content.length} karakter)
                </p>
                <pre className="whitespace-pre-wrap text-emerald-300">{content}</pre>
              </div>
            </div>
          </div>
        )}

        {/* Submit Commit Bar */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex items-center justify-between">
          <div className="text-xs text-slate-400">
            Target Branch: <strong className="text-emerald-400">{branch}</strong>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs px-6 py-2.5 rounded-xl shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <GitCommit className="w-4 h-4" />
            )}
            <span>{saving ? 'Menyimpan Commit...' : 'Commit & Push File'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
