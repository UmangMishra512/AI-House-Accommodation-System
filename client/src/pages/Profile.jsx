import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api, { BACKEND_URL } from '../lib/api';
import { Link } from 'react-router-dom';
import { User as UserIcon, MapPin, Trash2, Edit, CheckCircle, XCircle } from 'lucide-react';

const Profile = () => {
  const { user } = useContext(AuthContext);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProperties = async () => {
    try {
      const res = await api.get('/property');
      const userProps = res.data.filter(p => p.owner_id && p.owner_id._id === user.id);
      setProperties(userProps);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchProperties();
    }
  }, [user]);

  const handleDelete = async (id) => {
    if(window.confirm('Are you sure you want to delete this property?')) {
      try {
        await api.delete(`/property/${id}`);
        fetchProperties();
      } catch (err) {
        alert('Error deleting property');
      }
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 'available' ? 'rented' : 'available';
      await api.put(`/property/${id}`, { status: newStatus });
      fetchProperties();
    } catch (err) {
      alert('Error updating status');
    }
  };

  if (loading) {
    return <div className="flex justify-center mt-20"><div className="animate-spin h-8 w-8 border-b-2 border-indigo-600 rounded-full"></div></div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8 flex flex-col md:flex-row items-center gap-6">
        <div className="h-24 w-24 bg-indigo-100 rounded-full flex items-center justify-center">
          <UserIcon className="h-12 w-12 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
          <p className="text-gray-500 text-lg">{user.email}</p>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mb-6">Manage My Properties ({properties.length})</h2>

      {properties.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
          <p className="text-gray-500 mb-4">You haven't listed any properties yet.</p>
          <Link to="/dashboard" className="text-indigo-600 font-medium hover:underline">Go to Dashboard to list one</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map(property => (
            <div key={property._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
              <div className="relative h-48">
                <img 
                  src={property.images[0] ? (property.images[0].startsWith('http') ? property.images[0] : `${BACKEND_URL}${property.images[0]}`) : 'https://via.placeholder.com/400x300'} 
                  alt={property.title} 
                  className="w-full h-full object-cover" 
                />
                <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${property.status === 'rented' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                  {property.status}
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{property.title}</h3>
                  <p className="text-gray-500 mt-1 flex items-center gap-1 text-sm"><MapPin className="w-4 h-4"/> {property.location}</p>
                  <p className="text-xl font-bold text-indigo-600 mt-3">₹{property.price.toLocaleString('en-IN')}</p>
                </div>
                <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4">
                  <button 
                    onClick={() => toggleStatus(property._id, property.status)}
                    className="text-sm font-medium flex items-center gap-1 text-gray-600 hover:text-indigo-600 transition-colors"
                  >
                    {property.status === 'available' ? <><XCircle className="w-4 h-4"/> Mark Rented</> : <><CheckCircle className="w-4 h-4"/> Mark Available</>}
                  </button>
                  <div className="flex gap-2">
                    <button onClick={() => handleDelete(property._id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Profile;
