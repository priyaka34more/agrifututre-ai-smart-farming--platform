import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, Sprout } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import '../styles/glassmorphism.css';

// 🌿 Glassmorphism Login Component
const GlassLogin = () => {
  const navigate = useNavigate();
  const { language, setLanguage, t, availableLanguages } = useLanguage();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [particles, setParticles] = useState([]);

  // 🌿 Generate floating particles
  useEffect(() => {
    const generateParticles = () => {
      const newParticles = [];
      for (let i = 0; i < 50; i++) {
        newParticles.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 4 + 1,
          duration: Math.random() * 20 + 10,
          delay: Math.random() * 5
        });
      }
      setParticles(newParticles);
    };
    generateParticles();
  }, []);

  // 🌿 Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Mock login logic - replace with actual API call
      if (formData.email && formData.password) {
        localStorage.setItem('token', 'mock-token');
        localStorage.setItem('userName', formData.email.split('@')[0]);
        localStorage.setItem('role', 'user');
        navigate('/dashboard');
      } else {
        setError(t('error'));
      }
    } catch (err) {
      setError(t('error'));
    } finally {
      setLoading(false);
    }
  };

  // 🌿 Handle input changes
  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // 🌿 Get greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('goodMorning');
    if (hour < 18) return t('goodAfternoon');
    return t('goodEvening');
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* 🌿 Background Image with Overlay */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat"
             style={{
               backgroundImage: `url('https://images.unsplash.com/photo-1590634203228-2a2b1e3c6cd5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80')`
             }}>
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-green-900/80 via-green-800/60 to-blue-900/80"></div>
      </div>

      {/* 🌿 Floating Particles */}
      <div className="fixed inset-0 z-10 pointer-events-none">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute bg-white/20 rounded-full glass-float"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              animationDuration: `${particle.duration}s`,
              animationDelay: `${particle.delay}s`
            }}
          />
        ))}
      </div>

      {/* 🌿 Language Switcher */}
      <div className="fixed top-4 right-4 z-20">
        <div className="glass-card p-2 flex gap-2">
          {availableLanguages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => setLanguage(lang.code)}
              className={`glass-button px-3 py-1 text-sm ${language === lang.code ? 'bg-white/20' : ''}`}
              title={lang.name}
            >
              <span className="mr-1">{lang.flag}</span>
              <span className="hidden sm:inline">{lang.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 🌿 Main Login Content */}
      <div className="relative z-20 min-h-screen flex items-center justify-center p-4">
        <div className="glass-card glass-glow w-full max-w-md p-8 glass-optimized">
          {/* 🌿 Logo and Title */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-400 to-blue-500 rounded-full mb-4 glass-pulse">
              <Sprout size={40} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {getGreeting()}
            </h1>
            <p className="text-white/80 text-lg">
              {t('welcomeBack')} to AgriFuture AI
            </p>
          </div>

          {/* 🌿 Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 🌿 Email Field */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail size={20} className="text-white/60" />
              </div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder={t('email')}
                className="glass-input pl-10 text-white placeholder-white/60"
                required
              />
            </div>

            {/* 🌿 Password Field */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock size={20} className="text-white/60" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder={t('password')}
                className="glass-input pl-10 pr-10 text-white placeholder-white/60"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? (
                  <EyeOff size={20} className="text-white/60 hover:text-white/80 transition-colors" />
                ) : (
                  <Eye size={20} className="text-white/60 hover:text-white/80 transition-colors" />
                )}
              </button>
            </div>

            {/* 🌿 Error Message */}
            {error && (
              <div className="glass-card bg-red-500/20 border-red-500/30 p-3 text-red-200 text-sm">
                {error}
              </div>
            )}

            {/* 🌿 Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="glass-button w-full py-3 text-white font-semibold bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                  {t('loading')}
                </div>
              ) : (
                t('login')
              )}
            </button>
          </form>

          {/* 🌿 Additional Links */}
          <div className="mt-6 text-center">
            <div className="flex justify-between text-white/60 text-sm">
              <button className="hover:text-white/80 transition-colors">
                {t('changePassword')}
              </button>
              <button className="hover:text-white/80 transition-colors">
                {t('register')}
              </button>
            </div>
          </div>

          {/* 🌿 Footer */}
          <div className="mt-8 pt-6 border-t border-white/20 text-center">
            <p className="text-white/60 text-sm">
              © 2024 AgriFuture AI. {t('welcomeBack')} to smart farming.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlassLogin;
