import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api, { BACKEND_URL } from '../lib/api';
import { Link } from 'react-router-dom';
import { Settings, Plus, Image as ImageIcon, MapPin, IndianRupee, Trash2, Home, Sparkles, Loader2 } from 'lucide-react';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [properties, setProperties] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    location: '',
    lat: '',
    lng: '',
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
  const [tripoStatus, setTripoStatus] = useState({}); // { propertyId: { status, message } }

  const fetchProperties = async () => {
    try {
      const res = await api.get('/property');
      const userProps = res.data.filter(p => p.owner_id && p.owner_id._id === user.id);
      setProperties(userProps);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchProperties();
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles(files);
    
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      let uploadedImageUrls = [];
      
      // Upload images if any
      if (imageFiles.length > 0) {
        const uploadData = new FormData();
        imageFiles.forEach(file => {
          uploadData.append('images', file);
        });
        
        const uploadRes = await api.post('/upload', uploadData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        uploadedImageUrls = uploadRes.data.urls;
      }

      const dataToSubmit = {
        ...formData,
        price: Number(formData.price),
        lat: formData.lat ? Number(formData.lat) : undefined,
        lng: formData.lng ? Number(formData.lng) : undefined,
        phone_number: formData.phone_number ? `${phoneCode} ${formData.phone_number}` : '',
        alternate_phone: formData.alternate_phone ? `${altPhoneCode} ${formData.alternate_phone}` : '',
        images: uploadedImageUrls,
        video_url: videoUrls.filter(v => v.trim()),
      };

      await api.post('/property', dataToSubmit);
      setMessage('Property created successfully!');
      setFormData({
        title: '', description: '', price: '', location: '', lat: '', lng: '',
        owner_name: '', phone_number: '', alternate_phone: '', email: '',
        ai_model_url: ''
      });
      setVideoUrls(['']);
      setImageFiles([]);
      setImagePreviews([]);
      fetchProperties();
    } catch (err) {
      setMessage('Error creating property.');
    } finally {
      setLoading(false);
    }
  };

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

  const generate3DModel = async (propertyId, imageUrl) => {
    const fullImageUrl = imageUrl.startsWith('http') ? imageUrl : `${BACKEND_URL}${imageUrl}`;
    
    setTripoStatus(prev => ({ ...prev, [propertyId]: { status: 'starting', message: 'Starting...' } }));
    
    try {
      const genRes = await api.post('/tripo/generate', { imageUrl: fullImageUrl, propertyId });
      const { taskId } = genRes.data;
      
      setTripoStatus(prev => ({ ...prev, [propertyId]: { status: 'queued', message: 'Queued...' } }));
      
      const pollInterval = setInterval(async () => {
        try {
          const statusRes = await api.get(`/tripo/status/${taskId}`);
          const { status, modelUrl, message: statusMsg } = statusRes.data;
          
          setTripoStatus(prev => ({ ...prev, [propertyId]: { status, message: statusMsg } }));
          
          if (status === 'success' && modelUrl) {
            clearInterval(pollInterval);
            setTripoStatus(prev => ({ ...prev, [propertyId]: { status: 'saving', message: 'Saving model...' } }));
            await api.post('/tripo/save', { modelUrl, propertyId });
            setTripoStatus(prev => ({ ...prev, [propertyId]: { status: 'done', message: '3D model ready!' } }));
            fetchProperties();
            setTimeout(() => {
              setTripoStatus(prev => { const n = {...prev}; delete n[propertyId]; return n; });
            }, 5000);
          } else if (status === 'failed') {
            clearInterval(pollInterval);
            setTimeout(() => {
              setTripoStatus(prev => { const n = {...prev}; delete n[propertyId]; return n; });
            }, 5000);
          }
        } catch (err) {
          clearInterval(pollInterval);
          setTripoStatus(prev => ({ ...prev, [propertyId]: { status: 'failed', message: 'Error' } }));
        }
      }, 5000);
    } catch (err) {
      setTripoStatus(prev => ({ ...prev, [propertyId]: { status: 'failed', message: err.response?.data?.message || 'Failed' } }));
    }
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
          {message && <div className="mb-4 p-3 bg-indigo-50 text-indigo-700 rounded-md text-sm">{message}</div>}
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
              <div className="w-1/2">
                <label className="block text-sm font-medium text-gray-700">Location Name</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-4 w-4 text-gray-400" />
                  </div>
                  <input type="text" name="location" required value={formData.location} onChange={handleChange} className="block w-full pl-9 border border-gray-300 rounded-md p-2" />
                </div>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="w-1/2">
                <label className="block text-sm font-medium text-gray-700">Latitude</label>
                <input type="number" step="any" name="lat" value={formData.lat} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2" placeholder="e.g. 40.7128" />
              </div>
              <div className="w-1/2">
                <label className="block text-sm font-medium text-gray-700">Longitude</label>
                <input type="number" step="any" name="lng" value={formData.lng} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2" placeholder="e.g. -74.0060" />
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
                    <option value="+971">🇦🇪 +971</option>
                    <option value="+61">🇦🇺 +61</option>
                    <option value="+86">🇨🇳 +86</option>
                    <option value="+81">🇯🇵 +81</option>
                    <option value="+49">🇩🇪 +49</option>
                    <option value="+33">🇫🇷 +33</option>
                    <option value="+7">🇷🇺 +7</option>
                    <option value="+55">🇧🇷 +55</option>
                    <option value="+27">🇿🇦 +27</option>
                    <option value="+82">🇰🇷 +82</option>
                    <option value="+39">🇮🇹 +39</option>
                    <option value="+34">🇪🇸 +34</option>
                    <option value="+60">🇲🇾 +60</option>
                    <option value="+65">🇸🇬 +65</option>
                    <option value="+977">🇳🇵 +977</option>
                    <option value="+94">🇱🇰 +94</option>
                    <option value="+880">🇧🇩 +880</option>
                  </select>
                  <input type="tel" name="phone_number" value={formData.phone_number} onChange={handleChange} placeholder="Phone Number" className="block w-full border border-gray-300 rounded-md p-2" />
                </div>
                <div className="flex gap-2">
                  <select value={altPhoneCode} onChange={(e) => setAltPhoneCode(e.target.value)} className="border border-gray-300 rounded-md p-2 text-sm w-24">
                    <option value="+91">🇮🇳 +91</option>
                    <option value="+1">🇺🇸 +1</option>
                    <option value="+44">🇬🇧 +44</option>
                    <option value="+971">🇦🇪 +971</option>
                    <option value="+61">🇦🇺 +61</option>
                    <option value="+86">🇨🇳 +86</option>
                    <option value="+81">🇯🇵 +81</option>
                    <option value="+49">🇩🇪 +49</option>
                    <option value="+33">🇫🇷 +33</option>
                    <option value="+7">🇷🇺 +7</option>
                    <option value="+55">🇧🇷 +55</option>
                    <option value="+27">🇿🇦 +27</option>
                    <option value="+82">🇰🇷 +82</option>
                    <option value="+39">🇮🇹 +39</option>
                    <option value="+34">🇪🇸 +34</option>
                    <option value="+60">🇲🇾 +60</option>
                    <option value="+65">🇸🇬 +65</option>
                    <option value="+977">🇳🇵 +977</option>
                    <option value="+94">🇱🇰 +94</option>
                    <option value="+880">🇧🇩 +880</option>
                  </select>
                  <input type="tel" name="alternate_phone" value={formData.alternate_phone} onChange={handleChange} placeholder="Alt Phone" className="block w-full border border-gray-300 rounded-md p-2" />
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

        {/* Listings Section */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-800">
            <Home className="w-5 h-5 text-indigo-500" /> My Properties
          </h2>
          {properties.length === 0 ? (
            <div className="text-gray-500 p-8 border border-dashed border-gray-300 rounded-lg text-center bg-gray-50">
              No properties listed yet. Add one from the left!
            </div>
          ) : (
            properties.map(property => (
              <div key={property._id} className="flex bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                <img src={property.images[0] ? (property.images[0].startsWith('http') ? property.images[0] : `${BACKEND_URL}${property.images[0]}`) : 'https://via.placeholder.com/150'} alt="Property" className="w-48 h-auto object-cover" />
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{property.title}</h3>
                      <button onClick={() => handleDelete(property._id)} className="text-red-500 hover:text-red-700 p-1">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                    <p className="text-gray-500 mt-1 flex items-center gap-1 text-sm"><MapPin className="w-4 h-4"/> {property.location}</p>
                    <p className="text-xl font-bold text-indigo-600 mt-2">₹{property.price.toLocaleString('en-IN')}</p>
                  </div>
                  <div className="mt-4 flex items-center gap-4 flex-wrap">
                    <Link to={`/property/${property._id}`} className="text-sm text-indigo-600 font-medium hover:underline">
                      View Listing
                    </Link>
                    {property.images && property.images.length > 0 && !property.model_3d_url && (
                      <button 
                        onClick={() => generate3DModel(property._id, property.images[0])}
                        disabled={tripoStatus[property._id]}
                        className="text-sm bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-3 py-1.5 rounded-lg font-medium hover:from-violet-700 hover:to-indigo-700 disabled:opacity-60 transition-all flex items-center gap-1.5 shadow-sm"
                      >
                        {tripoStatus[property._id] ? (
                          <><Loader2 className="w-3.5 h-3.5 animate-spin" /> {tripoStatus[property._id].message}</>
                        ) : (
                          <><Sparkles className="w-3.5 h-3.5" /> Generate 3D Model</>
                        )}
                      </button>
                    )}
                    {property.model_3d_url && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">✓ 3D Model Ready</span>
                    )}
                    {property.qr_code_url && (
                       <img src={property.qr_code_url} alt="QR Code" className="w-10 h-10 border border-gray-200 rounded" />
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
