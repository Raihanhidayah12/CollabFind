import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import { GitBranch, Briefcase, Globe, MapPin, Calendar, ExternalLink, ArrowRight, Star, Loader2, Zap, Code2, User } from 'lucide-react';
import Footer from '../components/landing/Footer';

// A custom navbar for the portfolio page
function PortfolioNavbar({ portfolioName }) {
  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#06080F]/80 backdrop-blur-xl border-b border-white/[0.05]">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Zap size={16} className="text-white" />
            </div>
            <span className="font-bold text-white hidden sm:block tracking-tight">CollabFind</span>
          </Link>

          <div className="hidden sm:flex items-center text-slate-600 text-sm">
            <span className="mx-2">/</span>
            <span className="text-slate-400">Portfolio</span>
            <span className="mx-2">/</span>
            <span className="text-slate-300 font-medium truncate max-w-[150px]">{portfolioName}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <button onClick={() => scrollTo('about')} className="text-sm font-medium text-slate-400 hover:text-white transition-colors">About</button>
          <button onClick={() => scrollTo('projects')} className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Projects</button>
          <button onClick={() => scrollTo('recommendations')} className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Testimonials</button>
        </div>
        
        <div>
          <span className="text-sm font-semibold bg-white/10 px-3 py-1.5 rounded-full text-white border border-white/10">
            {portfolioName}
          </span>
        </div>
      </div>
    </nav>
  );
}

export default function PublicPortfolio() {
  const { username } = useParams();
  const [loading, setLoading] = useState(true);
  const [portfolio, setPortfolio] = useState(null);
  const [profile, setProfile] = useState(null);
  const [projects, setProjects] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [collabScore, setCollabScore] = useState(0);
  
  useEffect(() => {
    fetchPortfolio();
  }, [username]);

  const fetchPortfolio = async () => {
    try {
      setLoading(true);
      
      const { data: pfData, error: pfError } = await supabase
        .from('user_portfolios')
        .select('*')
        .eq('username', username)
        .single();
        
      if (pfError || !pfData) {
        setLoading(false);
        return;
      }
      
      setPortfolio(pfData);
      
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', pfData.user_id)
        .single();
        
      if (profileData) setProfile(profileData);
      
      if (pfData.featured_project_ids && pfData.featured_project_ids.length > 0) {
        const { data: projectsData } = await supabase
          .from('projects')
          .select('*')
          .in('id', pfData.featured_project_ids);
          
        if (projectsData) {
          const enrichedProjects = await Promise.all(projectsData.map(async (proj) => {
            let role = 'Member';
            if (proj.creator_id === pfData.user_id) {
              role = 'Lead Developer / Creator';
            } else {
              const { data: appData } = await supabase
                .from('applications')
                .select('role')
                .eq('project_id', proj.id)
                .eq('applicant_id', pfData.user_id)
                .maybeSingle();
              if (appData && appData.role) {
                role = appData.role;
              }
            }
            return { ...proj, userRole: role };
          }));
          
          setProjects(enrichedProjects);
        }
      }

      // Fetch user ratings
      const { data: ratingsData } = await supabase
        .from('user_ratings')
        .select('score')
        .eq('ratee_id', pfData.user_id);
        
      if (ratingsData && ratingsData.length > 0) {
        const total = ratingsData.reduce((sum, r) => sum + r.score, 0);
        setCollabScore(Math.round(total / ratingsData.length));
      } else {
        setCollabScore(0);
      }

      if (pfData.show_testimonials) {
        const { data: testData } = await supabase
          .from('user_testimonials')
          .select('*')
          .eq('user_id', pfData.user_id)
          .order('created_at', { ascending: false });
        
        if (testData) setTestimonials(testData);
      }
      
    } catch (error) {
      console.error('Error fetching portfolio:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#06080F] flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
        </div>
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="min-h-screen bg-[#06080F] flex flex-col text-white">
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
          <h1 className="text-4xl font-bold mb-4">Portfolio Not Found</h1>
          <p className="text-gray-400 mb-8 max-w-md">The portfolio you are looking for does not exist or has been removed.</p>
          <Link to="/" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-full font-medium transition-all">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  const displayName = profile?.name || profile?.full_name || portfolio.username;
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-[#06080F] text-white font-sans selection:bg-blue-500/30">
      <PortfolioNavbar portfolioName={displayName} />
      
      <main className="pt-28 pb-20">
        
        {/* Hero Section */}
        <section className="relative px-6 pt-12 pb-24 lg:pt-20 lg:pb-32 overflow-hidden max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12">
          {/* Background Elements */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />
          
          <div className="flex-1 relative z-10 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-slate-300 text-xs font-semibold mb-6">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" /> Available for opportunities
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight mb-6 text-white leading-[1.1]">
              Hi, I'm <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">{displayName}</span>
            </h1>
            
            {portfolio.headline && (
              <p className="text-2xl text-slate-400 font-medium mb-10 max-w-2xl leading-relaxed">
                {portfolio.headline}
              </p>
            )}
            
            {/* Social Links */}
            <div className="flex gap-4">
              {portfolio.github_url && (
                <a href={portfolio.github_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all hover:scale-105 font-medium">
                  <GitBranch className="w-5 h-5" /> GitHub
                </a>
              )}
              {portfolio.linkedin_url && (
                <a href={portfolio.linkedin_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-5 py-2.5 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20 rounded-xl transition-all hover:scale-105 font-medium">
                  <Briefcase className="w-5 h-5" /> LinkedIn
                </a>
              )}
              {portfolio.website_url && (
                <a href={portfolio.website_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-xl transition-all hover:scale-105 font-medium">
                  <Globe className="w-5 h-5" /> Website
                </a>
              )}
            </div>
          </div>
          
          <div className="relative z-10 animate-fade-in-up flex-shrink-0" style={{ animationDelay: '200ms' }}>
            <div className="relative w-56 h-56 lg:w-72 lg:h-72">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full blur-2xl opacity-40 animate-pulse" />
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Profile" className="relative w-full h-full rounded-full border-4 border-[#06080F] object-cover shadow-2xl" />
              ) : (
                <div className="relative w-full h-full rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-7xl font-bold border-4 border-[#06080F] shadow-2xl">
                  {initial}
                </div>
              )}
              
              {/* Floating Badge */}
              <div className="absolute -bottom-4 -right-4 bg-[#0F1423] border border-white/10 px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <Star className={`w-5 h-5 ${collabScore > 0 ? 'text-yellow-400 fill-yellow-400' : 'text-purple-400'}`} />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">Collaboration Score</p>
                  <p className="text-sm font-bold">{collabScore > 0 ? `${collabScore}/100` : 'Not Rated Yet'}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* About & Tools Section */}
        <section id="about" className="px-6 py-24 bg-[#0A0E1A] border-y border-white/[0.03]">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                  <User className="w-5 h-5 text-blue-400" />
                </div>
                <h2 className="text-3xl font-bold">About Me</h2>
              </div>
              <div className="prose prose-invert prose-lg text-slate-400">
                <p className="leading-relaxed whitespace-pre-wrap">
                  {portfolio.bio || "This user is currently building amazing things but hasn't updated their bio yet."}
                </p>
              </div>
            </div>
            
            <div className="bg-[#0F1423] p-8 rounded-3xl border border-white/5">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                  <Code2 className="w-5 h-5 text-purple-400" />
                </div>
                <h2 className="text-2xl font-bold">Tools & Tech Stack</h2>
              </div>
              
              <div className="flex flex-wrap gap-2.5">
                {profile?.skills && profile.skills.length > 0 ? (
                  profile.skills.map((skill, index) => (
                    <span 
                      key={index} 
                      className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-sm font-medium hover:bg-white/10 hover:border-white/20 transition-all cursor-default"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <p className="text-slate-500 italic">No specific tools listed yet.</p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Showcase Grid */}
        <section id="projects" className="px-6 py-24 max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold mb-4">Featured Projects</h2>
            <p className="text-slate-400 text-lg">A selection of my best work and contributions on CollabFind.</p>
          </div>
          
          {projects.length === 0 ? (
            <div className="text-center py-20 bg-[#0F1423] rounded-3xl border border-white/5">
              <p className="text-slate-500 text-lg">No featured projects yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {projects.map((project, idx) => (
                <div 
                  key={project.id} 
                  className="group relative bg-[#0F1423] rounded-3xl border border-white/5 hover:border-blue-500/30 p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(59,130,246,0.1)] flex flex-col"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-2xl font-bold mb-2 group-hover:text-blue-400 transition-colors">{project.title}</h3>
                      <span className="inline-flex items-center px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-full text-xs font-bold tracking-widest uppercase">
                        Role: {project.userRole}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-slate-400 text-base leading-relaxed mb-8 flex-1">
                    {project.description || "A collaborative project built on CollabFind."}
                  </p>
                  
                  <div className="mt-auto pt-6 border-t border-white/5 flex justify-between items-center">
                    <div className="flex flex-wrap gap-2">
                      {(project.skills_needed || ['JavaScript', 'React']).slice(0, 3).map((skill, i) => (
                        <span key={i} className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-medium text-slate-300">
                          {skill}
                        </span>
                      ))}
                    </div>
                    
                    <Link to={`/project/${project.id}`} state={{ from: location.pathname }} className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white hover:bg-blue-600 transition-colors shrink-0">
                      <ArrowRight className="w-4 h-4 group-hover:-rotate-45 transition-transform" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Testimonials Section */}
        {portfolio.show_testimonials && (
          <section id="recommendations" className="px-6 py-24 bg-[#0A0E1A] border-y border-white/[0.03]">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-4xl font-extrabold mb-4">Recommendations</h2>
                <p className="text-slate-400 text-lg">What teammates and collaborators say about working with me.</p>
              </div>
              
              {testimonials.length === 0 ? (
                <div className="text-center py-16 bg-[#0F1423] rounded-3xl border border-white/5 max-w-3xl mx-auto">
                  <Star className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400 text-lg font-medium">No recommendations yet.</p>
                  <p className="text-slate-500 text-sm mt-2">Testimonials from past projects will appear here.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {testimonials.map((test) => (
                    <div key={test.id} className="bg-[#0F1423] p-8 rounded-3xl border border-white/5 relative hover:border-yellow-500/20 transition-all">
                      <div className="flex gap-1 mb-6 text-yellow-400">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < (test.rating || 5) ? 'fill-current' : 'text-slate-600'}`} />
                        ))}
                      </div>
                      <p className="text-slate-300 text-sm leading-relaxed mb-8 italic">
                        "{test.content}"
                      </p>
                      <div className="flex items-center gap-4 mt-auto">
                        {test.reviewer_avatar ? (
                          <img src={test.reviewer_avatar} alt={test.reviewer_name} className="w-12 h-12 rounded-full object-cover border border-white/10" />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center font-bold text-white shadow-lg">
                            {test.reviewer_name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <h4 className="font-bold text-sm text-white">{test.reviewer_name}</h4>
                          <p className="text-xs text-slate-500">{test.reviewer_role || 'Collaborator'}</p>
                        </div>
                      </div>
                      
                      {test.is_verified && (
                        <div className="absolute top-6 right-6 px-2 py-1 bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] font-bold tracking-widest uppercase rounded">
                          Verified
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}
      </main>
      
      <Footer />
    </div>
  );
}
