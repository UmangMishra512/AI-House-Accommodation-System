import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';
import { MapPin, Search, Sparkles, Loader2, X } from 'lucide-react';

const PropertyListing = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [aiSearchEnabled, setAiSearchEnabled] = useState(false);
  const [aiSearching, setAiSearching] = useState(false);
  const [aiResults, setAiResults] = useState(null);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        setProperties(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, []);

  // Regular text search
  const filteredProperties = searchQuery && !aiSearchEnabled
    ? properties.filter(p =>
        p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : properties;

  // AI semantic search
  const handleAiSearch = async () => {
    if (!searchQuery.trim()) return;
    setAiSearching(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-search', {
        body: { query: searchQuery }
      });
      if (error) throw error;
      setAiResults(data?.results || []);
    } catch (err) {
      console.error('AI search error:', err);
      setAiResults([]);
    } finally {
      setAiSearching(false);
    }
  };

  const clearAiSearch = () => {
    setAiResults(null);
    setSearchQuery('');
  };

  const displayProperties = aiResults !== null ? aiResults : filteredProperties;

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Available Properties</h1>
            <p className="mt-2 text-gray-500">Explore homes with immersive 3D experiences.</p>
          </div>
          <div className="mt-4 md:mt-0 flex flex-col gap-2 w-full md:w-auto">
            {/* AI Search Toggle */}
            <div className="flex items-center gap-2 justify-end">
              <button
                onClick={() => {
                  setAiSearchEnabled(!aiSearchEnabled);
                  setAiResults(null);
                }}
                className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition-all ${
                  aiSearchEnabled
                    ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                <Sparkles className="w-3 h-3" />
                {aiSearchEnabled ? 'AI Search ON' : 'AI Search'}
              </button>
            </div>
            {/* Search Bar */}
            <div className="relative w-full md:w-80">
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (!aiSearchEnabled) setAiResults(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && aiSearchEnabled) handleAiSearch();
                }}
                placeholder={aiSearchEnabled ? 'Try "sunny house with balcony near park"...' : 'Search properties...'} 
                className={`w-full pl-10 pr-${aiResults ? '16' : '4'} py-2.5 border rounded-full focus:outline-none focus:ring-2 transition-all ${
                  aiSearchEnabled
                    ? 'border-indigo-300 focus:ring-indigo-500 bg-indigo-50/30'
                    : 'border-gray-300 focus:ring-indigo-500'
                }`}
              />
              {aiSearchEnabled ? (
                <Sparkles className="absolute left-3 top-3 h-5 w-5 text-indigo-400" />
              ) : (
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              )}
              {aiSearchEnabled && searchQuery && (
                <button
                  onClick={handleAiSearch}
                  disabled={aiSearching}
                  className="absolute right-2 top-1.5 bg-indigo-600 text-white px-3 py-1.5 rounded-full text-xs font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  {aiSearching ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Search'}
                </button>
              )}
              {aiResults !== null && (
                <button
                  onClick={clearAiSearch}
                  className="absolute right-2 top-2.5 p-1 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* AI Search Results Banner */}
        {aiResults !== null && (
          <div className="mb-6 p-3 rounded-xl bg-gradient-to-r from-purple-50 to-indigo-50 border border-indigo-100 flex items-center justify-between">
            <p className="text-sm text-indigo-700 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span>
                Found <strong>{aiResults.length}</strong> results matching "{searchQuery}"
                {aiResults.length > 0 && ' — sorted by relevance'}
              </span>
            </p>
            <button onClick={clearAiSearch} className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">
              Clear
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {displayProperties.map(property => (
              <Link to={`/property/${property.id}`} key={property.id} className="group flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="relative h-48 w-full overflow-hidden bg-gray-200">
                  <img
                    src={property.images && property.images[0] ? property.images[0] : 'https://via.placeholder.com/400x300'}
                    alt={property.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {property.ai_model_url && (
                    <div className="absolute top-2 right-2 bg-indigo-600 text-white text-xs font-bold px-2 py-1 rounded-md shadow">
                      3D Tour
                    </div>
                  )}
                  {property.similarity !== undefined && (
                    <div className="absolute top-2 left-2 bg-purple-600/90 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow backdrop-blur-sm">
                      {(property.similarity * 100).toFixed(0)}% match
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
                    <p className="text-xl font-bold text-gray-900">₹{property.price?.toLocaleString('en-IN')}</p>
                    {property.owner_id && (
                       <p className="text-xs text-gray-400">By {property.owner_name || (property.owner_id && typeof property.owner_id === 'object' ? property.owner_id.name?.split(' ')[0] : 'Host')}</p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
            {displayProperties.length === 0 && (
              <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-xl border border-gray-200">
                {aiResults !== null
                  ? 'No matching properties found. Try a different search query.'
                  : 'No properties found. Be the first to add one!'
                }
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyListing;
