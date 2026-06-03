import { Zap, GitBranch, Globe, Briefcase, Camera } from 'lucide-react';
import { Link } from 'react-router-dom';

const links = {
  Product:    [
    { label: 'Features',           to: '/#features' },
    { label: 'Explore Projects',   to: '/explore' },
    { label: 'Find Teammates',     to: '/explore' },
    { label: 'Portfolio Generator',to: '/profile' },
  ],
  Resources:  [
    { label: 'Documentation', to: '/docs' },
    { label: 'API Reference',  to: '/api' },
    { label: 'Blog',           to: '/blog' },
    { label: 'Changelog',      to: '/changelog' },
    { label: 'Status',         to: '/status' },
  ],
  Community:  [
    { label: 'Discord',      to: '/discord' },
    { label: 'Forum',        to: '/forum' },
    { label: 'Events',       to: '/events' },
    { label: 'Hackathons',   to: '/hackathons' },
    { label: 'Newsletter',   to: '/newsletter' },
  ],
  Company:    [
    { label: 'About Us',        to: '/about' },
    { label: 'Careers',         to: '/careers' },
    { label: 'Press Kit',       to: '/press' },
    { label: 'Privacy Policy',  to: '/privacy' },
    { label: 'Terms of Service',to: '/terms' },
  ],
};

const socials = [
  { icon: GitBranch, href: '#', label: 'GitHub' },
  { icon: Globe,     href: '#', label: 'Twitter' },
  { icon: Briefcase, href: '#', label: 'LinkedIn' },
  { icon: Camera,    href: '#', label: 'Instagram' },
];

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.06] bg-[#030712]/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

        {/* Top */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-[0_0_16px_rgba(59,130,246,0.4)]">
                <Zap size={16} className="text-white" />
              </div>
              <span className="text-white font-bold text-lg tracking-tight">
                Collab<span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Find</span>
              </span>
            </Link>
            <p className="text-sm text-slate-500 leading-relaxed mb-5 max-w-xs">
              The collaboration platform for students, developers, and creators to build amazing projects together.
            </p>
            <div className="flex gap-3">
              {socials.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-lg border border-white/[0.08] bg-white/[0.03] flex items-center justify-center text-slate-500 hover:text-white hover:border-white/[0.15] hover:bg-white/[0.07] transition-all duration-200"
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(links).map(([section, items]) => (
            <div key={section}>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">{section}</h4>
              <ul className="flex flex-col gap-2.5">
                {items.map((item) => (
                  <li key={item.label}>
                    <Link to={item.to} className="text-sm text-slate-500 hover:text-slate-300 transition-colors duration-200">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="flex flex-col sm:flex-row items-center justify-between pt-8 border-t border-white/[0.05] gap-4">
          <p className="text-xs text-slate-600">
            © {new Date().getFullYear()} CollabFind. All rights reserved.
          </p>
          <div className="flex items-center gap-1 text-xs text-slate-600">
            Built with
            <span className="mx-1">⚡</span>
            React, Vite, Tailwind CSS & Supabase
          </div>
        </div>
      </div>
    </footer>
  );
}
