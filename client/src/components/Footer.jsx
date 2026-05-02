import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Home, Mail, Phone, Heart, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [message, setMessage] = useState('');

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    try {
      const { error } = await supabase
        .from('subscribers')
        .insert([{ email }]);

      if (error) {
        if (error.code === '23505') { // Unique violation
          throw new Error('You are already subscribed!');
        }
        throw error;
      }

      setStatus('success');
      setMessage('Successfully subscribed!');
      setEmail('');
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setStatus('idle');
        setMessage('');
      }, 3000);
    } catch (err) {
      console.error(err);
      setStatus('error');
      setMessage(err.message || 'Failed to subscribe. Please try again.');
      
      setTimeout(() => {
        setStatus('idle');
        setMessage('');
      }, 3000);
    }
  };

  return (
    <footer className="bg-gray-900 text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand Section */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="bg-indigo-600 p-2 rounded-lg group-hover:rotate-12 transition-transform duration-300">
                <Home className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-black tracking-tight text-white">AI Accommodate</span>
            </Link>
            <p className="text-gray-400 leading-relaxed">
              Modernizing the way you find and manage your perfect home. Experience the future of property rentals with AI-powered features and a seamless host-customer interaction.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold mb-6 text-white border-l-4 border-indigo-600 pl-3">Quick Links</h4>
            <ul className="space-y-4">
              <li>
                <Link to="/" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                  <span>Home</span>
                </Link>
              </li>
              <li>
                <Link to="/properties" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                  <span>Browse Listings</span>
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                  <span>Host Dashboard</span>
                </Link>
              </li>
              <li>
                <Link to="/profile" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                  <span>My Profile</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-lg font-bold mb-6 text-white border-l-4 border-indigo-600 pl-3">Platform</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">3D Property Tours</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">AI Interior Design</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Instant Inquiries</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-bold mb-6 text-white border-l-4 border-indigo-600 pl-3">Get in Touch</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-gray-400">
                <Mail className="h-5 w-5 text-indigo-500 mt-0.5" />
                <span>support@aiaccommodate.com</span>
              </li>
              <li className="flex items-start gap-3 text-gray-400">
                <Phone className="h-5 w-5 text-indigo-500 mt-0.5" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-start gap-3 text-gray-400">
                <div className="bg-indigo-600/10 text-indigo-400 p-4 rounded-xl border border-indigo-500/20 w-full mt-2">
                  <p className="text-sm font-medium">Subscribe to our newsletter for latest listings.</p>
                  <form onSubmit={handleSubscribe} className="mt-3 flex gap-2">
                    <input 
                      type="email" 
                      placeholder="Email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={status === 'loading'}
                      className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm w-full outline-none focus:border-indigo-500 disabled:opacity-50"
                    />
                    <button 
                      type="submit"
                      disabled={status === 'loading' || !email}
                      className="bg-indigo-600 hover:bg-indigo-700 px-3 py-2 rounded-lg text-sm font-bold transition-all disabled:opacity-50 flex items-center justify-center min-w-[60px]"
                    >
                      {status === 'loading' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Join'}
                    </button>
                  </form>
                  {message && (
                    <p className={`text-xs mt-2 font-medium ${status === 'error' ? 'text-red-400' : 'text-green-400'}`}>
                      {message}
                    </p>
                  )}
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500 font-medium">
          <p>© {new Date().getFullYear()} AI Accommodate. All rights reserved.</p>
          <div className="flex items-center gap-1">
            Made with <Heart className="h-4 w-4 text-red-500 fill-red-500 mx-0.5" /> in India
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
