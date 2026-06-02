import React, { useState } from 'react';
import { 
  Mail, Lock, Eye, EyeOff, User, Sprout, 
  AlertCircle, Loader2, Sun
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../styles/premium-theme.css';

// 🌿 Premium Auth UI Component
const PremiumAuthUI = ({ mode = 'login' }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState('weak');
  const [focusedField, setFocusedField] = useState('');
  const weather = {
    temp: 28,
    condition: 'Partly Cloudy',
    icon: Sun
  };

  // 🌿 Password strength checker
  const checkPasswordStrength = (password) => {
    if (!password) return 'weak';
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.match(/[a-z]/)) strength++;
    if (password.match(/[A-Z]/)) strength++;
    if (password.match(/[0-9]/)) strength++;
    if (password.match(/[^a-zA-Z0-9]/)) strength++;
    
    if (strength <= 2) return 'weak';
    if (strength <= 3) return 'medium';
    return 'strong';
  };

  // 🌿 Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'password') {
      setPasswordStrength(checkPasswordStrength(value));
    }
    
    // Clear error on input
    if (error) setError('');
  };

  // 🌿 Handle field focus
  const handleFieldFocus = (fieldName) => {
    setFocusedField(fieldName);
  };

  const handleFieldBlur = () => {
    setFocusedField('');
  };

  // 🌿 Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate form
      if (mode === 'register' && formData.password !== formData.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      if (formData.password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Success
      localStorage.setItem('token', 'demo-token');
      localStorage.setItem('userName', formData.name || formData.email.split('@')[0]);
      navigate('/dashboard');
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 🌿 Get password strength color
  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case 'weak': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'strong': return 'bg-green-500';
      default: return 'bg-gray-300';
    }
  };

  // 🌿 Get password strength text
  const getPasswordStrengthText = () => {
    switch (passwordStrength) {
      case 'weak': return 'Weak password';
      case 'medium': return 'Medium strength';
      case 'strong': return 'Strong password';
      default: return '';
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background with glassmorphism */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-400 via-blue-500 to-purple-600">
        <div className="absolute inset-0 bg-black/20"></div>
        
        {/* Animated background elements */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-48 h-48 bg-white/10 rounded-full blur-2xl animate-pulse delay-75"></div>
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-white/10 rounded-full blur-lg animate-pulse delay-150"></div>
      </div>

      {/* Weather Widget */}
      <div className="absolute top-8 right-8 premium-glass-card p-4 text-white">
        <div className="flex items-center space-x-3">
          <weather.icon size={24} />
          <div>
            <div className="text-lg font-semibold">{weather.temp}°C</div>
            <div className="text-sm opacity-80">{weather.condition}</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-md rounded-full mb-4">
              <Sprout size={40} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">AgriFuture AI</h1>
            <p className="text-white/80">Smart Farming Assistant</p>
          </div>

          {/* Auth Form */}
          <div className="premium-glass-card p-8">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 text-center">
              {mode === 'login' ? 'Welcome Back' : 'Create Account'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Field (Register Only) */}
              {mode === 'register' && (
                <div className="relative">
                  <div className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors duration-200 ${
                    focusedField === 'name' ? 'text-green-500' : 'text-gray-400'
                  }`}>
                    <User size={20} />
                  </div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    onFocus={() => handleFieldFocus('name')}
                    onBlur={handleFieldBlur}
                    placeholder="Full Name"
                    className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl bg-white/80 backdrop-blur-md text-gray-800 placeholder-gray-500 transition-all duration-300 ${
                      focusedField === 'name' 
                        ? 'border-green-500 shadow-lg shadow-green-500/20' 
                        : 'border-transparent'
                    }`}
                    required={mode === 'register'}
                  />
                </div>
              )}

              {/* Email Field */}
              <div className="relative">
                <div className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors duration-200 ${
                  focusedField === 'email' ? 'text-green-500' : 'text-gray-400'
                }`}>
                  <Mail size={20} />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  onFocus={() => handleFieldFocus('email')}
                  onBlur={handleFieldBlur}
                  placeholder="Email Address"
                  className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl bg-white/80 backdrop-blur-md text-gray-800 placeholder-gray-500 transition-all duration-300 ${
                    focusedField === 'email' 
                      ? 'border-green-500 shadow-lg shadow-green-500/20' 
                      : 'border-transparent'
                  }`}
                  required
                />
              </div>

              {/* Password Field */}
              <div className="relative">
                <div className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors duration-200 ${
                  focusedField === 'password' ? 'text-green-500' : 'text-gray-400'
                }`}>
                  <Lock size={20} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  onFocus={() => handleFieldFocus('password')}
                  onBlur={handleFieldBlur}
                  placeholder="Password"
                  className={`w-full pl-12 pr-12 py-3 border-2 rounded-xl bg-white/80 backdrop-blur-md text-gray-800 placeholder-gray-500 transition-all duration-300 ${
                    focusedField === 'password' 
                      ? 'border-green-500 shadow-lg shadow-green-500/20' 
                      : 'border-transparent'
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Password Strength
                    </span>
                    <span className="text-sm font-medium text-gray-800 dark:text-white">
                      {getPasswordStrengthText()}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                      style={{ 
                        width: passwordStrength === 'weak' ? '33%' : 
                               passwordStrength === 'medium' ? '66%' : '100%' 
                      }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Confirm Password Field (Register Only) */}
              {mode === 'register' && (
                <div className="relative">
                  <div className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors duration-200 ${
                    focusedField === 'confirmPassword' ? 'text-green-500' : 'text-gray-400'
                  }`}>
                    <Lock size={20} />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    onFocus={() => handleFieldFocus('confirmPassword')}
                    onBlur={handleFieldBlur}
                    placeholder="Confirm Password"
                    className={`w-full pl-12 pr-12 py-3 border-2 rounded-xl bg-white/80 backdrop-blur-md text-gray-800 placeholder-gray-500 transition-all duration-300 ${
                      focusedField === 'confirmPassword' 
                        ? 'border-green-500 shadow-lg shadow-green-500/20' 
                        : 'border-transparent'
                    }`}
                    required={mode === 'register'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="flex items-center space-x-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <AlertCircle size={16} className="text-red-500" />
                  <span className="text-sm text-red-700 dark:text-red-300">{error}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full premium-button py-4 text-lg font-semibold bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <Loader2 size={20} className="animate-spin" />
                    <span>{mode === 'login' ? 'Signing In...' : 'Creating Account...'}</span>
                  </div>
                ) : (
                  <span>{mode === 'login' ? 'Sign In' : 'Create Account'}</span>
                )}
              </button>
            </form>

            {/* Switch Mode */}
            <div className="mt-6 text-center">
              <p className="text-gray-600 dark:text-gray-400">
                {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
                <button
                  onClick={() => navigate(mode === 'login' ? '/register' : '/login')}
                  className="ml-2 text-green-600 hover:text-green-700 font-medium transition-colors duration-200"
                >
                  {mode === 'login' ? 'Sign Up' : 'Sign In'}
                </button>
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-white/60 text-sm">
              © 2024 AgriFuture AI. Smart farming for better tomorrow.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumAuthUI;
