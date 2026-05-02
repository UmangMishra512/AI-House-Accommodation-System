import React, { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Link, useSearchParams } from 'react-router-dom';
import { Settings, Plus, MapPin, IndianRupee, Trash2, Home, Sparkles, Loader2, Download, Mail, CheckCircle } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { QRCodeCanvas } from 'qrcode.react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { OpenStreetMapProvider } from 'leaflet-geosearch';
import { format } from 'date-fns';

// Fix leaflet icon issue in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

function LocationMarker({ lat, lng, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng.lat, e.latlng.lng);
    },
  });

  return lat && lng ? (
    <Marker position={[lat, lng]}></Marker>
  ) : null;
}

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'properties';
  
  const [activeTab, setActiveTab] = useState(initialTab);
  const [properties, setProperties] = useState([]);
  const [messages, setMessages] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    location: '',
    lat: 20.5937, // Default center on India
    lng: 78.9629,
    owner_name: '',
    phone_number: '',
    alternate_phone: '',
    email: '',
    ai_model_url: '',
  });
  
  const [videoUrls, setVideoUrls] = useState(['']);
  const [phoneCode, setPhoneCode] = useState('+91');
  const [altPhoneCode, setAltPhoneCode] = useState('+91');
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [generatingTripo, setGeneratingTripo] = useState(null);

  // Location Autocomplete State
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const provider = new OpenStreetMapProvider();
  const searchRef = useRef(null);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    // Click outside to close suggestions
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLocationSearch = async (e) => {
    const value = e.target.value;
    setFormData({ ...formData, location: value });
    
    if (value.length > 2) {
      const results = await provider.search({ query: value });
      setLocationSuggestions(results);
      setShowSuggestions(true);
    } else {
      setLocationSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const selectLocation = (result) => {
    setFormData({ 
      ...formData, 
      location: result.label, 
      lat: result.y, 
      lng: result.x 
    });
    setShowSuggestions(false);
  };

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
      console.error(err);
    }
  };

  const fetchMessages = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*, property:properties(title)')
        .order('created_at', { ascending: false });
        // RLS policy already ensures we only get messages for properties owned by `user.id`
      
      if (error) throw error;
      setMessages(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchProperties();
      fetchMessages();
    }
  }, [user]);

  const handleGenerate3D = async (propertyId, imageUrl) => {
    try {
      setGeneratingTripo(propertyId);
      
      const { data: startData, error: startError } = await supabase.functions.invoke('tripo', {
        body: { action: 'generate', imageUrl }
      });
      
      if (startError || startData.error) {
        throw new Error(startError?.message || startData.error);
      }
      
      const taskId = startData.taskId;
      
      const poll = setInterval(async () => {
        const { data: statusData, error: statusError } = await supabase.functions.invoke('tripo', {
          body: { action: 'status', taskId }
        });
        
        if (statusError || statusData.error) {
          clearInterval(poll);
          setGeneratingTripo(null);
          alert("Error checking 3D model status: " + (statusError?.message || statusData.error));
          return;
        }
        
        if (statusData.status === 'success') {
          clearInterval(poll);
          const { error: updateError } = await supabase
            .from('properties')
            .update({ ai_model_url: statusData.modelUrl })
            .eq('id', propertyId);
            
          if (updateError) {
             alert("Error saving 3D model URL.");
          } else {
             fetchProperties();
          }
          setGeneratingTripo(null);
        } else if (statusData.status === 'failed' || statusData.status === 'cancelled') {
          clearInterval(poll);
          setGeneratingTripo(null);
          alert("3D model generation failed on Tripo AI.");
        }
      }, 5000);
      
    } catch (err) {
      setGeneratingTripo(null);
      alert('Error generating 3D model: ' + err.message);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); 
    if (value.length <= 10) {
      setFormData({ ...formData, [e.target.name]: value });
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles(files);
    
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.phone_number.length !== 10) {
      setMessage('Phone number must be exactly 10 digits.');
      return;
    }
    if (formData.alternate_phone && formData.alternate_phone.length !== 10) {
      setMessage('Alternate phone number must be exactly 10 digits.');
      return;
    }

    setLoading(true);
    setMessage(null);
    try {
      let uploadedImageUrls = [];
      
      if (imageFiles.length > 0) {
        for (const file of imageFiles) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Math.random()}.${fileExt}`;
          const filePath = `${user.id}/${fileName}`;
          
          const { error: uploadError } = await supabase.storage
            .from('property-images')
            .upload(filePath, file);
            
          if (uploadError) throw uploadError;
          
          const { data: { publicUrl } } = supabase.storage
            .from('property-images')
            .getPublicUrl(filePath);
            
          uploadedImageUrls.push(publicUrl);
        }
      }

      const dataToSubmit = {
        owner_id: user.id,
        title: formData.title,
        description: formData.description,
        price: Number(formData.price),
        location: formData.location,
        lat: Number(formData.lat),
        lng: Number(formData.lng),
        owner_name: formData.owner_name,
        phone_number: `${phoneCode} ${formData.phone_number}`,
        alternate_phone: formData.alternate_phone ? `${altPhoneCode} ${formData.alternate_phone}` : null,
        email: formData.email,
        images: uploadedImageUrls,
        video_url: videoUrls.filter(v => v.trim()),
        ai_model_url: formData.ai_model_url || null
      };

      const { error } = await supabase.from('properties').insert([dataToSubmit]);
      if (error) throw error;

      setMessage('Property created successfully!');
      setFormData({
        title: '', description: '', price: '', location: '', lat: 20.5937, lng: 78.9629,
        owner_name: '', phone_number: '', alternate_phone: '', email: '', ai_model_url: ''
      });
      setVideoUrls(['']);
      setImageFiles([]);
      setImagePreviews([]);
      fetchProperties();
      setActiveTab('properties');
    } catch (err) {
      console.error(err);
      setMessage(`Error creating property: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if(window.confirm('Are you sure you want to delete this property?')) {
      try {
        const { error } = await supabase.from('properties').delete().eq('id', id);
        if (error) throw error;
        fetchProperties();
      } catch (err) {
        alert('Error deleting property: ' + err.message);
      }
    }
  };

  const downloadQR = (propertyId, title) => {
    const canvas = document.getElementById(`qr-${propertyId}`);
    const pngUrl = canvas
      .toDataURL("image/png")
      .replace("image/png", "image/octet-stream");
    let downloadLink = document.createElement("a");
    downloadLink.href = pngUrl;
    downloadLink.download = `${title.replace(/\s+/g, '_')}_QR.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  const setTab = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-2">
        <Settings className="w-8 h-8 text-indigo-600" />
        Host Dashboard
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Section */}
        <div className="lg:col-span-1 border border-gray-200 bg-white p-6 rounded-xl shadow-sm h-fit max-h-[80vh] overflow-y-auto">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-indigo-500" /> Add New Property
          </h2>
          {message && (
            <div className={`mb-4 p-3 rounded-md text-sm ${message.includes('Error') || message.includes('must be') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
              {message}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input type="text" name="title" required value={formData.title} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea name="description" required value={formData.description} onChange={handleChange} rows="3" className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
            </div>
            <div className="flex gap-4">
              <div className="w-1/2">
                <label className="block text-sm font-medium text-gray-700">Price (₹)</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <IndianRupee className="h-4 w-4 text-gray-400" />
                  </div>
                  <input type="number" name="price" required value={formData.price} onChange={handleChange} className="block w-full pl-9 border border-gray-300 rounded-md p-2" />
                </div>
              </div>
              <div className="w-1/2 relative" ref={searchRef}>
                <label className="block text-sm font-medium text-gray-700">Location Name</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-4 w-4 text-gray-400" />
                  </div>
                  <input 
                    type="text" 
                    required 
                    value={formData.location} 
                    onChange={handleLocationSearch}
                    onFocus={() => {if(locationSuggestions.length > 0) setShowSuggestions(true)}}
                    placeholder="Search location..."
                    className="block w-full pl-9 border border-gray-300 rounded-md p-2" 
                  />
                </div>
                {/* Autocomplete Dropdown */}
                {showSuggestions && locationSuggestions.length > 0 && (
                  <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {locationSuggestions.map((result, index) => (
                      <li 
                        key={index} 
                        className="px-4 py-2 hover:bg-indigo-50 cursor-pointer text-sm text-gray-700 border-b border-gray-100 last:border-b-0"
                        onClick={() => selectLocation(result)}
                      >
                        {result.label}
                      </li>
                    ))}
                  </ul>
                )}
                {formData.location && !showSuggestions && (
                  <a 
                    href={`https://www.google.com/maps/search/?api=1&query=${formData.lat},${formData.lng}`}
                    target="_blank"
                    rel="noopener noreferrer" 
                    className="text-xs text-blue-600 hover:underline mt-1 inline-block"
                  >
                    Verify on Google Maps
                  </a>
                )}
              </div>
            </div>
            
            <div className="pt-4 border-t border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Pin Location on Map</h3>
              <p className="text-xs text-gray-500 mb-2">Auto-filled via search or click map to adjust.</p>
              <div className="h-48 w-full rounded-md border border-gray-300 overflow-hidden mb-2 z-0">
                <MapContainer center={[formData.lat, formData.lng]} zoom={4} style={{ height: '100%', width: '100%' }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <LocationMarker 
                    lat={formData.lat} 
                    lng={formData.lng} 
                    setPosition={(lat, lng) => setFormData({ ...formData, lat, lng })} 
                  />
                </MapContainer>
              </div>
              <div className="flex gap-4 text-xs text-gray-500">
                <div>Lat: {formData.lat.toFixed(4)}</div>
                <div>Lng: {formData.lng.toFixed(4)}</div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Contact Details</h3>
              <div className="space-y-3">
                <input type="text" name="owner_name" value={formData.owner_name} onChange={handleChange} placeholder="Owner Name" className="block w-full border border-gray-300 rounded-md p-2" />
                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email Address" className="block w-full border border-gray-300 rounded-md p-2" />
                <div className="flex gap-2">
                  <select value={phoneCode} onChange={(e) => setPhoneCode(e.target.value)} className="border border-gray-300 rounded-md p-2 text-sm w-24">
                    <option value="+91">🇮🇳 +91</option>
                    <option value="+1">🇺🇸 +1</option>
                    <option value="+44">🇬🇧 +44</option>
                  </select>
                  <input type="tel" name="phone_number" required value={formData.phone_number} onChange={handlePhoneChange} placeholder="10-digit Phone Number" className="block w-full border border-gray-300 rounded-md p-2" />
                </div>
                <div className="flex gap-2">
                  <select value={altPhoneCode} onChange={(e) => setAltPhoneCode(e.target.value)} className="border border-gray-300 rounded-md p-2 text-sm w-24">
                    <option value="+91">🇮🇳 +91</option>
                    <option value="+1">🇺🇸 +1</option>
                    <option value="+44">🇬🇧 +44</option>
                  </select>
                  <input type="tel" name="alternate_phone" value={formData.alternate_phone} onChange={handlePhoneChange} placeholder="10-digit Alt Phone (optional)" className="block w-full border border-gray-300 rounded-md p-2" />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <label className="block text-sm font-medium text-gray-700 mb-2">Property Images</label>
              <input type="file" multiple accept="image/jpeg, image/png, image/jpg" onChange={handleImageChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
              {imagePreviews.length > 0 && (
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {imagePreviews.map((src, idx) => (
                    <img key={idx} src={src} alt="Preview" className="w-full h-20 object-cover rounded" />
                  ))}
                </div>
              )}
            </div>
            
            <div className="pt-4 border-t border-gray-100">
              <label className="block text-sm font-medium text-gray-700 mb-2">Video URLs</label>
              <div className="space-y-2">
                {videoUrls.map((url, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input 
                      type="url" 
                      value={url} 
                      onChange={(e) => {
                        const updated = [...videoUrls];
                        updated[idx] = e.target.value;
                        setVideoUrls(updated);
                      }} 
                      placeholder={`Video URL ${idx + 1}`}
                      className="block w-full border border-gray-300 rounded-md p-2" 
                    />
                    {videoUrls.length > 1 && (
                      <button type="button" onClick={() => setVideoUrls(videoUrls.filter((_, i) => i !== idx))} className="text-red-500 hover:text-red-700 px-2">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={() => setVideoUrls([...videoUrls, ''])} className="text-sm text-indigo-600 font-medium hover:underline flex items-center gap-1">
                  <Plus className="w-4 h-4" /> Add another video URL
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">3D Models Embed URL (e.g. Luma AI)</label>
              <input type="url" name="ai_model_url" value={formData.ai_model_url} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Publishing...' : 'Publish Property'}
            </button>
          </form>
        </div>

        {/* Dynamic Content Section */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Tabs Navigation */}
          <div className="flex gap-4 border-b border-gray-200">
            <button 
              onClick={() => setTab('properties')}
              className={`pb-3 font-medium flex items-center gap-2 transition-colors border-b-2 ${activeTab === 'properties' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              <Home className="w-5 h-5" />
              My Properties
            </button>
            <button 
              onClick={() => setTab('queries')}
              className={`pb-3 font-medium flex items-center gap-2 transition-colors border-b-2 ${activeTab === 'queries' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              <Mail className="w-5 h-5" />
              My Queries
              {messages.length > 0 && (
                <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-0.5 rounded-full font-bold">{messages.length}</span>
              )}
            </button>
          </div>

          {activeTab === 'properties' && (
            <div className="space-y-4 pt-4 animate-in fade-in duration-300">
              {properties.length === 0 ? (
                <div className="text-gray-500 p-12 border border-dashed border-gray-300 rounded-xl text-center bg-white flex flex-col items-center">
                  <Home className="w-12 h-12 text-gray-300 mb-3" />
                  <p className="font-medium text-gray-700">No properties listed yet.</p>
                  <p className="text-sm">Use the form on the left to add your first property.</p>
                </div>
              ) : (
                properties.map(property => {
                  const propertyUrl = `${window.location.origin}/property/${property.id}`;
                  
                  return (
                  <div key={property.id} className="flex flex-col xl:flex-row bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                    <div className="w-full xl:w-56 h-56 xl:h-auto relative bg-gray-100 flex-shrink-0">
                      {property.ai_model_url ? (
                        <model-viewer 
                          src={property.ai_model_url} 
                          auto-rotate 
                          camera-controls 
                          style={{ width: '100%', height: '100%' }}
                        ></model-viewer>
                      ) : (
                        <img src={property.images && property.images[0] ? property.images[0] : 'https://via.placeholder.com/150'} alt="Property" className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{property.title}</h3>
                          <button onClick={() => handleDelete(property.id)} className="text-red-500 hover:text-red-700 p-1 bg-red-50 rounded transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-gray-500 mt-1 flex items-center gap-1 text-sm"><MapPin className="w-4 h-4"/> {property.location}</p>
                        <a 
                          href={`https://www.google.com/maps/search/?api=1&query=${property.lat},${property.lng}`}
                          target="_blank"
                          rel="noopener noreferrer" 
                          className="text-xs text-blue-600 hover:underline mt-1 inline-block"
                        >
                          View on Google Maps
                        </a>
                        <p className="text-xl font-bold text-indigo-600 mt-2">₹{Number(property.price).toLocaleString('en-IN')}</p>
                      </div>
                      <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
                        <Link to={`/property/${property.id}`} className="text-sm text-indigo-600 font-medium hover:underline whitespace-nowrap">
                          View Listing ↗
                        </Link>
                        
                        <div className="flex flex-wrap items-center gap-3">
                          {/* INCREASED QR CODE SIZE */}
                          <div className="bg-gray-50 p-2 rounded-xl border border-gray-200" title="Scan to view on mobile">
                            <QRCodeCanvas id={`qr-${property.id}`} value={propertyUrl} size={1024} level={"H"} style={{ width: '80px', height: '80px' }} />
                          </div>
                          
                          <div className="flex flex-col gap-2">
                            {!property.ai_model_url && property.images && property.images[0] && (
                              <button 
                                onClick={() => handleGenerate3D(property.id, property.images[0])}
                                disabled={generatingTripo === property.id}
                                className="text-sm border border-purple-200 bg-purple-50 text-purple-700 px-3 py-2 rounded-lg font-medium hover:bg-purple-100 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                              >
                                {generatingTripo === property.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                                {generatingTripo === property.id ? 'Generating...' : 'Generate 3D'}
                              </button>
                            )}

                            <button 
                              onClick={() => downloadQR(property.id, property.title)}
                              className="text-sm border border-indigo-200 bg-indigo-50 text-indigo-700 px-3 py-2 rounded-lg font-medium hover:bg-indigo-100 transition-all flex items-center justify-center gap-1.5"
                            >
                              <Download className="w-4 h-4" /> Download QR
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )})
              )}
            </div>
          )}

          {activeTab === 'queries' && (
            <div className="space-y-4 pt-4 animate-in fade-in duration-300">
              {messages.length === 0 ? (
                <div className="text-gray-500 p-12 border border-dashed border-gray-300 rounded-xl text-center bg-white flex flex-col items-center">
                  <CheckCircle className="w-12 h-12 text-green-400 mb-3" />
                  <p className="font-medium text-gray-700">You're all caught up!</p>
                  <p className="text-sm">No new inquiries for your properties.</p>
                </div>
              ) : (
                messages.map(msg => (
                  <div key={msg.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-3">
                    <div className="flex justify-between items-start border-b border-gray-100 pb-3">
                      <div>
                        <h4 className="font-bold text-gray-900">{msg.name}</h4>
                        <div className="flex gap-2 items-center flex-wrap">
                          <a href={`mailto:${msg.email}`} className="text-sm text-indigo-600 hover:underline">{msg.email}</a>
                          {msg.phone_number && (
                            <a href={`tel:${msg.phone_number}`} className="text-sm text-indigo-600 hover:underline border-l border-gray-300 pl-2">
                              {msg.phone_number}
                            </a>
                          )}
                        </div>
                      </div>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md font-medium">
                        {format(new Date(msg.created_at), 'MMM dd, h:mm a')}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Inquiry Regarding</p>
                      <p className="text-sm font-medium text-gray-800 bg-gray-50 p-2 rounded-md border border-gray-100">{msg.property?.title || 'Deleted Property'}</p>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{msg.message}</p>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap justify-end gap-2">
                      {msg.phone_number && (
                        <>
                          <a href={`tel:${msg.phone_number}`} className="text-sm bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                            Call
                          </a>
                          <a href={`sms:${msg.phone_number}`} className="text-sm bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                            Text Message
                          </a>
                        </>
                      )}
                      <a href={`mailto:${msg.email}?subject=Re: Inquiry about ${msg.property?.title}`} className="text-sm bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors">
                        Reply via Email
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
