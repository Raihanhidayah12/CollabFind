import { motion } from 'framer-motion';
import Footer from '../../components/landing/Footer';
import PageNavbar from '../../components/PageNavbar';

const sections = [
  {
    title: '1. Acceptance of Terms',
    content: `By accessing or using CollabFind, you agree to be bound by these Terms of Service. 
    If you do not agree to these terms, please do not use the platform.`,
  },
  {
    title: '2. Eligibility',
    content: `You must be at least 13 years old to use CollabFind. By using our platform, you 
    represent that you meet this requirement and that the information you provide is accurate.`,
  },
  {
    title: '3. User Accounts',
    content: `You are responsible for maintaining the security of your account credentials. 
    You agree not to share your password or allow others to access your account. You are 
    responsible for all activities that occur under your account.`,
  },
  {
    title: '4. Acceptable Use',
    content: `You agree not to use CollabFind to post misleading or fraudulent content, 
    harass or harm other users, infringe on intellectual property rights, 
    distribute malware or harmful code, or violate any applicable laws or regulations.`,
  },
  {
    title: '5. Project Content',
    content: `You retain ownership of content you create on CollabFind. By posting content, 
    you grant CollabFind a non-exclusive license to display and distribute that content 
    within the platform. You are responsible for ensuring you have the rights to any 
    content you post.`,
  },
  {
    title: '6. Collaboration & Disputes',
    content: `CollabFind facilitates connections between users but is not a party to any 
    collaboration agreements. Disputes between collaborators are the responsibility of 
    the involved parties. We encourage clear communication and written agreements for 
    significant collaborations.`,
  },
  {
    title: '7. Termination',
    content: `We reserve the right to suspend or terminate accounts that violate these terms 
    or that we determine, in our sole discretion, are harmful to the platform or other users. 
    You may delete your account at any time through your settings.`,
  },
  {
    title: '8. Limitation of Liability',
    content: `CollabFind is provided "as is" without warranties of any kind. We are not 
    liable for any indirect, incidental, or consequential damages arising from your use 
    of the platform. Our total liability shall not exceed the amount you paid us in the 
    past 12 months.`,
  },
  {
    title: '9. Changes to Terms',
    content: `We may modify these terms at any time. We will notify users of material changes 
    via email or platform notification. Continued use after changes constitutes acceptance 
    of the updated terms.`,
  },
];

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-[#050816]" style={{ fontFamily: "'Manrope',sans-serif" }}>
      <PageNavbar breadcrumbs={[{ label: 'Terms of Service', href: null }]} />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs text-slate-500 mb-3">Last updated: June 2025</p>
          <h1 className="text-4xl font-extrabold text-white mb-4 tracking-tight" style={{ fontFamily: "'Space Grotesk',sans-serif" }}>
            Terms of Service
          </h1>
          <p className="text-slate-400 leading-relaxed mb-12">
            Please read these Terms of Service carefully before using CollabFind.
          </p>

          <div className="flex flex-col gap-10">
            {sections.map((s, i) => (
              <motion.div key={s.title} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <h2 className="text-base font-bold text-white mb-3" style={{ fontFamily: "'Space Grotesk',sans-serif" }}>{s.title}</h2>
                <p className="text-sm text-slate-400 leading-relaxed">{s.content}</p>
              </motion.div>
            ))}
          </div>

          <div className="mt-14 p-6 rounded-2xl border border-white/[0.07] bg-[#0a0f1e]/70">
            <p className="text-sm text-slate-400">
              Questions about our terms?{' '}
              <a href="mailto:legal@collabfind.com" className="text-blue-400 hover:text-blue-300 transition-colors">
                legal@collabfind.com
              </a>
            </p>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
