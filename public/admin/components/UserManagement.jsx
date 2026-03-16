const { useState, useEffect } = React;

const UserManagement = () => {
    // Demo states (to be replaced with API Hooks)
    const [users, setUsers] = useState([]);
    const [teams, setTeams] = useState([]);
    const [filters, setFilters] = useState({ search: '', role: '', status: '', limit: 10 });

    useEffect(() => {
        fetchUsers();
        fetchTeams();
    }, [filters]);

    const fetchUsers = async () => {
        try {
            const queryParams = new URLSearchParams(filters).toString();
            const res = await fetch(`/api/users?${queryParams}`);
            const json = await res.json();
            setUsers(json.data || []);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const fetchTeams = async () => {
        try {
            const res = await fetch('/api/users/team');
            const data = await res.json();
            setTeams(data || []);
        } catch (error) {
            console.error('Error fetching teams:', error);
        }
    };

    const handleFilterChange = (e) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const applyFilters = () => {
        fetchUsers();
    };

    const resetFilters = () => {
        setFilters({ search: '', role: '', status: '', limit: 10 });
    };

    const toggleStatus = async (id, currentStatus) => {
        const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
        try {
            await fetch(`/api/users/${id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            fetchUsers();
            fetchTeams();
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    return (
        <div className="p-6 bg-slate-50 min-h-screen font-sans">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">User Management</h1>
                    <p className="text-sm text-slate-500 mt-1">Manage system administrators, managers, and sales representatives.</p>
                </div>
                <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium shadow-sm transition-colors flex items-center gap-2">
                    <span>+</span> Add User
                </button>
            </div>

            {/* Filters Section */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm mb-6 flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-[240px]">
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Search</label>
                    <input
                        type="text"
                        name="search"
                        value={filters.search}
                        onChange={handleFilterChange}
                        placeholder="Search by name or email..."
                        className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow"
                    />
                </div>

                <div className="w-48">
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Role</label>
                    <select
                        name="role"
                        value={filters.role}
                        onChange={handleFilterChange}
                        className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white transition-shadow"
                    >
                        <option value="">All Roles</option>
                        <option value="Superadmin">Superadmin</option>
                        <option value="Admin">Admin</option>
                        <option value="Manager">Manager</option>
                        <option value="Sales">Sales</option>
                    </select>
                </div>

                <div className="w-48">
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Status</label>
                    <select
                        name="status"
                        value={filters.status}
                        onChange={handleFilterChange}
                        className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white transition-shadow"
                    >
                        <option value="">All Statuses</option>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                    </select>
                </div>

                <div className="w-32">
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Rows</label>
                    <select
                        name="limit"
                        value={filters.limit}
                        onChange={handleFilterChange}
                        className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white transition-shadow"
                    >
                        <option value="10">10</option>
                        <option value="25">25</option>
                        <option value="50">50</option>
                    </select>
                </div>

                <div className="flex gap-2">
                    <button onClick={applyFilters} className="bg-slate-800 hover:bg-slate-900 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm">
                        Filter
                    </button>
                    <button onClick={resetFilters} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors">
                        Reset
                    </button>
                </div>
            </div>

            {/* Users Table List */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-8">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600 whitespace-nowrap">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-800">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Name & Email</th>
                                <th className="px-6 py-4 font-semibold">Phone</th>
                                <th className="px-6 py-4 font-semibold">Role</th>
                                <th className="px-6 py-4 font-semibold">Reporting Manager</th>
                                <th className="px-6 py-4 font-semibold text-center">Auto Assign Weight</th>
                                <th className="px-6 py-4 font-semibold">Status</th>
                                <th className="px-6 py-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {users.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-8 text-center text-slate-500">
                                        No users found.
                                    </td>
                                </tr>
                            ) : users.map(user => (
                                <tr key={user._id} className="hover:bg-slate-50/80 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-slate-900">{user.fullName}</div>
                                        <div className="text-xs text-slate-500 mt-0.5">{user.email}</div>
                                    </td>
                                    <td className="px-6 py-4">{user.phone || 'N/A'}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ring-1 ring-inset ${user.role === 'Superadmin' ? 'bg-indigo-50 text-indigo-700 ring-indigo-700/10' :
                                                user.role === 'Admin' ? 'bg-blue-50 text-blue-700 ring-blue-700/10' :
                                                    user.role === 'Manager' ? 'bg-purple-50 text-purple-700 ring-purple-700/10' :
                                                        'bg-slate-50 text-slate-700 ring-slate-700/10'
                                            }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {user.reportingManager ? user.reportingManager.fullName : <span className="text-slate-400 italic">None</span>}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="font-semibold text-slate-700">{user.autoAssignWeight}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => toggleStatus(user._id, user.status)}
                                                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 transition-colors duration-200 ease-in-out ${user.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-300'}`}
                                            >
                                                <span className={`${user.status === 'Active' ? 'translate-x-2' : '-translate-x-2'} pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`} />
                                            </button>
                                            <span className={`text-xs font-medium px-2 py-0.5 rounded border ${user.status === 'Active' ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 'text-slate-600 bg-slate-100 border-slate-200'}`}>
                                                {user.status}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-indigo-600 hover:text-indigo-900 font-medium text-sm transition-colors">Edit</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Footer */}
                <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between text-sm text-slate-500 bg-slate-50">
                    <div>Showing <span className="font-medium text-slate-900">1</span> to <span className="font-medium text-slate-900">10</span> of <span className="font-medium text-slate-900">45</span> results</div>
                    <div className="flex gap-1.5">
                        <button className="px-3.5 py-1.5 border border-slate-300 rounded-md hover:bg-white bg-transparent transition-colors shadow-sm disabled:opacity-50">Previous</button>
                        <button className="px-3.5 py-1.5 border border-indigo-600 rounded-md bg-indigo-50 text-indigo-600 font-medium shadow-sm">1</button>
                        <button className="px-3.5 py-1.5 border border-slate-300 rounded-md hover:bg-white bg-transparent transition-colors shadow-sm">2</button>
                        <button className="px-3.5 py-1.5 border border-slate-300 rounded-md hover:bg-white bg-transparent transition-colors shadow-sm">3</button>
                        <button className="px-3.5 py-1.5 border border-slate-300 rounded-md hover:bg-white bg-transparent transition-colors shadow-sm">Next</button>
                    </div>
                </div>
            </div>

            {/* Teams by Manager View */}
            <h2 className="text-lg font-bold text-slate-800 mb-4 px-1">Teams Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {teams.length === 0 ? (
                    <div className="col-span-full p-6 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
                        No teams available
                    </div>
                ) : teams.map(team => (
                    <div key={team.managerId} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-100">
                            <div className="w-11 h-11 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm shadow-inner uppercase">
                                {team.managerName.substring(0, 2)}
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 leading-tight">{team.managerName}</h3>
                                <p className="text-xs text-slate-500 mt-0.5">Manager Department</p>
                            </div>
                            <span className="ml-auto bg-slate-100 text-slate-600 py-1 px-2.5 rounded text-xs font-semibold shadow-sm border border-slate-200">
                                {team.members.length} {team.members.length === 1 ? 'Member' : 'Members'}
                            </span>
                        </div>

                        <div className="space-y-3">
                            {team.members.map(member => (
                                <div key={member._id} className="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                                    <div className="flex items-center gap-2.5">
                                        <div className="relative flex h-2.5 w-2.5">
                                            {member.status === 'Active' && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
                                            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${member.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-slate-700">{member.fullName}</div>
                                            <div className="text-[10px] text-slate-400">{member.email}</div>
                                        </div>
                                    </div>
                                    <span className="text-slate-500 text-xs font-medium">{member.role}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
