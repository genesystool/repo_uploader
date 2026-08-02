import React, { useState, useEffect } from 'react';
import {
  Folder,
  FileText,
  FileCode,
  FileImage,
  ChevronRight,
  ArrowLeft,
  Search,
  Upload,
  FilePlus,
  Trash2,
  Eye,
  RefreshCw,
  Clock,
  Download,
  AlertTriangle,
  Loader2,
  FolderGit2,
} from 'lucide-react';
import { GitHubContent, ViewTab } from '../types';
import { getRepositoryContents, deleteFile, cleanFilePath } from '../services/githubApi';

interface FileExplorerProps {
  token: string;
  owner: string;
  repo: string;
  branch: string;
  onOpenFile: (path: string, sha: string) => void;
  onStartUpload: (currentDirPath: string) => void;
  onStartCreateFile: (currentDirPath: string) => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  openTokenModal: () => void;
}

export const FileExplorer: React.FC<FileExplorerProps> = ({
  token,
  owner,
  repo,
  branch,
  onOpenFile,
  onStartUpload,
  onStartCreateFile,
  showToast,
  openTokenModal,
}) => {
  const [currentPath, setCurrentPath] = useState('');
  const [contents, setContents] = useState<GitHubContent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<GitHubContent | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (token && owner && repo) {
      loadContents(currentPath);
    }
  }, [token, owner, repo, branch, currentPath]);

  const loadContents = async (path: string) => {
    if (!token) {
      setError('Token GitHub belum dikonfigurasi.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const clean = cleanFilePath(path);
      const data = await getRepositoryContents(token, owner, repo, clean, branch);
      if (Array.isArray(data)) {
        // Sort directories first, then files alphabetically
        const sorted = [...data].sort((a, b) => {
          if (a.type === 'dir' && b.type !== 'dir') return -1;
          if (a.type !== 'dir' && b.type === 'dir') return 1;
          return a.name.localeCompare(b.name);
        });
        setContents(sorted);
      } else {
        // If single file path was passed by mistake
        setContents([data]);
      }
    } catch (err: any) {
      setError(err.message || 'Gagal memuat isi repositori.');
      setContents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFolderClick = (dirPath: string) => {
    setCurrentPath(dirPath);
    setSearchQuery('');
  };

  const handleNavigateUp = () => {
    if (!currentPath) return;
    const parts = currentPath.split('/').filter(Boolean);
    parts.pop();
    setCurrentPath(parts.join('/'));
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget || !token) return;
    setIsDeleting(true);
    try {
      await deleteFile(
        token,
        owner,
        repo,
        deleteTarget.path,
        deleteTarget.sha,
        `Delete ${deleteTarget.name} via GitHub Studio App`,
        branch
      );
      showToast(`File ${deleteTarget.name} berhasil dihapus.`, 'success');
      setDeleteTarget(null);
      loadContents(currentPath);
    } catch (err: any) {
      showToast(`Gagal menghapus file: ${err.message}`, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const pathParts = currentPath ? currentPath.split('/') : [];

  const filteredContents = contents.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getFileIcon = (name: string, type: string) => {
    if (type === 'dir') return <Folder className="w-4 h-4 text-amber-400 fill-amber-400/20" />;
    const ext = name.split('.').pop()?.toLowerCase();
    if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(ext || '')) {
      return <FileImage className="w-4 h-4 text-emerald-400" />;
    }
    if (['py', 'js', 'ts', 'tsx', 'jsx', 'html', 'css', 'json', 'yml', 'yaml', 'sh'].includes(ext || '')) {
      return <FileCode className="w-4 h-4 text-indigo-400" />;
    }
    return <FileText className="w-4 h-4 text-slate-400" />;
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-4">
      {/* Top Explorer Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Breadcrumb Navigation */}
        <div className="flex items-center space-x-1 overflow-x-auto py-1 text-sm font-medium">
          <button
            onClick={() => setCurrentPath('')}
            className={`px-2 py-1 rounded-lg hover:bg-slate-800 transition-colors ${
              currentPath === '' ? 'text-indigo-400 font-bold' : 'text-slate-300'
            }`}
          >
            {repo || 'root'}
          </button>

          {pathParts.map((part, index) => {
            const fullSubPath = pathParts.slice(0, index + 1).join('/');
            const isLast = index === pathParts.length - 1;
            return (
              <React.Fragment key={fullSubPath}>
                <ChevronRight className="w-4 h-4 text-slate-600 shrink-0" />
                <button
                  onClick={() => setCurrentPath(fullSubPath)}
                  className={`px-2 py-1 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap ${
                    isLast ? 'text-indigo-400 font-bold' : 'text-slate-300'
                  }`}
                >
                  {part}
                </button>
              </React.Fragment>
            );
          })}
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari file dalam direktori..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <button
            onClick={() => loadContents(currentPath)}
            disabled={loading}
            title="Refresh Directory"
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
          </button>

          <button
            onClick={() => onStartCreateFile(currentPath)}
            className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-3 py-2 rounded-xl transition-colors"
          >
            <FilePlus className="w-4 h-4 text-emerald-400" />
            <span>Buat File</span>
          </button>

          <button
            onClick={() => onStartUpload(currentPath)}
            className="flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3.5 py-2 rounded-xl shadow-lg shadow-indigo-600/30 transition-all"
          >
            <Upload className="w-4 h-4" />
            <span>Upload File</span>
          </button>
        </div>
      </div>

      {/* Main File Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            <p className="text-xs">Memuat daftar file dari GitHub...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center space-y-3">
            <div className="inline-flex p-3 bg-rose-500/10 text-rose-400 rounded-2xl">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-rose-300">{error}</p>
            {!token && (
              <button
                onClick={openTokenModal}
                className="inline-flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium px-4 py-2 rounded-xl transition-colors"
              >
                <span>Atur Token Sekarang</span>
              </button>
            )}
          </div>
        ) : filteredContents.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <FolderGit2 className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-sm font-medium text-slate-300">
              {searchQuery ? 'Tidak ada file yang cocok dengan pencarian.' : 'Direktori ini kosong.'}
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => onStartUpload(currentPath)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium px-4 py-2 rounded-xl transition-colors"
              >
                Upload File Ke Sini
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/60 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Nama</th>
                  <th className="px-4 py-3 hidden sm:table-cell">Ukuran</th>
                  <th className="px-4 py-3 hidden md:table-cell">SHA</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {/* Parent Directory Go Up Row */}
                {currentPath !== '' && (
                  <tr
                    onClick={handleNavigateUp}
                    className="hover:bg-slate-800/50 cursor-pointer transition-colors text-slate-400"
                  >
                    <td className="px-4 py-2.5 font-medium flex items-center space-x-2" colSpan={4}>
                      <ArrowLeft className="w-4 h-4 text-indigo-400" />
                      <span>.. (Kembali ke folder induk)</span>
                    </td>
                  </tr>
                )}

                {filteredContents.map((item) => (
                  <tr
                    key={item.sha || item.path}
                    className="hover:bg-slate-800/40 transition-colors group"
                  >
                    {/* File Name & Icon */}
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-3">
                        {getFileIcon(item.name, item.type)}
                        {item.type === 'dir' ? (
                          <button
                            onClick={() => handleFolderClick(item.path)}
                            className="font-medium text-slate-200 hover:text-indigo-400 hover:underline transition-colors text-left"
                          >
                            {item.name}/
                          </button>
                        ) : (
                          <button
                            onClick={() => onOpenFile(item.path, item.sha)}
                            className="font-medium text-slate-200 hover:text-indigo-300 transition-colors text-left font-mono"
                          >
                            {item.name}
                          </button>
                        )}
                      </div>
                    </td>

                    {/* Size */}
                    <td className="px-4 py-3 hidden sm:table-cell text-slate-400">
                      {item.type === 'dir' ? '-' : formatBytes(item.size)}
                    </td>

                    {/* SHA */}
                    <td className="px-4 py-3 hidden md:table-cell text-slate-500 font-mono text-[11px]">
                      {item.sha ? item.sha.substring(0, 7) : '-'}
                    </td>

                    {/* Action Buttons */}
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        {item.type === 'file' && (
                          <>
                            <button
                              onClick={() => onOpenFile(item.path, item.sha)}
                              title="Buka / Edit File"
                              className="p-1.5 text-slate-400 hover:text-indigo-300 hover:bg-slate-800 rounded-lg transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {item.download_url && (
                              <a
                                href={item.download_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Unduh File Raw"
                                className="p-1.5 text-slate-400 hover:text-emerald-300 hover:bg-slate-800 rounded-lg transition-colors"
                              >
                                <Download className="w-4 h-4" />
                              </a>
                            )}

                            <button
                              onClick={() => setDeleteTarget(item)}
                              title="Hapus File"
                              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}

                        {item.type === 'dir' && (
                          <button
                            onClick={() => handleFolderClick(item.path)}
                            className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold px-2 py-1 rounded hover:bg-slate-800"
                          >
                            Buka Folder
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 text-slate-100 shadow-2xl">
            <div className="flex items-center space-x-3 text-rose-400">
              <div className="p-2 bg-rose-500/20 rounded-xl">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-base text-slate-100">
                Konfirmasi Hapus File
              </h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Apakah Anda yakin ingin menghapus file{' '}
              <strong className="text-rose-300 font-mono">{deleteTarget.path}</strong> dari
              branch <strong className="text-slate-200">{branch}</strong>? Tindakan ini akan membuat commit hapus baru di GitHub.
            </p>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="flex items-center space-x-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all disabled:opacity-50"
              >
                {isDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{isDeleting ? 'Menghapus...' : 'Ya, Hapus File'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
