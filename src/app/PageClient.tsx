'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, RefreshCw, Mail, Inbox, ChevronRight, X, ShieldCheck } from 'lucide-react';
import dynamic from 'next/dynamic';

const Background3D = dynamic(() => import('./Background3D'), { ssr: false });

export default function Home() {
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [selectedMsg, setSelectedMsg] = useState<any>(null);
  const [msgContent, setMsgContent] = useState('');
  const [loadingMsg, setLoadingMsg] = useState(false);
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    // Disable DevTools shortcuts & right click
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === 'F12' ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && ['I', 'i', 'J', 'j', 'C', 'c'].includes(e.key)) ||
        ((e.ctrlKey || e.metaKey) && ['U', 'u'].includes(e.key))
      ) {
        e.preventDefault();
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);


  const generateEmail = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/generate', { method: 'POST' });
      const data = await res.json();
      setEmail(data.email);
      setToken(data.sessionToken);
      setMessages([]);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const fetchInbox = async () => {
    if (!token) return;
    try {
      const res = await fetch(`/api/inbox?token=${token}`);
      const data = await res.json();
      setMessages(data);
    } catch (e) {
      console.error(e);
    }
  };

  const openMessage = async (msg: any) => {
    setSelectedMsg(msg);
    if (msg.provider === 1) {
      setLoadingMsg(true);
      try {
        const res = await fetch(`/api/message/${msg.id}?token=${token}`);
        const data = await res.json();
        setMsgContent(data.html || data.text || '');
      } catch (e) {
        setMsgContent('Failed to load message.');
      }
      setLoadingMsg(false);
    } else {
      const raw = msg.raw || {};
      const content = raw.html || raw.html_body || raw.body_html || raw.body || raw.text_body || raw.body_text || raw.text || msg.intro;
      if (content) {
        setMsgContent(content);
      } else {
        setMsgContent(`<pre class="text-xs text-slate-400 overflow-auto p-4 bg-slate-900 rounded-lg border border-slate-800"><code>${JSON.stringify(raw, null, 2)}</code></pre>`);
      }
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };



  useEffect(() => {
    if (token) {
      const interval = setInterval(fetchInbox, 10000);
      return () => clearInterval(interval);
    }
  }, [token]);



  return (
    <main className="min-h-screen relative flex items-center justify-center p-4 text-slate-50 font-sans selection:bg-indigo-500/30">
      <Background3D />

      <div className="w-full max-w-5xl grid lg:grid-cols-12 gap-8 relative z-10">

        {/* Left Panel - Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-5 flex flex-col justify-center"
        >
          <div className="mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-medium mb-6">
              <ShieldCheck size={16} />
              <span>Secure & Anonymous</span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-200 to-indigo-400">
              Codesy Mails
            </h1>
            <p className="text-lg text-slate-400 mb-8 max-w-md">
              Instantly generate a disposable email address to protect your personal inbox from spam, bots, and phishing.
            </p>
          </div>

          {!email ? (
            <button
              onClick={generateEmail}
              disabled={loading}
              className="group relative w-full py-4 bg-indigo-600 hover:bg-indigo-500 rounded-2xl font-semibold text-lg text-white shadow-[0_0_40px_-10px_rgba(79,70,229,0.4)] transition-all flex items-center justify-center disabled:opacity-70"
            >
              {loading ? (
                <RefreshCw className="animate-spin text-indigo-200" />
              ) : (
                <span className="flex items-center gap-2">
                  Generate Email <ChevronRight className="group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </button>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              <div className="p-1 rounded-2xl bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-800 shadow-xl">
                <div className="flex items-center bg-slate-950/50 rounded-xl p-2">
                  <input
                    type="text"
                    readOnly
                    value={email}
                    className="bg-transparent flex-1 px-4 outline-none text-lg font-medium text-slate-200 w-full"
                  />
                  <button
                    onClick={copyToClipboard}
                    className="px-4 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white font-medium transition-colors flex items-center gap-2"
                  >
                    {copied ? (
                      <>Copied!</>
                    ) : (
                      <><Copy size={18} /> Copy</>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={fetchInbox}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 text-slate-300"
                >
                  <RefreshCw size={18} /> Refresh
                </button>
                <button
                  onClick={generateEmail}
                  className="flex-1 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl font-medium transition-colors"
                >
                  Delete Address
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Right Panel - Inbox */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-7 bg-slate-900/80 backdrop-blur-xl border border-slate-800 shadow-2xl rounded-3xl overflow-hidden flex flex-col h-[600px]"
        >
          <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
                <Inbox size={20} />
              </div>
              <h2 className="text-xl font-semibold text-white">Inbox</h2>
            </div>
            {messages.length > 0 && (
              <span className="bg-slate-800 text-slate-300 py-1 px-3 rounded-full text-xs font-bold tracking-wider">
                {messages.length} MESSAGES
              </span>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            {!email ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-4">
                <div className="w-20 h-20 rounded-full bg-slate-800/50 flex items-center justify-center">
                  <Mail size={32} className="opacity-50" />
                </div>
                <p className="font-medium text-lg">Your inbox is waiting</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-4">
                <RefreshCw size={28} className="animate-spin opacity-50 text-indigo-400" />
                <p className="font-medium">Waiting for new emails...</p>
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((msg, idx) => (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={msg.id}
                    onClick={() => openMessage(msg)}
                    className="p-5 bg-slate-800/50 hover:bg-slate-800 rounded-2xl cursor-pointer transition-all border border-transparent hover:border-slate-700 flex items-start gap-4 group"
                  >
                    <div className="w-12 h-12 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-lg shrink-0">
                      {msg.from[0]?.toUpperCase() || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-slate-400 truncate pr-4">{msg.from}</p>
                        <p className="text-xs text-slate-500 shrink-0">
                          {new Date(msg.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <h4 className="font-semibold text-slate-200 truncate mb-1">{msg.subject || 'No Subject'}</h4>
                      <p className="text-sm text-slate-500 truncate">{msg.intro}</p>
                    </div>
                    <div className="shrink-0 self-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <ChevronRight className="text-indigo-400" />
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {selectedMsg && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-slate-900 border border-slate-700 w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl max-h-[85vh] flex flex-col"
            >
              <div className="p-6 md:p-8 border-b border-slate-800 bg-slate-900 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="font-bold text-2xl text-slate-100 mb-2 truncate">{selectedMsg.subject || 'No Subject'}</h3>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-slate-400">From:</span>
                    <span className="text-indigo-400 font-medium truncate">{selectedMsg.from}</span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedMsg(null)}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full transition-colors shrink-0"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 md:p-8 overflow-y-auto flex-1 bg-white text-slate-900 custom-html-content">
                {loadingMsg ? (
                  <div className="flex flex-col items-center justify-center h-40 gap-4">
                    <RefreshCw className="animate-spin text-indigo-500" size={32} />
                    <p className="text-slate-500 font-medium">Loading secure message...</p>
                  </div>
                ) : (
                  msgContent ? (
                    <div className="prose prose-slate max-w-none whitespace-pre-wrap break-words" dangerouslySetInnerHTML={{ __html: msgContent }} />
                  ) : (
                    <p className="text-slate-500 italic text-center py-10">No content available for this message.</p>
                  )
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{
        __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #334155;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #475569;
        }
      `}} />
    </main>
  );
}
