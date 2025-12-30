import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateUser } from '../hooks/useUser';
import { useAuth } from '../hooks/useAuth';

const SignUpPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{
    username?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const navigate = useNavigate();
  const { mutateAsync: createUser, isPending } = useCreateUser();
  const { login } = useAuth();

  // Validation functions
  const validateUsername = (value: string): string | undefined => {
    if (!value) return 'Username is required';
    if (value.length < 3) return 'Username must be at least 3 characters';
    if (value.length > 50) return 'Username must be less than 50 characters';
    if (!/^[a-zA-Z0-9_-]+$/.test(value)) {
      return 'Username can only contain letters, numbers, underscores, and hyphens';
    }
    return undefined;
  };

  const validatePassword = (value: string): string | undefined => {
    if (!value) return 'Password is required';
    if (value.length < 8) return 'Password must be at least 8 characters';
    if (value.length > 128) return 'Password must be less than 128 characters';
    if (!/(?=.*[a-z])/.test(value)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/(?=.*[A-Z])/.test(value)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/(?=.*\d)/.test(value)) {
      return 'Password must contain at least one number';
    }
    if (!/(?=.*[@$!%*?&])/.test(value)) {
      return 'Password must contain at least one special character (@$!%*?&)';
    }
    return undefined;
  };

  const validateConfirmPassword = (
    password: string,
    confirmPass: string
  ): string | undefined => {
    if (!confirmPass) return 'Please confirm your password';
    if (password !== confirmPass) return 'Passwords do not match';
    return undefined;
  };

  // Real-time validation on blur
  const handleUsernameBlur = () => {
    const error = validateUsername(username);
    setFieldErrors((prev) => ({ ...prev, username: error }));
  };

  const handlePasswordBlur = () => {
    const error = validatePassword(password);
    setFieldErrors((prev) => ({ ...prev, password: error }));
  };

  const handleConfirmPasswordBlur = () => {
    const error = validateConfirmPassword(password, confirmPassword);
    setFieldErrors((prev) => ({ ...prev, confirmPassword: error }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate all fields
    const usernameError = validateUsername(username);
    const passwordError = validatePassword(password);
    const confirmPasswordError = validateConfirmPassword(
      password,
      confirmPassword
    );

    setFieldErrors({
      username: usernameError,
      password: passwordError,
      confirmPassword: confirmPasswordError,
    });

    // If any validation fails, don't submit
    if (usernameError || passwordError || confirmPasswordError) {
      setError('Please enter a valid username or password');
      return;
    }

    try {
      await createUser({ username, password });

      // Auto-login after successful registration
      await login({ username, password });
      navigate('/home');
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail;

      // Handle specific backend errors
      if (typeof errorMessage === 'string') {
        if (errorMessage.toLowerCase().includes('username')) {
          setFieldErrors((prev) => ({ ...prev, username: errorMessage }));
        } else {
          setError(errorMessage);
        }
      } else {
        setError('Sign up failed. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-black flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 mb-2">
            Join OtakuTime
          </h1>
          <p className="text-zinc-400 text-sm">
            Create your account and start tracking
          </p>
        </div>

        <div className="bg-zinc-900/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-zinc-800 p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Sign Up</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username Field */}
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-zinc-300 mb-2"
              >
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  // Clear error when user types
                  if (fieldErrors.username) {
                    setFieldErrors((prev) => ({
                      ...prev,
                      username: undefined,
                    }));
                  }
                }}
                onBlur={handleUsernameBlur}
                placeholder="Choose a username"
                required
                className={`w-full px-4 py-3 bg-zinc-800/50 border rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 transition-all duration-200 ${
                  fieldErrors.username
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-zinc-700 focus:ring-blue-500 focus:border-transparent'
                }`}
              />
              {fieldErrors.username && (
                <p className="mt-1 text-sm text-red-400">
                  {fieldErrors.username}
                </p>
              )}
              <p className="mt-1 text-xs text-zinc-500">
                3-50 characters, letters, numbers, underscores, and hyphens only
              </p>
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-zinc-300 mb-2"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (fieldErrors.password) {
                    setFieldErrors((prev) => ({
                      ...prev,
                      password: undefined,
                    }));
                  }
                }}
                onBlur={handlePasswordBlur}
                placeholder="Create a strong password"
                required
                className={`w-full px-4 py-3 bg-zinc-800/50 border rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 transition-all duration-200 ${
                  fieldErrors.password
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-zinc-700 focus:ring-blue-500 focus:border-transparent'
                }`}
              />
              {fieldErrors.password && (
                <p className="mt-1 text-sm text-red-400">
                  {fieldErrors.password}
                </p>
              )}
              <div className="mt-2 space-y-1">
                <p className="text-xs text-zinc-500">Password must contain:</p>
                <ul className="text-xs text-zinc-500 space-y-0.5 ml-4">
                  <li className={password.length >= 8 ? 'text-green-400' : ''}>
                    ✓ At least 8 characters
                  </li>
                  <li
                    className={
                      /(?=.*[a-z])/.test(password) ? 'text-green-400' : ''
                    }
                  >
                    ✓ One lowercase letter
                  </li>
                  <li
                    className={
                      /(?=.*[A-Z])/.test(password) ? 'text-green-400' : ''
                    }
                  >
                    ✓ One uppercase letter
                  </li>
                  <li
                    className={
                      /(?=.*\d)/.test(password) ? 'text-green-400' : ''
                    }
                  >
                    ✓ One number
                  </li>
                  <li
                    className={
                      /(?=.*[@$!%*?&])/.test(password) ? 'text-green-400' : ''
                    }
                  >
                    ✓ One special character (@$!%*?&)
                  </li>
                </ul>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-zinc-300 mb-2"
              >
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (fieldErrors.confirmPassword) {
                    setFieldErrors((prev) => ({
                      ...prev,
                      confirmPassword: undefined,
                    }));
                  }
                }}
                onBlur={handleConfirmPasswordBlur}
                placeholder="Confirm your password"
                required
                className={`w-full px-4 py-3 bg-zinc-800/50 border rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 transition-all duration-200 ${
                  fieldErrors.confirmPassword
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-zinc-700 focus:ring-blue-500 focus:border-transparent'
                }`}
              />
              {fieldErrors.confirmPassword && (
                <p className="mt-1 text-sm text-red-400">
                  {fieldErrors.confirmPassword}
                </p>
              )}
            </div>

            {/* General Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 flex items-start gap-2">
                <span className="text-red-400 text-xl"></span>
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg shadow-blue-500/25 transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Creating account...
                </span>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-zinc-400 text-sm">
              Already have an account?{' '}
              <button
                onClick={() => navigate('/login')}
                className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
