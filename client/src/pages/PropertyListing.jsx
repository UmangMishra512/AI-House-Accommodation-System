import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';
import { MapPin, Search, Sparkles, Loader2, X, SlidersHorizontal, ArrowUpDown, Heart, ChevronDown, PlusSquare, CheckSquare, Map, Grid3X3 } from 'lucide-react';
import MapView from '../components/MapView';

// Skeleton Card Component
const SkeletonCard = () => (
  <div className="flex flex-col bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden animate-pulse">
    <div className="h-48 w-full bg-gray-200" />
    <div className="p-5 space-y-3">
      <div className="h-5 bg-gray-200 rounded w-3/4" />
      <div className="h-4 bg-gray-200 rounded w-1/2" />
      <div className="flex justify-between items-center pt-3">
        <div className="h-6 bg-gray-200 rounded w-24" />
        <div className="h-4 bg-gray-200 rounded w-16" />
      </div>
    </div>
  </div>
);

const PropertyListing = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [aiSearchEnabled, setAiSearchEnabled] = useState(false);
  const [aiSearching, setAiSearching] = useState(false);
  const [aiResults, setAiResults] = useState(null);
  const [viewMode, setViewMode] = useState('grid');

  // Filter state
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [sortBy, setSortBy] = useState('newest');
  const [maxPrice, setMaxPrice] = useState(100000);

  // Favorites (localStorage)
  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('property_favorites') || '[]');
    } catch { return []; }
  });

  // Compare state
  const [compareList, setCompareList] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('property_compare') || '[]');
    } catch { return []; }
  });

  const toggleFavorite = (e, propertyId) => {
    e.preventDefault();
    e.stopPropagation();
    setFavorites(prev => {
      const next = prev.includes(propertyId)
        ? prev.filter(id => id !== propertyId)
        : [...prev, propertyId];
      localStorage.setItem('property_favorites', JSON.stringify(next));
      return next;
    });
  };

  const toggleCompare = (e, property) => {
    e.preventDefault();
    e.stopPropagation();
    setCompareList(prev => {
      const isSelected = prev.some(p => p.id === property.id);
      if (isSelected) {
        const next = prev.filter(p => p.id !== property.id);
        localStorage.setItem('property_compare', JSON.stringify(next));
        return next;
      }
      if (prev.length >= 4) {
        alert("You can compare up to 4 properties at a time.");
        return prev;
      }
      const next = [...prev, { id: property.id, title: property.title, price: property.price, image: property.images?.[0] }];
      localStorage.setItem('property_compare', JSON.stringify(next));
      return next;
    });
  };

  const removeCompareItem = (id) => {
    setCompareList(prev => {
      const next = prev.filter(p => p.id !== id);
      localStorage.setItem('property_compare', JSON.stringify(next));
      return next;
    });
  };

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        setProperties(data || []);
        // Compute max price for slider
        if (data && data.length > 0) {
          const max = Math.max(...data.map(p => Number(p.price) || 0));
          setMaxPrice(Math.ceil(max / 1000) * 1000 || 100000);
          setPriceRange([0, Math.ceil(max / 1000) * 1000 || 100000]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, []);

  // Filter + sort logic
  const getFilteredProperties = useCallback(() => {
    let filtered = properties;

    // Text search
    if (searchQuery && !aiSearchEnabled) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.title?.toLowerCase().includes(q) ||
        p.location?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
      );
    }

    // Price filter
    filtered = filtered.filter(p => {
      const price = Number(p.price) || 0;
      return price >= priceRange[0] && price <= priceRange[1];
    });

    // Sort
    switch (sortBy) {
      case 'price-low':
        filtered = [...filtered].sort((a, b) => {
          if (a.is_premium !== b.is_premium) return b.is_premium ? 1 : -1;
          return (Number(a.price) || 0) - (Number(b.price) || 0);
        });
        break;
      case 'price-high':
        filtered = [...filtered].sort((a, b) => {
          if (a.is_premium !== b.is_premium) return b.is_premium ? 1 : -1;
          return (Number(b.price) || 0) - (Number(a.price) || 0);
        });
        break;
      case 'oldest':
        filtered = [...filtered].sort((a, b) => {
          if (a.is_premium !== b.is_premium) return b.is_premium ? 1 : -1;
          return new Date(a.created_at) - new Date(b.created_at);
        });
        break;
      case 'newest':
      default:
        filtered = [...filtered].sort((a, b) => {
          if (a.is_premium !== b.is_premium) return b.is_premium ? 1 : -1;
          return new Date(b.created_at) - new Date(a.created_at);
        });
        break;
    }

    return filtered;
  }, [properties, searchQuery, aiSearchEnabled, priceRange, sortBy]);

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

  const displayProperties = (() => {
    if (aiResults !== null) {
      // Map AI results back to full property objects to include is_premium and amenities
      const fullAiResults = aiResults.map(aiResult => {
        const fullProp = properties.find(p => p.id === aiResult.id);
        return fullProp ? { ...fullProp, similarity: aiResult.similarity } : aiResult;
      });

      // Sort: Premium properties first, then by AI similarity
      return fullAiResults.sort((a, b) => {
        if (a.is_premium !== b.is_premium) return b.is_premium ? 1 : -1;
        return (b.similarity || 0) - (a.similarity || 0);
      });
    }
    return getFilteredProperties();
  })();
  const activeFilterCount = (priceRange[0] > 0 || priceRange[1] < maxPrice ? 1 : 0) + (sortBy !== 'newest' ? 1 : 0);

  return (
    <>
    <div className={`bg-gray-50 dark:bg-gray-900 min-h-screen py-8 sm:py-12 ${compareList.length > 0 ? 'pb-28' : ''}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col gap-4 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Available Properties</h1>
              <p className="mt-1 text-gray-500 dark:text-gray-400 text-sm sm:text-base">Explore {properties.length} homes with immersive experiences.</p>
            </div>
            
            {/* View Toggle */}
            <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg w-max">
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  viewMode === 'grid' ? 'bg-white dark:bg-gray-800 text-indigo-600 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:text-gray-200'
                }`}
              >
                <Grid3X3 className="w-4 h-4" /> Grid
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  viewMode === 'map' ? 'bg-white dark:bg-gray-800 text-indigo-600 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:text-gray-200'
                }`}
              >
                <Map className="w-4 h-4" /> Map
              </button>
            </div>
          </div>

          {/* Search + Filter Row */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Bar */}
            <div className="relative flex-1">
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
                placeholder={aiSearchEnabled ? 'Try "sunny house with balcony near park"...' : 'Search by name, location...'} 
                className={`w-full pl-10 pr-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 transition-all text-sm ${
                  aiSearchEnabled
                    ? 'border-indigo-300 focus:ring-indigo-400 bg-indigo-50/30'
                    : 'border-gray-200 dark:border-gray-700 focus:ring-indigo-400'
                }`}
              />
              {aiSearchEnabled ? (
                <Sparkles className="absolute left-3 top-3 h-4 w-4 text-indigo-400" />
              ) : (
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              )}
              {aiSearchEnabled && searchQuery && (
                <button
                  onClick={handleAiSearch}
                  disabled={aiSearching}
                  className="absolute right-2 top-1.5 bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  {aiSearching ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Search'}
                </button>
              )}
              {aiResults !== null && !aiSearchEnabled && (
                <button onClick={clearAiSearch} className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:text-gray-300">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filter + AI Toggle Buttons */}
            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={() => {
                  setAiSearchEnabled(!aiSearchEnabled);
                  setAiResults(null);
                }}
                className={`flex items-center gap-1.5 text-xs font-medium px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
                  aiSearchEnabled
                    ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-md shadow-indigo-200'
                    : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-indigo-300'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                AI Search
              </button>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-1.5 text-xs font-medium px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
                  showFilters
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                    : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-indigo-300'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Filters
                {activeFilterCount > 0 && (
                  <span className={`ml-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${showFilters ? 'bg-white dark:bg-gray-800/20' : 'bg-indigo-100 text-indigo-600'}`}>
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Expandable Filter Panel */}
          {showFilters && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-5 space-y-4 shadow-sm animate-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Price Range */}
                <div>
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-200 mb-2 block">
                    Price Range: ₹{priceRange[0].toLocaleString('en-IN')} — ₹{priceRange[1].toLocaleString('en-IN')}
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={0}
                      max={maxPrice}
                      step={500}
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([Math.min(Number(e.target.value), priceRange[1] - 500), priceRange[1]])}
                      className="flex-1 accent-indigo-600 h-2"
                    />
                    <input
                      type="range"
                      min={0}
                      max={maxPrice}
                      step={500}
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], Math.max(Number(e.target.value), priceRange[0] + 500)])}
                      className="flex-1 accent-indigo-600 h-2"
                    />
                  </div>
                </div>

                {/* Sort */}
                <div>
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-200 mb-2 block">Sort By</label>
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full appearance-none bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none pr-8"
                    >
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                      <option value="price-low">Price: Low → High</option>
                      <option value="price-high">Price: High → Low</option>
                    </select>
                    <ChevronDown className="absolute right-2.5 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>
              
              {/* Reset */}
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    setPriceRange([0, maxPrice]);
                    setSortBy('newest');
                  }}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          )}
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

        {/* Map / Grid View */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : viewMode === 'map' ? (
          <MapView properties={displayProperties} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayProperties.map(property => (
              <Link to={`/property/${property.id}`} key={property.id} className="group flex flex-col bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="relative h-48 w-full overflow-hidden bg-gray-200">
                  <img
                    src={property.images && property.images[0] ? property.images[0] : 'https://via.placeholder.com/400x300'}
                    alt={property.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <button
                    onClick={(e) => toggleFavorite(e, property.id)}
                    className="absolute top-3 right-3 p-2 rounded-full bg-white dark:bg-gray-800/80 backdrop-blur-sm hover:bg-white dark:bg-gray-800 transition-all shadow-sm z-10"
                    title="Toggle Favorite"
                  >
                    <Heart className={`w-4 h-4 transition-colors ${
                      favorites.includes(property.id) ? 'fill-red-500 text-red-500' : 'text-gray-500 dark:text-gray-400'
                    }`} />
                  </button>
                  <button
                    onClick={(e) => toggleCompare(e, property)}
                    className="absolute top-14 right-3 p-2 rounded-full bg-white dark:bg-gray-800/80 backdrop-blur-sm hover:bg-white dark:bg-gray-800 transition-all shadow-sm z-10"
                    title="Add to Compare"
                  >
                    {compareList.some(p => p.id === property.id) ? (
                      <CheckSquare className="w-4 h-4 text-indigo-600" />
                    ) : (
                      <PlusSquare className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    )}
                  </button>
                  {property.ai_model_url && (
                    <div className="absolute top-3 left-3 bg-indigo-600 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow z-10">
                      3D Tour
                    </div>
                  )}
                  {property.similarity !== undefined && (
                    <div className="absolute bottom-3 left-3 bg-purple-600/90 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow backdrop-blur-sm z-10">
                      {(property.similarity * 100).toFixed(0)}% match
                    </div>
                  )}
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white line-clamp-1 group-hover:text-indigo-600 transition-colors">
                      {property.title}
                    </h3>
                    {property.is_premium && (
                      <span className="flex-shrink-0 bg-gradient-to-r from-amber-400 to-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        Premium
                      </span>
                    )}
                  </div>
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                    <MapPin className="flex-shrink-0 mr-1 h-3.5 w-3.5 text-gray-400" />
                    <span className="truncate text-xs">{property.location}</span>
                  </div>
                  
                  {/* Amenity Tags */}
                  {property.amenities && property.amenities.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2.5">
                      {property.amenities.slice(0, 3).map((amenity, idx) => (
                        <span key={idx} className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-[10px] px-2 py-0.5 rounded-full font-medium border border-gray-200 dark:border-gray-700/50">
                          {amenity}
                        </span>
                      ))}
                      {property.amenities.length > 3 && (
                        <span className="bg-gray-50 dark:bg-gray-900 text-gray-400 text-[10px] px-1.5 py-0.5 rounded-full font-medium">
                          +{property.amenities.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="mt-auto pt-3 flex items-center justify-between border-t border-gray-50 mt-3">
                    <p className="text-lg font-bold text-gray-900 dark:text-white">₹{Number(property.price)?.toLocaleString('en-IN')}</p>
                    <span className="text-[11px] text-gray-400 font-medium">/ month</span>
                  </div>
                </div>
              </Link>
            ))}
            {displayProperties.length === 0 && (
              <div className="col-span-full py-16 text-center text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <Search className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="font-medium text-gray-700 dark:text-gray-200 mb-1">No properties found</p>
                <p className="text-sm">
                  {aiResults !== null
                    ? 'Try a different search query.'
                    : activeFilterCount > 0
                      ? 'Try adjusting your filters.'
                      : 'Be the first to add one!'
                  }
                </p>
              </div>
            )}
          </div>
        )}

        {/* Results count */}
        {!loading && displayProperties.length > 0 && (
          <p className="text-center text-xs text-gray-400 mt-8">
            Showing {displayProperties.length} of {properties.length} properties
          </p>
        )}

      </div>
    </div>

    {/* Compare Floating Bar — outside content wrappers for true fixed positioning */}
    {compareList.length > 0 && (
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] transform transition-transform duration-300 z-50 animate-fade-in pb-safe">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 whitespace-nowrap">
                Compare ({compareList.length}/4)
              </span>
              <div className="flex items-center gap-2">
                {compareList.map(item => (
                  <div key={item.id} className="relative group flex-shrink-0 w-12 h-12 rounded-md overflow-hidden border border-gray-200 dark:border-gray-700">
                    <img src={item.image || 'https://via.placeholder.com/100'} alt="" className="w-full h-full object-cover" />
                    <button 
                      onClick={() => removeCompareItem(item.id)}
                      className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center transition-all"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </div>
                ))}
                {[...Array(4 - compareList.length)].map((_, i) => (
                  <div key={`empty-${i}`} className="w-12 h-12 rounded-md border border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 flex items-center justify-center flex-shrink-0">
                    <span className="text-gray-300 text-xs">+</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button 
                onClick={() => setCompareList([])}
                className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Clear
              </button>
              <Link 
                to="/compare"
                className={`flex-1 sm:flex-none px-6 py-2 text-sm font-medium text-white rounded-lg transition-colors text-center ${
                  compareList.length > 1 ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-indigo-400 cursor-not-allowed'
                }`}
                onClick={e => compareList.length < 2 && e.preventDefault()}
              >
                Compare Now
              </Link>
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  );
};

export default PropertyListing;
