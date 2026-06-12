import { useLanguage } from '../i18n/LanguageContext';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Gift, Copy, CheckCircle, Users, Star, Shield, Crown, Award, Share2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import PageNavbar from '../components/PageNavbar';
import Footer from '../components/landing/Footer';

const BADGE_TIERS = [
  { min: 0,  key: 'Scout',          icon: Star,    color: '#94A3B8', descKey: 'ref.badgeDescScout' },
  { min: 1,  key: 'Connector',      icon: Users,   color: '#3B82F6', descKey: 'ref.badgeDescConnector' },
  { min: 5,  key: 'Founding',       icon: Shield,  color: '#8B5CF6', descKey: 'ref.badgeDescFounding' },
  { min: 10, key: 'Ambassador',     icon: Crown,   color: '#F59E0B', descKey: 'ref.badgeDescAmbassador' },
];

function getBadge(count) {
  let badge = BADGE_TIERS[0];
  for (const tier of BADGE_TIERS) {
    if (count >= tier.min) badge = tier;
  }
  return badge;
}

export default function Referral() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [referralCode, setReferralCode] = useState('');
  const [referrals, setReferrals] = useState([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) { navigate('/login'); return; }
      setSession(data.session);

      const { data: prof } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.session.user.id)
        .single();

      if (prof) {
        let code = prof.referral_code;
        if (!code) {
          code = Math.random().toString(36).substring(2, 10);
          await supabase.from('profiles').update({ referral_code: code }).eq('id', data.session.user.id).catch(() => {});
        }
        setReferralCode(code);
      }

      try {
        const { data: refs } = await supabase
          .from('referrals')
          .select('id, referred_id, created_at')
          .eq('referrer_id', data.session.user.id)
          .order('created_at', { ascending: false });

        if (refs && refs.length > 0) {
          const referredIds = refs.map(r => r.referred_id);
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, name, avatar_url, created_at')
            .in('id', referredIds);

          const enriched = refs.map(r => ({
            ...r,
            profile: profiles?.find(p => p.id === r.referred_id),
          }));
          setReferrals(enriched);
        }
      } catch {
        // Referrals table may not exist yet
      }

      setLoading(false);
    });
  }, [navigate]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    const url = `https://collab-find.vercel.app/register?ref=${referralCode}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'CollabFind',
          text: 'Join CollabFind and find your perfect project team!',
          url,
        });
      } catch {
        // User cancelled share
      }
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const badge = getBadge(referrals.length);
  const BadgeIcon = badge.icon;

  if (loading) return (
    <div className="bg-[#050816] flex items-center justify-center min-h-screen">
      <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="bg-[#050816] flex flex-col min-h-screen" style={{ fontFamily: "'Manrope',sans-serif" }}>
      <PageNavbar breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: t('ref.title') }]} homePath="/dashboard" />

      <main className="flex-1 pt-20 md:pt-28 pb-12 md:pb-16">
        <div className="max-w-3xl mx-auto px-3 sm:px-6 lg:px-8">

          {/* Header */}
          <div className="mb-8 md:mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-xs font-medium mb-4">
              <Gift size={12} /> {t('ref.title')}
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white" style={{ fontFamily: "'Space Grotesk',sans-serif" }}>
              {t('ref.shareTitle')}
            </h1>
            <p className="text-xs md:text-sm text-slate-400 mt-2">{t('ref.shareDesc')}</p>
          </div>

          {/* Referral Code Card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-purple-500/20 bg-[#0a0f1e]/80 p-5 md:p-6 mb-6 text-center"
          >
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">{t('ref.yourCode')}</p>
            <div className="text-3xl md:text-4xl font-extrabold text-white tracking-[0.2em] font-mono mb-5 select-all" style={{ fontFamily: "'Space Grotesk',sans-serif" }}>
              {referralCode}
            </div>
            <div className="flex justify-center gap-3">
              <button
                onClick={handleCopy}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  copied
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-white/[0.06] text-slate-300 border border-white/[0.1] hover:bg-white/[0.1]'
                }`}
              >
                {copied ? <><CheckCircle size={15} /> {t('ref.copied')}</> : <><Copy size={15} /> {t('ref.copyCode')}</>}
              </button>
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-purple-500/20 border border-purple-500/30 hover:bg-purple-500/30 transition-all"
              >
                <Share2 size={15} /> {t('ref.share')}
              </button>
            </div>
          </motion.div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="rounded-2xl border border-white/[0.07] bg-[#0a0f1e]/70 p-5"
            >
              <p className="text-xs text-slate-500 mb-1">{t('ref.totalReferrals')}</p>
              <p className="text-3xl font-extrabold text-white" style={{ fontFamily: "'Space Grotesk',sans-serif" }}>
                {referrals.length}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-2xl border border-white/[0.07] bg-[#0a0f1e]/70 p-5"
            >
              <p className="text-xs text-slate-500 mb-1">{t('ref.currentBadge')}</p>
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: `${badge.color}18`, border: `1px solid ${badge.color}40` }}
                >
                  <BadgeIcon size={16} style={{ color: badge.color }} />
                </div>
                <p className="text-lg font-extrabold text-white" style={{ fontFamily: "'Space Grotesk',sans-serif" }}>
                  {t(`ref.badge${badge.key}`)}
                </p>
              </div>
            </motion.div>
          </div>

          {/* Badge Tiers */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-2xl border border-white/[0.07] bg-[#0a0f1e]/70 p-5 md:p-6 mb-6"
          >
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Badge Tiers</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {BADGE_TIERS.map(tier => {
                const Icon = tier.icon;
                const isActive = badge.key === tier.key;
                return (
                  <div
                    key={tier.key}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      isActive
                        ? 'border-white/[0.15] bg-white/[0.04]'
                        : 'border-white/[0.05] bg-white/[0.01] opacity-50'
                    }`}
                  >
                    <div
                      className="w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center"
                      style={{ background: `${tier.color}18`, border: `1px solid ${tier.color}33` }}
                    >
                      <Icon size={18} style={{ color: tier.color }} />
                    </div>
                    <p className="text-xs font-bold text-white">{t(`ref.badge${tier.key}`)}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{t(tier.descKey)}</p>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Referral History */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl border border-white/[0.07] bg-[#0a0f1e]/70 p-5 md:p-6"
          >
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">{t('ref.history')}</p>

            {referrals.length === 0 ? (
              <div className="text-center py-8">
                <Award size={32} className="text-slate-700 mx-auto mb-3" />
                <p className="text-sm text-slate-500">{t('ref.noHistory')}</p>
              </div>
            ) : (
              <div className="space-y-2">
                {referrals.map((ref, i) => {
                  const p = ref.profile;
                  const initial = (p?.name || 'U')[0].toUpperCase();
                  const colors = ['#3B82F6','#8B5CF6','#06B6D4','#10B981','#F59E0B','#EC4899'];
                  const color = colors[i % colors.length];
                  return (
                    <motion.div
                      key={ref.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center gap-3 p-3 rounded-xl border border-white/[0.05] bg-white/[0.02]"
                    >
                      {p?.avatar_url?.startsWith('http') ? (
                        <img src={p.avatar_url} alt="" className="w-9 h-9 rounded-lg object-cover" />
                      ) : (
                        <div
                          className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm text-white flex-shrink-0"
                          style={{ background: `${color}20`, border: `1px solid ${color}40` }}
                        >
                          {initial}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{p?.name || 'User'}</p>
                        <p className="text-[10px] text-slate-600">
                          {t('ref.joinedOn')} {ref.created_at ? new Date(ref.created_at).toLocaleDateString() : '—'}
                        </p>
                      </div>
                      <CheckCircle size={14} className="text-emerald-400 flex-shrink-0" />
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
