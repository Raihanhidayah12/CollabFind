import { useLanguage } from '../i18n/LanguageContext';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Camera, Save, Loader2, CheckCircle, X, Plus, GitBranch, Link as LinkIcon, Globe, ExternalLink, Link2, Zap, Briefcase, DollarSign } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import PageNavbar from '../components/PageNavbar';
import Footer from '../components/landing/Footer';
import { SkeletonCard } from '../components/Skeleton';

export default function Profile() { 
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  
  const [formData, setFormData] = useState({
    name: '',
    job_title: '',
    bio: '',
    skills: [],
    avatar_url: '',
    location: ''
  });
  const [customSkill, setCustomSkill] = useState('');
  const [portfolio, setPortfolio] = useState(null);
  const [links, setLinks] = useState({ github_url: '', linkedin_url: '', website_url: '' });
  const portfolioHref = links.website_url?.trim() || (portfolio?.username ? `/portfolio/${portfolio.username}` : '');
  const portfolioIsExternal = Boolean(links.website_url?.trim());
  const [freelancer, setFreelancer] = useState({
    is_freelancer: false,
    hourly_rate: '',
    availability: 'not_available',
    service_categories: [],
  });

  async function fetchProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (error) throw error;
      
      if (data) {
        setFormData({
          name: data.name || '',
          job_title: data.job_title || '',
          bio: data.bio || '',
          skills: Array.isArray(data.skills) ? data.skills : (data.skills ? data.skills : []),
          avatar_url: data.avatar_url || '',
          location: data.location || ''
        });
        // Backward compatibility: old data used profiles.portofolio_url for personal portfolio links.
        if (data.portofolio_url) {
          setLinks(l => ({ ...l, website_url: l.website_url || data.portofolio_url }));
        }
        setFreelancer({
          is_freelancer: data.is_freelancer || false,
          hourly_rate: data.hourly_rate?.toString() || '',
          availability: data.availability || 'not_available',
          service_categories: Array.isArray(data.service_categories) ? data.service_categories : [],
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchPortfolio(userId) {
    const { data } = await supabase
      .from('user_portfolios')
      .select('username, github_url, linkedin_url, website_url')
      .eq('user_id', userId)
      .maybeSingle();
    if (data) {
      setPortfolio(data);
      const collabfindUrl = data.username
        ? `${window.location.origin}/portfolio/${data.username}`
        : '';
      setLinks(prev => ({
        github_url: data.github_url || '',
        linkedin_url: data.linkedin_url || '',
        website_url: data.website_url || prev.website_url || collabfindUrl,
      }));
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        navigate('/login');
        return;
      }
      setSession(data.session);
      fetchProfile(data.session.user.id);
      fetchPortfolio(data.session.user.id);
    });
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!session) return;
    
    try {
      setSaving(true);
      setMessage({ text: '', type: '' });
      
      const skillsArray = Array.isArray(formData.skills)
        ? formData.skills.filter(s => s.trim().length > 0)
        : formData.skills.split(',').map(s => s.trim()).filter(s => s.length > 0);

      const updates = {
        id: session.user.id,
        name: formData.name || null,
        job_title: formData.job_title || null,
        bio: formData.bio || null,
        skills: skillsArray.length > 0 ? skillsArray : null,
        avatar_url: formData.avatar_url?.trim() || null,
        location: formData.location || null,
        portofolio_url: links.website_url?.trim() || null,
        is_freelancer: freelancer.is_freelancer,
        hourly_rate: freelancer.hourly_rate ? parseInt(freelancer.hourly_rate) : null,
        availability: freelancer.availability,
        service_categories: freelancer.service_categories.length > 0 ? freelancer.service_categories : null,
      };

      const { error } = await supabase
        .from('profiles')
        .upsert(updates, { onConflict: 'id' });

      if (error) {
        console.error('Supabase upsert error:', JSON.stringify(error, null, 2));
        throw error;
      }
      
      setMessage({ text: 'Profile berhasil disimpan!', type: 'success' });

      // Also save links to user_portfolios if portfolio exists
      if (portfolio) {
        await supabase.from('user_portfolios').update({
          github_url: links.github_url || null,
          linkedin_url: links.linkedin_url || null,
          website_url: links.website_url || null,
        }).eq('user_id', session.user.id);
      }
    } catch (err) {
      setMessage({ text: err.message || 'Failed to update profile', type: 'error' });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage({ text: '', type: '' }), 5000);
    }
  };

  if (loading) return (
    <div className="bg-[#050816] flex flex-col" style={{ fontFamily: "'Manrope',sans-serif" }}>
      <PageNavbar breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'My Profile' }]} homePath="/dashboard" />
      <main className="flex-1 pt-28 pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <div className="h-8 w-48 animate-pulse rounded-lg bg-white/[0.06] mb-3" />
            <div className="h-3 w-96 animate-pulse rounded-lg bg-white/[0.04]" />
          </div>
          <SkeletonCard lines={5} />
        </div>
      </main>
    </div>
  );

  return (
    <div className="bg-[#050816] flex flex-col" style={{ fontFamily: "'Manrope',sans-serif" }}>
      <PageNavbar breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'My Profile' }]} homePath="/dashboard" />
      
      <main className="flex-1 pt-28 pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <h1 className="text-3xl font-extrabold text-white" style={{ fontFamily: "'Space Grotesk',sans-serif" }}>
              My Profile
            </h1>
            <p className="text-slate-400 mt-2">Manage your personal information and how others see you on CollabFind.</p>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#0a0f1e]/80 border border-white/[0.08] rounded-2xl p-6 sm:p-8 backdrop-blur-sm shadow-2xl relative overflow-hidden"
          >
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />
            
            <form onSubmit={handleSubmit} className="relative z-10">
              
              <div className="flex flex-col sm:flex-row gap-8 mb-10 items-start">
                {/* Avatar Preview */}
                <div className="flex flex-col items-center gap-3">
                  <div className="w-28 h-28 rounded-2xl bg-[#050816] border border-white/[0.08] overflow-hidden flex items-center justify-center shadow-lg relative group">
                    {formData.avatar_url ? (
                      <img src={formData.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-4xl text-slate-600 font-bold">{formData.name ? formData.name[0].toUpperCase() : 'U'}</span>
                    )}
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="text-white" size={24} />
                    </div>
                  </div>
                  <div className="text-xs text-slate-500 text-center max-w-[120px]">
                    Your avatar makes it easier to recognize you
                  </div>
                </div>
                
                <div className="flex-1 space-y-5 w-full">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Full Name</label>
                    <input 
                      type="text" 
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="e.g. John Doe"
                      className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Job Title / Role</label>
                    <input 
                      type="text" 
                      name="job_title"
                      value={formData.job_title}
                      onChange={handleChange}
                      placeholder="e.g. Full Stack Developer, Product Designer"
                      className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 transition-colors"
                    />
                    <div className="flex flex-wrap gap-2 mt-2">
                      {[
                        'Frontend Developer',
                        'Backend Developer',
                        'Full Stack Developer',
                        'Mobile Developer',
                        'UI/UX Designer',
                        'Product Designer',
                        'Product Manager',
                        'DevOps Engineer',
                        'Data Scientist',
                        'Machine Learning Engineer',
                        'QA Engineer',
                        'Blockchain Developer',
                      ].map(role => (
                        <button
                          key={role}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, job_title: role }))}
                          className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all ${
                            formData.job_title === role
                              ? 'bg-blue-500/25 border-blue-500/50 text-blue-300'
                              : 'bg-white/[0.04] border-white/[0.08] text-slate-400 hover:text-white hover:border-white/20 hover:bg-white/[0.07]'
                          }`}
                        >
                          {role}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-slate-600 mt-1.5">Pilih opsi di atas atau ketik sendiri.</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Avatar URL</label>
                  <input 
                    type="url" 
                    name="avatar_url"
                    value={formData.avatar_url}
                    onChange={handleChange}
                    placeholder="https://example.com/your-image.png"
                    className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 transition-colors text-sm"
                  />
                  <p className="text-xs text-slate-500 mt-2">Provide a valid image URL for your profile picture.</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Bio</label>
                  <textarea 
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows="4"
                    placeholder="Tell others a bit about yourself, your experience, and what you're looking for..."
                    className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 transition-colors resize-none"
                  ></textarea>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Location</label>
                  <input 
                    type="text" 
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="e.g. Jakarta, Indonesia"
                    className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 transition-colors"
                  />
                  <p className="text-xs text-slate-500 mt-1.5">Where are you based? This helps teammates find you by region.</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Skills</label>

                  {/* Selected Skills as Tags */}
                  {formData.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {formData.skills.map(skill => (
                        <span
                          key={skill}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/20 border border-blue-500/40 text-blue-300 text-xs font-semibold"
                        >
                          {skill}
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }))}
                            className="text-blue-300/60 hover:text-red-400 transition-colors"
                          >
                            <X size={11} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Custom Skill Input */}
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={customSkill}
                      onChange={e => setCustomSkill(e.target.value)}
                      onKeyDown={e => {
                        if ((e.key === 'Enter' || e.key === ',') && customSkill.trim()) {
                          e.preventDefault();
                          const s = customSkill.trim().replace(/,$/, '');
                          if (s && !formData.skills.includes(s)) {
                            setFormData(prev => ({ ...prev, skills: [...prev.skills, s] }));
                          }
                          setCustomSkill('');
                        }
                      }}
                      placeholder="Ketik skill lalu tekan Enter..."
                      className="flex-1 bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 transition-colors text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const s = customSkill.trim();
                        if (s && !formData.skills.includes(s)) {
                          setFormData(prev => ({ ...prev, skills: [...prev.skills, s] }));
                        }
                        setCustomSkill('');
                      }}
                      className="px-3 py-2.5 rounded-xl bg-blue-500/20 border border-blue-500/30 text-blue-400 hover:bg-blue-500/30 transition-all"
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  {/* Skill Suggestion Chips */}
                  <div className="flex flex-wrap gap-2">
                    {[
                      'React', 'Vue.js', 'Angular', 'Next.js', 'TypeScript', 'JavaScript',
                      'Node.js', 'Express.js', 'Python', 'Django', 'FastAPI', 'Go',
                      'Flutter', 'React Native', 'Swift', 'Kotlin',
                      'Figma', 'Adobe XD', 'UI/UX Design', 'Tailwind CSS',
                      'PostgreSQL', 'MongoDB', 'MySQL', 'Supabase', 'Firebase',
                      'Docker', 'Kubernetes', 'AWS', 'Git',
                      'Machine Learning', 'TensorFlow', 'PyTorch',
                      'Solidity', 'Web3.js',
                    ].map(skill => {
                      const selected = formData.skills.includes(skill);
                      return (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              skills: selected
                                ? prev.skills.filter(s => s !== skill)
                                : [...prev.skills, skill]
                            }));
                          }}
                          className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all ${
                            selected
                              ? 'bg-blue-500/25 border-blue-500/50 text-blue-300'
                              : 'bg-white/[0.04] border-white/[0.08] text-slate-400 hover:text-white hover:border-white/20 hover:bg-white/[0.07]'
                          }`}
                        >
                          {selected ? '✓ ' : ''}{skill}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-xs text-slate-600 mt-2">Pilih skill di atas atau ketik sendiri. Skill yang dipilih muncul sebagai tag di atas.</p>
                </div>
              </div>

              {/* Freelancer / Open for Work Section */}
              <div className="mt-8 pt-8 border-t border-white/[0.08]">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Briefcase size={16} className="text-purple-400" /> Open for Work
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">Aktifkan untuk muncul di Freelance Marketplace dan menerima tawaran kerja.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFreelancer(f => ({ ...f, is_freelancer: !f.is_freelancer }))}
                    className={`relative w-11 h-6 rounded-full transition-colors ${freelancer.is_freelancer ? 'bg-green-500' : 'bg-white/[0.1]'}`}
                  >
                    <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${freelancer.is_freelancer ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
                  </button>
                </div>

                {freelancer.is_freelancer && (
                  <div className="space-y-4 pl-0">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1.5">
                          <span className="flex items-center gap-1"><DollarSign size={11} /> Hourly Rate (USD)</span>
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={freelancer.hourly_rate}
                          onChange={e => setFreelancer(f => ({ ...f, hourly_rate: e.target.value }))}
                          placeholder="45"
                          className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 transition-colors text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1.5">Availability</label>
                        <select
                          value={freelancer.availability}
                          onChange={e => setFreelancer(f => ({ ...f, availability: e.target.value }))}
                          className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500/50 transition-colors text-sm appearance-none"
                        >
                          <option value="available" className="bg-[#0a0f1e]">Available</option>
                          <option value="busy" className="bg-[#0a0f1e]">Busy</option>
                          <option value="not_available" className="bg-[#0a0f1e]">Not Available</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">Service Categories</label>
                      <div className="flex flex-wrap gap-2">
                        {['Web Development', 'Mobile App', 'UI/UX Design', 'Data & Analytics', 'Writing', 'Marketing', 'DevOps', 'Blockchain'].map(cat => {
                          const selected = freelancer.service_categories.includes(cat);
                          return (
                            <button
                              key={cat}
                              type="button"
                              onClick={() => setFreelancer(f => ({
                                ...f,
                                service_categories: selected
                                  ? f.service_categories.filter(c => c !== cat)
                                  : [...f.service_categories, cat]
                              }))}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                                selected
                                  ? 'bg-purple-500/20 border-purple-500/40 text-purple-300'
                                  : 'bg-white/[0.04] border-white/[0.08] text-slate-400 hover:text-white hover:border-white/20'
                              }`}
                            >
                              {selected ? '✓ ' : ''}{cat}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <Link
                      to="/freelance/dashboard"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-purple-300 border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 transition-all"
                    >
                      <Briefcase size={12} /> Go to Freelance Dashboard
                    </Link>
                  </div>
                )}
              </div>

              {/* Links & Portfolio Section */}
              <div className="mt-8 pt-8 border-t border-white/[0.08]">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Link2 size={16} className="text-blue-400" /> Links & Portfolio
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">Hubungkan akun dan tampilkan portfoliomu kepada recruiter.</p>
                  </div>
                  {portfolioHref ? (
                    <a
                      href={portfolioHref}
                      target={portfolioIsExternal ? '_blank' : undefined}
                      rel={portfolioIsExternal ? 'noopener noreferrer' : undefined}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-purple-300 border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 transition-all"
                    >
                      <ExternalLink size={12} /> Lihat Portfolio
                    </a>
                  ) : (
                    <Link
                      to="/dashboard/portfolio"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-purple-300 border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 transition-all"
                    >
                      <Plus size={12} /> Buat Portfolio
                    </Link>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                      <GitBranch size={16} />
                    </div>
                    <input
                      type="url"
                      value={links.github_url}
                      onChange={e => setLinks(l => ({ ...l, github_url: e.target.value }))}
                      placeholder="https://github.com/username"
                      className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 transition-colors text-sm"
                    />
                  </div>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                      <LinkIcon size={16} />
                    </div>
                    <input
                      type="url"
                      value={links.linkedin_url}
                      onChange={e => setLinks(l => ({ ...l, linkedin_url: e.target.value }))}
                      placeholder="https://linkedin.com/in/username"
                      className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 transition-colors text-sm"
                    />
                  </div>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                      <Globe size={16} />
                    </div>
                    <input
                      type="url"
                      value={links.website_url}
                      onChange={e => setLinks(l => ({ ...l, website_url: e.target.value }))}
                      placeholder="https://mywebsite.com atau portfolio pribadi"
                      className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 transition-colors text-sm"
                    />
                  </div>
                </div>
              </div>
              
              {/* Messages & Actions */}
              <div className="mt-10 pt-6 border-t border-white/[0.08] flex items-center justify-between">
                <div>
                  {message.text && (
                    <div className={`flex items-center gap-2 text-sm ${message.type === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>
                      {message.type === 'success' && <CheckCircle size={16} />}
                      {message.text}
                    </div>
                  )}
                </div>
                <button 
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-6 py-2.5 rounded-xl font-semibold shadow-lg shadow-blue-900/20 transition-all disabled:opacity-50"
                >
                  {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  Save Changes
                </button>
              </div>
              
            </form>
          </motion.div>
          
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
