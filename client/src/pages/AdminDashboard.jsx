import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Shield, Users, Home, Trash2, Mail, LayoutDashboard, Search, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

const AdminDashboard = () => {
  const { user, isAdmin } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [properties, setProperties] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Because RLS is bypassed by is_admin() function, we can query all these tables
      const [usersRes, propertiesRes, messagesRes] = await Promise.all([
        supabase.from('users').select('*').order('created_at', { ascending: false }),
        supabase.from('properties').select('*').order('created_at', { ascending: false }),
        supabase.from('contact_messages').select('*, property:properties(title)').order('created_at', { ascending: false })
      ]);

      if (usersRes.error) throw usersRes.error;
      if (propertiesRes.error) throw propertiesRes.error;
      if (messagesRes.error) throw messagesRes.error;

      setUsers(usersRes.data || []);
      setProperties(propertiesRes.data || []);
      setMessages(messagesRes.data || []);
    } catch (err) {
      console.error(err);
      setError('Error fetching admin data. Make sure you have run the SQL script to make yourself an admin.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin]);

  const handleDeleteUser = async (id) => {
    if (window.confirm('Are you sure you want to delete this user? This may break relational data unless handled properly.')) {
      try {
        const { error } = await supabase.from('users').delete().eq('id', id);
        if (error) throw error;
        setUsers(users.filter(u => u.id !== id));
      } catch (err) {
        alert('Error deleting user: ' + err.message);
      }
    }
  };

  const handleDeleteProperty = async (id) => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      try {
        const { error } = await supabase.from('properties').delete().eq('id', id);
        if (error) throw error;
        setProperties(properties.filter(p => p.id !== id));
      } catch (err) {
        alert('Error deleting property: ' + err.message);
      }
    }
  };

  const handleDeleteMessage = async (id) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      try {
        const { error } = await supabase.from('contact_messages').delete().eq('id', id);
        if (error) throw error;
        setMessages(messages.filter(m => m.id !== id));
      } catch (err) {
        alert('Error deleting message: ' + err.message);
      }
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center mt-20 text-center px-4">
        <Shield className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
        <p className="text-gray-500 max-w-md">You do not have administrative privileges. Please ensure you have run the Supabase SQL migration script to assign your email as an admin.</p>
      </div>
    );
  }

  if (loading) return <div className="flex justify-center mt-20"><div className="animate-spin h-8 w-8 border-b-2 border-indigo-600 rounded-full"></div></div>;

  // Analytics preparation
  const last7DaysProperties = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = format(d, 'MMM dd');
    return {
      name: dateStr,
      listings: properties.filter(p => format(new Date(p.created_at), 'MMM dd') === dateStr).length
    };
  }).reverse();

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-100 rounded-xl">
              <Shield className="w-8 h-8 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Admin Console</h1>
              <p className="text-sm text-gray-500 font-medium mt-1">Manage users, listings, and platform communications</p>
            </div>
          </div>
          <button onClick={fetchData} className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
            Refresh Data
          </button>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <p className="text-red-700 font-medium text-sm">{error}</p>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 border-b border-gray-200 scrollbar-hide">
          <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={LayoutDashboard} label="Overview" />
          <TabButton active={activeTab === 'users'} onClick={() => setActiveTab('users')} icon={Users} label={`Users (${users.length})`} />
          <TabButton active={activeTab === 'properties'} onClick={() => setActiveTab('properties')} icon={Home} label={`Properties (${properties.length})`} />
          <TabButton active={activeTab === 'messages'} onClick={() => setActiveTab('messages')} icon={Mail} label={`Messages (${messages.length})`} />
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <StatCard title="Total Users" value={users.length} icon={Users} color="indigo" />
              <StatCard title="Total Listings" value={properties.length} icon={Home} color="emerald" />
              <StatCard title="Total Inquiries" value={messages.length} icon={Mail} color="blue" />
              <StatCard title="Admins" value={users.filter(u => u.role === 'admin').length} icon={Shield} color="purple" />
            </div>

            {/* Charts Section */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Listing Growth (Last 7 Days)</h2>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={last7DaysProperties}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} allowDecimals={false} />
                    <Tooltip cursor={{fill: '#f3f4f6'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                    <Bar dataKey="listings" fill="#4f46e5" radius={[4, 4, 0, 0]} maxBarSize={50} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden animate-in fade-in duration-300">
            <DataTable 
              columns={['Name', 'Email', 'Role', 'Joined', 'Actions']}
              data={users.map(u => (
                <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{u.name || 'Anonymous'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${u.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{format(new Date(u.created_at), 'MMM dd, yyyy')}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => handleDeleteUser(u.id)} disabled={u.id === user?.id} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                      <Trash2 className="w-4 h-4"/>
                    </button>
                  </td>
                </tr>
              ))}
            />
          </div>
        )}

        {activeTab === 'properties' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden animate-in fade-in duration-300">
             <DataTable 
              columns={['Property', 'Host', 'Location', 'Price', 'Actions']}
              data={properties.map(p => (
                <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 max-w-[200px] truncate">{p.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.owner?.name || p.owner_name || 'Unknown'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.location}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">₹{p.price?.toLocaleString('en-IN') || p.price}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => handleDeleteProperty(p.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4"/>
                    </button>
                  </td>
                </tr>
              ))}
            />
          </div>
        )}

        {activeTab === 'messages' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden animate-in fade-in duration-300">
             <DataTable 
              columns={['Sender', 'Property', 'Message', 'Date', 'Actions']}
              data={messages.map(m => (
                <tr key={m.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="text-sm font-medium text-gray-900">{m.name}</p>
                    <p className="text-xs text-gray-500">{m.email}</p>
                    {m.phone_number && <p className="text-xs text-gray-500">{m.phone_number}</p>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-600 font-medium">{m.property?.title || 'Deleted Property'}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-[300px] truncate">{m.message}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{format(new Date(m.created_at), 'MMM dd, HH:mm')}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => handleDeleteMessage(m.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4"/>
                    </button>
                  </td>
                </tr>
              ))}
            />
          </div>
        )}

      </div>
    </div>
  );
};

// UI Components
const TabButton = ({ active, onClick, icon: Icon, label }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${
      active 
        ? 'bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-200' 
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
    }`}
  >
    <Icon className={`w-4 h-4 ${active ? 'text-indigo-600' : 'text-gray-500'}`} />
    {label}
  </button>
);

const StatCard = ({ title, value, icon: Icon, color }) => {
  const colorMap = {
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
  };
  
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between group hover:border-gray-300 transition-colors">
      <div>
        <p className="text-sm font-semibold text-gray-500 mb-1">{title}</p>
        <p className="text-3xl font-bold text-gray-900 tracking-tight">{value}</p>
      </div>
      <div className={`p-4 rounded-2xl border ${colorMap[color]} transition-transform group-hover:scale-105`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  );
};

const DataTable = ({ columns, data }) => (
  <div className="overflow-x-auto">
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50/50">
        <tr>
          {columns.map((col, i) => (
            <th key={i} className={`px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider ${i === columns.length - 1 ? 'text-right' : ''}`}>
              {col}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-100">
        {data.length > 0 ? data : (
          <tr>
            <td colSpan={columns.length} className="px-6 py-12 text-center text-sm text-gray-500">
              No data available
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
);

export default AdminDashboard;
