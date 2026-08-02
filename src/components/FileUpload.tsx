import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  File,
  CheckCircle2,
  X,
  AlertCircle,
  Loader2,
  FolderPlus,
  ArrowRight,
  GitCommit,
  Sparkles,
} from 'lucide-react';
import { FileToUpload } from '../types';
import {
  fileToBase64,
  getFileSha,
  createOrUpdateFile,
  cleanFilePath,
} from '../services/githubApi';

interface FileUploadProps {
  token: string;
  owner: string;
  repo: string;
  branch: string;
  targetDir?: string;
  onUploadSuccess: () => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  openTokenModal: () => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  token,
  owner,
  repo,
  branch,
  targetDir = '',
  onUploadSuccess,
  showToast,
  openTokenModal,
}) => {
  const [targetFolder, setTargetFolder] = useState(targetDir);
  const [commitMessage, setCommitMessage] = useState('Upload file via GitHub Studio');
  const [filesToUpload, setFilesToUpload] = useState<FileToUpload[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelection = async (selectedFiles: FileList | File[]) => {
    if (!selectedFiles || selectedFiles.length === 0) return;

    const newItems: FileToUpload[] = [];

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      // Check if relative path is available (e.g. from folder drag-and-drop)
      const relativePath = (file as any).webkitRelativePath || file.name;
      const rawPath = targetFolder
        ? `${targetFolder}/${relativePath}`
        : relativePath;
      const cleanPath = cleanFilePath(rawPath);

      const base64Content = await fileToBase64(file);

      newItems.push({
        id: Math.random().toString(36).substring(2, 9),
        file,
        path: cleanPath,
        content: base64Content,
        isBinary: !file.type.startsWith('text/'),
        status: 'checking',
        size: file.size,
      });
    }

    setFilesToUpload((prev) => [...prev, ...newItems]);

    // Asynchronously check SHA for each file on GitHub
    for (const item of newItems) {
      if (token && owner && repo) {
        try {
          const sha = await getFileSha(token, owner, repo, item.path, branch);
          setFilesToUpload((prev) =>
            prev.map((f) =>
              f.id === item.id
                ? { ...f, existingSha: sha || undefined, status: 'ready' }
                : f
            )
          );
        } catch (e) {
          setFilesToUpload((prev) =>
            prev.map((f) => (f.id === item.id ? { ...f, status: 'ready' } : f))
          );
        }
      } else {
        setFilesToUpload((prev) =>
          prev.map((f) => (f.id === item.id ? { ...f, status: 'ready' } : f))
        );
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelection(e.dataTransfer.files);
    }
  };

  const handleRemoveItem = (id: string) => {
    setFilesToUpload((prev) => prev.filter((f) => f.id !== id));
  };

  const handleUploadAll = async () => {
    if (!token) {
      showToast('Token GitHub belum dikonfigurasi.', 'error');
      openTokenModal();
      return;
    }
    if (filesToUpload.length === 0) {
      showToast('Harap pilih file yang akan diunggah.', 'error');
      return;
    }

    setIsUploading(true);
    let successCount = 0;
    let failCount = 0;

    for (const item of filesToUpload) {
      if (item.status === 'success') continue;

      setFilesToUpload((prev) =>
        prev.map((f) => (f.id === item.id ? { ...f, status: 'uploading' } : f))
      );

      try {
        // Compute clean target remote path dynamically based on targetFolder input
        const fileName = (item.file as any)?.webkitRelativePath || item.file?.name || item.path;
        const rawRemotePath = targetFolder
          ? `${targetFolder}/${fileName}`
          : fileName;
        const remotePath = cleanFilePath(rawRemotePath);

        // Fetch SHA if missing
        let shaToUse = item.existingSha;
        if (!shaToUse) {
          shaToUse = (await getFileSha(token, owner, repo, remotePath, branch)) || undefined;
        }

        await createOrUpdateFile(token, {
          owner,
          repo,
          path: remotePath,
          message: commitMessage || `Upload ${fileName}`,
          content: item.content,
          sha: shaToUse,
          branch,
        });

        setFilesToUpload((prev) =>
          prev.map((f) => (f.id === item.id ? { ...f, status: 'success', path: remotePath } : f))
        );
        successCount++;
      } catch (err: any) {
        failCount++;
        setFilesToUpload((prev) =>
          prev.map((f) =>
            f.id === item.id
              ? { ...f, status: 'error', errorMessage: err.message }
              : f
          )
        );
      }
    }

    setIsUploading(false);

    if (successCount > 0) {
      showToast(
        `Berhasil mengunggah ${successCount} file ke branch '${branch}'! ${failCount > 0 ? `(${failCount} gagal)` : ''}`,
        'success'
      );
      onUploadSuccess();
    } else if (failCount > 0) {
      showToast(`Gagal mengunggah file. Silakan periksa pesan kesalahan pada daftar file.`, 'error');
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-5">
      {/* Title Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-indigo-500/20 text-indigo-400 rounded-xl">
            <UploadCloud className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-semibold text-base text-slate-100">
              Upload & Batch Update File
            </h2>
            <p className="text-xs text-slate-400">
              Unggah satu atau banyak file sekaligus dari komputer Anda ke GitHub.
            </p>
          </div>
        </div>
      </div>

      {/* Upload Settings Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Folder Tujuan di Repo (Opsional)
            </label>
            <div className="relative">
              <input
                type="text"
                value={targetFolder}
                onChange={(e) => setTargetFolder(e.target.value)}
                placeholder="misal: assets/images atau src/data"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Biarkan kosong jika ingin mengunggah ke direktori utama (root).
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Pesan Commit
            </label>
            <input
              type="text"
              value={commitMessage}
              onChange={(e) => setCommitMessage(e.target.value)}
              placeholder="Pesan deskripsi commit..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Drag & Drop Area */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-indigo-500 bg-indigo-500/10 scale-[1.01]'
              : 'border-slate-800 hover:border-slate-700 bg-slate-950/60'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            multiple
            onChange={(e) => e.target.files && handleFileSelection(e.target.files)}
            className="hidden"
          />
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-2xl">
              <UploadCloud className="w-8 h-8" />
            </div>
            <p className="text-sm font-semibold text-slate-200">
              Tarik & Lepas File di sini atau <span className="text-indigo-400 underline">Pilih File</span>
            </p>
            <p className="text-xs text-slate-400">
              Mendukung semua jenis file (Kode, Gambar, PDF, Zip, Dokumen, dll).
            </p>
          </div>
        </div>
      </div>

      {/* Selected File Queue List */}
      {filesToUpload.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
              Daftar File Siap Diunggah ({filesToUpload.length})
            </h3>
            <button
              onClick={() => setFilesToUpload([])}
              className="text-xs text-rose-400 hover:underline"
            >
              Bersihkan Semua
            </button>
          </div>

          <div className="divide-y divide-slate-800 max-h-80 overflow-y-auto">
            {filesToUpload.map((item) => (
              <div
                key={item.id}
                className="py-3 flex items-center justify-between text-xs text-slate-300"
              >
                <div className="flex items-center space-x-3 truncate pr-4">
                  <File className="w-4 h-4 text-indigo-400 shrink-0" />
                  <div className="truncate">
                    <p className="font-semibold text-slate-200 truncate font-mono">
                      {item.file?.name || item.path}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Ukuran: {formatBytes(item.size)} | Path Target: {item.path}
                      {item.existingSha && (
                        <span className="ml-2 text-indigo-400 font-medium">
                          (File Sudah Ada → Akan Di-Update)
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 shrink-0">
                  {/* Status Badge */}
                  {item.status === 'checking' && (
                    <span className="flex items-center gap-1 text-slate-400">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                      Memeriksa SHA...
                    </span>
                  )}
                  {item.status === 'ready' && (
                    <span className="text-emerald-400 font-medium">Siap</span>
                  )}
                  {item.status === 'uploading' && (
                    <span className="flex items-center gap-1 text-indigo-400 font-medium">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Mengunggah...
                    </span>
                  )}
                  {item.status === 'success' && (
                    <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                      <CheckCircle2 className="w-4 h-4" />
                      Berhasil
                    </span>
                  )}
                  {item.status === 'error' && (
                    <span
                      title={item.errorMessage}
                      className="flex items-center gap-1 text-rose-400 font-semibold"
                    >
                      <AlertCircle className="w-4 h-4" />
                      Gagal
                    </span>
                  )}

                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    disabled={isUploading}
                    className="p-1 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Start Upload Button */}
          <div className="pt-2 flex justify-end">
            <button
              onClick={handleUploadAll}
              disabled={isUploading}
              className="flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs px-6 py-2.5 rounded-xl shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
            >
              {isUploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <GitCommit className="w-4 h-4" />
              )}
              <span>{isUploading ? 'Mengunggah ke GitHub...' : 'Mulai Upload / Update'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
