import React, { createContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchRole = async (uid) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', uid)
        .single();
      if (!error && data) {
        setIsAdmin(data.role === 'admin');
      } else {
        setIsAdmin(false);
      }
    } catch (err) {
      console.error(err);
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user || null);
      if (session?.user) {
        fetchRole(session.user.id).then(() => setLoading(false));
      } else {
        setIsAdmin(false);
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user || null);
      if (session?.user) {
        fetchRole(session.user.id);
      } else {
        setIsAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  };

  const register = async (email, password, name, role = 'user') => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, role }
      }
    });
    if (error) throw error;

    // Manually insert into public.users if trigger is missing
    if (data.user) {
      try {
        await supabase.from('users').upsert([{
          id: data.user.id,
          name,
          email,
          role
        }]);
      } catch (dbErr) {
        console.error('Error creating public profile:', dbErr);
      }
    }
    
    return data;
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  const resetPasswordForEmail = async (email) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
    return data;
  };
  
  const updatePassword = async (newPassword) => {
    const { data, error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
    return data;
  };

  const updateProfile = async (name) => {
    const { data, error } = await supabase.auth.updateUser({
      data: { name }
    });
    if (error) throw error;
    setUser(data.user);
    
    // Also update the public.users table for consistency
    await supabase
      .from('users')
      .update({ name })
      .eq('id', data.user.id);
      
    return data;
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, login, register, logout, resetPasswordForEmail,
        updatePassword,
        updateProfile,
        isAdmin
      }}
    >  {!loading && children}
    </AuthContext.Provider>
  );
};
