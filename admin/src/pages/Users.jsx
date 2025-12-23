import { useState } from 'react';
import './ApprovalPage.css';

const mockUsers = [
    {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+91 98765 43210',
        role: 'user',
        eventsAttended: 12,
        ticketsPurchased: 15,
        totalSpent: 22500,
        isBlocked: false,
        createdAt: '2024-10-15',
    },
    {
        id: '2',
        name: 'Sarah Johnson',
        email: 'sarah@partyplus.com',
        phone: '+91 87654 32109',
        role: 'organizer',
        eventsAttended: 5,
        ticketsPurchased: 8,
        totalSpent: 12000,
        isBlocked: false,
        createdAt: '2024-09-20',
    },
    {
        id: '3',
        name: 'Mike Wilson',
        email: 'mike@djcosmic.com',
        phone: '+91 76543 21098',
        role: 'brand',
        eventsAttended: 25,
        ticketsPurchased: 30,
        totalSpent: 45000,
        isBlocked: false,
        createdAt: '2024-08-10',
    },
    {
        id: '4',
        name: 'Spam Account',
        email: 'spam@fake.com',
        phone: '+91 11111 11111',
        role: 'user',
        eventsAttended: 0,
        ticketsPurchased: 0,
        totalSpent: 0,
        isBlocked: true,
        createdAt: '2024-12-20',
    },
];

export default function Users() {
    const [users, setUsers] = useState(mockUsers);
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');

    const filteredUsers = users.filter(u => {
        const matchesFilter = filter === 'all' ? true :
            filter === 'blocked' ? u.isBlocked :
                filter === 'active' ? !u.isBlocked :
                    u.role === filter;
        const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
            u.email.toLowerCase().includes(search.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const handleBlock = (id) => {
        setUsers(users.map(u =>
            u.id === id ? { ...u, isBlocked: true } : u
        ));
    };

    const handleUnblock = (id) => {
        setUsers(users.map(u =>
            u.id === id ? { ...u, isBlocked: false } : u
        ));
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const totalUsers = users.length;
    const blockedUsers = users.filter(u => u.isBlocked).length;

    return (
        <div className="approval-page">
            <div className="page-header">
                <div>
                    <h1>Users</h1>
                    <p>Manage platform users</p>
                </div>
                <div className="header-stats">
                    <span style={{ color: 'var(--text-secondary)' }}>{totalUsers} total</span>
                    <span className="pending-badge" style={{ background: 'rgba(239, 68, 68, 0.2)', color: 'var(--accent-red)' }}>
                        {blockedUsers} blocked
                    </span>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="filters" style={{ justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {['all', 'user', 'organizer', 'brand', 'blocked'].map(status => (
                        <button
                            key={status}
                            className={`filter-btn ${filter === status ? 'active' : ''}`}
                            onClick={() => setFilter(status)}
                        >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                    ))}
                </div>
                <input
                    type="text"
                    placeholder="Search users..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="search-input"
                />
            </div>

            {/* Table */}
            <div className="card mt-4">
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Role</th>
                                <th>Events Attended</th>
                                <th>Tickets Purchased</th>
                                <th>Total Spent</th>
                                <th>Joined</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map((user) => (
                                <tr key={user.id}>
                                    <td>
                                        <div className="venue-info">
                                            <div className="avatar">{user.name.charAt(0)}</div>
                                            <div>
                                                <div className="venue-name">{user.name}</div>
                                                <div className="text-muted">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`badge ${user.role === 'brand' ? 'badge-approved' :
                                                user.role === 'organizer' ? 'badge-active' :
                                                    'badge-pending'
                                            }`} style={{ textTransform: 'capitalize' }}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td>{user.eventsAttended}</td>
                                    <td>{user.ticketsPurchased}</td>
                                    <td style={{ color: 'var(--accent-green)', fontWeight: 600 }}>
                                        {formatCurrency(user.totalSpent)}
                                    </td>
                                    <td>{user.createdAt}</td>
                                    <td>
                                        <span className={`badge ${user.isBlocked ? 'badge-rejected' : 'badge-approved'}`}>
                                            {user.isBlocked ? 'Blocked' : 'Active'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="actions">
                                            {user.isBlocked ? (
                                                <button className="btn btn-success btn-sm" onClick={() => handleUnblock(user.id)}>
                                                    Unblock
                                                </button>
                                            ) : (
                                                <button className="btn btn-danger btn-sm" onClick={() => handleBlock(user.id)}>
                                                    Block
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
