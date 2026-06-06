import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Calendar, Zap, CheckCircle, Clock, XCircle, Trophy, AlertTriangle, Upload, X,
  ExternalLink, FileText, UserCheck, UserX, UserPlus, Check, Star,
} from 'lucide-react';
import { supabase } from '../utils/supabaseClient';
import PageNavbar from '../components/PageNavbar';
import RateTeammatesModal from '../components/workspace/RateTeammatesModal';

const STATUS_STYLE = {
  open:      { label: 'Recruiting',  cls: 'text-green-400 bg-green-400/10 border-green-400/20' },
  ongoing:   { label: 'In Progress', cls: 'text-blue-400 bg-blue-400/10 border-blue-400/20' },
  completed: { label: 'Completed',   cls: 'text-slate-400 bg-slate-400/10 border-slate-400/20' },
};

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [project, setProject]   = useState(null);
  const [creator, setCreator]   = useState(null);
  const [session, setSession]   = useState(null);
  const [applied, setApplied]   = useState(false);
  const [loading, setLoading]   = useState(true);
  const [applying, setApplying] = useState(false);
  const [appStatus, setAppStatus] = useState(null); // 'pending'|'accepted'|'rejected'|null
  const [message, setMessage]   = useState('');
  const [markingDone, setMarkingDone] = useState(false);
  const [ownerApplications, setOwnerApplications] = useState([]);
  const [ownerAppsLoading, setOwnerAppsLoading] = useState(false);
  const [reviewingAppId, setReviewingAppId] = useState(null);
  const [cvLinks, setCvLinks] = useState({});

  // Apply form extra fields
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [cvFile, setCvFile]         = useState(null);
  const [cvUploading, setCvUploading] = useState(false);

  // Invite members
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState('');
  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Rate teammates
  const [showRateModal, setShowRateModal] = useState(false);
  const [collaborators, setCollaborators] = useState([]);
  const [collaboratorsLoading, setCollaboratorsLoading] = useState(false);

  // Get session
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => listener.subscription.unsubscribe();
  }, []);

  // Fetch project
  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data: p } = await supabase.from('projects').select('*').eq('id', id).single();
      if (!p) { navigate('/explore'); return; }

      // Check if slots are full and auto-update status
      const remainingSlots = Math.max(0, (p.open_slots ?? 0) - ((p.current_members ?? 1) - 1));
      if (remainingSlots <= 0 && p.status === 'open') {
        const { error: updateError } = await supabase
          .from('projects')
          .update({ status: 'ongoing' })
          .eq('id', id);
        if (!updateError) {
          p.status = 'ongoing';
        }
      }

      setProject(p);

      // Fetch creator profile
      if (p.creator_id) {
        const { data: c } = await supabase.from('profiles').select('name, job_title, avatar_url').eq('id', p.creator_id).single();
        setCreator(c);
      }

      setLoading(false);
    }
    load();
  }, [id, navigate]);

  // Fetch collaborators (accepted applicants + accepted invitations)
  // Depends on session so RLS can authorize the applications query
  useEffect(() => {
    if (!project?.id || !session) return;

    async function fetchCollaborators() {
      try {
        setCollaboratorsLoading(true);

        // 1. Fetch accepted applicants (RLS requires authenticated user)
        const { data: apps, error: appsErr } = await supabase
          .from('applications')
          .select('applicant_id')
          .eq('project_id', project.id)
          .eq('status', 'accepted');

        if (appsErr) console.warn('fetchCollaborators apps error:', appsErr);

        // 2. Fetch accepted invitations only
        const { data: invites, error: invitesErr } = await supabase
          .from('invitations')
          .select('invitee_id')
          .eq('project_id', project.id)
          .eq('status', 'accepted');

        if (invitesErr) console.warn('fetchCollaborators invites error:', invitesErr);

        const applicantIds = (apps || []).map(a => a.applicant_id).filter(Boolean);
        const inviteeIds   = (invites || []).map(i => i.invitee_id).filter(Boolean);
        const allIds       = [...new Set([...applicantIds, ...inviteeIds])];

        if (allIds.length > 0) {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, name, avatar_url, job_title')
            .in('id', allIds);

          setCollaborators(profiles || []);
        } else {
          setCollaborators([]);
        }
      } catch (err) {
        console.error('Failed to fetch collaborators:', err);
      } finally {
        setCollaboratorsLoading(false);
      }
    }

    fetchCollaborators();
  }, [project?.id, session]);

  // Auto-fill portfolio URL from user_portfolios
  useEffect(() => {
    if (!session) return;
    supabase
      .from('user_portfolios')
      .select('username')
      .eq('user_id', session.user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.username) {
          setPortfolioUrl(`${window.location.origin}/portfolio/${data.username}`);
        }
      });
  }, [session]);

  // Check if already applied or invited
  useEffect(() => {
    if (!session || !id) return;
    async function checkStatus() {
      const [appRes, invRes] = await Promise.all([
        supabase
          .from('applications')
          .select('id, status')
          .eq('project_id', id)
          .eq('applicant_id', session.user.id)
          .maybeSingle(),
        supabase
          .from('invitations')
          .select('id, status')
          .eq('project_id', id)
          .eq('invitee_id', session.user.id)
          .maybeSingle(),
      ]);
      if (appRes.data) {
        setApplied(true);
        setAppStatus(appRes.data.status);
      } else if (invRes.data) {
        setApplied(true);
        setAppStatus(invRes.data.status);
      }
    }
    checkStatus();
  }, [session, id]);

  // Load incoming applications for the project owner.
  useEffect(() => {
    if (!session || !project || session.user.id !== project.creator_id) return;

    async function loadOwnerApplications() {
      setOwnerAppsLoading(true);

      const { data: apps, error } = await supabase
        .from('applications')
        .select('*')
        .eq('project_id', project.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading project applications:', error);
        setOwnerAppsLoading(false);
        return;
      }

      const applicantIds = [...new Set((apps || []).map(app => app.applicant_id).filter(Boolean))];
      let profiles = [];

      if (applicantIds.length > 0) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id, name, job_title, avatar_url, skills, bio, portofolio_url')
          .in('id', applicantIds);

        if (profileError) {
          console.error('Error loading applicant profiles:', profileError);
        } else {
          profiles = profileData || [];
        }
      }

      const profileById = new Map(profiles.map(profile => [profile.id, profile]));
      const mergedApps = (apps || []).map(app => ({
        ...app,
        applicant: profileById.get(app.applicant_id) || null,
      }));

      setOwnerApplications(mergedApps);

      const links = {};
      await Promise.all(
        mergedApps
          .filter(app => app.cv_url)
          .map(async app => {
            const { data } = await supabase.storage
              .from('cv-files')
              .createSignedUrl(app.cv_url, 60 * 10);
            if (data?.signedUrl) links[app.id] = data.signedUrl;
          })
      );
      setCvLinks(links);
      setOwnerAppsLoading(false);
    }

    loadOwnerApplications();
  }, [session, project]);

  // Load registered users when invite modal opens
  useEffect(() => {
    if (showInviteModal) {
      loadRegisteredUsers();
    }
  }, [showInviteModal]);

  const handleApply = async () => {
    if (!session) { navigate('/login'); return; }
    if (applied) return;

    setApplying(true);

    let cvUrl = null;
    let cvFileName = null;

    // Upload CV if provided
    if (cvFile) {
      setCvUploading(true);
      const path = `cv/${session.user.id}/${Date.now()}_${cvFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from('cv-files')
        .upload(path, cvFile, { upsert: true });

      if (!uploadError) {
        cvUrl = path;
        cvFileName = cvFile.name;
      }
      setCvUploading(false);
    }

    const { error } = await supabase.from('applications').insert({
      project_id:      id,
      applicant_id:    session.user.id,
      message:         message.trim() || null,
      role_applied:    'Member',
      status:          'pending',
      portfolio_url:   portfolioUrl.trim() || null,
      selected_skills: selectedSkills,
      cv_url:          cvUrl,
      cv_file_name:    cvFileName,
    });

    if (!error) {
      setApplied(true);
      setAppStatus('pending');
    } else {
      console.error('Apply error:', error);
    }
    setApplying(false);
  };

  const handleMarkStatus = async (newStatus) => {
    if (!isOwner) return;
    const confirmed = confirm(
      newStatus === 'completed'
        ? 'Mark this project as Completed? This will allow it to appear in Portfolio Generator.'
        : 'Close recruiting for this project? Status will change to "In Progress".'
    );
    if (!confirmed) return;
    setMarkingDone(true);
    const { error } = await supabase
      .from('projects')
      .update({ status: newStatus })
      .eq('id', id);
    if (!error) {
      setProject(prev => ({ ...prev, status: newStatus }));
      if (newStatus === 'completed') {
        setShowRateModal(true);
      }
    } else {
      alert('Failed to update status: ' + error.message);
    }
    setMarkingDone(false);
  };

  const loadRegisteredUsers = async () => {
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, name, skills, avatar_url, job_title')
        .neq('id', session?.user?.id);

      if (error) throw error;
      setRegisteredUsers(profiles || []);
    } catch (err) {
      console.error('Error loading users:', err);
    }
  };

  const handleInvite = async () => {
    if (selectedUsers.length === 0 || !session || !project) return;
    setInviting(true);
    setInviteError('');
    let successCount = 0;
    let duplicateCount = 0;

    try {
      for (const user of selectedUsers) {
        try {
          const { data: existing } = await supabase
            .from('invitations')
            .select('id')
            .eq('project_id', project.id)
            .eq('invitee_id', user.id)
            .maybeSingle();

          if (existing) {
            duplicateCount++;
            continue;
          }

          const { error: invitError } = await supabase.from('invitations').insert({
            inviter_id: session.user.id,
            invitee_id: user.id,
            invitee_email: '', // Email not available from profiles
            project_id: project.id,
            status: 'pending'
          });

          if (invitError) {
            console.error(`Invitation error for ${user.name}:`, invitError);
            setInviteError(prev => prev + `\n❌ ${user.name}: ${invitError.message}`);
          } else {
            successCount++;
          }
        } catch (err) {
          console.error(`Error inviting ${user.name}:`, err);
          setInviteError(prev => prev + `\n❌ ${user.name}: ${err.message}`);
        }
      }

      if (successCount > 0) {
        setSelectedUsers([]);
        setSearchQuery('');
        setTimeout(() => setShowInviteModal(false), 1000);
        const msg = `✅ ${successCount} invitation(s) sent successfully!${duplicateCount > 0 ? ` (${duplicateCount} already invited)` : ''}`;
        alert(msg);
      } else if (duplicateCount > 0) {
        alert(`⚠️ All ${duplicateCount} users are already invited to this project.`);
      }
    } catch (err) {
      console.error('Invite error:', err);
      setInviteError(err.message);
    }

    setInviting(false);
  };

  const handleReviewApplication = async (application, newStatus) => {
    if (!isOwner || application.status !== 'pending') return;

    setReviewingAppId(application.id);
    const { data: updatedApplication, error } = await supabase
      .from('applications')
      .update({ status: newStatus })
      .eq('id', application.id)
      .eq('project_id', project.id)
      .select('id, status')
      .maybeSingle();

    if (error) {
      alert('Failed to update application: ' + error.message);
      setReviewingAppId(null);
      return;
    }

    if (!updatedApplication) {
      alert('Application was not updated. Check Supabase RLS policy for owner updates on the applications table.');
      setReviewingAppId(null);
      return;
    }

    setOwnerApplications(prev =>
      prev.map(app => app.id === application.id ? { ...app, status: updatedApplication.status } : app)
    );

    if (updatedApplication.status === 'accepted') {
      const nextMembers = (project.current_members ?? 1) + 1;
      const remainingSlots = (project.open_slots ?? 0) - ((nextMembers) - 1);

      // Check if slots are now full and auto-update status
      const shouldUpdateStatus = remainingSlots <= 0 && project.status === 'open';

      const updateData = { current_members: nextMembers };
      if (shouldUpdateStatus) {
        updateData.status = 'ongoing';
      }

      const { error: memberUpdateError } = await supabase
        .from('projects')
        .update(updateData)
        .eq('id', project.id);

      if (memberUpdateError) {
        console.error('Failed to update member count:', memberUpdateError);
      } else {
        setProject(prev => ({
          ...prev,
          current_members: nextMembers,
          ...(shouldUpdateStatus && { status: 'ongoing' })
        }));
      }
    }

    setReviewingAppId(null);
  };

  if (loading) return (
    <div className="min-h-screen bg-[#050816] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
    </div>
  );

  if (!project) return null;

  const accent = project.accent_color || '#3B82F6';
  const s = STATUS_STYLE[project.status] || STATUS_STYLE.open;
  const isOwner = session?.user?.id === project.creator_id;

  return (
    <div className="min-h-screen bg-[#050816]" style={{ fontFamily: "'Manrope', sans-serif" }}>
      {/* Bg */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/3 w-[500px] h-[400px] rounded-full blur-[120px]"
          style={{ background: `${accent}12` }} />
        <div className="absolute bottom-1/3 right-0 w-[400px] h-[400px] bg-purple-600/8 rounded-full blur-[100px]" />
      </div>

      {/* Navbar */}
      <PageNavbar breadcrumbs={[{ label: 'Explore', href: '/explore' }, { label: 'Project Details' }]} homePath="/dashboard" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 pt-24 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Left: main content ── */}
          <div className="lg:col-span-2 flex flex-col gap-5">

            {/* Hero card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-white/[0.07] bg-[#0a0f1e]/70 backdrop-blur-sm overflow-hidden"
            >
              {/* Accent header */}
              <div className="h-2" style={{ background: `linear-gradient(90deg, ${accent}, ${accent}44)` }} />
              <div className="h-36 flex items-center justify-center"
                style={{ background: `linear-gradient(135deg, ${accent}18, ${accent}06)` }}>
                <div className="w-16 h-16 rounded-2xl border border-white/10 bg-white/[0.05] flex items-center justify-center"
                  style={{ boxShadow: `0 0 32px ${accent}55` }}>
                  <Zap size={28} style={{ color: accent }} />
                </div>
              </div>

              <div className="p-6">
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${s.cls}`}>{s.label}</span>
                  <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                    <Users size={13} />
                    <span>{project.current_members ?? 1} members · {Math.max(0, (project.open_slots ?? 0) - ((project.current_members ?? 1) - 1))} slots left</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                    <Calendar size={13} />
                    <span>{new Date(project.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-3 tracking-tight"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {project.title}
                </h1>

                <p className="text-slate-400 leading-relaxed mb-5">{project.description}</p>

                {/* Skills */}
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Skills Needed</p>
                  <div className="flex flex-wrap gap-2">
                    {(project.skills_needed || []).map(s => (
                      <span key={s} className="px-3 py-1 rounded-lg bg-white/[0.05] border border-white/[0.08] text-sm text-slate-300">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Show when user has joined */}
            {!isOwner && project.status === 'open' && appStatus === 'accepted' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="rounded-2xl border border-white/[0.07] bg-[#0a0f1e]/70 p-6"
              >
                <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
                  <CheckCircle size={18} />
                  <div>
                    <div className="font-semibold text-sm">You've Joined This Project</div>
                    <div className="text-xs opacity-75 mt-0.5">Welcome to the team! Check back for updates.</div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Apply form — only when status is 'open' and user hasn't joined */}
            {!isOwner && project.status === 'open' && appStatus !== 'accepted' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="rounded-2xl border border-white/[0.07] bg-[#0a0f1e]/70 p-6"
              >
                <h2 className="text-base font-bold text-white mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Apply to Join
                </h2>
                <p className="text-sm text-slate-500 mb-5">
                  Fill in your details to apply. The more complete, the better your chances.
                </p>

                {/* Slots display */}
                {(() => {
                  const remainingSlots = Math.max(0, (project.open_slots ?? 0) - ((project.current_members ?? 1) - 1));
                  const isFull = remainingSlots <= 0;

                  return (
                    <div className={`p-4 rounded-xl mb-5 border flex items-center justify-between ${
                      isFull
                        ? 'bg-red-500/10 border-red-500/30'
                        : 'bg-blue-500/10 border-blue-500/30'
                    }`}>
                      <div className={isFull ? 'text-red-300' : 'text-blue-300'}>
                        <div className="text-xs font-bold uppercase">{isFull ? 'Slots Full' : 'Slots Available'}</div>
                        <div className="text-sm font-semibold">{isFull ? 'No spots left' : `${remainingSlots} slot${remainingSlots === 1 ? '' : 's'} remaining`}</div>
                      </div>
                      {!isFull && (
                        <div className="text-right">
                          <div className="text-xs text-slate-400">Current Members</div>
                          <div className="text-lg font-bold text-white">{project.current_members ?? 1}</div>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {applied ? (
                  <div className={`flex items-center gap-3 p-4 rounded-xl border ${
                    appStatus === 'accepted' ? 'bg-green-500/10 border-green-500/30 text-green-300' :
                    appStatus === 'rejected' ? 'bg-red-500/10 border-red-500/30 text-red-300' :
                    'bg-blue-500/10 border-blue-500/30 text-blue-300'
                  }`}>
                    {appStatus === 'accepted' ? <CheckCircle size={18} /> :
                     appStatus === 'rejected' ? <XCircle size={18} /> :
                     <Clock size={18} />}
                    <div>
                      <div className="font-semibold text-sm">
                        {appStatus === 'accepted' ? 'Application Accepted!' :
                         appStatus === 'rejected' ? 'Application Not Accepted' :
                         'Application Submitted'}
                      </div>
                      <div className="text-xs opacity-75 mt-0.5">
                        {appStatus === 'accepted' ? 'Welcome to the team!' :
                         appStatus === 'rejected' ? 'Keep exploring other projects.' :
                         'The team will review your application soon.'}
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {!session && (
                      <div className="p-3 mb-4 rounded-xl border border-yellow-500/25 bg-yellow-500/8 text-yellow-300 text-sm">
                        You need to <Link to="/login" state={{ from: location.pathname }} className="underline font-semibold">sign in</Link> to apply.
                      </div>
                    )}

                    <div className="flex flex-col gap-4">
                      {/* Portfolio URL */}
                      <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">
                          Portfolio URL
                        </label>
                        <input
                          type="url"
                          value={portfolioUrl}
                          onChange={e => setPortfolioUrl(e.target.value)}
                          disabled={!session}
                          placeholder="https://collabfind.com/portfolio/username"
                          className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder-slate-600 text-sm outline-none focus:border-blue-500/40 transition-all disabled:opacity-40"
                        />
                        {portfolioUrl && (
                          <p className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1">
                            <CheckCircle size={10} /> Auto-filled from your Portfolio Editor
                          </p>
                        )}
                      </div>

                      {/* Skills multi-select */}
                      {(project.skills_needed || []).length > 0 && (
                        <div>
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">
                            Relevant Skills You Have <span className="text-slate-600 font-normal normal-case">(select all that apply)</span>
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {(project.skills_needed || []).map(skill => {
                              const isSelected = selectedSkills.includes(skill);
                              return (
                                <button
                                  key={skill}
                                  type="button"
                                  disabled={!session}
                                  onClick={() => {
                                    setSelectedSkills(prev =>
                                      isSelected ? prev.filter(s => s !== skill) : [...prev, skill]
                                    );
                                  }}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all disabled:opacity-40 ${
                                    isSelected
                                      ? 'bg-blue-500/20 border-blue-500/50 text-blue-300'
                                      : 'bg-white/[0.04] border-white/[0.1] text-slate-400 hover:border-white/[0.25] hover:text-white'
                                  }`}
                                >
                                  {isSelected && <CheckCircle size={10} className="inline mr-1" />}
                                  {skill}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Message */}
                      <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">
                          Cover Message
                        </label>
                        <textarea
                          rows={3}
                          placeholder="Hi, I'm interested in joining because..."
                          value={message}
                          onChange={e => setMessage(e.target.value)}
                          disabled={!session}
                          className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder-slate-600 text-sm outline-none focus:border-blue-500/40 transition-all resize-none disabled:opacity-40"
                        />
                      </div>

                      {/* CV Upload */}
                      <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">
                          CV / Resume <span className="text-slate-600 font-normal normal-case">(PDF, DOC, max 5MB — optional)</span>
                        </label>
                        {cvFile ? (
                          <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                            <CheckCircle size={14} className="text-emerald-400 flex-shrink-0" />
                            <span className="text-sm text-emerald-300 flex-1 truncate">{cvFile.name}</span>
                            <button
                              onClick={() => setCvFile(null)}
                              className="text-slate-500 hover:text-red-400 transition-colors"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <label className={`flex items-center gap-3 px-4 py-3 rounded-xl border border-dashed border-white/[0.1] bg-white/[0.02] hover:border-white/[0.2] hover:bg-white/[0.04] transition-all cursor-pointer ${!session ? 'opacity-40 pointer-events-none' : ''}`}>
                            <Upload size={15} className="text-slate-500 flex-shrink-0" />
                            <span className="text-sm text-slate-500">Click to upload your CV</span>
                            <input
                              type="file"
                              accept=".pdf,.doc,.docx"
                              className="hidden"
                              disabled={!session}
                              onChange={e => {
                                const f = e.target.files?.[0];
                                if (f && f.size <= 5 * 1024 * 1024) setCvFile(f);
                                else if (f) alert('Max 5MB');
                                e.target.value = '';
                              }}
                            />
                          </label>
                        )}
                      </div>

                      {/* Submit */}
                      <button
                        onClick={handleApply}
                        disabled={applying || cvUploading || !session}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{
                          background: `linear-gradient(135deg, ${accent}, ${accent}88)`,
                          boxShadow: `0 0 24px ${accent}44`,
                        }}
                      >
                        {applying || cvUploading ? (
                          <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> {cvUploading ? 'Uploading CV...' : 'Applying...'}</>
                        ) : (
                          <><Zap size={15} /> Apply to Join</>
                        )}
                      </button>
                    </div>
                  </>
                )}
              </motion.div>
            )}

            {/* Notice for non-members when project is ongoing or completed */}
            {!isOwner && (project.status === 'ongoing' || project.status === 'completed') && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className={`rounded-2xl border p-6 ${
                  project.status === 'completed'
                    ? 'border-slate-500/20 bg-slate-500/8'
                    : 'border-blue-500/20 bg-blue-500/8'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-8 h-8 rounded-xl border flex items-center justify-center flex-shrink-0 ${
                    project.status === 'completed'
                      ? 'bg-slate-500/15 border-slate-500/25'
                      : 'bg-blue-500/15 border-blue-500/25'
                  }`}>
                    {project.status === 'completed'
                      ? <CheckCircle size={16} className="text-slate-400" />
                      : <Clock size={16} className="text-blue-400" />
                    }
                  </div>
                  <h2 className={`text-base font-bold ${
                    project.status === 'completed' ? 'text-slate-300' : 'text-blue-300'
                  }`} style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    {project.status === 'completed' ? 'Project Completed' : 'Project In Progress'}
                  </h2>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {project.status === 'completed'
                    ? 'This project has been marked as completed and is no longer accepting new members.'
                    : 'This project is currently in progress and is no longer accepting new applicants.'}
                </p>
              </motion.div>
            )}
          </div>

          {/* ── Right: sidebar ── */}
          <div className="flex flex-col gap-4">

            {/* Creator */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-2xl border border-white/[0.07] bg-[#0a0f1e]/70 p-5"
            >
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Project Creator</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                  style={{ background: `${accent}22`, border: `1px solid ${accent}44` }}>
                  {creator?.name?.[0] || '?'}
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">{creator?.name || 'Anonymous'}</div>
                  <div className="text-xs text-slate-500">{creator?.job_title || 'Member'}</div>
                </div>
              </div>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              className="rounded-2xl border border-white/[0.07] bg-[#0a0f1e]/70 p-5"
            >
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Project Stats</p>
              <div className="flex flex-col gap-3">
                {[
                  { label: 'Current Members', value: project.current_members ?? 1 },
                  { label: 'Remaining Slots', value: Math.max(0, (project.open_slots ?? 0) - ((project.current_members ?? 1) - 1)) },
                  { label: 'Status',           value: s.label },
                ].map(stat => (
                  <div key={stat.label} className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">{stat.label}</span>
                    <span className="text-xs font-semibold text-white">{stat.value}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Owner Actions */}
            {isOwner && project.status !== 'completed' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.18 }}
                className="rounded-2xl border border-white/[0.07] bg-[#0a0f1e]/70 p-5"
              >
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Owner Actions</p>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => setShowInviteModal(true)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-purple-300 border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 transition-all"
                  >
                    <UserPlus size={14} />
                    Invite Members
                  </button>
                  {project.status === 'open' && (
                    <button
                      onClick={() => handleMarkStatus('ongoing')}
                      disabled={markingDone}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-blue-300 border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 transition-all disabled:opacity-50"
                    >
                      <Clock size={14} />
                      {markingDone ? 'Updating...' : 'Close Recruiting'}
                    </button>
                  )}
                  <button
                    onClick={() => handleMarkStatus('completed')}
                    disabled={markingDone}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-emerald-300 border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 transition-all disabled:opacity-50"
                  >
                    <Trophy size={14} />
                    {markingDone ? 'Updating...' : 'Mark as Completed'}
                  </button>
                  <p className="text-[10px] text-slate-600 text-center mt-1 flex items-center justify-center gap-1">
                    <AlertTriangle size={10} /> Completed projects can be showcased in your Portfolio.
                  </p>
                </div>
              </motion.div>
            )}

            {/* Project Collaborators - shown for all statuses if logged in */}
            {session && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.18 }}
                className="rounded-2xl border border-white/[0.07] bg-[#0a0f1e]/70 p-5"
              >
                <div className="flex items-center justify-between gap-3 mb-4">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Collaborators</p>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold text-blue-300 bg-blue-500/10 border border-blue-500/20">
                    {collaborators.length}
                  </span>
                </div>

                {collaboratorsLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="w-4 h-4 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                  </div>
                ) : collaborators.length === 0 ? (
                  <p className="text-sm text-slate-500">No collaborators yet.</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {collaborators.map(collab => (
                      <div key={collab.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/[0.04] transition-colors">
                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-white text-xs font-bold overflow-hidden border border-slate-700 flex-shrink-0">
                          {collab.avatar_url ? (
                            <img src={collab.avatar_url} alt={collab.name} className="w-full h-full object-cover" />
                          ) : (
                            (collab.name || 'C')[0].toUpperCase()
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-white truncate">{collab.name || 'Anonymous'}</p>
                          {collab.job_title && (
                            <p className="text-[10px] text-slate-500 truncate">{collab.job_title}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Rate button — shown for ALL members when project is completed */}
                {project.status === 'completed' && (
                  <button
                    onClick={() => setShowRateModal(true)}
                    className="w-full mt-4 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-yellow-300 border border-yellow-500/30 bg-yellow-500/10 hover:bg-yellow-500/20 transition-all"
                  >
                    <Star size={14} />
                    {isOwner ? 'Rate Collaborators' : 'Rate Teammates'}
                  </button>
                )}
              </motion.div>
            )}

            {/* Incoming Applications */}
            {isOwner && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="rounded-2xl border border-white/[0.07] bg-[#0a0f1e]/70 p-5"
              >
                <div className="flex items-center justify-between gap-3 mb-4">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Applicants</p>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold text-blue-300 bg-blue-500/10 border border-blue-500/20">
                    {ownerApplications.length}
                  </span>
                </div>

                {ownerAppsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                  </div>
                ) : ownerApplications.length === 0 ? (
                  <p className="text-sm text-slate-500 leading-relaxed">Belum ada pelamar untuk project ini.</p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {ownerApplications.map(app => {
                      const applicant = app.applicant;
                      const statusStyle =
                        app.status === 'accepted' ? 'text-emerald-300 bg-emerald-500/10 border-emerald-500/20' :
                        app.status === 'rejected' ? 'text-red-300 bg-red-500/10 border-red-500/20' :
                        'text-yellow-300 bg-yellow-500/10 border-yellow-500/20';
                      const portfolioLink = app.portfolio_url || applicant?.portofolio_url;

                      return (
                        <div key={app.id} className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4">
                          <div className="flex items-start gap-3 mb-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                              style={{ background: `${accent}22`, border: `1px solid ${accent}44` }}>
                              {applicant?.name?.[0] || '?'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <p className="text-sm font-semibold text-white truncate">{applicant?.name || 'Anonymous applicant'}</p>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border flex-shrink-0 ${statusStyle}`}>
                                  {app.status}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 truncate">{applicant?.job_title || 'Member'}</p>
                            </div>
                          </div>

                          {app.message && (
                            <p className="text-xs text-slate-400 leading-relaxed mb-3">{app.message}</p>
                          )}

                          {(app.selected_skills?.length > 0 || applicant?.skills?.length > 0) && (
                            <div className="flex flex-wrap gap-1.5 mb-3">
                              {(app.selected_skills?.length > 0 ? app.selected_skills : applicant.skills).slice(0, 6).map(skill => (
                                <span key={skill} className="px-2 py-0.5 rounded-md bg-white/[0.05] border border-white/[0.07] text-[10px] text-slate-400">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          )}

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                            {portfolioLink && (
                              <a
                                href={portfolioLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold text-blue-300 border border-blue-500/25 bg-blue-500/10 hover:bg-blue-500/20 transition-all"
                              >
                                <ExternalLink size={12} /> Portfolio
                              </a>
                            )}
                            {app.cv_url && (
                              <a
                                href={cvLinks[app.id] || '#'}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold border transition-all ${
                                  cvLinks[app.id]
                                    ? 'text-purple-300 border-purple-500/25 bg-purple-500/10 hover:bg-purple-500/20'
                                    : 'text-slate-500 border-white/[0.08] bg-white/[0.03] pointer-events-none'
                                }`}
                              >
                                <FileText size={12} /> {app.cv_file_name || 'CV'}
                              </a>
                            )}
                          </div>

                          {app.status === 'pending' && (
                            <div className="grid grid-cols-2 gap-2">
                              <button
                                onClick={() => handleReviewApplication(app, 'accepted')}
                                disabled={reviewingAppId === app.id}
                                className="flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold text-emerald-300 border border-emerald-500/25 bg-emerald-500/10 hover:bg-emerald-500/20 transition-all disabled:opacity-50"
                              >
                                <UserCheck size={12} /> Accept
                              </button>
                              <button
                                onClick={() => handleReviewApplication(app, 'rejected')}
                                disabled={reviewingAppId === app.id}
                                className="flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold text-red-300 border border-red-500/25 bg-red-500/10 hover:bg-red-500/20 transition-all disabled:opacity-50"
                              >
                                <UserX size={12} /> Reject
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}

            {/* Similar projects link */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Link
                to="/explore"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold text-slate-400 border border-white/[0.07] bg-white/[0.03] hover:text-white hover:border-white/[0.14] hover:bg-white/[0.06] transition-all"
              >
                Browse More Projects →
              </Link>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Invite Members Modal */}
      <AnimatePresence>
        {showInviteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowInviteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 16 }}
              className="w-full max-w-md rounded-2xl border border-white/[0.1] bg-[#0d1224]/95 backdrop-blur-xl p-6"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-white">Invite Members</h2>
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="text-slate-500 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="mb-4">
                <label className="text-xs text-slate-400 block mb-2">Search and select members</label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search by name or skills..."
                  className="w-full bg-white/[0.04] border border-white/[0.09] rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 outline-none focus:border-blue-500/50 transition-all"
                />
              </div>

              <div className="mb-4 max-h-[300px] overflow-y-auto border border-white/[0.09] rounded-xl p-3 bg-white/[0.02]">
                {registeredUsers
                  .filter(u => {
                    const q = searchQuery.toLowerCase();
                    return u.name?.toLowerCase().includes(q) ||
                           u.skills?.some(s => s.toLowerCase().includes(q));
                  })
                  .length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-4">No users found</p>
                ) : (
                  registeredUsers
                    .filter(u => {
                      const q = searchQuery.toLowerCase();
                      return u.name?.toLowerCase().includes(q) ||
                             u.skills?.some(s => s.toLowerCase().includes(q));
                    })
                    .map(user => {
                      const isSelected = selectedUsers.some(s => s.id === user.id);
                      return (
                        <button
                          key={user.id}
                          onClick={() => {
                            setSelectedUsers(prev =>
                              isSelected
                                ? prev.filter(u => u.id !== user.id)
                                : [...prev, user]
                            );
                          }}
                          className={`w-full text-left px-3 py-3 rounded-lg text-sm mb-2 transition-all border ${
                            isSelected
                              ? 'bg-blue-500/20 border-blue-500/50'
                              : 'bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.06]'
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <div className={`w-4 h-4 rounded border mt-0.5 flex-shrink-0 ${
                              isSelected ? 'bg-blue-500 border-blue-500' : 'border-white/30'
                            } flex items-center justify-center`}>
                              {isSelected && <Check size={12} className="text-white" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-white">{user.name || 'Anonymous'}</span>
                                {user.job_title && <span className="text-xs text-slate-500">{user.job_title}</span>}
                              </div>
                              {user.skills && user.skills.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {user.skills.slice(0, 3).map(skill => (
                                    <span key={skill} className="text-[10px] px-2 py-0.5 rounded bg-blue-500/15 border border-blue-500/25 text-blue-300">
                                      {skill}
                                    </span>
                                  ))}
                                  {user.skills.length > 3 && <span className="text-[10px] text-slate-500">+{user.skills.length - 3}</span>}
                                </div>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })
                )}
              </div>

              {selectedUsers.length > 0 && (
                <div className="mb-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <p className="text-xs text-blue-300 font-semibold">
                    {selectedUsers.length} user(s) selected
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedUsers.map(user => (
                      <div
                        key={user.id}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-500/20 border border-blue-500/30 text-xs text-blue-300"
                      >
                        {user.name || 'Anonymous'}
                        <button
                          onClick={() => setSelectedUsers(prev => prev.filter(u => u.id !== user.id))}
                          className="hover:text-blue-200"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {inviteError && (
                <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-300 whitespace-pre-wrap">
                  {inviteError}
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowInviteModal(false);
                    setSelectedUsers([]);
                    setSearchQuery('');
                  }}
                  className="flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold text-slate-400 border border-white/[0.1] hover:bg-white/[0.05] transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleInvite}
                  disabled={selectedUsers.length === 0 || inviting}
                  className="flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 disabled:opacity-50 transition-all"
                >
                  {inviting ? 'Sending...' : `Send Invites (${selectedUsers.length})`}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Rate Teammates Modal */}
        {showRateModal && session && project && (
          <RateTeammatesModal
            project={project}
            session={session}
            onClose={() => setShowRateModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
