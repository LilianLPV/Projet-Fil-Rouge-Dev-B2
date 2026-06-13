import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import ListingsPage from './pages/ListingsPage'
import ListingDetailPage from './pages/ListingDetailPage'
import NewListingPage from './pages/NewListingPage'
import AgenciesPage from './pages/AgenciesPage'
import AgencyDetailPage from './pages/AgencyDetailPage'
import MyApplicationsPage from './pages/MyApplicationsPage'
import AdminApplicationsPage from './pages/AdminApplicationsPage'
import DashboardPage from './pages/DashboardPage'
import UsersPage from './pages/UsersPage'
import AnalyticsPage from './pages/AnalyticsPage'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen" style={{ background: 'var(--cream)', fontFamily: 'var(--font-body)' }}>
          <Navbar />
          <main id="main-content" tabIndex="-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/listings" element={<ListingsPage />} />
              <Route path="/listings/new" element={<NewListingPage />} />
              <Route path="/listings/:id" element={<ListingDetailPage />} />
              <Route path="/agencies" element={<AgenciesPage />} />
              <Route path="/agencies/:id" element={<AgencyDetailPage />} />
              <Route path="/my-applications" element={<MyApplicationsPage />} />
              <Route path="/applications" element={<AdminApplicationsPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/users" element={<UsersPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  )
}
