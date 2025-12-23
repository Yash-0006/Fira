import { useState, useEffect } from 'react';
import adminApi from '../api/adminApi';
import './Dashboard.css';

export default function Dashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await adminApi.getStats();
                setStats(data);
            } catch (err) {
                setError(err.message);
                // Use mock data as fallback
                setStats({
                    pendingVenues: 0,
                    pendingEvents: 0,
                    pendingBrands: 0,
                    totalUsers: 0,
                    totalRevenue: 0,
                    totalTickets: 0,
                });
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(amount);
    };

    if (loading) {
        return (
            <div className="dashboard">
                <div className="page-header">
                    <h1>Dashboard</h1>
                    <p>Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard">
            <div className="page-header">
                <h1>Dashboard</h1>
                <p>Overview of platform activity and pending approvals</p>
            </div>

            {error && (
                <div style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: 'var(--accent-red)',
                    padding: '0.75rem 1rem',
                    borderRadius: '0.5rem',
                    marginBottom: '1.5rem',
                    fontSize: '0.875rem'
                }}>
                    ⚠️ Could not connect to server. Showing placeholder data.
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid-4 mb-6">
                <div className="stats-card">
                    <h3>Pending Venues</h3>
                    <div className="value" style={{ color: 'var(--accent-orange)' }}>
                        {stats?.pendingVenues || 0}
                    </div>
                </div>
                <div className="stats-card">
                    <h3>Pending Events</h3>
                    <div className="value" style={{ color: 'var(--accent-orange)' }}>
                        {stats?.pendingEvents || 0}
                    </div>
                </div>
                <div className="stats-card">
                    <h3>Pending Brands</h3>
                    <div className="value" style={{ color: 'var(--accent-orange)' }}>
                        {stats?.pendingBrands || 0}
                    </div>
                </div>
                <div className="stats-card">
                    <h3>Total Users</h3>
                    <div className="value">{(stats?.totalUsers || 0).toLocaleString()}</div>
                </div>
            </div>

            <div className="grid-2 gap-6">
                {/* Revenue Card */}
                <div className="card">
                    <h2 className="card-title">Platform Revenue</h2>
                    <div className="revenue-value">{formatCurrency(stats?.totalRevenue || 0)}</div>
                    <p className="revenue-subtitle">Total earnings from ticket sales</p>
                    <div className="stats-row mt-4">
                        <div>
                            <div className="stats-label">Tickets Sold</div>
                            <div className="stats-number">{(stats?.totalTickets || 0).toLocaleString()}</div>
                        </div>
                        <div>
                            <div className="stats-label">Avg. Ticket Price</div>
                            <div className="stats-number">
                                {stats?.totalTickets > 0
                                    ? formatCurrency((stats?.totalRevenue || 0) / stats.totalTickets)
                                    : '₹0'
                                }
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="card">
                    <h2 className="card-title">Platform Overview</h2>
                    <div className="stats-list">
                        <div className="stat-item">
                            <span>Total Venues</span>
                            <span className="stat-value">{stats?.totalVenues || 0}</span>
                        </div>
                        <div className="stat-item">
                            <span>Total Events</span>
                            <span className="stat-value">{stats?.totalEvents || 0}</span>
                        </div>
                        <div className="stat-item">
                            <span>Total Brands</span>
                            <span className="stat-value">{stats?.totalBrands || 0}</span>
                        </div>
                        <div className="stat-item">
                            <span>Blocked Users</span>
                            <span className="stat-value" style={{ color: 'var(--accent-red)' }}>{stats?.blockedUsers || 0}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
