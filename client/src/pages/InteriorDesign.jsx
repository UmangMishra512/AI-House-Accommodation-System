import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Wand2, Palette, Layers, Sparkles, Users } from 'lucide-react';

const teamMembers = [
  { name: 'Chinmay Bhardwaj', roll: 'A45605224009' },
  { name: 'Vedant Narayan', roll: 'A45605224022' },
  { name: 'Shivam Kumar Singh', roll: 'A45605224040' },
  { name: 'Umang Mishra', roll: 'A45605224058' },
];

const features = [
  {
    icon: <Wand2 className="w-6 h-6" />,
    title: 'AI-Powered Suggestions',
    description: 'Our AI analyzes your property photos and generates personalized interior design suggestions — from furniture placement to color palettes — tailored to your space and style preferences.',
  },
  {
    icon: <Palette className="w-6 h-6" />,
    title: 'Style Matching',
    description: 'Choose from a curated library of design styles — Modern, Minimalist, Bohemian, Industrial, and more. Our AI adapts suggestions to perfectly match your chosen aesthetic.',
  },
  {
    icon: <Layers className="w-6 h-6" />,
    title: 'Room-by-Room Analysis',
    description: 'Upload photos of individual rooms and receive detailed design recommendations. Each suggestion considers room dimensions, natural lighting, and existing architectural features.',
  },
  {
    icon: <Sparkles className="w-6 h-6" />,
    title: 'Smart Enhancement',
    description: 'Our AI image enhancement engine optimizes property photos with intelligent brightness, contrast, and color corrections — making listings more attractive to potential tenants.',
  },
];

const InteriorDesign = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-rose-500 via-pink-600 to-purple-700 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-20 w-96 h-96 bg-pink-200 rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 relative z-10">
          <Link to="/" className="inline-flex items-center gap-1 text-pink-200 hover:text-white text-sm font-medium mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
            AI Interior Design
          </h1>
          <p className="text-lg sm:text-xl text-pink-100 max-w-2xl leading-relaxed">
            Transform empty spaces into dream homes with AI-driven design intelligence. Get instant style suggestions, photo enhancements, and personalized decor recommendations — all powered by Gemini AI.
          </p>
          <div className="mt-8 flex gap-4">
            <Link to="/properties" className="bg-white text-pink-700 px-6 py-3 rounded-xl font-semibold hover:bg-pink-50 transition-colors shadow-lg">
              View Properties
            </Link>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Design Intelligence at Your Fingertips</h2>
          <p className="mt-3 text-gray-500 dark:text-gray-400 max-w-xl mx-auto">Our AI design tools help both hosts and tenants visualize the full potential of any property.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, idx) => (
            <div key={idx} className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900/30 text-pink-600 rounded-xl flex items-center justify-center mb-5">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
              <p className="text-gray-500 dark:text-gray-400 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Team */}
      <div className="bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-pink-50 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 px-4 py-2 rounded-full text-sm font-semibold mb-4">
              <Users className="w-4 h-4" /> Our Team
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Meet the Creators</h2>
            <p className="mt-3 text-gray-500 dark:text-gray-400 max-w-xl mx-auto">A dedicated team of student developers bringing AI innovation to the real estate experience.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {teamMembers.map((member, idx) => (
              <div key={idx} className="text-center p-6 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-700">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-4 shadow-lg shadow-pink-200 dark:shadow-pink-900/50">
                  {member.name.charAt(0)}
                </div>
                <h4 className="font-bold text-gray-900 dark:text-white">{member.name}</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-mono">{member.roll}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InteriorDesign;
