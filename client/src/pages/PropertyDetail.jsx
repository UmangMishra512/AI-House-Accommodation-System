import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { MapPin, IndianRupee, ArrowLeft, Share2, MessageCircle, Send, Loader2, Sparkles, X } from 'lucide-react';

const PropertyDetail = () => {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [contactForm, setContactForm] = useState({ name: '', email: '', phone_number: '', message: '' });
  const [contactStatus, setContactStatus] = useState({ loading: false, success: false, error: '' });

  // AI Chat State
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setContactStatus({ loading: true, success: false, error: '' });
    try {
      const { error } = await supabase
        .from('contact_messages')
        .insert([{ ...contactForm, property_id: id }]);
      if (error) throw error;
      setContactStatus({ loading: false, success: true, error: '' });
      setContactForm({ name: '', email: '', phone_number: '', message: '' });
    } catch (err) {
      setContactStatus({ loading: false, success: false, error: 'Failed to send message.' });
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: property?.title || 'Property',
          text: `Check out this property on AI Accommodate!`,
          url: window.location.href,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .eq('id', id)
          .single();
          
        if (error) throw error;
        setProperty(data);
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
                  <div className="flex flex-col">
                    <span>{property.location}</span>
                    <a 
                      href={`https://www.google.com/maps/search/?api=1&query=${property.lat},${property.lng}`}
                      target="_blank"
                      rel="noopener noreferrer" 
                      className="text-sm text-blue-600 hover:underline inline-block mt-0.5"
                    >
                      View on Google Maps
                    </a>
                  </div>
                </span>
                <span className="flex items-center text-xl font-bold text-indigo-600">
                  <IndianRupee className="h-5 w-5" />
                  {property.price.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Images Grid */}
            {property.images && property.images.length > 0 && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <img 
                  src={property.images[0]}
                  alt="Main" className="w-full h-80 object-cover rounded-2xl sm:col-span-2" 
                />
                {property.images.slice(1).map((img, idx) => (
                  <img 
                    key={idx} 
                    src={img}
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
            
            {/* AI-Generated 3D Model (highest priority) */}
            {property.model_3d_url && (
              <div className="bg-gradient-to-br from-violet-50 to-indigo-50 p-6 rounded-3xl border border-indigo-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="bg-gradient-to-r from-violet-600 to-indigo-600 text-transparent bg-clip-text">AI-Generated</span> 3D Model
                </h2>
                <div className="relative w-full overflow-hidden rounded-2xl bg-gray-100" style={{ height: '500px' }}>
                  <model-viewer
                    src={property.model_3d_url}
                    alt="3D Model of property"
                    auto-rotate
                    camera-controls
                    touch-action="pan-y"
                    shadow-intensity="1"
                    environment-image="neutral"
                    style={{ width: '100%', height: '100%' }}
                  ></model-viewer>
                </div>
                <p className="text-xs text-gray-400 mt-3 text-center">Drag to rotate • Pinch to zoom • Powered by Tripo AI</p>
              </div>
            )}

            {/* Embedded 3D Tour (Luma AI / manual embed) */}
            {!property.model_3d_url && property.ai_model_url && (
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

            {/* If no 3D model at all, show video(s) */}
            {!property.model_3d_url && !property.ai_model_url && property.video_url && property.video_url.length > 0 && property.video_url.some(v => v) && (
              <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Property Videos</h2>
                <div className="space-y-4">
                  {property.video_url.filter(v => v).map((vUrl, idx) => {
                    // YouTube detection
                    const ytRegExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|m\.youtube\.com\/watch\?v=|youtube\.com\/shorts\/)([^#&?]*).*/;
                    const ytMatch = vUrl.match(ytRegExp);
                    
                    // Google Drive detection
                    const driveMatch = vUrl.match(/drive\.google\.com\/file\/d\/([^/]+)/);
                    
                    // Direct video file detection
                    const isDirectVideo = /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(vUrl);

                    if (ytMatch && ytMatch[2].length === 11) {
                      // YouTube embed
                      return (
                        <div key={idx} className="relative w-full overflow-hidden rounded-2xl" style={{ paddingTop: '56.25%' }}>
                          <iframe
                            className="absolute top-0 left-0 w-full h-full border-0"
                            src={`https://www.youtube.com/embed/${ytMatch[2]}`}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          ></iframe>
                        </div>
                      );
                    } else if (driveMatch) {
                      // Google Drive preview embed
                      const fileId = driveMatch[1];
                      return (
                        <div key={idx} className="relative w-full overflow-hidden rounded-2xl" style={{ paddingTop: '56.25%' }}>
                          <iframe
                            className="absolute top-0 left-0 w-full h-full border-0"
                            src={`https://drive.google.com/file/d/${fileId}/preview`}
                            allow="autoplay; encrypted-media"
                            allowFullScreen
                          ></iframe>
                        </div>
                      );
                    } else if (isDirectVideo) {
                      // Direct video file — use HTML5 video player
                      return (
                        <div key={idx} className="relative w-full overflow-hidden rounded-2xl">
                          <video controls className="w-full rounded-2xl" preload="metadata">
                            <source src={vUrl} />
                            Your browser does not support the video tag.
                          </video>
                        </div>
                      );
                    } else {
                      // Fallback — try iframe embed (works for many platforms)
                      return (
                        <div key={idx} className="relative w-full overflow-hidden rounded-2xl" style={{ paddingTop: '56.25%' }}>
                          <iframe
                            className="absolute top-0 left-0 w-full h-full border-0"
                            src={vUrl}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          ></iframe>
                        </div>
                      );
                    }
                  })}
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
                <div className="flex flex-col items-center">
                  <div className="flex justify-center p-4 bg-gray-50 rounded-xl mb-4 w-full">
                    <img 
                      src={property.qr_code_url || `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(window.location.href)}`} 
                      alt="Property QR Code" 
                      className="w-48 h-48 mix-blend-multiply" 
                    />
                  </div>
                  <div className="flex gap-2 w-full mt-4">
                    <button 
                      onClick={handleShare}
                      className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors shadow-sm"
                    >
                      <Share2 className="w-4 h-4" /> Share
                    </button>
                    <a 
                      href={property.qr_code_url || `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(window.location.href)}`} 
                      download="property-qr.png"
                      className="flex-1 text-center bg-indigo-50 text-indigo-700 py-2 rounded-lg font-medium hover:bg-indigo-100 transition-colors"
                    >
                      Download QR
                    </a>
                  </div>
                </div>
              </div>

              {/* AI Chat Widget */}
              <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
                <button
                  onClick={() => setChatOpen(!chatOpen)}
                  className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-sm font-semibold text-gray-900">Ask AI about this property</h3>
                      <p className="text-xs text-gray-500">Get instant answers</p>
                    </div>
                  </div>
                  <MessageCircle className={`w-5 h-5 text-gray-400 transition-transform ${chatOpen ? 'rotate-180' : ''}`} />
                </button>

                {chatOpen && (
                  <div className="border-t border-gray-100">
                    {/* Chat Messages */}
                    <div className="h-64 overflow-y-auto p-4 space-y-3 bg-gray-50">
                      {chatMessages.length === 0 && (
                        <div className="text-center py-6">
                          <Sparkles className="w-8 h-8 text-indigo-300 mx-auto mb-2" />
                          <p className="text-xs text-gray-500 mb-3">Ask me anything about this property!</p>
                          <div className="flex flex-wrap gap-1.5 justify-center">
                            {['Is there parking?', "What's nearby?", 'Pet policy?', 'Furnishing details?'].map(q => (
                              <button
                                key={q}
                                onClick={() => {
                                  setChatInput(q);
                                  // Auto-send
                                  const sendQ = async () => {
                                    setChatMessages(prev => [...prev, { role: 'user', text: q }]);
                                    setChatLoading(true);
                                    try {
                                      const { data, error } = await supabase.functions.invoke('property-chat', {
                                        body: { propertyId: id, question: q }
                                      });
                                      if (error) throw error;
                                      setChatMessages(prev => [...prev, { role: 'ai', text: data?.answer || 'No response.' }]);
                                    } catch (err) {
                                      setChatMessages(prev => [...prev, { role: 'ai', text: 'Sorry, I could not process that. ' + err.message }]);
                                    } finally {
                                      setChatLoading(false);
                                      setChatInput('');
                                    }
                                  };
                                  sendQ();
                                }}
                                className="text-[11px] px-2.5 py-1 rounded-full bg-white border border-gray-200 text-gray-600 hover:border-indigo-300 hover:text-indigo-600 transition-colors"
                              >
                                {q}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                      {chatMessages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm ${
                            msg.role === 'user'
                              ? 'bg-indigo-600 text-white rounded-br-md'
                              : 'bg-white text-gray-800 border border-gray-200 rounded-bl-md shadow-sm'
                          }`}>
                            {msg.text}
                          </div>
                        </div>
                      ))}
                      {chatLoading && (
                        <div className="flex justify-start">
                          <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-2 shadow-sm">
                            <div className="flex gap-1">
                              <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                              <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                              <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Chat Input */}
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        if (!chatInput.trim() || chatLoading) return;
                        const question = chatInput.trim();
                        setChatMessages(prev => [...prev, { role: 'user', text: question }]);
                        setChatInput('');
                        setChatLoading(true);
                        try {
                          const { data, error } = await supabase.functions.invoke('property-chat', {
                            body: { propertyId: id, question }
                          });
                          if (error) throw error;
                          setChatMessages(prev => [...prev, { role: 'ai', text: data?.answer || 'No response.' }]);
                        } catch (err) {
                          setChatMessages(prev => [...prev, { role: 'ai', text: 'Sorry, I could not process that. ' + err.message }]);
                        } finally {
                          setChatLoading(false);
                        }
                      }}
                      className="flex items-center gap-2 p-3 border-t border-gray-100 bg-white"
                    >
                      <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="Ask about this property..."
                        className="flex-1 text-sm px-3 py-2 rounded-lg border border-gray-200 focus:ring-1 focus:ring-indigo-400 focus:border-indigo-400 outline-none"
                        disabled={chatLoading}
                      />
                      <button
                        type="submit"
                        disabled={chatLoading || !chatInput.trim()}
                        className="p-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors disabled:opacity-50"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </form>
                  </div>
                )}
              </div>

              {/* Contact/Owner Card */}
              {property.owner_id && (
                <div className="bg-gradient-to-br from-indigo-50 to-white rounded-2xl p-6 border border-indigo-100">
                   <h3 className="text-lg font-semibold text-gray-900 mb-2">Listed by Host</h3>
                   <div className="flex items-center gap-4 mt-4">
                     <div className="h-12 w-12 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xl font-bold">
                       {(property.owner_name || (property.owner_id && property.owner_id.name) || 'H').charAt(0).toUpperCase()}
                     </div>
                     <div>
                       <p className="text-sm font-medium text-gray-900">{property.owner_name || (property.owner_id && property.owner_id.name) || 'Host'}</p>
                       <p className="text-sm text-gray-500">{property.email || (property.owner_id && property.owner_id.email)}</p>
                     </div>
                   </div>
                   
                   <div className="mt-6 flex flex-col gap-3">
                     {property.phone_number && (
                       <a href={`tel:${property.phone_number}`} className="w-full flex items-center justify-center bg-white border border-indigo-200 text-indigo-700 py-2 rounded-xl font-medium hover:bg-indigo-50 transition-colors shadow-sm">
                         Call Now
                       </a>
                     )}
                     {(property.email || (property.owner_id && property.owner_id.email)) && (
                       <a href={`mailto:${property.email || (property.owner_id && property.owner_id.email)}`} className="w-full flex items-center justify-center bg-white border border-indigo-200 text-indigo-700 py-2 rounded-xl font-medium hover:bg-indigo-50 transition-colors shadow-sm">
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
                     <input type="tel" placeholder="Your Phone Number (optional)" value={contactForm.phone_number} onChange={(e) => setContactForm({...contactForm, phone_number: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-sm" />
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
