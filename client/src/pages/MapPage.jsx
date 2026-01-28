import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { Home, ArrowLeft, Filter } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet default marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Lagos State center coordinates
const LAGOS_CENTER = [6.5244, 3.3792];

// Lagos LGAs for filtering
const LAGOS_LGAS = [
  'Alimosho', 'Ajeromi-Ifelodun', 'Kosofe', 'Mushin', 'Oshodi-Isolo',
  'Ojo', 'Ikorodu', 'Surulere', 'Agege', 'Ifako-Ijaiye',
  'Somolu', 'Amuwo-Odofin', 'Lagos Mainland', 'Ikeja', 'Eti-Osa',
  'Badagry', 'Apapa', 'Lagos Island', 'Epe', 'Ibeju-Lekki'
];

export default function MapPage() {
  const navigate = useNavigate();
  const [orphanages, setOrphanages] = useState([]);
  const [filteredOrphanages, setFilteredOrphanages] = useState([]);
  const [selectedLGA, setSelectedLGA] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('verified');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrphanages();
  }, [selectedStatus]);

  useEffect(() => {
    filterOrphanages();
  }, [orphanages, selectedLGA]);

  const fetchOrphanages = async () => {
    try {
      const data = await api.getOrphanages({ status: selectedStatus });
      setOrphanages(data.orphanages);
    } catch (error) {
      console.error('Error fetching orphanages:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterOrphanages = () => {
    if (selectedLGA) {
      setFilteredOrphanages(orphanages.filter(o => o.lga === selectedLGA));
    } else {
      setFilteredOrphanages(orphanages);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
            <h1 className="text-xl font-bold text-gray-900">Orphanage Map - Lagos State</h1>
            <button 
              onClick={() => navigate('/dashboard')}
              className="btn-secondary flex items-center space-x-2"
            >
              <Home className="w-4 h-4" />
              <span>Dashboard</span>
            </button>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <select
              value={selectedLGA}
              onChange={(e) => setSelectedLGA(e.target.value)}
              className="input-field w-64"
            >
              <option value="">All LGAs</option>
              {LAGOS_LGAS.map(lga => (
                <option key={lga} value={lga}>{lga}</option>
              ))}
            </select>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="input-field w-48"
            >
              <option value="verified">Verified Only</option>
              <option value="pending">Pending</option>
              <option value="">All Status</option>
            </select>
            <div className="flex-1"></div>
            <div className="text-sm text-gray-600">
              Showing {filteredOrphanages.length} orphanage{filteredOrphanages.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="p-4">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="card h-[600px] flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading map...</p>
              </div>
            </div>
          ) : (
            <div className="card p-0 overflow-hidden h-[600px]">
              <MapContainer 
                center={LAGOS_CENTER} 
                zoom={11} 
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {filteredOrphanages.map(orphanage => {
                  // Use actual coordinates if available, otherwise use sample coordinates
                  const lat = orphanage.latitude || (6.5244 + (Math.random() - 0.5) * 0.3);
                  const lng = orphanage.longitude || (3.3792 + (Math.random() - 0.5) * 0.3);
                  
                  return (
                    <Marker key={orphanage.id} position={[lat, lng]}>
                      <Popup>
                        <div className="p-2">
                          <h3 className="font-semibold text-gray-900 mb-1">{orphanage.name}</h3>
                          <p className="text-sm text-gray-600 mb-2">{orphanage.lga}</p>
                          <p className="text-xs text-gray-500 mb-2">
                            Capacity: {orphanage.capacity || 'N/A'} | 
                            Current: {orphanage.current_children || 0}
                          </p>
                          <button
                            onClick={() => navigate(`/orphanages/${orphanage.id}`)}
                            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                          >
                            View Details →
                          </button>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
              </MapContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
