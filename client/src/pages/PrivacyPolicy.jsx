import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Eye, Lock, Database, Users } from 'lucide-react';

const teamMembers = [
  { name: 'Chinmay Bhardwaj', roll: 'A45605224009' },
  { name: 'Vedant Narayan', roll: 'A45605224022' },
  { name: 'Shivam Kumar Singh', roll: 'A45605224040' },
  { name: 'Umang Mishra', roll: 'A45605224058' },
];

const PrivacyPolicy = () => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
    <div className="relative overflow-hidden bg-gradient-to-br from-gray-800 via-gray-900 to-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 relative z-10">
        <Link to="/" className="inline-flex items-center gap-1 text-gray-400 hover:text-white text-sm font-medium mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">Privacy Policy</h1>
        <p className="text-lg sm:text-xl text-gray-300 max-w-2xl leading-relaxed">Your privacy matters to us. This policy outlines how AI Accommodate collects, uses, and protects your personal information.</p>
        <p className="text-sm text-gray-500 mt-4">Last updated: May 2026</p>
      </div>
    </div>

    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      <div className="prose prose-lg dark:prose-invert max-w-none space-y-10">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex items-center gap-3 mb-4"><Database className="w-6 h-6 text-indigo-600" /><h2 className="text-2xl font-bold text-gray-900 dark:text-white m-0">Information We Collect</h2></div>
          <ul className="space-y-3 text-gray-600 dark:text-gray-300">
            <li><strong>Account Information:</strong> When you register, we collect your name, email address, and profile details to create and manage your account.</li>
            <li><strong>Property Data:</strong> Hosts provide property details including titles, descriptions, images, location coordinates, contact information, and pricing.</li>
            <li><strong>Usage Data:</strong> We automatically collect information about how you interact with our platform, including pages visited, search queries, and feature usage.</li>
            <li><strong>Communication Data:</strong> Messages sent through our inquiry system and AI chat interactions are stored to facilitate host-tenant communication.</li>
          </ul>
        </div>

        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex items-center gap-3 mb-4"><Eye className="w-6 h-6 text-indigo-600" /><h2 className="text-2xl font-bold text-gray-900 dark:text-white m-0">How We Use Your Information</h2></div>
          <ul className="space-y-3 text-gray-600 dark:text-gray-300">
            <li><strong>Service Delivery:</strong> To display property listings, facilitate inquiries, and enable AI-powered features like semantic search and chat.</li>
            <li><strong>Personalization:</strong> To provide relevant property recommendations and neighborhood insights tailored to your preferences.</li>
            <li><strong>Communication:</strong> To send important updates about your account, inquiries, and newsletter subscriptions.</li>
            <li><strong>Platform Improvement:</strong> To analyze usage patterns and improve our features, performance, and user experience.</li>
          </ul>
        </div>

        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex items-center gap-3 mb-4"><Lock className="w-6 h-6 text-indigo-600" /><h2 className="text-2xl font-bold text-gray-900 dark:text-white m-0">Data Security</h2></div>
          <ul className="space-y-3 text-gray-600 dark:text-gray-300">
            <li><strong>Encryption:</strong> All data is transmitted over HTTPS and stored using industry-standard encryption in our Supabase-powered database.</li>
            <li><strong>Authentication:</strong> We use Supabase Auth with Row Level Security (RLS) policies to ensure users can only access their own data.</li>
            <li><strong>No Selling:</strong> We never sell, rent, or trade your personal information to third parties for marketing purposes.</li>
            <li><strong>Access Control:</strong> Administrative access is restricted and all actions are logged for accountability.</li>
          </ul>
        </div>

        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex items-center gap-3 mb-4"><Shield className="w-6 h-6 text-indigo-600" /><h2 className="text-2xl font-bold text-gray-900 dark:text-white m-0">Your Rights</h2></div>
          <ul className="space-y-3 text-gray-600 dark:text-gray-300">
            <li><strong>Access:</strong> You can request a copy of the personal data we hold about you at any time.</li>
            <li><strong>Correction:</strong> You can update your profile information directly from your account settings.</li>
            <li><strong>Deletion:</strong> You can request deletion of your account and associated data by contacting our support team.</li>
            <li><strong>Opt-Out:</strong> You can unsubscribe from newsletters and marketing communications at any time.</li>
          </ul>
        </div>

        <div className="text-center text-gray-500 dark:text-gray-400 text-sm pt-4">
          <p>For any privacy-related concerns, please contact us at <a href="mailto:support@aiaccommodate.com" className="text-indigo-600 hover:underline">support@aiaccommodate.com</a></p>
        </div>
      </div>
    </div>

    <div className="bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-full text-sm font-semibold mb-4"><Users className="w-4 h-4" /> Our Team</div>
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Developed By</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {teamMembers.map((m, i) => (
            <div key={i} className="text-center p-6 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-700">
              <div className="w-16 h-16 bg-gradient-to-br from-gray-700 to-gray-900 rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-4 shadow-lg">{m.name.charAt(0)}</div>
              <h4 className="font-bold text-gray-900 dark:text-white">{m.name}</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-mono">{m.roll}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default PrivacyPolicy;
