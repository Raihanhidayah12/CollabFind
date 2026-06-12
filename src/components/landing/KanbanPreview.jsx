import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layout, LayoutDashboard, BookOpen, FolderOpen, Activity, MessageSquare } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

// ─── Kanban data ────────────────────────────────────────────────────────────
const columns = [
  {
    title: 'To-Do', titleKey: 'kp.colTodo', color: '#94A3B8', borderColor: 'border-slate-600/50',
    cards: [
      { title: 'Design onboarding flow',   assignee: 'S', deadline: '20 Jun', threads: 0 },
      { title: 'Write API documentation',  assignee: 'D', deadline: '22 Jun', threads: 3 },
      { title: 'Set up CI/CD pipeline',    assignee: 'K', deadline: '25 Jun', threads: 1 },
    ],
  },
  {
    title: 'In Progress', titleKey: 'kp.colInProgress', color: '#3B82F6', borderColor: 'border-blue-500/50',
    cards: [
      { title: 'Build authentication system',  assignee: 'A', deadline: '18 Jun', threads: 5 },
      { title: 'Create project dashboard UI',  assignee: 'R', deadline: '19 Jun', threads: 2 },
    ],
  },
  {
    title: 'Done', titleKey: 'kp.colDone', color: '#10B981', borderColor: 'border-emerald-500/50',
    cards: [
      { title: 'Wireframes & prototypes', assignee: 'S', deadline: null, threads: 4 },
      { title: 'Project setup & repo',    assignee: 'A', deadline: null, threads: 1 },
      { title: 'Tech stack decision',     assignee: 'D', deadline: null, threads: 0 },
    ],
  },
];
const avatarColors = { A: '#3B82F6', S: '#EC4899', K: '#06B6D4', D: '#8B5CF6', L: '#10B981', R: '#F97316' };

// ─── Wiki data ────────────────────────────────────────────────────────────────
const wikiPages = [
  { icon: '📋', title: 'Project Overview',   titleKey: 'kp.wikiOverview',   active: true },
  { icon: '🗺️',  title: 'Tech Stack',         titleKey: 'kp.wikiTechStack',  active: false },
  { icon: '🔐', title: 'Auth Flow',           titleKey: 'kp.wikiAuthFlow',   active: false },
  { icon: '🎨', title: 'Design Guidelines',   titleKey: 'kp.wikiDesign',     active: false },
  { icon: '🚀', title: 'Deployment Guide',    titleKey: 'kp.wikiDeployment', active: false },
];
const wikiContent = {
  titleKey: 'kp.wikiOverview',
  updatedKey: 'kanban.updated',
  sections: [
    { headingKey: 'kanban.aboutProject', bodyKey: 'kanban.aboutDesc' },
    { headingKey: 'kanban.team', bodyKey: 'kanban.teamDesc' },
    { headingKey: 'kanban.targetLaunch', bodyKey: 'kanban.targetLaunchDesc' },
  ],
};

// ─── Tabs config ─────────────────────────────────────────────────────────────
const TABS = [
  { id: 'files',    label: 'File Storage',    labelKey: 'kp.tabFiles',    icon: FolderOpen },
  { id: 'wiki',     label: 'Wiki',            labelKey: 'kp.tabWiki',     icon: BookOpen },
  { id: 'kanban',   label: 'Project Boards',  labelKey: 'kp.tabBoards',   icon: LayoutDashboard },
  { id: 'activity', label: 'Activity',        labelKey: 'kp.tabActivity', icon: Activity },
];

// ─── Panel components ─────────────────────────────────────────────────────────
function KanbanPanel() {
  const { t } = useLanguage();
  return (
    <div className="p-5">
      {/* Sprint navigation */}
      <div className="flex items-center gap-2 mb-4">
        {[t('kanban.backlog'), t('kanban.sprint1'), t('kanban.sprint2')].map((sp, i) => (
          <div key={sp} className={`px-3 py-1 rounded-full text-[10px] font-semibold border ${i === 1 ? 'bg-blue-500 border-blue-500 text-white' : 'bg-white/[0.04] border-white/[0.09] text-slate-500'}`}>
            {sp}
          </div>
        ))}
        <div className="ml-auto px-3 py-1 rounded-full text-[10px] font-semibold border border-emerald-500/30 bg-emerald-500/10 text-emerald-300">
          {t('kanban.sprintNew')}
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] text-slate-600">{t('kanban.progress')}</span>
          <span className="text-[10px] font-bold text-slate-400">60%</span>
        </div>
        <div className="w-full bg-white/[0.04] h-1.5 rounded-full overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-500" style={{ width: '60%' }} />
        </div>
        <span className="text-[9px] text-slate-700">{t('kanban.tasksDone')}</span>
      </div>

      {/* Kanban columns */}
      <div className="grid grid-cols-3 gap-4">
        {columns.map((col, ci) => (
          <div key={col.title} className="min-w-0">
            <div className={`flex items-center gap-2 pb-3 mb-3 border-b ${col.borderColor}`}>
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: col.color }} />
              <span className="text-xs font-semibold text-slate-400">{t(col.titleKey)}</span>
              <span className="ml-auto px-1.5 py-0.5 rounded-full text-[10px] font-bold border" style={{ color: col.color, background: `${col.color}15`, borderColor: `${col.color}35` }}>
                {col.cards.length}
              </span>
            </div>
            <div className="flex flex-col gap-2 p-2 rounded-xl border border-white/[0.06]" style={{ background: `${col.color}06` }}>
              {col.cards.map((card, ki) => (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: ci * 0.05 + ki * 0.05 }}
                  whileHover={{ scale: 1.02, y: -1 }}
                  className="p-2.5 rounded-xl bg-[#0d1226] border border-white/[0.07] hover:border-white/[0.14] transition-all duration-200 cursor-pointer"
                >
                  <p className="text-xs text-slate-300 mb-2 leading-snug font-semibold">{card.title}</p>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/20 text-[9px] text-purple-300">
                      {card.assignee}
                    </span>
                    {card.deadline && (
                      <span className="px-1.5 py-0.5 rounded-md bg-slate-500/10 border border-slate-500/20 text-[9px] text-slate-400">
                        {card.deadline}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 mt-2 text-[9px] text-slate-600">
                    <MessageSquare size={9} />
                    <span>{t('kanban.discussion')}</span>
                    {card.threads > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[8px] font-bold">{card.threads}</span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FileStoragePanel() {
  const { t } = useLanguage();
  const folders = [
    { name: t('kanban.designAssets'), files: 12, color: '#F59E0B', icon: '📁' },
    { name: t('kanban.backendCode'), files: 8, color: '#10B981', icon: '📁' },
    { name: t('kanban.documentation'), files: 5, color: '#8B5CF6', icon: '📁' },
    { name: t('kanban.presentations'), files: 3, color: '#3B82F6', icon: '📁' },
  ];
  const recentFiles = [
    { name: t('kanban.wireframeFile'), size: '4.2 MB', type: 'Figma', color: '#EC4899', time: `2${t('kanban.hoursAgoShort')}` },
    { name: t('kanban.apiDocsFile'), size: '128 KB', type: 'Markdown', color: '#6B7280', time: `5${t('kanban.hoursAgoShort')}` },
    { name: t('kanban.dbSchemaFile'), size: '34 KB', type: 'SQL', color: '#10B981', time: t('kanban.yesterday') },
    { name: t('kanban.pitchDeckFile'), size: '2.1 MB', type: 'PDF', color: '#F59E0B', time: t('kanban.yesterday') },
  ];

  return (
    <div className="flex h-[340px]">
      {/* Sidebar */}
      <div className="w-44 border-r border-white/[0.06] p-3 flex flex-col gap-1 flex-shrink-0">
        <p className="text-[10px] text-slate-600 uppercase tracking-wider mb-2 px-1">{t('kanban.folder')}</p>
        {folders.map((f) => (
          <div key={f.name} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-slate-500 hover:text-slate-300 hover:bg-white/[0.04] cursor-pointer transition-colors">
            <span>{f.icon}</span>
            <span className="truncate">{f.name}</span>
            <span className="ml-auto text-[10px] text-slate-700">{f.files}</span>
          </div>
        ))}
      </div>

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="px-4 py-2.5 border-b border-white/[0.06] flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400">{t('kanban.recentFiles')}</span>
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-blue-500/20 border border-blue-500/30 text-[10px] font-semibold text-blue-300 cursor-pointer">
            <FolderOpen size={10} /> {t('kanban.upload')}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-2">
          {recentFiles.map((file, i) => (
            <motion.div
              key={file.name}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07 }}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.06] transition-all duration-200 cursor-pointer group"
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                style={{ background: `${file.color}18`, border: `1px solid ${file.color}33`, color: file.color }}
              >
                {file.type.slice(0, 3)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-300 truncate group-hover:text-white transition-colors">{file.name}</p>
                <p className="text-[10px] text-slate-600">{file.size}</p>
              </div>
              <span className="text-[10px] text-slate-600 flex-shrink-0">{file.time}</span>
            </motion.div>
          ))}
        </div>
        <div className="px-4 py-2 border-t border-white/[0.06]">
          <div className="flex items-center justify-between text-[10px] text-slate-600">
            <span>{t('kanban.fileUsage')}</span>
            <span className="text-blue-400">{t('kanban.ofStorage')}</span>
          </div>
          <div className="mt-1.5 h-1 rounded-full bg-white/[0.06] overflow-hidden">
            <div className="h-full w-[7%] rounded-full bg-gradient-to-r from-blue-500 to-cyan-400" />
          </div>
        </div>
      </div>
    </div>
  );
}

function WikiPanel() {
  const { t } = useLanguage();
  return (
    <div className="flex h-[340px]">
      {/* Sidebar pages */}
      <div className="w-44 border-r border-white/[0.06] p-3 flex flex-col gap-1 flex-shrink-0 overflow-y-auto">
        <p className="text-[10px] text-slate-600 uppercase tracking-wider mb-2 px-1">{t('kanban.pages')}</p>
        {wikiPages.map((page) => (
          <div key={page.title}
            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs cursor-pointer transition-colors ${page.active ? 'bg-purple-500/20 text-purple-300 font-medium' : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.04]'}`}>
            <span>{page.icon}</span>
            <span className="truncate">{t(page.titleKey)}</span>
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h3 className="text-sm font-bold text-white mb-1">{t(wikiContent.titleKey)}</h3>
          <p className="text-[10px] text-slate-600 mb-4">{t(wikiContent.updatedKey)}</p>
          <div className="flex flex-col gap-4">
            {wikiContent.sections.map((sec, i) => (
              <motion.div key={sec.headingKey}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.1 }}
              >
                <h4 className="text-xs font-semibold text-slate-300 mb-1.5">{t(sec.headingKey)}</h4>
                <p className="text-xs text-slate-500 leading-relaxed">{t(sec.bodyKey)}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function ActivityPanel() {
  const { t } = useLanguage();

  const activityDataLocalized = {
    [t('kanban.today')]: [
      { user: 'A', name: 'Ardi', action: t('mock.createdTask'), detail: '"Auth flow"', color: '#10B981', icon: '+' },
      { user: 'S', name: 'Sari', action: t('mock.movedTask'), detail: '→ In Progress', color: '#3B82F6', icon: '→' },
      { user: 'K', name: 'Kevin', action: t('mock.addedComment'), detail: 'di "DB schema"', color: '#8B5CF6', icon: '💬' },
      { user: 'D', name: 'Dina', action: t('mock.editedWiki'), detail: '"API docs"', color: '#F59E0B', icon: '✎' },
    ],
    [t('kanban.yesterday')]: [
      { user: 'R', name: 'Raihan', action: t('mock.uploadedFile'), detail: '"wireframe-v3.fig"', color: '#06B6D4', icon: '↑' },
      { user: 'A', name: 'Ardi', action: t('mock.editedWiki'), detail: '"Setup Guide"', color: '#EC4899', icon: '✎' },
      { user: 'S', name: 'Sari', action: t('mock.deletedTask'), detail: '"Old prototype"', color: '#EF4444', icon: '✕' },
    ],
  };

  return (
    <div className="p-5">
      {/* Filter */}
      <div className="flex items-center gap-2 mb-4">
        {[t('kanban.allFilter'), t('kanban.taskFilter'), t('kanban.commentFilter'), t('kanban.fileFilter'), t('kanban.wikiFilter')].map((f, i) => (
          <div key={f} className={`px-2.5 py-1 rounded-lg text-[10px] font-medium ${i === 0 ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'text-slate-600 hover:text-slate-400'}`}>
            {f}
          </div>
        ))}
      </div>

      {/* Timeline */}
      <div className="flex flex-col gap-4">
        {Object.entries(activityDataLocalized).map(([dateLabel, items]) => (
          <div key={dateLabel}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{dateLabel}</span>
              <div className="flex-1 h-px bg-white/[0.06]" />
            </div>
            <div className="flex flex-col gap-2">
              {items.map((activity, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-start gap-3 p-3 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] transition-all"
                >
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-[10px] font-bold"
                    style={{ background: `${activity.color}18`, border: `1px solid ${activity.color}33`, color: activity.color }}
                  >
                    {activity.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <div className="w-3.5 h-3.5 rounded bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-[7px] font-bold text-white">
                        {activity.user}
                      </div>
                      <span className="text-[10px] font-semibold text-white">{activity.name}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-relaxed">
                      {activity.action} <span className="text-white font-medium">{activity.detail}</span>
                    </p>
                  </div>
                  <span className="text-[9px] text-slate-700 flex-shrink-0">
                    {i === 0 ? `5${t('live.minutesAgo')}` : i === 1 ? `23${t('live.minutesAgo')}` : i === 2 ? `1${t('live.hoursAgo')}` : `3${t('live.hoursAgo')}`}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function KanbanPreview() {
  const [activeTab, setActiveTab] = useState('kanban');
  const { t } = useLanguage();

  return (
    <section className="kanban-section py-24 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-blue-600/8 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-300 text-xs font-medium mb-4">
            <Layout size={12} /> {t('kanban.workspacePreview')}
          </div>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-4 tracking-tight">
            {t('kanban.heading')}{' '}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">{t('kanban.headingHighlight')}</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            {t('kanban.subtitle')}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 48 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          <div className="absolute -inset-3 bg-gradient-to-r from-blue-600/15 via-purple-600/15 to-cyan-600/15 rounded-3xl blur-2xl" />

          <div className="relative rounded-2xl border border-white/[0.08] bg-[#080d1a]/90 backdrop-blur-sm overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.6)]">
            {/* Browser chrome */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.06] bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/70" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                  <div className="w-3 h-3 rounded-full bg-green-500/70" />
                </div>
                <span className="text-xs font-semibold text-slate-500">CollabFind — Food Delivery App</span>
              </div>
              <div className="flex -space-x-1.5">
                {['A','S','K','L'].map((a) => (
                  <div key={a} className="w-6 h-6 rounded-full border-2 border-[#080d1a] flex items-center justify-center text-[9px] font-bold text-white"
                    style={{ background: avatarColors[a] }}>
                    {a}
                  </div>
                ))}
                <div className="w-6 h-6 rounded-full border-2 border-[#080d1a] bg-white/10 flex items-center justify-center text-[9px] text-slate-400">+2</div>
              </div>
            </div>

            {/* Tab bar */}
            <div className="flex border-b border-white/[0.06] bg-white/[0.015]">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-5 py-3 text-xs font-medium transition-all duration-200 border-b-2 ${
                      isActive
                        ? 'text-white border-blue-500 bg-blue-500/[0.08]'
                        : 'text-slate-500 border-transparent hover:text-slate-300 hover:bg-white/[0.03]'
                    }`}
                  >
                    <Icon size={13} />
                    {t(tab.labelKey)}
                  </button>
                );
              })}
            </div>

            {/* Tab content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === 'kanban'   && <KanbanPanel />}
                {activeTab === 'wiki'     && <WikiPanel />}
                {activeTab === 'files'    && <FileStoragePanel />}
                {activeTab === 'activity' && <ActivityPanel />}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
