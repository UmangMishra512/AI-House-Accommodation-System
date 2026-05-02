import React, { useContext, useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Home, LogOut, User as UserIcon, PlusSquare, Shield, Bell, Check, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';

const Navbar = () => {
  const { user, isAdmin, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [unreadMessages, setUnreadMessages] = useState([]);
  const [showNotificationPopup, setShowNotificationPopup] = useState(false);
  const notificationRef = useRef(null);

  useEffect(() => {
    if (user) {
      const fetchUnreadMessages = async () => {
        const { data, error } = await supabase
          .from('contact_messages')
          .select('*, property:properties(title)')
          .eq('is_read', false)
          .order('created_at', { ascending: false });
        
        if (!error && data) {
          setUnreadMessages(data);
        }
      };
      
      fetchUnreadMessages();

      // Subscribe to new messages
      const channel = supabase.channel('public:contact_messages')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'contact_messages' }, () => {
          fetchUnreadMessages();
        })
        .subscribe();
        
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotificationPopup(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const markAsRead = async (messageId) => {
    try {
      if (messageId === 'all') {
        const ids = unreadMessages.map(m => m.id);
        if(ids.length === 0) return;
        await supabase.from('contact_messages').update({ is_read: true }).in('id', ids);
      } else {
        await supabase.from('contact_messages').update({ is_read: true }).eq('id', messageId);
      }
      // Realtime subscription will automatically update the state, but we can optimistically update
      if (messageId === 'all') {
        setUnreadMessages([]);
      } else {
        setUnreadMessages(prev => prev.filter(m => m.id !== messageId));
      }
    } catch (err) {
      console.error("Error marking as read:", err);
    }
  };

  const handleNotificationClick = (msg) => {
    markAsRead(msg.id);
    setShowNotificationPopup(false);
    navigate('/dashboard?tab=queries');
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <Home className="h-6 w-6 text-indigo-600" />
              <span className="font-bold text-xl text-gray-900 tracking-tight">AI Accommodate</span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/properties" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors">
              Listing
            </Link>
            {user ? (
              <>
                {isAdmin && (
                  <Link to="/admin" className="flex items-center gap-1 text-gray-600 hover:text-indigo-600 font-medium transition-colors">
                    <Shield className="w-5 h-5" />
                    Admin
                  </Link>
                )}
                <Link to="/dashboard" className="flex items-center gap-1 text-gray-600 hover:text-indigo-600 font-medium transition-colors">
                  <PlusSquare className="w-5 h-5" />
                  Dashboard
                </Link>
                
                <div className="relative flex items-center" ref={notificationRef}>
                  <button 
                    onClick={() => setShowNotificationPopup(!showNotificationPopup)}
                    className="relative flex items-center text-gray-600 hover:text-indigo-600 transition-colors p-1"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadMessages.length > 0 && (
                      <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center justify-center min-w-[16px] h-[16px]">
                        {unreadMessages.length > 99 ? '99+' : unreadMessages.length}
                      </span>
                    )}
                  </button>

                  {/* Notification Popover */}
                  {showNotificationPopup && (
                    <div className="absolute top-full right-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                      <div className="p-3 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                        <h3 className="font-semibold text-gray-800 text-sm">Notifications</h3>
                        {unreadMessages.length > 0 && (
                          <button 
                            onClick={() => markAsRead('all')}
                            className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
                          >
                            <Check className="w-3 h-3" /> Mark all as read
                          </button>
                        )}
                      </div>
                      
                      <div className="max-h-80 overflow-y-auto">
                        {unreadMessages.length === 0 ? (
                          <div className="p-6 text-center text-gray-500 flex flex-col items-center gap-2">
                            <CheckCircle2 className="w-8 h-8 text-green-400" />
                            <p className="text-sm">You have no unread notifications.</p>
                          </div>
                        ) : (
                          unreadMessages.map((msg) => (
                            <div 
                              key={msg.id} 
                              onClick={() => handleNotificationClick(msg)}
                              className="p-3 border-b border-gray-50 hover:bg-indigo-50/50 cursor-pointer transition-colors"
                            >
                              <div className="flex justify-between items-start mb-1">
                                <span className="font-semibold text-sm text-gray-900 truncate pr-2">{msg.name}</span>
                                <span className="text-[10px] text-indigo-600 font-medium whitespace-nowrap bg-indigo-50 px-1.5 py-0.5 rounded">
                                  {format(new Date(msg.created_at), 'MMM dd')}
                                </span>
                              </div>
                              <p className="text-xs text-gray-500 line-clamp-1 mb-1">
                                Inquired about: <span className="font-medium text-gray-700">{msg.property?.title || 'Unknown Property'}</span>
                              </p>
                              <p className="text-xs text-gray-600 line-clamp-2">
                                "{msg.message}"
                              </p>
                            </div>
                          ))
                        )}
                      </div>
                      
                      <Link 
                        to="/dashboard?tab=queries" 
                        onClick={() => setShowNotificationPopup(false)}
                        className="block w-full text-center p-2 text-xs font-semibold text-indigo-600 bg-gray-50 hover:bg-gray-100 transition-colors"
                      >
                        View all queries
                      </Link>
                    </div>
                  )}
                </div>

                <Link to="/profile" className="flex items-center gap-2 pr-4 border-r border-gray-200 hover:text-indigo-600 transition-colors ml-2">
                  <UserIcon className="w-5 h-5 text-gray-500" />
                  <span className="text-sm font-semibold text-gray-700">{user.name}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 text-red-500 hover:text-red-700 font-medium transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors">
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md font-medium hover:bg-indigo-700 transition-colors"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
