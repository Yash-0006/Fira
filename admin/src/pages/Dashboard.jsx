import './Dashboard.css';

const mockStats = {
    pendingVenues: 12,
    pendingEvents: 8,
    pendingBrands: 5,
    totalUsers: 1234,
    totalRevenue: 458900,
    ticketsSold: 3456,
};

const recentPending = [
    { id: 1, type: 'venue', name: 'Skyline Rooftop', owner: 'John Doe', date: '2024-12-22' },
    { id: 2, type: 'event', name: 'New Year Bash', owner: 'Party Plus', date: '2024-12-21' },
    { id: 3, type: 'brand', name: 'DJ Cosmic', owner: 'Mike Wilson', date: '2024-12-21' },
    { id: 4, type: 'venue', name: 'Beach Club', owner: 'Sarah Lee', date: '2024-12-20' },
    { id: 5, type: 'event', name: 'Live Concert', owner: 'Music Hub', date: '2024-12-20' },
];

export default function Dashboard() {
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <div className="dashboard">
            <div className="page-header">
                <h1>Dashboard</h1>
                <p>Overview of platform activity and pending approvals</p>
            </div>

            {/* Stats Grid */}
            <div className="grid-4 mb-6">
                <div className="stats-card">
                    <h3>Pending Venues</h3>
                    <div className="value" style={{ color: 'var(--accent-orange)' }}>
                        {mockStats.pendingVenues}
                    </div>
                </div>
                <div className="stats-card">
                    <h3>Pending Events</h3>
                    <div className="value" style={{ color: 'var(--accent-orange)' }}>
                        {mockStats.pendingEvents}
                    </div>
                </div>
                <div className="stats-card">
                    <h3>Pending Brands</h3>
                    <div className="value" style={{ color: 'var(--accent-orange)' }}>
                        {mockStats.pendingBrands}
                    </div>
                </div>
                <div className="stats-card">
                    <h3>Total Users</h3>
                    <div className="value">{mockStats.totalUsers.toLocaleString()}</div>
                </div>
            </div>

            <div className="grid-2 gap-6">
                {/* Revenue Card */}
                <div className="card">
                    <h2 className="card-title">Platform Revenue</h2>
                    <div className="revenue-value">{formatCurrency(mockStats.totalRevenue)}</div>
                    <p className="revenue-subtitle">Total earnings from ticket sales</p>
                    <div className="stats-row mt-4">
                        <div>
                            <div className="stats-label">Tickets Sold</div>
                            <div className="stats-number">{mockStats.ticketsSold.toLocaleString()}</div>
                        </div>
                        <div>
                            <div className="stats-label">Avg. Ticket Price</div>
                            <div className="stats-number">
                                {formatCurrency(mockStats.totalRevenue / mockStats.ticketsSold)}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Pending */}
                <div className="card">
                    <h2 className="card-title">Recent Pending Approvals</h2>
                    <div className="pending-list">
                        {recentPending.map((item) => (
                            <div key={item.id} className="pending-item">
                                <div className="pending-info">
                                    <span className={`badge badge-${item.type === 'venue' ? 'pending' : item.type === 'event' ? 'active' : 'approved'}`}>
                                        {item.type}
                                    </span>
                                    <span className="pending-name">{item.name}</span>
                                </div>
                                <div className="pending-meta">
                                    <span>{item.owner}</span>
                                    <span className="pending-date">{item.date}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
