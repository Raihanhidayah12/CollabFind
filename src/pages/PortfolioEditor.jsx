/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { Loader2, Save, LayoutTemplate, Link as LinkIcon, GitBranch, Briefcase, Globe, CheckCircle2, Circle, User, Code2, AlertCircle, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageNavbar from '../components/PageNavbar';

export default function PortfolioEditor() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  
  const [portfolio, setPortfolio] = useState({
    username: '',
    headline: '',
    bio: '',
    github_url: '',
    linkedin_url: '',
    website_url: '',
    show_testimonials: true,
    featured_project_ids: []
  });

  const [profile, setProfile] = useState({
    full_name: '',
    skills: []
  });

  const [skillsInput, setSkillsInput] = useState('');
  const [availableProjects, setAvailableProjects] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });
    // eslint-disable-next-line react-hooks/immutability
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUser(user);

      // Fetch user's profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileData) {
        setProfile({
          name: profileData.name || '',
          skills: profileData.skills || []
        });
        setSkillsInput((profileData.skills || []).join(', '));
      }

      // Fetch user's portfolio if exists
      const { data: portfolioData } = await supabase
        .from('user_portfolios')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (portfolioData) {
        setPortfolio({
          ...portfolioData,
          featured_project_ids: portfolioData.featured_project_ids || []
        });
      } else {
        const defaultUsername = user.email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '') + Math.floor(Math.random() * 1000);
        setPortfolio(prev => ({ ...prev, username: defaultUsername }));
      }

      // Fetch user's completed projects
      const { data: createdProjects } = await supabase
        .from('projects')
        .select('*')
        .eq('creator_id', user.id)
        .eq('status', 'completed');
        
      const { data: applications } = await supabase
        .from('applications')
        .select('project_id')
        .eq('applicant_id', user.id)
        .eq('status', 'accepted');
        
      const applicantProjectIds = applications?.map(app => app.project_id) || [];
      let memberProjects = [];
      if (applicantProjectIds.length > 0) {
        const { data: appProjs } = await supabase
          .from('projects')
          .select('*')
          .in('id', applicantProjectIds)
          .eq('status', 'completed');
        if (appProjs) memberProjects = appProjs;
      }

      const allProjects = [...(createdProjects || []), ...memberProjects];
      const uniqueProjects = Array.from(new Map(allProjects.map(item => [item.id, item])).values());
      
      setAvailableProjects(uniqueProjects);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPortfolio(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSkillsChange = (e) => {
    setSkillsInput(e.target.value);
    const parsedSkills = e.target.value.split(',').map(s => s.trim()).filter(s => s !== '');
    setProfile(prev => ({ ...prev, skills: parsedSkills }));
  };

  const toggleProject = (projectId) => {
    setPortfolio(prev => {
      const currentIds = prev.featured_project_ids || [];
      if (currentIds.includes(projectId)) {
        return { ...prev, featured_project_ids: currentIds.filter(id => id !== projectId) };
      } else {
        return { ...prev, featured_project_ids: [...currentIds, projectId] };
      }
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      if (!portfolio.username.trim()) {
         setMessage('Username cannot be empty.');
         setSaving(false);
         return;
      }

      const { data: existingUser } = await supabase
        .from('user_portfolios')
        .select('id, user_id')
        .eq('username', portfolio.username)
        .maybeSingle();

      if (existingUser && existingUser.user_id !== user.id) {
        setMessage('Username is already taken.');
        setSaving(false);
        return;
      }

      // Save Portfolio
      const { error: pfError } = await supabase
        .from('user_portfolios')
        .upsert({
          user_id: user.id,
          username: portfolio.username.toLowerCase(),
          headline: portfolio.headline,
          bio: portfolio.bio,
          github_url: portfolio.github_url,
          linkedin_url: portfolio.linkedin_url,
          website_url: portfolio.website_url,
          show_testimonials: portfolio.show_testimonials,
          featured_project_ids: portfolio.featured_project_ids
        }, { onConflict: 'user_id' });

      if (pfError) throw pfError;

      // Save Profile (Name & Skills)
      const { error: profError } = await supabase
        .from('profiles')
        .update({
          name: profile.name,
          skills: profile.skills
        })
        .eq('id', user.id);

      if (profError) throw profError;

      setMessage('Portfolio saved successfully! Your public page is updated.');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error saving portfolio:', error);
      setMessage('Failed to save portfolio.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#06080F]">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#06080F] text-white font-sans relative overflow-x-hidden flex flex-col">
      <PageNavbar breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Portfolio Generator' }]} homePath="/dashboard" />

      <div className="relative flex-1 p-6 lg:p-10">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-6xl mx-auto space-y-8 relative z-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/5 pb-8 animate-fade-in-up">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-500/20 bg-blue-500/10 text-blue-400 text-xs font-semibold mb-4">
              <User size={14} /> Personal Brand
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight mb-2">Portfolio Editor</h1>
            <p className="text-slate-400 text-lg max-w-xl">Curate your professional presence to match your public page.</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            {portfolio.username && (
              <Link 
                to={`/portfolio/${portfolio.username}`} 
                target="_blank"
                className="flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-semibold transition-all hover:scale-105"
              >
                <LayoutTemplate className="w-4 h-4" />
                View Public Page
              </Link>
            )}
            <button 
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 rounded-xl text-sm font-semibold transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] hover:scale-105"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? 'Saving...' : 'Save Portfolio'}
            </button>
          </div>
        </div>

        {message && (
          <div className={`p-4 rounded-2xl text-sm font-medium animate-fade-in-up flex items-center gap-3 ${
            message.includes('success') 
              ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
              : 'bg-red-500/10 text-red-400 border border-red-500/20'
          }`}>
            <CheckCircle2 className="w-5 h-5" />
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          
          {/* Main Form Column */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Profile Identity */}
            <div className="bg-[#0F1423]/80 backdrop-blur-xl rounded-3xl p-8 border border-white/5 shadow-2xl">
              <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                  <User className="w-5 h-5 text-blue-400" />
                </div>
                Profile Identity
              </h2>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">Display Name</label>
                    <input 
                      type="text" 
                      name="name"
                      value={profile.name}
                      onChange={handleProfileChange}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all hover:bg-white/10"
                      placeholder="John Doe"
                    />
                    <p className="text-xs text-slate-500 mt-2">Appears as your main heading.</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">Public URL Username</label>
                    <div className="flex shadow-sm rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-500/50 transition-all border border-white/10">
                      <span className="px-3 py-3 bg-white/5 text-slate-400 text-sm font-medium flex items-center border-r border-white/10">
                        /portfolio/
                      </span>
                      <input 
                        type="text" 
                        name="username"
                        value={portfolio.username}
                        onChange={handleChange}
                        className="flex-1 bg-white/5 px-3 py-3 text-white focus:outline-none font-medium transition-colors hover:bg-white/10"
                        placeholder="johndoe"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Professional Headline</label>
                  <input 
                    type="text" 
                    name="headline"
                    value={portfolio.headline}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all hover:bg-white/10"
                    placeholder="e.g. Senior Fullstack Developer & Open Source Contributor"
                  />
                  <p className="text-xs text-slate-500 mt-2">Appears right under your name on the public page.</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">About Me (Bio)</label>
                  <textarea 
                    name="bio"
                    value={portfolio.bio}
                    onChange={handleChange}
                    rows={5}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all hover:bg-white/10 resize-none leading-relaxed"
                    placeholder="Tell visitors about your journey, what you build, and what drives you..."
                  />
                </div>
              </div>
            </div>

            {/* Tools & Tech Stack */}
            <div className="bg-[#0F1423]/80 backdrop-blur-xl rounded-3xl p-8 border border-white/5 shadow-2xl">
              <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                  <Code2 className="w-5 h-5 text-purple-400" />
                </div>
                Tools & Tech Stack
              </h2>
              
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Your Skills (Comma separated)</label>
                <input 
                  type="text" 
                  value={skillsInput}
                  onChange={handleSkillsChange}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all hover:bg-white/10"
                  placeholder="React, Node.js, Tailwind CSS, PostgreSQL"
                />
                <p className="text-xs text-slate-500 mt-2">These will appear as badges in the "Tools & Tech Stack" section on your portfolio.</p>
                
                {profile.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {profile.skills.map((skill, i) => (
                      <span key={i} className="px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-lg text-xs font-semibold text-purple-300">
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Connect & Socials */}
            <div className="bg-[#0F1423]/80 backdrop-blur-xl rounded-3xl p-8 border border-white/5 shadow-2xl">
              <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                  <Globe className="w-5 h-5 text-emerald-400" />
                </div>
                Connect & Socials
              </h2>
              
              <div className="space-y-5">
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <GitBranch className="h-5 w-5 text-slate-400 group-focus-within:text-white transition-colors" />
                  </div>
                  <input 
                    type="url" 
                    name="github_url"
                    value={portfolio.github_url}
                    onChange={handleChange}
                    className="w-full pl-12 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all hover:bg-white/10"
                    placeholder="https://github.com/username"
                  />
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Briefcase className="h-5 w-5 text-slate-400 group-focus-within:text-blue-400 transition-colors" />
                  </div>
                  <input 
                    type="url" 
                    name="linkedin_url"
                    value={portfolio.linkedin_url}
                    onChange={handleChange}
                    className="w-full pl-12 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all hover:bg-white/10"
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Globe className="h-5 w-5 text-slate-400 group-focus-within:text-emerald-400 transition-colors" />
                  </div>
                  <input 
                    type="url" 
                    name="website_url"
                    value={portfolio.website_url}
                    onChange={handleChange}
                    className="w-full pl-12 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all hover:bg-white/10"
                    placeholder="https://yourwebsite.com"
                  />
                </div>
              </div>
            </div>
            
          </div>

          {/* Sidebar Column */}
          <div className="space-y-8">
            
            {/* Project Showcase Settings */}
            <div className="bg-[#0F1423]/80 backdrop-blur-xl rounded-3xl p-8 border border-white/5 shadow-2xl flex flex-col max-h-[600px]">
              <div className="mb-6">
                <h2 className="text-xl font-bold mb-2">Featured Projects</h2>
                <p className="text-sm text-slate-400">Select the completed projects you want to pin to your portfolio.</p>
              </div>
              
              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
                {availableProjects.length === 0 ? (
                  <div className="text-center py-12 px-4 bg-white/5 rounded-2xl border border-white/10">
                    <p className="text-slate-400 text-sm font-medium leading-relaxed">
                      No completed projects found.<br/> Finish a project to showcase it here!
                    </p>
                  </div>
                ) : (
                  availableProjects.map(project => {
                    const isSelected = portfolio.featured_project_ids.includes(project.id);
                    return (
                      <div 
                        key={project.id}
                        onClick={() => toggleProject(project.id)}
                        className={`group flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-all duration-200 ${
                          isSelected 
                            ? 'bg-blue-500/10 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.15)]' 
                            : 'bg-white/5 border-white/5 hover:border-white/20 hover:bg-white/10'
                        }`}
                      >
                        <div className="mt-0.5 shrink-0 transition-transform group-hover:scale-110">
                          {isSelected ? (
                            <CheckCircle2 className="w-5 h-5 text-blue-500" />
                          ) : (
                            <Circle className="w-5 h-5 text-slate-600" />
                          )}
                        </div>
                        <div>
                          <h4 className={`text-sm font-bold leading-tight mb-1 ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                            {project.title}
                          </h4>
                          {project.category && (
                            <span className="inline-block px-2.5 py-0.5 bg-black/30 rounded-md text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                              {project.category}
                          </span>
                          )}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>

            {/* Visibility Settings */}
            <div className="bg-[#0F1423]/80 backdrop-blur-xl rounded-3xl p-8 border border-white/5 shadow-2xl">
              <h2 className="text-xl font-bold mb-6">Recommendations</h2>
              
              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl mb-6 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <p className="text-xs text-blue-300 leading-relaxed">
                  Recommendations are automatically pulled from testimonials left by your team members.
                </p>
              </div>

              <label className="flex items-start gap-4 cursor-pointer group">
                <div className="relative flex items-center justify-center shrink-0 mt-0.5">
                  <input 
                    type="checkbox" 
                    name="show_testimonials"
                    checked={portfolio.show_testimonials}
                    onChange={handleChange}
                    className="peer sr-only"
                  />
                  <div className="w-6 h-6 bg-white/5 border border-white/20 rounded-md peer-checked:bg-blue-600 peer-checked:border-blue-500 transition-all shadow-inner"></div>
                  <CheckCircle2 className="w-4 h-4 text-white absolute opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
                </div>
                <div>
                  <span className="text-sm font-bold text-white block mb-1">Display on Portfolio</span>
                  <p className="text-xs text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">
                    If disabled, the entire Recommendations section will be hidden from public view.
                  </p>
                </div>
              </label>
            </div>

          </div>
        </div>
      </div>
      </div>
    </div>
  );
}