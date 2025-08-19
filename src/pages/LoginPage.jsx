import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import authService from '../services/auth';
import { motion } from 'framer-motion';
import { LogIn, User, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';

const LoginPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue
  } = useForm();

  // Rediriger si déjà connecté
  useEffect(() => {
    if (authService.isAuthenticated()) {
      const user = authService.getUser();
      if (user?.role === 'supervisor' || user?.role === 'admin') {
        navigate('/dashboard');
      } else {
        navigate('/timetracking');
      }
    }
  }, [navigate]);

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await authService.login(data.username, data.password);

      if (result.success) {
        setSuccess(result.message);
        
        // Attendre un peu pour montrer le message de succès
        setTimeout(() => {
          // Rediriger selon le rôle
          if (result.user.role === 'supervisor' || result.user.role === 'admin') {
            navigate('/dashboard');
          } else {
            navigate('/timetracking');
          }
        }, 1000);
      } else {
        setError(result.message || 'Erreur de connexion');
      }
    } catch (err) {
      console.error('Erreur lors de la connexion:', err);
      setError('Une erreur inattendue s\'est produite.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (username) => {
    setValue('username', username);
    setValue('password', 'artbeaurescence');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 text-white rounded-full mb-4"
          >
            <LogIn size={32} />
          </motion.div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Art'Beau-Pointage
          </h1>
          <p className="text-gray-600">
            Système de gestion du temps de travail
          </p>
        </div>

        {/* Formulaire */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Nom d'utilisateur */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom d'utilisateur
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  {...register('username', {
                    required: 'Le nom d\'utilisateur est requis',
                    minLength: {
                      value: 3,
                      message: 'Au moins 3 caractères requis'
                    }
                  })}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.username ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Entrez votre nom d'utilisateur"
                  disabled={loading}
                />
              </div>
              {errors.username && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle size={16} className="mr-1" />
                  {errors.username.message}
                </p>
              )}
            </div>

            {/* Mot de passe */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password', {
                    required: 'Le mot de passe est requis',
                    minLength: {
                      value: 6,
                      message: 'Au moins 6 caractères requis'
                    }
                  })}
                  className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.password ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Entrez votre mot de passe"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle size={16} className="mr-1" />
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Messages d'erreur/succès */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-red-50 border border-red-200 rounded-lg"
              >
                <div className="flex items-center text-red-700">
                  <AlertCircle size={20} className="mr-2" />
                  <span className="text-sm">{error}</span>
                </div>
              </motion.div>
            )}

            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-green-50 border border-green-200 rounded-lg"
              >
                <div className="flex items-center text-green-700">
                  <span className="text-sm">{success}</span>
                </div>
              </motion.div>
            )}

            {/* Bouton de connexion */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                  Connexion...
                </div>
              ) : (
                <div className="flex items-center">
                  <LogIn size={20} className="mr-2" />
                  Se connecter
                </div>
              )}
            </button>
          </form>

          {/* Comptes de démonstration */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 text-center mb-4">
              Comptes de démonstration:
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDemoLogin('abdoulayeniasse')}
                className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded transition-colors"
                disabled={loading}
              >
                Superviseur
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('mariamafall')}
                className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded transition-colors"
                disabled={loading}
              >
                Employé
              </button>
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center mt-8 text-sm text-gray-500"
        >
          <p>© 2025 Art'Beau-Pointage - Système de pointage moderne</p>
          <p className="mt-1">
            Mot de passe par défaut: <code className="bg-gray-100 px-1 rounded">artbeaurescence</code>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
