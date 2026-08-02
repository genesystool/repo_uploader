import React, { useState } from 'react';
import {
  Code2,
  Copy,
  Check,
  Download,
  Terminal,
  FolderSync,
  Globe,
  Sparkles,
  BookOpen,
  Info,
  Play,
  FileCode,
} from 'lucide-react';
import {
  generatePyGithubScript,
  generateRequestsScript,
  generateFolderSyncScript,
  generateCliScript,
} from '../services/pythonGenerator';

interface PythonWorkbenchProps {
  token: string;
  owner: string;
  repo: string;
  branch: string;
  initialFilePath?: string;
  initialContent?: string;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

type ScriptType = 'pygithub' | 'requests' | 'foldersync' | 'cli';

export const PythonWorkbench: React.FC<PythonWorkbenchProps> = ({
  token,
  owner,
  repo,
  branch,
  initialFilePath = 'src/example.py',
  showToast,
}) => {
  const [scriptType, setScriptType] = useState<ScriptType>('pygithub');
  const [customPath, setCustomPath] = useState(initialFilePath);
  const [customMsg, setCustomMsg] = useState('Upload file via Python script');
  const [copied, setCopied] = useState(false);

  const opts = {
    token: token || 'YOUR_GITHUB_PERSONAL_ACCESS_TOKEN',
    owner: owner || 'OWNER',
    repo: repo || 'REPOSITORY',
    branch: branch || 'main',
    filePath: customPath || 'example.py',
    commitMessage: customMsg,
  };

  let generatedCode = '';
  let filename = 'github_uploader.py';

  if (scriptType === 'pygithub') {
    generatedCode = generatePyGithubScript(opts);
    filename = 'upload_pygithub.py';
  } else if (scriptType === 'requests') {
    generatedCode = generateRequestsScript(opts);
    filename = 'upload_requests.py';
  } else if (scriptType === 'foldersync') {
    generatedCode = generateFolderSyncScript(opts);
    filename = 'sync_folder_github.py';
  } else if (scriptType === 'cli') {
    generatedCode = generateCliScript(opts);
    filename = 'github_uploader_cli.py';
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    showToast('Kode Python berhasil disalin ke clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPyFile = () => {
    const element = document.createElement('a');
    const file = new Blob([generatedCode], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    showToast(`File ${filename} berhasil diunduh!`, 'success');
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Title Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl">
            <Code2 className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="font-bold text-lg text-slate-100">
                Generator Skrip Python
              </h2>
              <span className="text-[11px] bg-emerald-500/20 text-emerald-300 font-medium px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                Otomatisasi GitHub API
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Salin atau unduh skrip Python siap pakai untuk upload dan update file repositori secara otomatis.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopyCode}
            className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-4 py-2.5 rounded-xl border border-slate-700 transition-all"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Tersalin!' : 'Salin Kode'}</span>
          </button>

          <button
            onClick={handleDownloadPyFile}
            className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-emerald-600/30 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Unduh File .py</span>
          </button>
        </div>
      </div>

      {/* Script Type Selector Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <button
          onClick={() => setScriptType('pygithub')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            scriptType === 'pygithub'
              ? 'bg-slate-900 border-emerald-500 ring-1 ring-emerald-500 text-white shadow-xl'
              : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-xs text-emerald-400">1. PyGithub (Rekomendasi)</span>
            <FileCode className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-[11px] text-slate-400 leading-snug">
            Upload & update file dengan library resmi <code className="text-emerald-300">PyGithub</code> (Cek SHA otomatis).
          </p>
        </button>

        <button
          onClick={() => setScriptType('requests')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            scriptType === 'requests'
              ? 'bg-slate-900 border-emerald-500 ring-1 ring-emerald-500 text-white shadow-xl'
              : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-xs text-emerald-400">2. Python Requests</span>
            <Globe className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-[11px] text-slate-400 leading-snug">
            Gunakan HTTP REST API standar tanpa library khusus (<code className="text-emerald-300">requests</code>).
          </p>
        </button>

        <button
          onClick={() => setScriptType('foldersync')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            scriptType === 'foldersync'
              ? 'bg-slate-900 border-emerald-500 ring-1 ring-emerald-500 text-white shadow-xl'
              : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-xs text-emerald-400">3. Sync Folder Lokal</span>
            <FolderSync className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-[11px] text-slate-400 leading-snug">
            Unggah seluruh isi folder lokal beserta subfolder ke repositori GitHub.
          </p>
        </button>

        <button
          onClick={() => setScriptType('cli')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            scriptType === 'cli'
              ? 'bg-slate-900 border-emerald-500 ring-1 ring-emerald-500 text-white shadow-xl'
              : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-xs text-emerald-400">4. Tool CLI Terminal</span>
            <Terminal className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-[11px] text-slate-400 leading-snug">
            Skrip CLI dengan argumen command-line (<code className="text-emerald-300">--file</code>, <code className="text-emerald-300">--repo</code>).
          </p>
        </button>
      </div>

      {/* Dynamic Parameters Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          Atur Parameter Variabel Skrip
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block text-slate-400 font-semibold mb-1">Target Repo</label>
            <input
              type="text"
              readOnly
              value={`${opts.owner}/${opts.repo}`}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 font-mono text-slate-300"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">Target Path File Remote</label>
            <input
              type="text"
              value={customPath}
              onChange={(e) => setCustomPath(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 font-mono text-slate-100 focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">Pesan Commit</label>
            <input
              type="text"
              value={customMsg}
              onChange={(e) => setCustomMsg(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:border-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Code Viewer Panel */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl shadow-xl overflow-hidden font-mono text-xs">
        <div className="bg-slate-900 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between text-slate-400">
          <div className="flex items-center space-x-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold text-slate-200">{filename}</span>
          </div>
          <button
            onClick={handleCopyCode}
            className="text-emerald-400 hover:text-emerald-300 hover:underline text-[11px] font-sans font-semibold flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Tersalin' : 'Salin Skrip'}
          </button>
        </div>

        <pre className="p-4 text-emerald-300/90 overflow-x-auto leading-relaxed max-h-[500px]">
          {generatedCode}
        </pre>
      </div>

      {/* Execution Instructions */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl text-xs space-y-3">
        <div className="flex items-center space-x-2 text-emerald-400 font-bold text-sm">
          <BookOpen className="w-4 h-4" />
          <span>Cara Menjalankan Skrip Python di Komputer Lokal:</span>
        </div>

        <div className="bg-slate-950 p-4 rounded-xl font-mono text-slate-300 space-y-2 border border-slate-800">
          <p className="text-slate-500"># 1. Install dependensi (jika menggunakan PyGithub):</p>
          <p className="text-emerald-400">pip install PyGithub requests</p>

          <p className="text-slate-500 pt-2"># 2. Jalankan skrip Python:</p>
          <p className="text-emerald-400">python {filename}</p>

          {scriptType === 'cli' && (
            <>
              <p className="text-slate-500 pt-2"># Atau gunakan argumen CLI secara dinamis:</p>
              <p className="text-emerald-400">
                python github_uploader_cli.py --file my_local_file.py --path src/remote_file.py --message "Update via CLI"
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
