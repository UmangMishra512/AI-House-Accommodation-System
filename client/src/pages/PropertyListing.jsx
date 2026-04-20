import React, { useState, useEffect } from 'react';
import api from '../lib/api';
import { Link } from 'react-router-dom';
import { MapPin, Search } from 'lucide-react';

const PropertyListing = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const res = await api.get('/property');
        setProperties(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Available Properties</h1>
            <p className="mt-2 text-gray-500">Explore homes with immersive 3D experiences.</p>
          </div>
          <div className="mt-4 md:mt-0 relative w-full md:w-72">
            <input 
              type="text" 
              placeholder="Search properties..." 
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500" 
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {properties.map(property => (
              <Link to={`/property/${property._id}`} key={property._id} className="group flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="relative h-48 w-full overflow-hidden bg-gray-200">
                  <img
                    src={property.images[0] || 'https://via.placeholder.com/400x300'}
                    alt={property.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {property.ai_model_url && (
                    <div className="absolute top-2 right-2 bg-indigo-600 text-white text-xs font-bold px-2 py-1 rounded-md shadow">
                      3D Tour
                    </div>
                  )}
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                    {property.title}
                  </h3>
                  <div className="flex items-center text-sm text-gray-500 mt-2">
                    <MapPin className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                    <span className="truncate">{property.location}</span>
                  </div>
                  <div className="mt-auto pt-4 flex items-center justify-between">
                    <p className="text-xl font-bold text-gray-900">${property.price.toLocaleString()}</p>
                    {property.owner_id && (
                       <p className="text-xs text-gray-400">By {property.owner_id.name.split(' ')[0]}</p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
            {properties.length === 0 && (
              <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-xl border border-gray-200">
                No properties found. Be the first to add one!
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyListing;
