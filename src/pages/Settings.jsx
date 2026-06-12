import { useLanguage } from '../i18n/LanguageContext';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Bell, Palette, Shield, LogOut, CheckCircle, Loader2, Zap, Copy, Gift, Share2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import PageNavbar from '../components/PageNavbar';
import Footer from '../components/landing/Footer';
import { SkeletonRow } from '../components/Skeleton';
import LanguageSwitcher from '../components/LanguageSwitcher';

const tabs = [
  { id: 'account', label: 'Account', icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'security', label: 'Security', icon: Shield },
];

export default function Settings() { 
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [activeTab, setActiveTab] = useState('account');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [profile, setProfile] = useState(null);
  const [emailNotifs, setEmailNotifs] = useState({
    applications: true, updates: true, messages: true, marketing: false,
  });
  const [referralCode, setReferralCode] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) {
        navigate('/login');
        return;
      }
      setSession(data.session);

      const { data: prof } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.session.user.id)
        .single();

      if (prof) {
        setProfile(prof);
        if (prof.email_notifications) {
          setEmailNotifs({ ...emailNotifs, ...prof.email_notifications });
        }
        let code = prof.referral_code;
        if (!code) {
          code = Math.random().toString(36).substring(2, 10);
          supabase.from('profiles').update({ referral_code: code }).eq('id', data.session.user.id).then(() => {}).catch(() => {});
        }
        setReferralCode(code);
      }

      setLoading(false);
    });
  }, [navigate]);

  const handleResetPassword = async () => {
    try {
      setActionLoading(true);
      setMessage({ text: '', type: '' });
      
      const { error } = await supabase.auth.resetPasswordForEmail(session.user.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
      
      setMessage({ text: 'Password reset email sent! Check your inbox.', type: 'success' });
    } catch (err) {
      setMessage({ text: err.message || 'Failed to send reset email', type: 'error' });
    } finally {
      setActionLoading(false);
      setTimeout(() => setMessage({ text: '', type: '' }), 5000);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const handleToggleNotif = async (key) => {
    const updated = { ...emailNotifs, [key]: !emailNotifs[key] };
    setEmailNotifs(updated);
    if (!session) return;
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ email_notifications: updated })
        .eq('id', session.user.id);
      if (error) throw error;
      setMessage({ text: t('settings.notifSaved'), type: 'success' });
    } catch {
      setMessage({ text: t('settings.notifSaveFail'), type: 'error' });
    }
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  const handleCopyReferral = async () => {
    await navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareReferral = async () => {
    const url = `https://collab-find.vercel.app/register?ref=${referralCode}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'CollabFind', text: 'Join CollabFind!', url });
      } catch { /* cancelled */ }
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) return (
    <div className="bg-[#050816] flex flex-col" style={{ fontFamily: "'Manrope',sans-serif" }}>
      <PageNavbar breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Settings' }]} homePath="/dashboard" />
      <main className="flex-1 pt-20 md:pt-28 pb-12 md:pb-16">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="mb-8 md:mb-10">
            <div className="h-8 w-40 animate-pulse rounded-lg bg-white/[0.06] mb-3" />
            <div className="h-3 w-72 animate-pulse rounded-lg bg-white/[0.04]" />
          </div>
          <div className="flex flex-col lg:flex-row gap-6 md:gap-8 items-start">
            <div className="w-full lg:w-64 flex-shrink-0 space-y-2">
              {Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)}
            </div>
            <div className="flex-1 w-full min-w-0">
              <div className="bg-[#0a0f1e]/80 border border-white/[0.08] rounded-2xl p-6 lg:p-8 min-h-[400px] space-y-4">
                <div className="h-5 w-48 animate-pulse rounded-lg bg-white/[0.06]" />
                <div className="h-3 w-64 animate-pulse rounded-lg bg-white/[0.04]" />
                <div className="h-10 w-full max-w-lg animate-pulse rounded-xl bg-white/[0.05]" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );

  return (
    <div className="bg-[#050816] flex flex-col" style={{ fontFamily: "'Manrope',sans-serif" }}>
      <PageNavbar breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Settings' }]} homePath="/dashboard" />
      
      <main className="flex-1 pt-20 md:pt-28 pb-12 md:pb-16">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="mb-8 md:mb-10">
            <h1 className="text-2xl md:text-3xl font-extrabold text-white" style={{ fontFamily: "'Space Grotesk',sans-serif" }}>
              Settings
            </h1>
            <p className="text-xs md:text-sm text-slate-400 mt-2">Manage your account settings and application preferences.</p>
          </div>
          
          <div className="flex flex-col lg:flex-row gap-6 md:gap-8 items-start">
            
            {/* Sidebar navigation */}
            <div className="w-full lg:w-64 flex-shrink-0">
              <nav className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-1 gap-2">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-3 px-3 md:px-4 py-2 md:py-3 rounded-xl text-xs md:text-sm font-medium transition-all whitespace-nowrap justify-center md:justify-start ${
                      activeTab === tab.id
                        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        : 'text-slate-400 hover:bg-white/[0.04] hover:text-white border border-transparent'
                    }`}
                  >
                    <tab.icon size={16} className={`flex-shrink-0 ${activeTab === tab.id ? 'text-blue-400' : 'text-slate-500'}`} />
                    <span className="hidden md:inline">{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>
            
            {/* Content area */}
            <div className="flex-1 w-full min-w-0">
              <motion.div 
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
                className="bg-[#0a0f1e]/80 border border-white/[0.08] rounded-2xl p-4 md:p-6 lg:p-8 backdrop-blur-sm shadow-xl min-h-[400px]"
              >
                
                {message.text && (
                  <div className={`mb-4 md:mb-6 p-3 md:p-4 rounded-xl border flex items-center gap-3 text-xs md:text-sm ${
                    message.type === 'success' 
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                      : 'bg-red-500/10 border-red-500/20 text-red-400'
                  }`}>
                    {message.type === 'success' && <CheckCircle size={16} className="flex-shrink-0" />}
                    {message.text}
                  </div>
                )}
                
                {/* Account Tab */}
                {activeTab === 'account' && (
                  <div className="space-y-6 md:space-y-8">
                    <div>
                      <h3 className="text-base md:text-lg font-bold text-white mb-1">Account Information</h3>
                      <p className="text-xs md:text-sm text-slate-400 mb-4 md:mb-5">Your basic account details.</p>
                      
                      <div className="space-y-4 max-w-lg">
                        <div>
                          <label className="block text-xs md:text-sm font-medium text-slate-300 mb-1.5">Email Address</label>
                          <input 
                            type="text" 
                            disabled
                            value={session.user.email}
                            className="w-full bg-white/[0.02] border border-white/[0.05] rounded-xl px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-slate-400 cursor-not-allowed"
                          />
                          <p className="text-xs text-slate-500 mt-2">Email changes are currently disabled in the beta.</p>
                        </div>
                      </div>
                    </div>
                    
                    <hr className="border-white/[0.08]" />

                    {/* Referral Section */}
                    {referralCode && (
                      <div>
                        <h3 className="text-base md:text-lg font-bold text-white mb-1">{t('ref.settingsTitle')}</h3>
                        <p className="text-xs md:text-sm text-slate-400 mb-4 md:mb-5">{t('ref.shareDesc')}</p>

                        <div className="flex flex-col sm:flex-row gap-3 max-w-lg">
                          <div className="flex-1 flex items-center gap-3 bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-2.5">
                            <Gift size={14} className="text-purple-400 flex-shrink-0" />
                            <span className="text-lg font-extrabold text-white tracking-[0.15em] font-mono select-all">
                              {referralCode}
                            </span>
                          </div>
                          <button
                            onClick={handleCopyReferral}
                            className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex-shrink-0 ${
                              copied
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-white/[0.06] text-slate-300 border border-white/[0.1] hover:bg-white/[0.1]'
                            }`}
                          >
                            {copied ? <><CheckCircle size={14} /> {t('ref.copied')}</> : <><Copy size={14} /> {t('ref.copyCode')}</>}
                          </button>
                          <button
                            onClick={handleShareReferral}
                            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-purple-500/20 border border-purple-500/30 hover:bg-purple-500/30 transition-all flex-shrink-0"
                          >
                            <Share2 size={14} /> {t('ref.share')}
                          </button>
                        </div>

                        <Link to="/referral" className="inline-block mt-3 text-xs text-blue-400 hover:text-blue-300 transition-colors">
                          {t('ref.title')} →
                        </Link>
                      </div>
                    )}

                    <hr className="border-white/[0.08]" />
                    
                    <div>
                      <h3 className="text-base md:text-lg font-bold text-white mb-1">Danger Zone</h3>
                      <p className="text-xs md:text-sm text-slate-400 mb-4 md:mb-5">Irreversible and destructive actions.</p>
                      
                      <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                        <button 
                          onClick={handleSignOut}
                          className="flex items-center justify-center gap-2 px-4 md:px-5 py-2 md:py-2.5 rounded-xl text-xs md:text-sm font-semibold text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-colors"
                        >
                          <LogOut size={16} /> Sign Out
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Notifications Tab */}
                {activeTab === 'notifications' && (
                  <div className="space-y-6 md:space-y-8">
                    <div>
                      <h3 className="text-base md:text-lg font-bold text-white mb-1">{t('settings.notifTitle')}</h3>
                      <p className="text-xs md:text-sm text-slate-400 mb-4 md:mb-5">{t('settings.notifDesc')}</p>

                      <div className="space-y-3 md:space-y-4">
                        {[
                          { key: 'applications', title: t('settings.notifApplications'), desc: t('settings.notifApplicationsDesc') },
                          { key: 'updates',      title: t('settings.notifUpdates'),      desc: t('settings.notifUpdatesDesc') },
                          { key: 'messages',     title: t('settings.notifMessages'),     desc: t('settings.notifMessagesDesc') },
                          { key: 'marketing',    title: t('settings.notifMarketing'),    desc: t('settings.notifMarketingDesc') },
                        ].map((item) => {
                          const on = emailNotifs[item.key];
                          return (
                            <div key={item.key} className="flex items-center justify-between p-3 md:p-4 rounded-xl border border-white/[0.05] bg-white/[0.01] gap-3">
                              <div className="min-w-0">
                                <div className="text-xs md:text-sm font-medium text-white">{item.title}</div>
                                <div className="text-xs text-slate-500 mt-0.5">{item.desc}</div>
                              </div>
                              <button
                                onClick={() => handleToggleNotif(item.key)}
                                className={`relative inline-block w-10 md:w-12 h-6 flex-shrink-0 rounded-full transition-colors cursor-pointer ${on ? 'bg-blue-500' : 'bg-white/[0.12]'}`}
                              >
                                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${on ? 'left-1 translate-x-5 md:translate-x-6' : 'left-1 translate-x-0'}`} />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Appearance Tab */}
                {activeTab === 'appearance' && (
                  <div className="space-y-6 md:space-y-8">
                    <div>
                      <h3 className="text-base md:text-lg font-bold text-white mb-1">Theme</h3>
                      <p className="text-xs md:text-sm text-slate-400 mb-4 md:mb-5">Customize the look of CollabFind.</p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 max-w-lg">
                        <div className="p-3 md:p-4 rounded-xl border-2 border-blue-500 bg-[#0a0f1e] text-center cursor-pointer">
                          <div className="w-14 md:w-16 h-9 md:h-10 mx-auto bg-[#050816] rounded-md border border-white/10 mb-2 md:mb-3 overflow-hidden">
                            <div className="h-2 md:h-3 bg-white/5 border-b border-white/10" />
                            <div className="flex p-1 gap-1">
                              <div className="w-3 md:w-4 h-3 md:h-4 rounded-sm bg-blue-500/20 border border-blue-500/30" />
                              <div className="flex-1 space-y-1 mt-1">
                                <div className="h-1 bg-white/10 rounded-full w-full" />
                                <div className="h-1 bg-white/10 rounded-full w-2/3" />
                              </div>
                            </div>
                          </div>
                          <div className="text-xs md:text-sm font-semibold text-blue-400">Dark Mode</div>
                        </div>
                        <div className="p-3 md:p-4 rounded-xl border-2 border-transparent bg-white/[0.03] text-center cursor-not-allowed opacity-50">
                          <div className="w-14 md:w-16 h-9 md:h-10 mx-auto bg-white rounded-md border border-slate-200 mb-2 md:mb-3 overflow-hidden">
                            <div className="h-2 md:h-3 bg-slate-100 border-b border-slate-200" />
                            <div className="flex p-1 gap-1">
                              <div className="w-3 md:w-4 h-3 md:h-4 rounded-sm bg-blue-100 border border-blue-200" />
                              <div className="flex-1 space-y-1 mt-1">
                                <div className="h-1 bg-slate-200 rounded-full w-full" />
                                <div className="h-1 bg-slate-200 rounded-full w-2/3" />
                              </div>
                            </div>
                          </div>
                          <div className="text-xs md:text-sm font-medium text-slate-400">Light Mode (Coming Soon)</div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-base md:text-lg font-bold text-white mb-1">Language</h3>
                      <p className="text-xs md:text-sm text-slate-400 mb-4 md:mb-5">Choose your preferred language.</p>
                      <LanguageSwitcher variant="settings" />
                    </div>
                  </div>
                )}

                {/* Security Tab */}
                {activeTab === 'security' && (
                  <div className="space-y-6 md:space-y-8">
                    <div>
                      <h3 className="text-base md:text-lg font-bold text-white mb-1">Password</h3>
                      <p className="text-xs md:text-sm text-slate-400 mb-4 md:mb-5">Update your password securely.</p>
                      
                      <button 
                        onClick={handleResetPassword}
                        disabled={actionLoading}
                        className="flex items-center justify-center gap-2 px-4 md:px-5 py-2 md:py-2.5 rounded-xl text-xs md:text-sm font-semibold text-white bg-white/[0.08] hover:bg-white/[0.12] transition-colors border border-white/[0.1] disabled:opacity-50 w-full md:w-auto"
                      >
                        {actionLoading ? <Loader2 size={16} className="animate-spin" /> : null}
                        Send Password Reset Link
                      </button>
                      <p className="text-xs text-slate-500 mt-3">We will send an email to {session.user.email} with instructions to reset your password.</p>
                    </div>
                  </div>
                )}

              </motion.div>
            </div>
            
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
