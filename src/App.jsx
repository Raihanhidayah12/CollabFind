import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './utils/supabaseClient';
import Navbar from './components/landing/Navbar';
import Hero from './components/landing/Hero';
import TrustedBy from './components/landing/TrustedBy';
import HowItWorks from './components/landing/HowItWorks';
import FeaturedProjects from './components/landing/FeaturedProjects';
import Features from './components/landing/Features';
import KanbanPreview from './components/landing/KanbanPreview';
import ComparisonTable from './components/landing/ComparisonTable';
import RoleMatcher from './components/landing/RoleMatcher';
import Testimonials from './components/landing/Testimonials';
import CTA from './components/landing/CTA';
import Footer from './components/landing/Footer';
import LiveActivityFeed from './components/landing/LiveActivityFeed';
import FreelanceMarketplaceSection from './components/landing/FreelanceMarketplace';
import CollabFindBot from './components/CollabFindBot';

export default function App() {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate('/dashboard', { replace: true });
    });
  }, [navigate]);

  return (
    <div className="app-shell">
      <Navbar />
      <main>
        <Hero />
        <TrustedBy />
        <HowItWorks />
        <FeaturedProjects />
        <KanbanPreview />
        <Features />
        <FreelanceMarketplaceSection />
        <ComparisonTable />
        <RoleMatcher />
        <Testimonials />
        <CTA />
      </main>
      <Footer />
      <LiveActivityFeed />
      <CollabFindBot />
    </div>
  );
}