import { useLanguage } from '../../i18n/LanguageContext';
import { motion } from 'framer-motion';
import Footer from '../../components/landing/Footer';
import PageNavbar from '../../components/PageNavbar';

const sections = [
  {
    title: '1. Information We Collect',
    content: `We collect information you provide directly to us, such as when you create an account, 
    create a project, or apply to collaborate. This includes your name, email address, skills, 
    and any profile information you choose to add. We also collect usage data to improve our services.`,
  },
  {
    title: '2. How We Use Your Information',
    content: `We use the information we collect to operate and improve CollabFind, match you with 
    relevant projects and collaborators, send you notifications about your account and projects, 
    and provide customer support. We do not sell your personal data to third parties.`,
  },
  {
    title: '3. Data Sharing',
    content: `Your profile information (name, skills, bio) is visible to other CollabFind users 
    to facilitate collaboration. We share data with service providers who help us operate the platform, 
    including Supabase for database and authentication services.`,
  },
  {
    title: '4. Data Retention',
    content: `We retain your data for as long as your account is active or as needed to provide 
    services. You can request deletion of your account and associated data at any time by contacting 
    us at privacy@collabfind.com.`,
  },
  {
    title: '5. Security',
    content: `We implement industry-standard security measures to protect your data, including 
    encryption at rest and in transit. However, no method of transmission over the internet is 
    100% secure, and we cannot guarantee absolute security.`,
  },
  {
    title: '6. Your Rights',
    content: `You have the right to access, correct, or delete your personal data. You can update 
    most of your information directly in your profile settings. For other requests, contact us at 
    privacy@collabfind.com.`,
  },
  {
    title: '7. Changes to This Policy',
    content: `We may update this Privacy Policy from time to time. We will notify you of significant 
    changes by email or through the platform. Continued use of CollabFind after changes constitutes 
    acceptance of the updated policy.`,
  },
];

export default function PrivacyPolicy() { 
  const { t } = useLanguage();
  return (
    <div className="bg-[#050816]" style={{ fontFamily: "'Manrope',sans-serif" }}>
      <PageNavbar breadcrumbs={[{ label: 'Privacy Policy', href: null }]} />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs text-slate-500 mb-3">Last updated: June 2025</p>
          <h1 className="text-4xl font-extrabold text-white mb-4 tracking-tight" style={{ fontFamily: "'Space Grotesk',sans-serif" }}>
            Privacy Policy
          </h1>
          <p className="text-slate-400 leading-relaxed mb-12">
            At CollabFind, we take your privacy seriously. This policy explains how we collect, 
            use, and protect your personal information.
          </p>

          <div className="flex flex-col gap-10">
            {sections.map((s, i) => (
              <motion.div key={s.title} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <h2 className="text-base font-bold text-white mb-3" style={{ fontFamily: "'Space Grotesk',sans-serif" }}>{s.title}</h2>
                <p className="text-sm text-slate-400 leading-relaxed">{s.content}</p>
              </motion.div>
            ))}
          </div>

          <div className="mt-14 p-6 rounded-2xl border border-white/[0.07] bg-[#0a0f1e]/70">
            <p className="text-sm text-slate-400">
              Questions about our privacy practices?{' '}
              <a href="mailto:privacy@collabfind.com" className="text-blue-400 hover:text-blue-300 transition-colors">
                privacy@collabfind.com
              </a>
            </p>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
