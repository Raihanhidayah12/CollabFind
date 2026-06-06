import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import ForgotPassword from './pages/ForgotPassword.jsx'
import ResetPassword from './pages/ResetPassword.jsx'
import Explore from './pages/Explore.jsx'
import ProjectDetail from './pages/ProjectDetail.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Profile from './pages/Profile.jsx'
import Settings from './pages/Settings.jsx'
import CreateProject from './pages/CreateProject.jsx'
import Workspace from './pages/Workspace.jsx'
import Chat from './pages/Chat.jsx'
import PortfolioEditor from './pages/PortfolioEditor.jsx'
import PublicPortfolio from './pages/PublicPortfolio.jsx'
import AboutUs from './pages/static/AboutUs.jsx'
import Careers from './pages/static/Careers.jsx'
import PressKit from './pages/static/PressKit.jsx'
import PrivacyPolicy from './pages/static/PrivacyPolicy.jsx'
import TermsOfService from './pages/static/TermsOfService.jsx'
import Discord from './pages/community/Discord.jsx'
import Forum from './pages/community/Forum.jsx'
import Events from './pages/community/Events.jsx'
import Hackathons from './pages/community/Hackathons.jsx'
import Newsletter from './pages/community/Newsletter.jsx'
import Documentation from './pages/resources/Documentation.jsx'
import ApiReference from './pages/resources/ApiReference.jsx'
import Blog from './pages/resources/Blog.jsx'
import Changelog from './pages/resources/Changelog.jsx'
import Status from './pages/resources/Status.jsx'
import ProductFeatures from './pages/ProductFeatures.jsx'
import FindTeammates from './pages/FindTeammates.jsx'
import PortfolioGeneratorLanding from './pages/PortfolioGeneratorLanding.jsx'
import ProjectInvitation from './pages/ProjectInvitation.jsx'
import { NotificationProvider } from './components/NotificationProvider.jsx'
import ToastContainer from './components/ToastContainer.jsx'
import { AuthProvider } from './components/AuthProvider.jsx'


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <NotificationProvider>
        <AuthProvider>
          <ToastContainer />
          <Routes>
            <Route path="/" element={<App />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset_password" element={<ResetPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/features" element={<ProductFeatures />} />
            <Route path="/teammates" element={<FindTeammates />} />
            <Route path="/portfolio-generator" element={<PortfolioGeneratorLanding />} />
            <Route path="/project/:id" element={<ProjectDetail />} />
            <Route path="/invite/:inviteId" element={<ProjectInvitation />} />
            <Route path="/create-project" element={<CreateProject />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/dashboard/workspace/:projectId" element={<Workspace />} />
            <Route path="/dashboard/chat" element={<Chat />} />
            <Route path="/dashboard/portfolio" element={<PortfolioEditor />} />
            <Route path="/portfolio/:username" element={<PublicPortfolio />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/careers" element={<Careers />} />
            <Route path="/press" element={<PressKit />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/discord" element={<Discord />} />
            <Route path="/forum" element={<Forum />} />
            <Route path="/events" element={<Events />} />
            <Route path="/hackathons" element={<Hackathons />} />
            <Route path="/newsletter" element={<Newsletter />} />
            <Route path="/docs" element={<Documentation />} />
            <Route path="/api" element={<ApiReference />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/changelog" element={<Changelog />} />
            <Route path="/status" element={<Status />} />
          </Routes>
        </AuthProvider>
      </NotificationProvider>
    </BrowserRouter>
  </StrictMode>,
)
