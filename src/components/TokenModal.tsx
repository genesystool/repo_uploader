import React, { useState } from 'react';
import {
  Key,
  ShieldCheck,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  X,
  Info,
  Loader2,
} from 'lucide-react';
import { GitHubUser } from '../types';
import { getAuthenticatedUser } from '../services/githubApi';

interface TokenModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: string;
  setToken: (token: string) => void;
  user: GitHubUser | null;
  setUser: (user: GitHubUser | null) => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const TokenModal: React.FC<TokenModalProps> = ({
  isOpen,
  onClose,
  token,
  setToken,
  user,
  setUser,
  showToast,
}) => {
  const [inputToken, setInputToken] = useState(token);
  const [loading, setLoading] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleTestToken = async () => {
    if (!inputToken.trim()) {
      setTestStatus('error');
      setErrorMessage('Token tidak boleh kosong.');
      return;
    }

    setLoading(true);
    setTestStatus('idle');
    setErrorMessage('');

    try {
      const userData = await getAuthenticatedUser(inputToken.trim());
      setUser(userData);
      setTestStatus('success');
      showToast(`Berhasil terhubung sebagai ${userData.login}!`, 'success');
    } catch (err: any) {
      setTestStatus('error');
      setErrorMessage(err.message || 'Gagal memverifikasi token.');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!inputToken.trim()) {
      showToast('Harap masukkan token GitHub terlebih dahulu.', 'error');
      return;
    }

    setToken(inputToken.trim());
    if (!user) {
      await handleTestToken();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden text-slate-100 animate-in fade-in zoom-in duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-xl">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-base text-slate-100">
                Pengaturan Token GitHub (PAT)
              </h3>
              <p className="text-xs text-slate-400">
                Diperlukan untuk membuat, mengunggah, & memperbarui file repo.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-5">
          {/* Token Input */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Personal Access Token (Classic atau Fine-grained)
            </label>
            <div className="relative">
              <input
                type="password"
                value={inputToken}
                onChange={(e) => {
                  setInputToken(e.target.value);
                  setTestStatus('idle');
                }}
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx atau github_pat_xxxx"
                className="w-full bg-slate-950 border border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 font-mono transition-all"
              />
            </div>
          </div>

          {/* Verification Status */}
          {testStatus === 'success' && user && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center space-x-3 text-emerald-300 text-xs">
              <img
                src={user.avatar_url}
                alt={user.login}
                className="w-8 h-8 rounded-full ring-2 ring-emerald-500/40"
              />
              <div>
                <p className="font-semibold">{user.name || user.login} (@{user.login})</p>
                <p className="text-[11px] text-emerald-400/80">
                  Token valid dengan akses ke {user.public_repos} repositori publik.
                </p>
              </div>
            </div>
          )}

          {testStatus === 'error' && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-start space-x-2.5 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium">{errorMessage}</p>
                <p className="text-[11px] text-rose-400/80 mt-0.5">
                  Pastikan token memiliki izin scope 'repo' atau 'contents:write'.
                </p>
              </div>
            </div>
          )}

          {/* Guide Box */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 text-xs space-y-2 text-slate-300">
            <div className="flex items-center space-x-1.5 font-semibold text-slate-200">
              <Info className="w-4 h-4 text-indigo-400" />
              <span>Cara Mendapatkan Personal Access Token (PAT):</span>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-slate-400 pl-1">
              <li>
                Buka Halaman{' '}
                <a
                  href="https://github.com/settings/tokens?type=beta"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-400 hover:underline inline-flex items-center gap-0.5"
                >
                  GitHub Personal Access Tokens
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>Klik **Generate new token** (pilih *Classic* atau *Fine-grained*).</li>
              <li>
                Beri nama Note (misal: "App Upload Python"), beri centang pada izin{' '}
                <strong className="text-slate-200">repo</strong> (Full control of private repositories) atau <strong className="text-slate-200">contents (Read and write)</strong>.
              </li>
              <li>Klik **Generate token**, lalu salin dan tempel token tersebut di sini.</li>
            </ol>
            <p className="text-[11px] text-amber-400/80 pt-1">
              🔒 Token Anda disimpan secara lokal di peramban (localStorage) dan tidak pernah dikirim ke server pihak ketiga mana pun.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/40 flex items-center justify-between">
          <button
            type="button"
            onClick={handleTestToken}
            disabled={loading}
            className="flex items-center space-x-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3.5 py-2 rounded-xl transition-all disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
            ) : (
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
            )}
            <span>{loading ? 'Memeriksa...' : 'Uji Koneksi Token'}</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
            >
              Batal
            </button>
            <button
              onClick={handleSave}
              className="flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-lg shadow-indigo-600/30 transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Simpan & Lanjutkan</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
