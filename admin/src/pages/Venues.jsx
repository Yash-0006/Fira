import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ApprovalPage.css';

const mockVenues = [
    {
        id: '1',
        name: 'Skyline Rooftop Lounge',
        owner: 'John Doe',
        email: 'john@example.com',
        city: 'Mumbai',
        capacity: 500,
        status: 'pending',
        createdAt: '2024-12-22',
        images: [],
    },
    {
        id: '2',
        name: 'Beach Club Paradise',
        owner: 'Sarah Lee',
        email: 'sarah@example.com',
        city: 'Goa',
        capacity: 1000,
        status: 'pending',
        createdAt: '2024-12-20',
        images: [],
    },
    {
        id: '3',
        name: 'Downtown Convention Center',
        owner: 'Mike Johnson',
        email: 'mike@example.com',
        city: 'Delhi',
        capacity: 2000,
        status: 'pending',
        createdAt: '2024-12-19',
        images: [],
    },
    {
        id: '4',
        name: 'Garden Party Venue',
        owner: 'Emma Wilson',
        email: 'emma@example.com',
        city: 'Bangalore',
        capacity: 300,
        status: 'approved',
        createdAt: '2024-12-18',
        images: [],
    },
];

export default function Venues() {
    const navigate = useNavigate();
    const [venues, setVenues] = useState(mockVenues);
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');

    const filteredVenues = venues.filter(v => {
        const matchesFilter = filter === 'all' ? true : v.status === filter;
        const matchesSearch = v.name.toLowerCase().includes(search.toLowerCase()) ||
            v.owner.toLowerCase().includes(search.toLowerCase()) ||
            v.city.toLowerCase().includes(search.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const handleApprove = (id) => {
        setVenues(venues.map(v =>
            v.id === id ? { ...v, status: 'approved' } : v
        ));
    };

    const handleReject = (id) => {
        setVenues(venues.map(v =>
            v.id === id ? { ...v, status: 'rejected' } : v
        ));
    };

    const handleBlock = (id) => {
        setVenues(venues.map(v =>
            v.id === id ? { ...v, status: 'blocked' } : v
        ));
    };

    const pendingCount = venues.filter(v => v.status === 'pending').length;

    return (
        <div className="approval-page">
            <div className="page-header">
                <div>
                    <h1>Venues</h1>
                    <p>Manage and approve venue listings</p>
                </div>
                <div className="header-stats">
                    <span className="pending-badge">{pendingCount} pending</span>
                </div>
            </div>

            {/* Filters */}
            <div className="filters" style={{ justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {['all', 'pending', 'approved', 'rejected'].map(status => (
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
                    placeholder="Search venues..."
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
                                <th>Venue</th>
                                <th>Owner</th>
                                <th>Location</th>
                                <th>Capacity</th>
                                <th>Status</th>
                                <th>Created</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredVenues.map((venue) => (
                                <tr key={venue.id} onClick={() => navigate(`/venues/${venue.id}`)} style={{ cursor: 'pointer' }}>
                                    <td>
                                        <div className="venue-info">
                                            <div className="venue-thumb">
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" />
                                                </svg>
                                            </div>
                                            <span className="venue-name">{venue.name}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div>
                                            <div>{venue.owner}</div>
                                            <div className="text-muted">{venue.email}</div>
                                        </div>
                                    </td>
                                    <td>{venue.city}</td>
                                    <td>{venue.capacity.toLocaleString()}</td>
                                    <td>
                                        <span className={`badge badge-${venue.status}`}>
                                            {venue.status}
                                        </span>
                                    </td>
                                    <td>{venue.createdAt}</td>
                                    <td>
                                        <div className="actions">
                                            {venue.status === 'pending' && (
                                                <>
                                                    <button className="btn btn-success btn-sm" onClick={() => handleApprove(venue.id)}>
                                                        Approve
                                                    </button>
                                                    <button className="btn btn-danger btn-sm" onClick={() => handleReject(venue.id)}>
                                                        Reject
                                                    </button>
                                                </>
                                            )}
                                            {venue.status === 'approved' && (
                                                <button className="btn btn-danger btn-sm" onClick={() => handleBlock(venue.id)}>
                                                    Block
                                                </button>
                                            )}
                                            {venue.status === 'blocked' && (
                                                <button className="btn btn-success btn-sm" onClick={() => handleApprove(venue.id)}>
                                                    Unblock
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
