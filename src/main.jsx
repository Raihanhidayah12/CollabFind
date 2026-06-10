/* eslint-disable react-refresh/only-export-components */
import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { NotificationProvider } from './components/NotificationProvider.jsx'
import ToastContainer from './components/ToastContainer.jsx'
import { AuthProvider } from './components/AuthProvider.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import CommandPalette from './components/CommandPalette.jsx'

const Login = lazy(() => import('./pages/Login.jsx'))
const Register = lazy(() => import('./pages/Register.jsx'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword.jsx'))
const ResetPassword = lazy(() => import('./pages/ResetPassword.jsx'))
const Explore = lazy(() => import('./pages/Explore.jsx'))
const ProjectDetail = lazy(() => import('./pages/ProjectDetail.jsx'))
const Dashboard = lazy(() => import('./pages/Dashboard.jsx'))
const Profile = lazy(() => import('./pages/Profile.jsx'))
const Settings = lazy(() => import('./pages/Settings.jsx'))
const CreateProject = lazy(() => import('./pages/CreateProject.jsx'))
const Workspace = lazy(() => import('./pages/Workspace.jsx'))
const Chat = lazy(() => import('./pages/Chat.jsx'))
const PortfolioEditor = lazy(() => import('./pages/PortfolioEditor.jsx'))
const PublicPortfolio = lazy(() => import('./pages/PublicPortfolio.jsx'))
const AboutUs = lazy(() => import('./pages/static/AboutUs.jsx'))
const Careers = lazy(() => import('./pages/static/Careers.jsx'))
const PressKit = lazy(() => import('./pages/static/PressKit.jsx'))
const PrivacyPolicy = lazy(() => import('./pages/static/PrivacyPolicy.jsx'))
const TermsOfService = lazy(() => import('./pages/static/TermsOfService.jsx'))
const Discord = lazy(() => import('./pages/community/Discord.jsx'))
const Forum = lazy(() => import('./pages/community/Forum.jsx'))
const Events = lazy(() => import('./pages/community/Events.jsx'))
const Hackathons = lazy(() => import('./pages/community/Hackathons.jsx'))
const Newsletter = lazy(() => import('./pages/community/Newsletter.jsx'))
const Documentation = lazy(() => import('./pages/resources/Documentation.jsx'))
const ApiReference = lazy(() => import('./pages/resources/ApiReference.jsx'))
const Blog = lazy(() => import('./pages/resources/Blog.jsx'))
const Changelog = lazy(() => import('./pages/resources/Changelog.jsx'))
const Status = lazy(() => import('./pages/resources/Status.jsx'))
const ProductFeatures = lazy(() => import('./pages/ProductFeatures.jsx'))
const FindTeammates = lazy(() => import('./pages/FindTeammates.jsx'))
const PortfolioGeneratorLanding = lazy(() => import('./pages/PortfolioGeneratorLanding.jsx'))
const ProjectInvitation = lazy(() => import('./pages/ProjectInvitation.jsx'))

function PageLoader() {
  return (
    <div className="min-h-screen bg-[#050816] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
    </div>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <NotificationProvider>
        <AuthProvider>
          <ToastContainer />
          <CommandPalette />
          <ErrorBoundary>
            <Suspense fallback={<PageLoader />}>
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
            </Suspense>
          </ErrorBoundary>
        </AuthProvider>
      </NotificationProvider>
    </BrowserRouter>
  </StrictMode>,
)
