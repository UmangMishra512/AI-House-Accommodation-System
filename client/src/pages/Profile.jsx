import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';
import { User as UserIcon, MapPin, Trash2, Edit, CheckCircle, XCircle, Loader2, Save, X, Plus, Home } from 'lucide-react';

const Profile = () => {
  const { user, updateProfile } = useContext(AuthContext);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProfile, setEditingProfile] = useState(false);
  const [newName, setNewName] = useState(user?.user_metadata?.name || '');
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Edit Property State
  const [editingProperty, setEditingProperty] = useState(null);
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    price: '',
    location: ''
  });
  const [updatingProperty, setUpdatingProperty] = useState(false);

  const fetchProperties = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setProperties(data || []);
    } catch (err) {
      console.error('Error fetching properties:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchProperties();
      setNewName(user?.user_metadata?.name || '');
    }
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdatingProfile(true);
    try {
      await updateProfile(newName);
      setEditingProfile(false);
    } catch (err) {
      alert('Error updating profile: ' + err.message);
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleEditProperty = (property) => {
    setEditingProperty(property);
    setEditFormData({
      title: property.title,
      description: property.description,
      price: property.price,
      location: property.location
    });
  };

  const handleUpdateProperty = async (e) => {
    e.preventDefault();
    setUpdatingProperty(true);
    try {
      const { error } = await supabase
        .from('properties')
        .update({
          title: editFormData.title,
          description: editFormData.description,
          price: parseFloat(editFormData.price),
          location: editFormData.location
        })
        .eq('id', editingProperty.id);

      if (error) throw error;
      
      setEditingProperty(null);
      fetchProperties();
    } catch (err) {
      alert('Error updating property: ' + err.message);
    } finally {
      setUpdatingProperty(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      try {
        const { error } = await supabase
          .from('properties')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
        fetchProperties();
      } catch (err) {
        alert('Error deleting property: ' + err.message);
      }
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 'available' ? 'rented' : 'available';
      const { error } = await supabase
        .from('properties')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;
      fetchProperties();
    } catch (err) {
      alert('Error updating status: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 text-indigo-600 animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Profile Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="relative">
            <div className="h-28 w-28 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
              <UserIcon className="h-14 w-14 text-white" />
            </div>
            <button 
              onClick={() => setEditingProfile(true)}
              className="absolute -bottom-1 -right-1 bg-white p-2 rounded-full shadow-md border border-gray-100 hover:text-indigo-600 transition-colors"
            >
              <Edit className="h-4 w-4" />
            </button>
          </div>
          
          <div className="flex-1 text-center md:text-left">
            {editingProfile ? (
              <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-md">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={updatingProfile}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-all disabled:opacity-50"
                  >
                    {updatingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingProfile(false)}
                    className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">{user?.user_metadata?.name || 'User'}</h1>
                <p className="text-gray-500 text-lg mb-4">{user?.email}</p>
                <div className="flex flex-wrap justify-center md:justify-start gap-4">
                  <div className="bg-indigo-50 px-4 py-2 rounded-xl border border-indigo-100">
                    <p className="text-xs text-indigo-600 font-bold uppercase tracking-wider">Total Listings</p>
                    <p className="text-xl font-bold text-indigo-900">{properties.length}</p>
                  </div>
                  <div className="bg-green-50 px-4 py-2 rounded-xl border border-green-100">
                    <p className="text-xs text-green-600 font-bold uppercase tracking-wider">Account Status</p>
                    <p className="text-xl font-bold text-green-900">Active</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Manage My Properties</h2>
        <Link 
          to="/dashboard" 
          className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg flex items-center gap-2"
        >
          <Plus className="h-5 w-5" /> Add New
        </Link>
      </div>

      {properties.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
          <div className="bg-white p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-sm">
            <Home className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No properties listed yet</h3>
          <p className="text-gray-500 mb-8 max-w-sm mx-auto">Start by adding your first property to reach thousands of potential customers.</p>
          <Link to="/dashboard" className="bg-white border border-gray-200 text-indigo-600 px-6 py-3 rounded-xl font-bold hover:bg-gray-50 transition-all shadow-sm">
            Go to Dashboard
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {properties.map(property => (
            <div key={property.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="relative h-56 overflow-hidden">
                <img 
                  src={property.images && property.images[0] ? property.images[0] : 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=800'} 
                  alt={property.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                />
                <div className={`absolute top-4 right-4 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg ${property.status === 'rented' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}>
                  {property.status}
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 line-clamp-1 mb-2">{property.title}</h3>
                  <p className="text-gray-500 flex items-center gap-2 text-sm mb-4">
                    <MapPin className="w-4 h-4 text-indigo-500"/> {property.location}
                  </p>
                  <div className="flex items-center gap-1 text-2xl font-black text-indigo-600">
                    <span className="text-lg">₹</span>
                    {property.price.toLocaleString('en-IN')}
                    <span className="text-sm font-normal text-gray-400 ml-1">/ month</span>
                  </div>
                </div>
                
                <div className="mt-8 flex items-center justify-between border-t border-gray-100 pt-5">
                  <button 
                    onClick={() => toggleStatus(property.id, property.status)}
                    className={`text-sm font-bold flex items-center gap-2 transition-colors ${property.status === 'available' ? 'text-gray-500 hover:text-red-600' : 'text-gray-500 hover:text-green-600'}`}
                  >
                    {property.status === 'available' ? <><XCircle className="w-4 h-4"/> Mark Rented</> : <><CheckCircle className="w-4 h-4"/> Mark Available</>}
                  </button>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleEditProperty(property)}
                      className="p-2.5 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                      title="Edit Property"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button 
                      onClick={() => handleDelete(property.id)} 
                      className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      title="Delete Property"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Property Modal */}
      {editingProperty && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-indigo-600">
              <h3 className="text-xl font-bold text-white">Edit Property</h3>
              <button onClick={() => setEditingProperty(null)} className="text-white/80 hover:text-white transition-colors">
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleUpdateProperty} className="p-8 space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Property Title</label>
                <input
                  type="text"
                  value={editFormData.title}
                  onChange={(e) => setEditFormData({...editFormData, title: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Location</label>
                <input
                  type="text"
                  value={editFormData.location}
                  onChange={(e) => setEditFormData({...editFormData, location: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Monthly Rent (₹)</label>
                <input
                  type="number"
                  value={editFormData.price}
                  onChange={(e) => setEditFormData({...editFormData, price: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Description</label>
                <textarea
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all h-32 resize-none"
                  required
                ></textarea>
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={updatingProperty}
                  className="flex-1 bg-indigo-600 text-white py-3.5 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-200 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {updatingProperty ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                  Update Property
                </button>
                <button
                  type="button"
                  onClick={() => setEditingProperty(null)}
                  className="flex-1 bg-gray-100 text-gray-600 py-3.5 rounded-2xl font-bold hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
