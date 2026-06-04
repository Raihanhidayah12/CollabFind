import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './utils/supabaseClient';
import Navbar from './components/landing/Navbar';
import Hero from './components/landing/Hero';
import TrustedBy from './components/landing/TrustedBy';
import FeaturedProjects from './components/landing/FeaturedProjects';
import Collaborators from './components/landing/Collaborators';
import Categories from './components/landing/Categories';
import Features from './components/landing/Features';
import KanbanPreview from './components/landing/KanbanPreview';
import Testimonials from './components/landing/Testimonials';
import CTA from './components/landing/CTA';
import Footer from './components/landing/Footer';

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
        <FeaturedProjects />
        <Collaborators />
        <Categories />
        <Features />
        <KanbanPreview />
        <Testimonials />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}