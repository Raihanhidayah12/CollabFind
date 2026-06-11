import { Zap, GitBranch, Globe, Briefcase, Camera } from 'lucide-react';
import { Link } from 'react-router-dom';

const links = {
  Platform: [
    { label: 'Explore Projects',    to: '/explore' },
    { label: 'Find Teammates',      to: '/teammates' },
    { label: 'Dashboard',           to: '/dashboard' },
    { label: 'Portfolio',           to: '/portfolio-generator' },
  ],
  Resources: [
    { label: 'Features',     to: '/features' },
    { label: 'Hackathons',   to: '/hackathons' },
    { label: 'Forum',        to: '/forum' },
    { label: 'Blog',         to: '/blog' },
  ],
  Company: [
    { label: 'About Us',         to: '/about' },
    { label: 'Privacy Policy',   to: '/privacy' },
    { label: 'Terms of Service', to: '/terms' },
  ],
};

const socials = [
  { icon: GitBranch, href: '#', label: 'GitHub' },
  { icon: Globe,     href: '#', label: 'Twitter' },
  { icon: Briefcase, href: '#', label: 'LinkedIn' },
  { icon: Camera,    href: '#', label: 'Instagram' },
];

export default function AuthFooter() {
  return (
    <footer className="border-t border-white/[0.06] bg-[#030712]/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/dashboard" className="flex items-center gap-2.5 mb-3">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-[0_0_12px_rgba(59,130,246,0.3)]">
                <Zap size={14} className="text-white" />
              </div>
              <span className="text-white font-bold tracking-tight">
                Collab<span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Find</span>
              </span>
            </Link>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              Build cool things together.
            </p>
            <div className="flex gap-2">
              {socials.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-8 h-8 rounded-lg border border-white/[0.06] bg-white/[0.02] flex items-center justify-center text-slate-600 hover:text-white hover:border-white/[0.12] transition-all"
                >
                  <Icon size={13} />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(links).map(([section, items]) => (
            <div key={section}>
              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">{section}</h4>
              <ul className="flex flex-col gap-2">
                {items.map((item) => (
                  <li key={item.label}>
                    <Link to={item.to} className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="flex items-center justify-between pt-6 border-t border-white/[0.04]">
          <p className="text-[11px] text-slate-600">
            &copy; {new Date().getFullYear()} CollabFind
          </p>
          <p className="text-[11px] text-slate-700">
            Built with React, Vite, Tailwind CSS &amp; Supabase
          </p>
        </div>
      </div>
    </footer>
  );
}
