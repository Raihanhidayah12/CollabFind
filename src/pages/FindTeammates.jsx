import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Lock, MessageSquare, Search, Sparkles, UserPlus, Users } from 'lucide-react';
import { supabase } from '../utils/supabaseClient';
import PageNavbar from '../components/PageNavbar';
import Footer from '../components/landing/Footer';
import { SkeletonCard } from '../components/Skeleton';
import { useLanguage } from '../i18n/LanguageContext';

function firstName(name) {
  return (name || 'Builder').split(' ')[0];
}

export default function FindTeammates() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [session, setSession] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [myProjects, setMyProjects] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [invitingId, setInvitingId] = useState(null);
  const [visibleCount, setVisibleCount] = useState(12);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession));
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data } = await supabase
        .from('profiles')
        .select('id, name, bio, skills, job_title, avatar_url')
        .order('created_at', { ascending: false })
        .limit(48);
      setProfiles(data || []);
      setLoading(false);
    }
    load();
  }, []);

  useEffect(() => {
    if (!session) return;
    supabase
      .from('projects')
      .select('id, title')
      .eq('creator_id', session.user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => setMyProjects(data || []));
  }, [session]);

  const visibleProfiles = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = q
      ? profiles.filter(profile =>
          profile.name?.toLowerCase().includes(q) ||
          profile.job_title?.toLowerCase().includes(q) ||
          (profile.skills || []).some(skill => skill.toLowerCase().includes(q))
        )
      : profiles;
    return base;
  }, [profiles, query]);

  const displayedProfiles = visibleProfiles.slice(0, visibleCount);
  const hasMore = visibleProfiles.length > visibleCount;

  async function handleInvite(profile) {
    if (!session) {
      navigate('/login', { state: { from: '/teammates' } });
      return;
    }

    if (!myProjects.length) {
      navigate('/create-project');
      return;
    }

    if (invitingId) return;
    setInvitingId(profile.id);

    let convId = null;
    const { data: memberRows } = await supabase
      .from('conversation_members')
      .select('conversation_id')
      .eq('user_id', session.user.id);

    if (memberRows?.length) {
      const convIds = memberRows.map(row => row.conversation_id);
      const { data: dmConvs } = await supabase
        .from('conversations')
        .select('id')
        .eq('type', 'dm')
        .in('id', convIds);

      if (dmConvs?.length) {
        const { data: theirMemberships } = await supabase
          .from('conversation_members')
          .select('conversation_id')
          .eq('user_id', profile.id)
          .in('conversation_id', dmConvs.map(conv => conv.id));

        convId = theirMemberships?.[0]?.conversation_id || null;
      }
    }

    if (!convId) {
      convId = crypto.randomUUID();
      await supabase.from('conversations').insert({ id: convId, type: 'dm', name: null });
      await supabase.from('conversation_members').insert([
        { conversation_id: convId, user_id: session.user.id },
        { conversation_id: convId, user_id: profile.id },
      ]);
    }

await supabase.from('messages').insert({
      id: crypto.randomUUID(),
      conversation_id: convId,
      sender_id: session.user.id,
      type: 'text',
      content: `Halo ${firstName(profile.name)}! Saya tertarik mengajak kamu ngobrol soal proyek ${myProjects[0].title}.`,
    });

    // Create project invitation for the invited user
    await supabase.from('invitations').upsert({
      project_id: myProjects[0].id,
      inviter_id: session.user.id,
      invitee_id: profile.id,
      status: 'pending'
    }, { onConflict: 'project_id,invitee_id' });

    setInvitingId(null);
    navigate(`/dashboard/chat?conv=${convId}`);
  }

  return (
    <div className="bg-[#050816] text-white font-['Manrope',sans-serif]">
      <PageNavbar breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Find Teammates' }]} homePath="/dashboard" />

      <main className="relative pt-28 pb-16 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-1/3 w-[520px] h-[360px] bg-purple-600/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-20 right-0 w-[420px] h-[360px] bg-blue-600/8 rounded-full blur-[110px]" />
        </div>

        <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-xs font-semibold mb-4">
              <Users size={12} /> Talent directory
            </div>
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
              <div>
                <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight" style={{ fontFamily: "'Space Grotesk',sans-serif" }}>
                  {t('tm.title')} <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">{t('tm.titleHighlight')}</span>
                </h1>
                <p className="text-slate-400 mt-3 max-w-2xl">
                  {t('tm.subtitle')}
                </p>
              </div>
              {session ? (
                <div className="flex items-center gap-2 text-sm text-emerald-300">
                  <Sparkles size={15} /> Smart search aktif
                </div>
              ) : (
                <Link to="/register" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-blue-500 to-purple-600">
                  Login untuk akses penuh <ArrowRight size={14} />
                </Link>
              )}
            </div>
          </motion.div>

          <div className="relative mb-6">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              value={query}
              onChange={event => setQuery(event.target.value)}
              placeholder="Cari skill, role, atau nama..."
              className="w-full rounded-xl bg-white/[0.04] border border-white/[0.08] pl-11 pr-4 py-3 text-sm text-white placeholder-slate-600 outline-none focus:border-blue-500/50"
            />
          </div>

          {!session && (
            <div className="mb-6 rounded-2xl border border-yellow-500/20 bg-yellow-500/8 p-4 flex items-start gap-3 text-sm text-yellow-200">
              <Lock size={16} className="mt-0.5 flex-shrink-0" />
              <p>Mode publik hanya menampilkan data terbatas. Login untuk membuka profil penuh, rekomendasi skill, dan tombol hubungi talenta.</p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <SkeletonCard key={index} lines={2} />
              ))
            ) : visibleProfiles.length === 0 ? (
              <div className="col-span-full text-center py-20">
                <p className="text-white font-bold mb-1">Belum ada talenta yang cocok.</p>
                <p className="text-sm text-slate-500">Coba keyword skill lain.</p>
              </div>
            ) : (
              displayedProfiles.map((profile, index) => {
                const displayName = session ? (profile.name || 'Anonymous') : firstName(profile.name);
                const initial = (displayName || 'B')[0].toUpperCase();
                return (
                  <motion.div
                    key={profile.id}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
                    className="rounded-2xl border border-white/[0.08] bg-[#0a0f1e]/75 p-5 hover:border-white/[0.16] transition-all"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      {session && profile.avatar_url?.startsWith('http') ? (
                        <img src={profile.avatar_url} alt={displayName} className="w-12 h-12 rounded-xl object-cover" />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/25 to-purple-500/25 border border-white/[0.1] flex items-center justify-center font-bold">
                          {initial}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-bold text-white truncate">{displayName}</p>
                        <p className="text-sm text-slate-500 truncate">{profile.job_title || 'Builder'}</p>
                      </div>
                    </div>

                    <p className="text-sm text-slate-500 leading-relaxed min-h-[42px]">
                      {session ? (profile.bio || 'Terbuka untuk kolaborasi proyek baru.') : 'Profil lengkap dan kontak tersedia setelah login.'}
                    </p>

                    <div className="flex flex-wrap gap-1.5 mt-4 mb-5">
                      {(profile.skills || []).slice(0, session ? 6 : 3).map(skill => (
                        <span key={skill} className="px-2 py-0.5 rounded-md bg-white/[0.05] border border-white/[0.07] text-xs text-slate-400">
                          {skill}
                        </span>
                      ))}
                    </div>

                    {session ? (
                      <button
                        onClick={() => handleInvite(profile)}
                        disabled={invitingId === profile.id || profile.id === session.user.id}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-blue-500 to-purple-600 disabled:opacity-45 disabled:cursor-not-allowed"
                      >
                        {invitingId === profile.id ? 'Membuka chat...' : myProjects.length ? 'Hubungi Talenta' : 'Buat Project Dulu'}
                        <MessageSquare size={14} />
                      </button>
                    ) : (
                      <Link
                        to="/login"
                        state={{ from: '/teammates' }}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-slate-300 border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08]"
                      >
                        Lihat Profil <UserPlus size={14} />
                      </Link>
                    )}
                  </motion.div>
                );
              })
            )}
          </div>

          {hasMore && (
            <div className="flex justify-center mt-8">
              <button
                onClick={() => setVisibleCount(prev => prev + 12)}
                className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-white/[0.06] border border-white/[0.1] hover:bg-white/[0.1] transition-all"
              >
                Load More ({visibleProfiles.length - visibleCount} remaining)
              </button>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
