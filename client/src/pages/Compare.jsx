import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ArrowLeft, MapPin, Check, X, Building, DollarSign } from 'lucide-react';

const Compare = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const saved = localStorage.getItem('property_compare');
        const compareList = saved ? JSON.parse(saved) : [];
        
        if (compareList.length === 0) {
          setLoading(false);
          return;
        }

        const ids = compareList.map(p => p.id);
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .in('id', ids);

        if (error) throw error;
        setProperties(data || []);
      } catch (err) {
        console.error('Error fetching compare properties:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, []);

  const removeFromCompare = (id) => {
    const saved = localStorage.getItem('property_compare');
    if (saved) {
      const compareList = JSON.parse(saved).filter(p => p.id !== id);
      localStorage.setItem('property_compare', JSON.stringify(compareList));
      setProperties(prev => prev.filter(p => p.id !== id));
      if (compareList.length === 0) {
        navigate('/properties');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm text-center max-w-md w-full">
          <div className="w-16 h-16 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Nothing to compare</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Select up to 4 properties from the listings page to see them side-by-side.</p>
          <Link to="/properties" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition-colors w-full justify-center">
            Browse Properties
          </Link>
        </div>
      </div>
    );
  }

  const features = [
    { label: 'Price', key: 'price', format: (val) => `₹${Number(val).toLocaleString('en-IN')}/mo` },
    { label: 'Location', key: 'location' },
    { label: 'Bedrooms', key: 'bedrooms' },
    { label: 'Bathrooms', key: 'bathrooms' },
    { label: 'Area', key: 'area', format: (val) => val ? `${val} sq ft` : 'N/A' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Link to="/properties" className="text-sm font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back to listings
              </Link>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Compare Properties</h1>
          </div>
        </div>

        {/* Comparison Grid */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
          <div className="overflow-x-auto scrollbar-hide">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr>
                  <th className="p-6 bg-gray-50 dark:bg-gray-900 w-48 border-b border-gray-200 dark:border-gray-700 sticky left-0 z-10 shadow-[1px_0_0_0_#e5e7eb]">
                    <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Features</span>
                  </th>
                  {properties.map(property => (
                    <th key={property.id} className="p-6 border-b border-gray-200 dark:border-gray-700 border-l min-w-[280px] align-top relative bg-white dark:bg-gray-800">
                      <button 
                        onClick={() => removeFromCompare(property.id)}
                        className="absolute top-4 right-4 p-1.5 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-red-50 hover:text-red-600 rounded-full transition-colors"
                        title="Remove"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <div className="w-full h-40 rounded-xl overflow-hidden mb-4 bg-gray-100 dark:bg-gray-800">
                        <img 
                          src={property.images && property.images[0] ? property.images[0] : 'https://via.placeholder.com/400x300'} 
                          alt={property.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-2 leading-tight mb-2">
                        {property.title}
                      </h3>
                      <Link 
                        to={`/property/${property.id}`}
                        className="inline-block mt-2 text-sm font-medium text-indigo-600 hover:text-indigo-800"
                      >
                        View details →
                      </Link>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
                {features.map((feature, idx) => (
                  <tr key={feature.key} className={idx % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900'}>
                    <td className="p-4 font-medium text-gray-900 dark:text-white border-l border-r border-gray-200 dark:border-gray-700 sticky left-0 shadow-[1px_0_0_0_#e5e7eb] bg-inherit">
                      {feature.label}
                    </td>
                    {properties.map(property => (
                      <td key={property.id} className="p-4 text-gray-600 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700">
                        {feature.format ? feature.format(property[feature.key]) : property[feature.key] || 'N/A'}
                      </td>
                    ))}
                  </tr>
                ))}
                <tr>
                  <td className="p-4 font-medium text-gray-900 dark:text-white border-l border-r border-gray-200 dark:border-gray-700 sticky left-0 shadow-[1px_0_0_0_#e5e7eb] bg-white dark:bg-gray-800">
                    Description
                  </td>
                  {properties.map(property => (
                    <td key={property.id} className="p-4 text-gray-500 dark:text-gray-400 border-r border-gray-200 dark:border-gray-700 align-top">
                      <p className="line-clamp-4 leading-relaxed">{property.description}</p>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Compare;
