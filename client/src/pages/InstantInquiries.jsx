import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, MessageCircle, Zap, Bell, Shield, Users } from 'lucide-react';

const teamMembers = [
  { name: 'Chinmay Bhardwaj', roll: 'A45605224009' },
  { name: 'Vedant Narayan', roll: 'A45605224022' },
  { name: 'Shivam Kumar Singh', roll: 'A45605224040' },
  { name: 'Umang Mishra', roll: 'A45605224058' },
];

const InstantInquiries = () => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
    <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-700 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 relative z-10">
        <Link to="/" className="inline-flex items-center gap-1 text-teal-200 hover:text-white text-sm font-medium mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">Instant Inquiries</h1>
        <p className="text-lg sm:text-xl text-teal-100 max-w-2xl leading-relaxed">Connect with property owners in seconds. Our intelligent inquiry system combines instant messaging, AI-powered responses, and real-time notifications.</p>
        <div className="mt-8"><Link to="/properties" className="bg-white text-teal-700 px-6 py-3 rounded-xl font-semibold hover:bg-teal-50 transition-colors shadow-lg">Browse Properties</Link></div>
      </div>
    </div>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      <div className="text-center mb-16">
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Seamless Communication</h2>
        <p className="mt-3 text-gray-500 dark:text-gray-400 max-w-xl mx-auto">From first inquiry to final agreement — fast, transparent, and reliable.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {[
          { icon: <MessageCircle className="w-6 h-6" />, title: 'One-Click Contact', desc: 'Reach property owners instantly through our streamlined inquiry form delivered directly to the host dashboard.' },
          { icon: <Zap className="w-6 h-6" />, title: 'AI-Powered Chat', desc: 'Get instant answers about any property using our Gemini AI chatbot — available 24/7 on every listing.' },
          { icon: <Bell className="w-6 h-6" />, title: 'Real-Time Notifications', desc: 'Hosts receive instant notifications when a new inquiry arrives with smart filters.' },
          { icon: <Shield className="w-6 h-6" />, title: 'Verified Communication', desc: 'All inquiries are authenticated and tied to registered accounts for genuine, spam-free interactions.' },
        ].map((f, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-xl flex items-center justify-center mb-5">{f.icon}</div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{f.title}</h3>
            <p className="text-gray-500 dark:text-gray-400 leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
    <div className="bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 px-4 py-2 rounded-full text-sm font-semibold mb-4"><Users className="w-4 h-4" /> Our Team</div>
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">The Team Behind the Platform</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {teamMembers.map((m, i) => (
            <div key={i} className="text-center p-6 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-700">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-4 shadow-lg">{m.name.charAt(0)}</div>
              <h4 className="font-bold text-gray-900 dark:text-white">{m.name}</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-mono">{m.roll}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default InstantInquiries;
