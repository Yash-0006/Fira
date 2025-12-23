import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Venues from './pages/Venues';
import VenueDetail from './pages/VenueDetail';
import Events from './pages/Events';
import EventDetail from './pages/EventDetail';
import Brands from './pages/Brands';
import BrandDetail from './pages/BrandDetail';
import Users from './pages/Users';
import Login from './pages/Login';
import './index.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return (
      <Router>
        <Routes>
          <Route path="*" element={<Login onLogin={handleLogin} />} />
        </Routes>
      </Router>
    );
  }

  return (
    <Router>
      <div className="app-container">
        <Sidebar onLogout={handleLogout} />
        <main className="main-content" style={{ marginLeft: '260px' }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/venues" element={<Venues />} />
            <Route path="/venues/:id" element={<VenueDetail />} />
            <Route path="/events" element={<Events />} />
            <Route path="/events/:id" element={<EventDetail />} />
            <Route path="/brands" element={<Brands />} />
            <Route path="/brands/:id" element={<BrandDetail />} />
            <Route path="/users" element={<Users />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
