import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../lib/api';
import { MapPin, DollarSign, ArrowLeft } from 'lucide-react';

const PropertyDetail = () => {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);

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
                <img src={property.images[0]} alt="Main" className="w-full h-80 object-cover rounded-2xl sm:col-span-2" />
                {property.images.slice(1, 3).map((img, idx) => (
                  <img key={idx} src={img} alt={`Additional ${idx}`} className="w-full h-48 object-cover rounded-2xl" />
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
          </div>

          {/* Sidebar Area */}
          <div className="lg:col-span-1 border-l border-gray-100 lg:pl-10">
            <div className="sticky top-24 space-y-8">
              
              {/* QR Code Card */}
              <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-8 text-center hidden md:block">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Scan & Share</h3>
                <p className="text-sm text-gray-500 mb-6">Scan this QR code natively using a smartphone camera to save and share this property.</p>
                {property.qr_code_url ? (
                  <div className="flex justify-center p-4 bg-gray-50 rounded-xl">
                    <img src={property.qr_code_url} alt="Property QR Code" className="w-48 h-48 mix-blend-multiply" />
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
                       {property.owner_id.name.charAt(0).toUpperCase()}
                     </div>
                     <div>
                       <p className="text-sm font-medium text-gray-900">{property.owner_id.name}</p>
                       <p className="text-sm text-gray-500">{property.owner_id.email}</p>
                     </div>
                   </div>
                   <button className="mt-6 w-full bg-indigo-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-indigo-700 transition-colors shadow-sm focus:ring-4 focus:ring-indigo-100">
                     Contact Host
                   </button>
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
