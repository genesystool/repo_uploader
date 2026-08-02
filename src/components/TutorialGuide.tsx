import React, { useState } from 'react';
import {
  HelpCircle,
  Key,
  UploadCloud,
  FileCode,
  Code2,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  ChevronRight,
  BookOpen,
  Terminal,
  ShieldAlert,
  ArrowRight,
  Search,
  Sparkles,
  FolderTree,
  RotateCcw,
} from 'lucide-react';
import { ViewTab } from '../types';

interface TutorialGuideProps {
  setActiveTab: (tab: ViewTab) => void;
  openTokenModal: () => void;
}

export const TutorialGuide: React.FC<TutorialGuideProps> = ({
  setActiveTab,
  openTokenModal,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('token');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedSnippet(id);
    setTimeout(() => setCopiedSnippet(null), 2000);
  };

  const categories = [
    { id: 'token', name: '1. Token GitHub', icon: Key, color: 'text-amber-400' },
    { id: 'upload', name: '2. Upload & Update File', icon: UploadCloud, color: 'text-indigo-400' },
    { id: 'editor', name: '3. Editor Kode Web', icon: FileCode, color: 'text-blue-400' },
    { id: 'python', name: '4. Skrip Python Automated', icon: Code2, color: 'text-emerald-400' },
    { id: 'errors', name: '5. Solusi Masalah & Error', icon: AlertTriangle, color: 'text-rose-400' },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Banner Top */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/80 to-slate-900 border border-indigo-500/20 rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-medium">
              <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
              <span>Panduan Penggunaan Lengkap</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Tutorial & Dokumentasi GitHub Studio
            </h2>
            <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
              Pelajari cara mengonfigurasi Token GitHub, mengunggah atau memperbarui file tanpa kendala SHA,
              menggunakan Editor Web, serta mengotomatisasi repository menggunakan Skrip Python.
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={openTokenModal}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold text-xs transition-all shadow-md"
            >
              <Key className="w-4 h-4" />
              <span>Atur Token Sekarang</span>
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition-all shadow-md"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Coba Upload File</span>
            </button>
          </div>
        </div>
      </div>

      {/* Category Navigation Bar & Search */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-900 border border-slate-800 p-2.5 rounded-xl">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : cat.color}`} />
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari kata kunci (e.g. SHA, Token, 403)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Main Content Sections */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-8">
        
        {/* CATEGORY 1: TOKEN GITHUB */}
        {(selectedCategory === 'token' || searchQuery.toLowerCase().includes('token')) && (
          <section className="space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                <Key className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Panduan Membuat Personal Access Token (PAT)</h3>
                <p className="text-xs text-slate-400">Diperlukan agar aplikasi memiliki hak akses mengunggah dan mengedit repository Anda.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-950 border border-slate-800/80 p-5 rounded-xl space-y-3">
                <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm">
                  1
                </div>
                <h4 className="font-semibold text-slate-200 text-sm">Buka Halaman Developer Settings</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Masuk ke akun GitHub Anda, lalu buka halaman pembuatan Personal Access Token (Classic).
                </p>
                <a
                  href="https://github.com/settings/tokens/new"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-400 hover:text-amber-300 hover:underline pt-2"
                >
                  <span>Buka GitHub Tokens Page</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <div className="bg-slate-950 border border-slate-800/80 p-5 rounded-xl space-y-3">
                <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm">
                  2
                </div>
                <h4 className="font-semibold text-slate-200 text-sm">Centang Scope yang Dibutuhkan</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Beri nama Note (e.g. <span className="text-amber-300">GitHub Studio</span>) dan pastikan centang hak akses berikut:
                </p>
                <ul className="text-xs text-slate-300 space-y-1 bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="font-mono text-amber-300 font-semibold">repo</span> (Full control of repos)
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="font-mono text-amber-300">workflow</span> (Opsional untuk CI/CD)
                  </li>
                </ul>
              </div>

              <div className="bg-slate-950 border border-slate-800/80 p-5 rounded-xl space-y-3">
                <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm">
                  3
                </div>
                <h4 className="font-semibold text-slate-200 text-sm">Salin & Tempel ke Aplikasi</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Klik <span className="text-slate-200 font-semibold">Generate Token</span>, salin string yang berawalan <code className="text-amber-300 font-mono">ghp_</code> atau <code className="text-amber-300 font-mono">github_pat_</code>, lalu tempel di aplikasi ini.
                </p>
                <button
                  onClick={openTokenModal}
                  className="w-full py-2 bg-amber-500/20 border border-amber-500/40 text-amber-300 rounded-lg text-xs font-semibold hover:bg-amber-500/30 transition-all"
                >
                  Buka Dialog Atur Token
                </button>
              </div>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-xl flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-200 leading-relaxed space-y-1">
                <p className="font-semibold text-amber-300">Keamanan Token Anda:</p>
                <p>
                  Token disimpan secara aman hanya di <code className="bg-slate-900 px-1 py-0.5 rounded text-amber-300 font-mono">localStorage</code> browser Anda.
                  Aplikasi ini berkomunikasi langsung dari browser ke API GitHub resmi (<code className="bg-slate-900 px-1 py-0.5 rounded text-amber-300 font-mono">https://api.github.com</code>) tanpa server perantara pihak ketiga.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* CATEGORY 2: UPLOAD & UPDATE FILE GUI */}
        {(selectedCategory === 'upload' || searchQuery.toLowerCase().includes('upload') || searchQuery.toLowerCase().includes('sha')) && (
          <section className="space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/30 rounded-xl">
                <UploadCloud className="w-6 h-6 text-indigo-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Panduan Upload & Update File (GUI)</h3>
                <p className="text-xs text-slate-400">Cara mengunggah berkas tunggal, folder, atau memperbarui berkas yang sudah ada tanpa error SHA.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl space-y-4">
                <h4 className="text-sm font-semibold text-indigo-300 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  Fitur Otomatis Penanganan SHA & Folder
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-300">
                  <div className="bg-slate-900/80 p-3.5 rounded-lg border border-slate-800 space-y-1">
                    <span className="font-semibold text-emerald-400 block">✓ Penanganan SHA Otomatis</span>
                    <p className="text-slate-400">
                      Di GitHub REST API, memperbarui file membutuhkan nilai <code className="text-indigo-300 font-mono">sha</code> file yang lama. Aplikasi ini secara otomatis memeriksa dan mengambil SHA file di GitHub sebelum mengirimkan commit.
                    </p>
                  </div>
                  <div className="bg-slate-900/80 p-3.5 rounded-lg border border-slate-800 space-y-1">
                    <span className="font-semibold text-indigo-400 block">✓ Upload Drag-and-Drop / Folder</span>
                    <p className="text-slate-400">
                      Anda dapat menggeser (drag & drop) file atau struktur folder langsung ke area upload. Path folder akan dipertahankan dengan rapi.
                    </p>
                  </div>
                </div>
              </div>

              {/* Steps */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Langkah-Langkah Upload File:</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                    <span className="text-indigo-400 font-bold">Langkah 1:</span>
                    <p className="font-medium text-slate-200">Pilih Repository & Branch</p>
                    <p className="text-slate-400">Pilih target repo dan branch (misal: <code className="text-indigo-300">main</code>) di bagian atas aplikasi.</p>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                    <span className="text-indigo-400 font-bold">Langkah 2:</span>
                    <p className="font-medium text-slate-200">Pilih Folder Target (Opsional)</p>
                    <p className="text-slate-400">Isi folder tujuan jika ingin mengunggah ke subfolder, e.g. <code className="text-indigo-300">src/components</code>.</p>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                    <span className="text-indigo-400 font-bold">Langkah 3:</span>
                    <p className="font-medium text-slate-200">Pilih / Seret Berkas</p>
                    <p className="text-slate-400">Klik area dropzone atau seret file gambar, dokumen, atau kode dari komputer Anda.</p>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                    <span className="text-indigo-400 font-bold">Langkah 4:</span>
                    <p className="font-medium text-slate-200">Klik "Unggah ke GitHub"</p>
                    <p className="text-slate-400">Tulis pesan commit khusus jika perlu, lalu tekan tombol upload. Status tiap file akan diperbarui secara realtime.</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setActiveTab('upload')}
                  className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg transition-all"
                >
                  <span>Buka Halaman Upload Sekarang</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </section>
        )}

        {/* CATEGORY 3: EDITOR KODE WEB */}
        {(selectedCategory === 'editor' || searchQuery.toLowerCase().includes('editor') || searchQuery.toLowerCase().includes('edit')) && (
          <section className="space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="p-2.5 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                <FileCode className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Panduan Editor Kode Web</h3>
                <p className="text-xs text-slate-400">Edit file berbasis teks (Python, JS, HTML, Markdown, JSON) langsung dari browser.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl space-y-3">
                <h4 className="font-semibold text-blue-300 flex items-center gap-2">
                  <FolderTree className="w-4 h-4 text-blue-400" />
                  Membuka File dari Explorer
                </h4>
                <p className="text-slate-300 leading-relaxed">
                  Buka tab <span className="text-indigo-300 font-medium">Explorer File</span>, jelajahi folder repository Anda, lalu klik pada nama file yang ingin diedit. Aplikasi akan memuat isi file dan berpindah ke Editor Kode secara otomatis.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => setActiveTab('explorer')}
                    className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-700 transition-all"
                  >
                    Buka Explorer File
                  </button>
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl space-y-3">
                <h4 className="font-semibold text-blue-300 flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-blue-400" />
                  Pemeriksaan SHA & Commit Langsung
                </h4>
                <p className="text-slate-300 leading-relaxed">
                  Tombol <span className="text-amber-300 font-semibold font-mono">Cek File di GitHub</span> memungkinkan Anda memeriksa apakah nama file sudah ada di repository. Jika ada, sistem akan mengambil SHA-nya sehingga commit dilakukan dalam mode UPDATE (bukan duplikat atau error).
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => setActiveTab('editor')}
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow transition-all"
                  >
                    Buka Editor Kode
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* CATEGORY 4: SKRIP PYTHON AUTOMATED */}
        {(selectedCategory === 'python' || searchQuery.toLowerCase().includes('python') || searchQuery.toLowerCase().includes('skrip')) && (
          <section className="space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                <Code2 className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Panduan Otomatisasi Skrip Python</h3>
                <p className="text-xs text-slate-400">Cara menjalankan skrip Python secara mandiri di komputer Anda untuk mengunggah atau memperbarui file secara otomatis.</p>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-xs text-slate-300 leading-relaxed">
                Tab <span className="text-emerald-400 font-semibold">Skrip Python</span> secara dinamis meregenerasi skrip Python mandiri berbasis library <code className="text-emerald-300 font-mono">requests</code> yang siap dijalankan di terminal/CMD lokal Anda.
              </p>

              {/* Python Execution Tutorial Steps */}
              <div className="bg-slate-950 border border-slate-800/90 rounded-xl p-5 space-y-4">
                <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  Cara Menjalankan Skrip Python di Komputer Anda:
                </h4>

                <div className="space-y-3 text-xs">
                  <div className="flex items-start gap-3 bg-slate-900 p-3 rounded-lg border border-slate-800">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0">1</div>
                    <div className="space-y-1">
                      <p className="font-semibold text-slate-200">Install Library Required:</p>
                      <div className="flex items-center justify-between bg-slate-950 px-3 py-1.5 rounded font-mono text-emerald-300 border border-slate-800">
                        <code>pip install requests</code>
                        <button
                          onClick={() => handleCopy('pip install requests', 'pip_install')}
                          className="text-slate-400 hover:text-white p-1"
                          title="Salin"
                        >
                          {copiedSnippet === 'pip_install' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-slate-900 p-3 rounded-lg border border-slate-800">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0">2</div>
                    <div className="space-y-1 w-full">
                      <p className="font-semibold text-slate-200">Salin Skrip dari Tab "Skrip Python" & Simpan ke file <code className="text-emerald-300">github_uploader.py</code>:</p>
                      <p className="text-slate-400 text-[11px]">
                        Skrip Python sudah menyertakan fungsi otomatisasi untuk mengecek SHA file lama, mengodekan file ke Base64, dan melakukan request HTTP PUT ke GitHub REST API.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-slate-900 p-3 rounded-lg border border-slate-800">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0">3</div>
                    <div className="space-y-1 w-full">
                      <p className="font-semibold text-slate-200">Jalankan Skrip di Terminal:</p>
                      <div className="flex items-center justify-between bg-slate-950 px-3 py-1.5 rounded font-mono text-emerald-300 border border-slate-800">
                        <code>python github_uploader.py</code>
                        <button
                          onClick={() => handleCopy('python github_uploader.py', 'py_run')}
                          className="text-slate-400 hover:text-white p-1"
                          title="Salin"
                        >
                          {copiedSnippet === 'py_run' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => setActiveTab('python')}
                    className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-lg transition-all"
                  >
                    <span>Generator & Viewer Skrip Python</span>
                    <Code2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* CATEGORY 5: TROUBLESHOOTING & ERROR CODES */}
        {(selectedCategory === 'errors' || searchQuery.toLowerCase().includes('error') || searchQuery.toLowerCase().includes('401') || searchQuery.toLowerCase().includes('403') || searchQuery.toLowerCase().includes('gagal')) && (
          <section className="space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-xl">
                <AlertTriangle className="w-6 h-6 text-rose-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Troubleshooting & Penanganan Error</h3>
                <p className="text-xs text-slate-400">Solusi jika upload atau update file mengalami kendala HTTP status code.</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              {/* Error 401 */}
              <div className="bg-slate-950 border border-slate-800/80 p-4 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-rose-400 font-bold text-sm">HTTP 401 Unauthorized</span>
                  <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 text-[10px] border border-rose-500/30">Token Tidak Valid</span>
                </div>
                <p className="text-slate-300">
                  <strong className="text-white">Penyebab:</strong> Token GitHub salah, telah kadaluarsa, atau dicabut di GitHub Settings.
                </p>
                <p className="text-slate-400">
                  <strong className="text-slate-200">Solusi:</strong> Klik tombol <span className="text-amber-300 font-semibold">Atur Token GitHub</span> di kanan atas, buat Personal Access Token baru, lalu masukkan kembali.
                </p>
              </div>

              {/* Error 403 */}
              <div className="bg-slate-950 border border-slate-800/80 p-4 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-rose-400 font-bold text-sm">HTTP 403 Forbidden</span>
                  <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 text-[10px] border border-rose-500/30">Akses Ditolak</span>
                </div>
                <p className="text-slate-300">
                  <strong className="text-white">Penyebab:</strong> Token tidak memiliki scope/hak akses <code className="text-amber-300 font-mono">repo</code> atau Anda bukan kontributor di repository target.
                </p>
                <p className="text-slate-400">
                  <strong className="text-slate-200">Solusi:</strong> Buat token baru di GitHub dan pastikan mencentang kotak <span className="text-amber-300 font-semibold font-mono">repo</span> (Full control of private repositories).
                </p>
              </div>

              {/* Error 404 */}
              <div className="bg-slate-950 border border-slate-800/80 p-4 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-amber-400 font-bold text-sm">HTTP 404 Not Found</span>
                  <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 text-[10px] border border-amber-500/30">Tidak Ditemukan</span>
                </div>
                <p className="text-slate-300">
                  <strong className="text-white">Penyebab:</strong> Nama repository, owner, branch, atau path folder yang dituju tidak ada atau salah ketik.
                </p>
                <p className="text-slate-400">
                  <strong className="text-slate-200">Solusi:</strong> Pilih repository & branch dari menu dropdown di atas, atau pastikan nama branch e.g. <code className="text-indigo-300">main</code> / <code className="text-indigo-300">master</code> sudah sesuai.
                </p>
              </div>

              {/* Error 422 / 409 */}
              <div className="bg-slate-950 border border-slate-800/80 p-4 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-indigo-400 font-bold text-sm">HTTP 422 / 409 Conflict</span>
                  <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 text-[10px] border border-indigo-500/30">SHA Mismatch / File Exists</span>
                </div>
                <p className="text-slate-300">
                  <strong className="text-white">Penyebab:</strong> Mencoba memperbarui file tanpa nilai SHA, atau ukuran file melebihi batas REST API (100 MB).
                </p>
                <p className="text-slate-400">
                  <strong className="text-slate-200">Solusi:</strong> Aplikasi ini sudah memiliki fitur pemulihan SHA otomatis. Jika file sangat besar (&gt;100MB), gunakan Git LFS / Git CLI lokal.
                </p>
              </div>
            </div>
          </section>
        )}

      </div>
    </div>
  );
};
