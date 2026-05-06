import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [msg, setMsg] = useState(null);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const { login, resetPasswordForEmail } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMsg(null);
    
    try {
      if (isForgotPassword) {
        await resetPasswordForEmail(email);
        setMsg('Password reset email sent! Check your inbox.');
      } else {
        await login(email, password);
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Authentication failed');
    }
  };

  return (
    <div className="flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-100 dark:border-gray-800">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            {isForgotPassword ? 'Reset Password' : 'Sign in to your account'}
          </h2>
        </div>
        {error && <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm text-center">{error}</div>}
        {msg && <div className="bg-green-50 text-green-600 p-3 rounded-md text-sm text-center">{msg}</div>}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <input
                name="email"
                type="email"
                required
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-white ${isForgotPassword ? 'rounded-md' : 'rounded-t-md'} focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            {!isForgotPassword && (
              <div>
                <input
                  name="password"
                  type="password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-white rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <button
                type="button"
                onClick={() => { setIsForgotPassword(!isForgotPassword); setError(null); setMsg(null); }}
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                {isForgotPassword ? 'Back to login' : 'Forgot your password?'}
              </button>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              {isForgotPassword ? 'Send Reset Link' : 'Sign in'}
            </button>
          </div>
          
          <div className="text-center text-sm">
            <span className="text-gray-600 dark:text-gray-300">Don't have an account? </span>
            <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
              Register here
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
