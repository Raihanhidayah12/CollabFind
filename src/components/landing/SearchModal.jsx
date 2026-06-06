/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Users, Folder, FileText, GitBranch, Globe, Briefcase, Camera, MessageSquare, Calendar, Trophy, Star, BookOpen, Lock } from 'lucide-react';
import { supabase } from '../../utils/supabaseClient';
import { useAuth } from '../AuthProvider';

// Icon mapping for pages
const ICON_MAP = {
  Folder: Folder,
  Users: Users,
  FileText: FileText,
  MessageSquare: MessageSquare,
  Calendar: Calendar,
  Trophy: Trophy,
  Star: Star,
  BookOpen: BookOpen,
  Globe: Globe,
  Briefcase: Briefcase,
  Camera: Camera,
  GitBranch: GitBranch,
  Lock: Lock,
};

// Page links configuration (matching Footer links)
const PAGE_LINKS = [
  // Product pages
  { label: 'Features', href: '/features', category: 'Product', icon: 'Star' },
  { label: 'Explore Projects', href: '/explore', category: 'Product', icon: 'Folder' },
  { label: 'Find Teammates', href: '/teammates', category: 'Product', icon: 'Users' },
  { label: 'Portfolio Generator', href: '/portfolio-generator', category: 'Product', icon: 'Briefcase' },
  
  // Resources
  { label: 'Documentation', href: '/docs', category: 'Resources', icon: 'BookOpen' },
  { label: 'API Reference', href: '/api', category: 'Resources', icon: 'FileText' },
  { label: 'Blog', href: '/blog', category: 'Resources', icon: 'Globe' },
  { label: 'Changelog', href: '/changelog', category: 'Resources', icon: 'GitBranch' },
  { label: 'Status', href: '/status', category: 'Resources', icon: 'Zap' },
  
  // Community
  { label: 'Discord', href: '/discord', category: 'Community', icon: 'MessageSquare' },
  { label: 'Forum', href: '/forum', category: 'Community', icon: 'MessageSquare' },
  { label: 'Events', href: '/events', category: 'Community', icon: 'Calendar' },
  { label: 'Hackathons', href: '/hackathons', category: 'Community', icon: 'Trophy' },
  { label: 'Newsletter', href: '/newsletter', category: 'Community', icon: 'Star' },
  
  // Company
  { label: 'About Us', href: '/about', category: 'Company', icon: 'Globe' },
  { label: 'Careers', href: '/careers', category: 'Company', icon: 'Briefcase' },
  { label: 'Press Kit', href: '/press', category: 'Company', icon: 'Camera' },
  { label: 'Privacy Policy', href: '/privacy', category: 'Company', icon: 'Lock' },
  { label: 'Terms of Service', href: '/terms', category: 'Company', icon: 'Lock' },
  
  // Auth
  { label: 'Login', href: '/login', category: 'Auth', icon: 'Lock' },
  { label: 'Register', href: '/register', category: 'Auth', icon: 'Lock' },
];

export default function SearchModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [projects, setProjects] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const { session } = useAuth();

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
    if (!isOpen) {
      setQuery('');
      setProjects([]);
      setProfiles([]);
    }
  }, [isOpen]);

  // Keyboard support (Escape to close)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Search when query changes
  useEffect(() => {
    if (!query.trim()) {
      setProjects([]);
      setProfiles([]);
      return;
    }

    const searchTimeout = setTimeout(async () => {
      setLoading(true);
      const q = query.toLowerCase();

      // Search projects
      const { data: projectsData } = await supabase
        .from('projects')
        .select('id, title, description, skills_needed, status')
        .or(`title.ilike.%${q}%,description.ilike.%${q}%`)
        .limit(5);

      // Search profiles
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, name, job_title, skills')
        .or(`name.ilike.%${q}%,job_title.ilike.%${q}%`)
        .limit(5);

      setProjects(projectsData || []);
      setProfiles(profilesData || []);
      setLoading(false);
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [query]);

  // Search pages
  const filteredPages = query.trim()
    ? PAGE_LINKS.filter(page =>
        page.label.toLowerCase().includes(query.toLowerCase())
      )
    : PAGE_LINKS.slice(0, 8); // Show popular pages when no query

  const handleResultClick = (href) => {
    navigate(href);
    onClose();
  };

  const handleProjectClick = (projectId) => {
    navigate(`/project/${projectId}`);
    onClose();
  };

const handleProfileClick = (profileId) => {
    if (session) {
      navigate(`/profile/${profileId}`);
    } else {
      navigate('/login', { state: { from: `/profile/${profileId}` } });
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed top-[15%] left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl mx-4"
          >
            <div className="bg-[#0a0f1e]/95 backdrop-blur-xl rounded-2xl border border-white/[0.1] shadow-[0_24px_64px_rgba(0,0,0,0.5)] overflow-hidden">
              {/* Search Input */}
              <div className="relative flex items-center px-4 py-3 border-b border-white/[0.08]">
                <Search size={18} className="text-slate-500 flex-shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search projects, teammates, pages..."
                  className="flex-1 px-3 py-2 bg-transparent text-white placeholder-slate-500 text-sm outline-none"
                  autoComplete="off"
                />
                {query && (
                  <button
                    onClick={() => setQuery('')}
                    className="p-1.5 text-slate-500 hover:text-white transition-colors"
                  >
                    <X size={14} />
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="ml-2 px-2 py-1 text-xs text-slate-500 hover:text-white bg-white/[0.05] hover:bg-white/[0.1] rounded transition-colors"
                >
                  ESC
                </button>
              </div>

              {/* Results */}
              <div className="max-h-[60vh] overflow-y-auto">
                {loading ? (
                  <div className="p-8 text-center text-slate-500">
                    <div className="w-6 h-6 border-2 border-slate-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-sm">Searching...</p>
                  </div>
                ) : !query.trim() && filteredPages.length > 0 ? (
                  /* Show popular pages when no query */
                  <div className="p-3">
                    <p className="px-3 py-2 text-xs text-slate-500 font-medium uppercase tracking-wider">
                      Quick Links
                    </p>
                    <div className="space-y-1">
                      {filteredPages.slice(0, 8).map((page) => {
                        const Icon = ICON_MAP[page.icon] || FileText;
                        return (
                          <button
                            key={page.href}
                            onClick={() => handleResultClick(page.href)}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm text-slate-300 hover:text-white hover:bg-white/[0.06] transition-all"
                          >
                            <div className="w-8 h-8 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center">
                              <Icon size={14} className="text-slate-500" />
                            </div>
                            <span>{page.label}</span>
                            <span className="ml-auto text-xs text-slate-600">{page.category}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  /* Show search results */
                  <div className="p-3 space-y-4">
                    {/* Projects */}
                    {projects.length > 0 && (
                      <div>
                        <p className="px-3 py-2 text-xs text-slate-500 font-medium uppercase tracking-wider">
                          Projects
                        </p>
                        <div className="space-y-1">
                          {projects.map((project) => (
                            <button
                              key={project.id}
                              onClick={() => handleProjectClick(project.id)}
                              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-white/[0.06] transition-all group"
                            >
                              <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                                <Folder size={14} className="text-blue-400" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-white truncate group-hover:text-blue-300">
                                  {project.title}
                                </p>
                                <p className="text-xs text-slate-500 truncate">
                                  {project.description}
                                </p>
                              </div>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                project.status === 'open' ? 'text-green-400 bg-green-400/10' :
                                project.status === 'ongoing' ? 'text-blue-400 bg-blue-400/10' :
                                'text-slate-400 bg-slate-400/10'
                              }`}>
                                {project.status}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Profiles */}
                    {profiles.length > 0 && (
                      <div>
                        <p className="px-3 py-2 text-xs text-slate-500 font-medium uppercase tracking-wider">
                          Teammates
                        </p>
                        <div className="space-y-1">
                          {profiles.map((profile) => (
                            <button
                              key={profile.id}
                              onClick={() => handleProfileClick(profile.id)}
                              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-white/[0.06] transition-all group"
                            >
                              <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                                <Users size={14} className="text-purple-400" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-white truncate group-hover:text-purple-300">
                                  {profile.name || 'Anonymous'}
                                </p>
                                <p className="text-xs text-slate-500 truncate">
                                  {profile.job_title || 'Builder'}
                                </p>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Pages */}
                    {filteredPages.length > 0 && (
                      <div>
                        <p className="px-3 py-2 text-xs text-slate-500 font-medium uppercase tracking-wider">
                          {query.trim() ? 'Pages' : 'More Links'}
                        </p>
                        <div className="space-y-1">
                          {filteredPages.map((page) => {
                            const Icon = ICON_MAP[page.icon] || FileText;
                            return (
                              <button
                                key={page.href}
                                onClick={() => handleResultClick(page.href)}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm text-slate-300 hover:text-white hover:bg-white/[0.06] transition-all"
                              >
                                <div className="w-8 h-8 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center">
                                  <Icon size={14} className="text-slate-500" />
                                </div>
                                <span>{page.label}</span>
                                <span className="ml-auto text-xs text-slate-600">{page.category}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* No results */}
                    {!loading && projects.length === 0 && profiles.length === 0 && filteredPages.length === 0 && query.trim() && (
                      <div className="p-8 text-center">
                        <Search size={32} className="text-slate-500/50 mx-auto mb-3" />
                        <p className="text-white font-medium mb-1">No results found</p>
                        <p className="text-sm text-slate-500">Try searching for something else</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer hint */}
              <div className="px-4 py-2.5 border-t border-white/[0.06] flex items-center gap-4 text-xs text-slate-600">
                <span className="flex items-center gap-1">
                  <span className="px-1.5 py-0.5 bg-white/[0.06] rounded">↑</span>
                  <span className="px-1.5 py-0.5 bg-white/[0.06] rounded">↓</span>
                  navigate
                </span>
                <span className="flex items-center gap-1">
                  <span className="px-1.5 py-0.5 bg-white/[0.06] rounded">↵</span>
                  select
                </span>
                <span className="flex items-center gap-1">
                  <span className="px-1.5 py-0.5 bg-white/[0.06] rounded">esc</span>
                  close
                </span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
