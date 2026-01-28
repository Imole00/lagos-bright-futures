import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import api from '../api';
import { 
  Heart, LogOut, Users, CheckCircle, Clock, XCircle, 
  TrendingUp, Map, FileText, PlusCircle 
} from 'lucide-react';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [orphanages, setOrphanages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsData, orphanagesData] = await Promise.all([
        api.getStats(),
        api.getOrphanages({ limit: 10 })
      ]);
      setStats(statsData.overview);
      setOrphanages(orphanagesData.orphanages);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <Heart className="w-8 h-8 text-primary-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Lagos Bright Futures</h1>
                <p className="text-sm text-gray-500">Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.full_name}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role.replace('_', ' ')}</p>
              </div>
              <button onClick={handleLogout} className="btn-secondary flex items-center space-x-2">
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-primary-600 to-blue-600 rounded-xl p-8 text-white mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome back, {user?.full_name}!</h2>
          <p className="text-primary-100">
            {user?.role === 'orphanage_admin' && 'Manage your orphanage and access resources.'}
            {user?.role === 'government_validator' && 'Review and verify orphanage applications.'}
            {user?.role === 'sponsor' && 'Explore sponsorship opportunities and track impact.'}
            {user?.role === 'ngo_partner' && 'Collaborate on programs and initiatives.'}
            {user?.role === 'super_admin' && 'System overview and administration.'}
          </p>
        </div>

        {/* Statistics Grid */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              icon={Users}
              title="Total Orphanages"
              value={stats.total_orphanages || 0}
              color="blue"
            />
            <StatCard
              icon={CheckCircle}
              title="Verified"
              value={stats.verified || 0}
              color="green"
            />
            <StatCard
              icon={Clock}
              title="Pending"
              value={stats.pending || 0}
              color="yellow"
            />
            <StatCard
              icon={TrendingUp}
              title="Total Children"
              value={stats.total_children || 0}
              color="purple"
            />
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <button
            onClick={() => navigate('/map')}
            className="card hover:shadow-md transition-shadow cursor-pointer text-left"
          >
            <Map className="w-10 h-10 text-primary-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">View Map</h3>
            <p className="text-gray-600 text-sm">Interactive map of all orphanages</p>
          </button>

          {user?.role === 'orphanage_admin' && (
            <button
              onClick={() => navigate('/orphanages/register')}
              className="card hover:shadow-md transition-shadow cursor-pointer text-left"
            >
              <PlusCircle className="w-10 h-10 text-success-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Register Orphanage</h3>
              <p className="text-gray-600 text-sm">Add your orphanage to the platform</p>
            </button>
          )}

          {(user?.role === 'government_validator' || user?.role === 'super_admin') && (
            <button
              onClick={() => navigate('/verification')}
              className="card hover:shadow-md transition-shadow cursor-pointer text-left"
            >
              <FileText className="w-10 h-10 text-warning-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Verify Documents</h3>
              <p className="text-gray-600 text-sm">Review pending applications</p>
            </button>
          )}
        </div>

        {/* Recent Orphanages */}
        <div className="card">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Recent Orphanages</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Name</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">LGA</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Capacity</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody>
                {orphanages.map((orphanage) => (
                  <tr key={orphanage.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-900">{orphanage.name}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{orphanage.lga}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{orphanage.capacity || 'N/A'}</td>
                    <td className="py-3 px-4">
                      <StatusBadge status={orphanage.verification_status} />
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => navigate(`/orphanages/${orphanage.id}`)}
                        className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ icon: Icon, title, value, color }) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    purple: 'bg-purple-100 text-purple-600'
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const badges = {
    verified: { class: 'badge-verified', text: 'Verified' },
    pending: { class: 'badge-pending', text: 'Pending' },
    rejected: { class: 'badge-rejected', text: 'Rejected' },
    suspended: { class: 'badge-rejected', text: 'Suspended' }
  };

  const badge = badges[status] || badges.pending;
  return <span className={badge.class}>{badge.text}</span>;
}
