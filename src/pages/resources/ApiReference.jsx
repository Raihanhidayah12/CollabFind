import { motion } from 'framer-motion';
import { Code2, Webhook, Zap, Mail, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import Navbar from '../../components/landing/Navbar';
import Footer from '../../components/landing/Footer';

// ─── Webhook events ───────────────────────────────────────────────────────────

const webhookEvents = [
  {
    event: 'task.created',
    description: 'Fired when a new task is created on a Kanban board.',
    color: '#3B82F6',
    payload: {
      event: 'task.created',
      timestamp: '2025-06-15T08:30:00Z',
      workspace_id: 'ws_abc123',
      data: {
        task_id: 'task_xyz789',
        title: 'Design landing page hero',
        column: 'Backlog',
        created_by: 'user_001',
        project_id: 'proj_999',
      },
    },
  },
  {
    event: 'task.updated',
    description: 'Fired when a task is moved to a different column or edited.',
    color: '#8B5CF6',
    payload: {
      event: 'task.updated',
      timestamp: '2025-06-15T09:12:00Z',
      workspace_id: 'ws_abc123',
      data: {
        task_id: 'task_xyz789',
        title: 'Design landing page hero',
        column_from: 'Backlog',
        column_to: 'In Progress',
        updated_by: 'user_002',
      },
    },
  },
  {
    event: 'file.uploaded',
    description: 'Fired when a team member uploads a file to the workspace storage.',
    color: '#10B981',
    payload: {
      event: 'file.uploaded',
      timestamp: '2025-06-15T10:05:00Z',
      workspace_id: 'ws_abc123',
      data: {
        file_id: 'file_aabbcc',
        file_name: 'mockup-v2.png',
        size_bytes: 204800,
        uploaded_by: 'user_003',
        storage_path: 'workspaces/ws_abc123/mockup-v2.png',
      },
    },
  },
  {
    event: 'member.joined',
    description: 'Fired when a new member is accepted and joins the project.',
    color: '#F59E0B',
    payload: {
      event: 'member.joined',
      timestamp: '2025-06-15T11:00:00Z',
      workspace_id: 'ws_abc123',
      data: {
        user_id: 'user_004',
        display_name: 'Rizki Pratama',
        role: 'Frontend Developer',
        project_id: 'proj_999',
      },
    },
  },
];

// ─── Node.js example ──────────────────────────────────────────────────────────

const nodeExample = `const express = require('express');
const crypto  = require('crypto');
const app     = express();

app.use(express.json());

// Replace with your webhook secret from CollabFind dashboard
const WEBHOOK_SECRET = process.env.COLLABFIND_WEBHOOK_SECRET;

app.post('/webhooks/collabfind', (req, res) => {
  // 1. Verify signature
  const signature = req.headers['x-collabfind-signature'];
  const expected  = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(JSON.stringify(req.body))
    .digest('hex');

  if (signature !== \`sha256=\${expected}\`) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  // 2. Handle events
  const { event, data } = req.body;

  switch (event) {
    case 'task.created':
      console.log('New task:', data.title);
      // e.g. post to Discord channel
      break;

    case 'member.joined':
      console.log('New member:', data.display_name);
      // e.g. send welcome message on Telegram
      break;

    default:
      console.log('Unhandled event:', event);
  }

  res.status(200).json({ received: true });
});

app.listen(3000, () => console.log('Webhook server running on :3000'));`;

// ─── Copy button ──────────────────────────────────────────────────────────────

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-white/[0.1] text-slate-400 hover:text-white hover:border-white/[0.2] transition-all"
    >
      {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ApiReference() {
  const [expandedEvent, setExpandedEvent] = useState(null);

  return (
    <div className="min-h-screen bg-[#050816]" style={{ fontFamily: "'Manrope',sans-serif" }}>
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">

        {/* ── Hero ── */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-300 text-xs font-medium mb-6">
            <Code2 size={11} /> Developer
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-5 tracking-tight" style={{ fontFamily: "'Space Grotesk',sans-serif" }}>
            CollabFind{' '}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              API Reference
            </span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Public API coming soon. For now, use webhooks to connect your workspace to Discord or Telegram and automate your team workflow.
          </p>

          <div className="inline-flex items-center gap-2 mt-6 px-4 py-2 rounded-xl border border-yellow-500/30 bg-yellow-500/10 text-yellow-300 text-xs font-medium">
            <Zap size={11} />
            REST API is under development — webhook support is available now
          </div>
        </motion.div>

        {/* ── Webhook Events ── */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center">
              <Webhook size={17} className="text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white" style={{ fontFamily: "'Space Grotesk',sans-serif" }}>
                Webhook Events
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">CollabFind will POST to your endpoint when these events occur.</p>
            </div>
          </div>

          <div className="space-y-3">
            {webhookEvents.map((ev, i) => {
              const isOpen = expandedEvent === ev.event;
              return (
                <motion.div
                  key={ev.event}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.12 + i * 0.06 }}
                  className="rounded-2xl border border-white/[0.08] bg-[#0a0f1e]/70 overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedEvent(isOpen ? null : ev.event)}
                    className="w-full flex items-center gap-4 px-5 py-4 hover:bg-white/[0.02] transition-colors text-left"
                  >
                    <code
                      className="text-sm font-mono font-semibold px-2.5 py-1 rounded-lg"
                      style={{ background: `${ev.color}18`, color: ev.color, border: `1px solid ${ev.color}30` }}
                    >
                      {ev.event}
                    </code>
                    <span className="text-sm text-slate-400 flex-1">{ev.description}</span>
                    <span className="text-xs text-slate-600 flex-shrink-0">
                      {isOpen ? 'Hide payload ▲' : 'View payload ▼'}
                    </span>
                  </button>

                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border-t border-white/[0.06]"
                    >
                      <div className="p-5">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
                            Example Payload
                          </span>
                          <CopyButton text={JSON.stringify(ev.payload, null, 2)} />
                        </div>
                        <pre className="text-xs text-slate-300 font-mono leading-relaxed bg-[#050816]/80 rounded-xl p-4 border border-white/[0.05] overflow-x-auto">
                          {JSON.stringify(ev.payload, null, 2)}
                        </pre>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* ── Code example ── */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center">
              <Code2 size={17} className="text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white" style={{ fontFamily: "'Space Grotesk',sans-serif" }}>
                Receiving Webhooks in Node.js
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Express.js example with signature verification.</p>
            </div>
          </div>

          <div className="rounded-2xl border border-white/[0.08] bg-[#0a0f1e]/70 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/70" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                <div className="w-3 h-3 rounded-full bg-green-500/70" />
              </div>
              <span className="text-xs text-slate-600 font-mono">webhook-server.js</span>
              <CopyButton text={nodeExample} />
            </div>
            <pre className="text-xs text-slate-300 font-mono leading-relaxed p-5 overflow-x-auto">
              <code>{nodeExample}</code>
            </pre>
          </div>
        </motion.section>

        {/* ── CTA ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28 }}
          className="rounded-3xl border border-blue-500/20 bg-gradient-to-br from-blue-600/10 via-purple-600/8 to-transparent p-10 text-center"
        >
          <div className="w-12 h-12 rounded-2xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center mx-auto mb-5">
            <Mail size={22} className="text-blue-400" />
          </div>
          <h3 className="text-xl font-extrabold text-white mb-2" style={{ fontFamily: "'Space Grotesk',sans-serif" }}>
            Interested in Early API Access?
          </h3>
          <p className="text-sm text-slate-400 mb-6 max-w-md mx-auto">
            We're building the REST API and looking for early adopters to help shape it. Send us your use case.
          </p>
          <a
            href="mailto:dev@collabfind.dev?subject=CollabFind API Early Access Request"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 shadow-[0_0_24px_rgba(59,130,246,0.3)] transition-all"
          >
            <Mail size={15} /> Request Early Access
          </a>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
