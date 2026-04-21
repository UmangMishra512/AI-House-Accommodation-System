import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api, { BACKEND_URL } from '../lib/api';
import { MapPin, DollarSign, ArrowLeft } from 'lucide-react';

const PropertyDetail = () => {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [contactStatus, setContactStatus] = useState({ loading: false, success: false, error: '' });

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setContactStatus({ loading: true, success: false, error: '' });
    try {
      await api.post('/contact', { ...contactForm, property_id: id });
      setContactStatus({ loading: false, success: true, error: '' });
      setContactForm({ name: '', email: '', message: '' });
    } catch (err) {
      setContactStatus({ loading: false, success: false, error: 'Failed to send message.' });
    }
  };

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const res = await api.get(`/property/${id}`);
        setProperty(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-xl text-gray-500">Property not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/properties" className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500 mb-6 transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to listings
        </Link>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">{property.title}</h1>
              <div className="mt-4 flex items-center gap-6 text-gray-500">
                <span className="flex items-center text-lg">
                  <MapPin className="mr-1.5 h-5 w-5 text-gray-400" />
                  {property.location}
                </span>
                <span className="flex items-center text-xl font-bold text-indigo-600">
                  <DollarSign className="h-5 w-5" />
                  {property.price.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Images Grid */}
            {property.images && property.images.length > 0 && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <img 
                  src={property.images[0].startsWith('http') ? property.images[0] : `${BACKEND_URL}${property.images[0]}`} 
                  alt="Main" className="w-full h-80 object-cover rounded-2xl sm:col-span-2" 
                />
                {property.images.slice(1, 3).map((img, idx) => (
                  <img 
                    key={idx} 
                    src={img.startsWith('http') ? img : `${BACKEND_URL}${img}`} 
                    alt={`Additional ${idx}`} className="w-full h-48 object-cover rounded-2xl" 
                  />
                ))}
              </div>
            )}

            {/* Description */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About this home</h2>
              <div className="prose prose-indigo max-w-none text-gray-600 text-lg">
                <p className="whitespace-pre-wrap">{property.description}</p>
              </div>
            </div>
            
            {/* Embedded 3D Tour */}
            {property.ai_model_url && (
              <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">3D Virtual Tour</h2>
                <div className="relative w-full overflow-hidden rounded-2xl" style={{ paddingTop: '56.25%' }}>
                   <iframe
                     className="absolute top-0 left-0 w-full h-full border-0"
                     src={property.ai_model_url}
                     allow="autoplay; fullscreen; vr"
                     allowFullScreen
                   ></iframe>
                </div>
              </div>
            )}

            {/* Map Location */}
            {property.lat && property.lng && (
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm mt-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Location Map</h2>
                <div className="relative w-full overflow-hidden rounded-2xl h-96 bg-gray-100">
                   <iframe
                     width="100%"
                     height="100%"
                     frameBorder="0"
                     style={{ border: 0 }}
                     src={`https://maps.google.com/maps?q=${property.lat},${property.lng}&hl=en&z=14&output=embed`}
                     allowFullScreen
                   ></iframe>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Area */}
          <div className="lg:col-span-1 border-l border-gray-100 lg:pl-10">
            <div className="sticky top-24 space-y-8">
              
              {/* QR Code Card */}
              <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-8 text-center hidden md:block">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Scan & Share</h3>
                <p className="text-sm text-gray-500 mb-6">Scan this QR code natively using a smartphone camera to save and share this property.</p>
                {property.qr_code_url ? (
                  <div className="flex flex-col items-center">
                    <div className="flex justify-center p-4 bg-gray-50 rounded-xl mb-4 w-full">
                      <img src={property.qr_code_url} alt="Property QR Code" className="w-48 h-48 mix-blend-multiply" />
                    </div>
                    <a 
                      href={property.qr_code_url} 
                      download="property-qr.png"
                      className="w-full text-center bg-indigo-50 text-indigo-700 py-2 rounded-lg font-medium hover:bg-indigo-100 transition-colors"
                    >
                      Download QR Code
                    </a>
                  </div>
                ) : (
                  <p className="text-gray-400 italic">No QR code available</p>
                )}
              </div>

              {/* Contact/Owner Card */}
              {property.owner_id && (
                <div className="bg-gradient-to-br from-indigo-50 to-white rounded-2xl p-6 border border-indigo-100">
                   <h3 className="text-lg font-semibold text-gray-900 mb-2">Listed by Host</h3>
                   <div className="flex items-center gap-4 mt-4">
                     <div className="h-12 w-12 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xl font-bold">
                       {(property.owner_name || property.owner_id.name).charAt(0).toUpperCase()}
                     </div>
                     <div>
                       <p className="text-sm font-medium text-gray-900">{property.owner_name || property.owner_id.name}</p>
                       <p className="text-sm text-gray-500">{property.email || property.owner_id.email}</p>
                     </div>
                   </div>
                   
                   <div className="mt-6 flex flex-col gap-3">
                     {property.phone_number && (
                       <a href={`tel:${property.phone_number}`} className="w-full flex items-center justify-center bg-white border border-indigo-200 text-indigo-700 py-2 rounded-xl font-medium hover:bg-indigo-50 transition-colors shadow-sm">
                         Call Now
                       </a>
                     )}
                     {(property.email || property.owner_id.email) && (
                       <a href={`mailto:${property.email || property.owner_id.email}`} className="w-full flex items-center justify-center bg-white border border-indigo-200 text-indigo-700 py-2 rounded-xl font-medium hover:bg-indigo-50 transition-colors shadow-sm">
                         Email Host
                       </a>
                     )}
                   </div>

                   <hr className="my-6 border-indigo-100" />
                   
                   <h4 className="text-md font-semibold text-gray-900 mb-4">Send a Message</h4>
                   {contactStatus.success && <div className="p-3 bg-green-50 text-green-700 rounded-lg text-sm mb-4">Message sent successfully!</div>}
                   {contactStatus.error && <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm mb-4">{contactStatus.error}</div>}
                   
                   <form onSubmit={handleContactSubmit} className="space-y-3">
                     <input required type="text" placeholder="Your Name" value={contactForm.name} onChange={(e) => setContactForm({...contactForm, name: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-sm" />
                     <input required type="email" placeholder="Your Email" value={contactForm.email} onChange={(e) => setContactForm({...contactForm, email: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-sm" />
                     <textarea required placeholder="I'm interested in this property..." rows="3" value={contactForm.message} onChange={(e) => setContactForm({...contactForm, message: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-sm"></textarea>
                     <button disabled={contactStatus.loading} type="submit" className="w-full bg-indigo-600 text-white py-2.5 px-4 rounded-xl font-medium hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50">
                       {contactStatus.loading ? 'Sending...' : 'Send Message'}
                     </button>
                   </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetail;
