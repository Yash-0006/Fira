import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ApprovalPage.css';

const mockBrands = [
    {
        id: '1',
        name: 'DJ Cosmic',
        owner: 'Mike Wilson',
        email: 'cosmic@djcosmic.com',
        category: 'DJ',
        followers: 12500,
        eventsHosted: 45,
        status: 'pending',
        createdAt: '2024-12-21',
    },
    {
        id: '2',
        name: 'Party Plus Entertainment',
        owner: 'Sarah Johnson',
        email: 'hello@partyplus.com',
        category: 'Event Planner',
        followers: 8900,
        eventsHosted: 120,
        status: 'approved',
        createdAt: '2024-12-15',
    },
    {
        id: '3',
        name: 'Sound Wave Productions',
        owner: 'Alex Turner',
        email: 'contact@soundwave.com',
        category: 'Production',
        followers: 5600,
        eventsHosted: 30,
        status: 'pending',
        createdAt: '2024-12-22',
    },
    {
        id: '4',
        name: 'Nightlife Kings',
        owner: 'Raj Patel',
        email: 'info@nightlifekings.com',
        category: 'Promoter',
        followers: 25000,
        eventsHosted: 200,
        status: 'approved',
        createdAt: '2024-12-10',
    },
];

export default function Brands() {
    const navigate = useNavigate();
    const [brands, setBrands] = useState(mockBrands);
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');

    const filteredBrands = brands.filter(b => {
        const matchesFilter = filter === 'all' ? true : b.status === filter;
        const matchesSearch = b.name.toLowerCase().includes(search.toLowerCase()) ||
            b.owner.toLowerCase().includes(search.toLowerCase()) ||
            b.category.toLowerCase().includes(search.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const handleApprove = (id) => {
        setBrands(brands.map(b =>
            b.id === id ? { ...b, status: 'approved' } : b
        ));
    };

    const handleReject = (id) => {
        setBrands(brands.map(b =>
            b.id === id ? { ...b, status: 'rejected' } : b
        ));
    };

    const handleBlock = (id) => {
        setBrands(brands.map(b =>
            b.id === id ? { ...b, status: 'blocked' } : b
        ));
    };

    const pendingCount = brands.filter(b => b.status === 'pending').length;

    return (
        <div className="approval-page">
            <div className="page-header">
                <div>
                    <h1>Brands</h1>
                    <p>Manage and approve brand profiles</p>
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
                    placeholder="Search brands..."
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
                                <th>Brand</th>
                                <th>Owner</th>
                                <th>Category</th>
                                <th>Followers</th>
                                <th>Events Hosted</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredBrands.map((brand) => (
                                <tr key={brand.id} onClick={() => navigate(`/brands/${brand.id}`)} style={{ cursor: 'pointer' }}>
                                    <td>
                                        <div className="venue-info">
                                            <div className="avatar">{brand.name.charAt(0)}</div>
                                            <span className="venue-name">{brand.name}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div>
                                            <div>{brand.owner}</div>
                                            <div className="text-muted">{brand.email}</div>
                                        </div>
                                    </td>
                                    <td>{brand.category}</td>
                                    <td>{brand.followers.toLocaleString()}</td>
                                    <td>{brand.eventsHosted}</td>
                                    <td>
                                        <span className={`badge badge-${brand.status}`}>
                                            {brand.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="actions">
                                            {brand.status === 'pending' && (
                                                <>
                                                    <button className="btn btn-success btn-sm" onClick={() => handleApprove(brand.id)}>
                                                        Approve
                                                    </button>
                                                    <button className="btn btn-danger btn-sm" onClick={() => handleReject(brand.id)}>
                                                        Reject
                                                    </button>
                                                </>
                                            )}
                                            {brand.status === 'approved' && (
                                                <button className="btn btn-danger btn-sm" onClick={() => handleBlock(brand.id)}>
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
