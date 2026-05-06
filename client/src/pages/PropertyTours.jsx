import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Box, RotateCcw, Maximize2, Smartphone, Users } from 'lucide-react';

const teamMembers = [
  { name: 'Chinmay Bhardwaj', roll: 'A45605224009' },
  { name: 'Vedant Narayan', roll: 'A45605224022' },
  { name: 'Shivam Kumar Singh', roll: 'A45605224040' },
  { name: 'Umang Mishra', roll: 'A45605224058' },
];

const features = [
  {
    icon: <Box className="w-6 h-6" />,
    title: 'Immersive 3D Models',
    description: 'Walk through properties virtually with high-fidelity 3D reconstructions powered by cutting-edge AI. Experience every room, hallway, and corner as if you were physically present.',
  },
  {
    icon: <RotateCcw className="w-6 h-6" />,
    title: '360° Panoramic Views',
    description: 'Rotate, zoom, and explore every angle of a property from the comfort of your device. Our panoramic views ensure you never miss a detail before making your decision.',
  },
  {
    icon: <Maximize2 className="w-6 h-6" />,
    title: 'Full-Screen Experience',
    description: 'Enjoy distraction-free property tours with our full-screen immersive mode. Optimized for large displays and VR headsets for the most lifelike viewing experience.',
  },
  {
    icon: <Smartphone className="w-6 h-6" />,
    title: 'Mobile-First Design',
    description: 'Access 3D tours seamlessly on any device — phone, tablet, or desktop. Our responsive rendering engine adapts to your screen for buttery-smooth performance.',
  },
];

const PropertyTours = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-purple-300 rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 relative z-10">
          <Link to="/" className="inline-flex items-center gap-1 text-indigo-200 hover:text-white text-sm font-medium mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <div className="flex items-center gap-4 flex-wrap">
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
              3D Property Tours
            </h1>
            <span className="bg-amber-400 text-amber-900 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-lg animate-pulse">
              Coming Soon
            </span>
          </div>
          <p className="text-lg sm:text-xl text-indigo-100 max-w-2xl leading-relaxed mt-4">
            Step inside your next home without stepping outside yours. Our AI-powered 3D tours bring properties to life with photorealistic detail, interactive walkthroughs, and immersive panoramic views.
          </p>
          <div className="mt-8 flex items-center gap-4 flex-wrap">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2">
              🚧 This feature is under active development
            </div>
            <Link to="/properties" className="bg-white text-indigo-700 px-6 py-3 rounded-xl font-semibold hover:bg-indigo-50 transition-colors shadow-lg">
              Explore Properties
            </Link>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">How It Works</h2>
          <p className="mt-3 text-gray-500 dark:text-gray-400 max-w-xl mx-auto">Our platform leverages the latest in 3D scanning and AI reconstruction to deliver unparalleled virtual property experiences.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, idx) => (
            <div key={idx} className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-xl flex items-center justify-center mb-5">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
              <p className="text-gray-500 dark:text-gray-400 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Team Section */}
      <div className="bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-4 py-2 rounded-full text-sm font-semibold mb-4">
              <Users className="w-4 h-4" /> Our Team
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Built by Students, for Everyone</h2>
            <p className="mt-3 text-gray-500 dark:text-gray-400 max-w-xl mx-auto">This project is developed as part of our academic curriculum by a passionate team of developers.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {teamMembers.map((member, idx) => (
              <div key={idx} className="text-center p-6 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-700">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-4 shadow-lg shadow-indigo-200 dark:shadow-indigo-900/50">
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

export default PropertyTours;
