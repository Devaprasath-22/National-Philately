import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import StampCatalog from './pages/StampCatalog';
import StampDetail from './pages/StampDetail';
import Forum from './pages/Forum';
import ForumPostDetail from './pages/ForumPostDetail';
import Trades from './pages/Trades';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import CollectionDashboard from './pages/CollectionDashboard';
import Wishlist from './pages/Wishlist';
import Collectors from './pages/Collectors';
import PublicProfile from './pages/PublicProfile';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <Navbar />
          <main className="main-content">
            <Routes>
              {/* Public */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/stamps" element={<StampCatalog />} />
              <Route path="/stamps/:id" element={<StampDetail />} />
              <Route path="/forum" element={<Forum />} />
              <Route path="/forum/:id" element={<ForumPostDetail />} />
              <Route path="/collectors" element={<Collectors />} />
              <Route path="/collectors/:username" element={<PublicProfile />} />

              {/* Protected (logged in) */}
              <Route path="/trades" element={<ProtectedRoute><Trades /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><CollectionDashboard /></ProtectedRoute>} />
              <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />

              {/* Admin only */}
              <Route path="/admin" element={<ProtectedRoute adminOnly={true}><AdminDashboard /></ProtectedRoute>} />

              {/* 404 */}
              <Route path="*" element={
                <div className="empty-state" style={{ minHeight: '50vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <div className="empty-icon">📮</div>
                  <h3>Page Not Found</h3>
                  <p>The page you're looking for doesn't exist.</p>
                  <a href="/" className="btn btn-primary mt-2" style={{ alignSelf: 'center' }}>Go Home</a>
                </div>
              } />
            </Routes>
          </main>
          <Footer />
        </div>

        <Toaster position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              background: '#1a1f35', color: '#f1f5f9',
              border: '1px solid rgba(148, 163, 184, 0.12)',
              borderRadius: '12px', fontFamily: 'Inter, sans-serif',
            },
            success: { iconTheme: { primary: '#10b981', secondary: '#1a1f35' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#1a1f35' } }
          }}
        />
      </Router>
    </AuthProvider>
  );
}

export default App;
