import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useUpdateUsername } from '../hooks/useUser';
import { useChangePassword } from '../hooks/useUser';
import type { UpdatePassword } from '../types/User';
import type { AxiosError } from 'axios';

const ProfileEdit: React.FC = () => {
  const { user } = useAuth();
  const [username, setUsername] = useState(user?.username || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const { mutateAsync: updateUsername, isPending: isUpdatingUsername } =
    useUpdateUsername();
  const { mutateAsync: changePassword, isPending: isChangingPassword } =
    useChangePassword();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      let changes = false;

      if (username !== user?.username && username.trim()) {
        await updateUsername({ username: username.trim() });
        changes = true;
      }

      if (currentPassword.trim() && newPassword.trim()) {
        const passwordData: UpdatePassword = {
          currentPassword: currentPassword.trim(),
          newPassword: newPassword.trim(),
        };
        await changePassword(passwordData);
        changes = true;
      } else if (currentPassword.trim() || newPassword.trim()) {
        setError('Please provide both current and new password');
        return;
      }

      if (!changes) {
        setError('No changes to save');
        return;
      }

      setSuccess('Profile updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      const axiosError = err as AxiosError<{ detail: string }>;
      setError(axiosError.response?.data?.detail || 'Failed to update profile');
    }
  };

  const isPending = isUpdatingUsername || isChangingPassword;

  return (
    <div className="bg-zinc-900/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-zinc-800 p-8">
      <h2 className="text-2xl font-bold text-white mb-6">Edit Profile</h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Username
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Current Password
          </label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Required to change password"
            className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            New Password
          </label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Leave blank to keep current"
            className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="mt-1 text-xs text-zinc-500">
            Must be at least 8 characters with uppercase, lowercase, number, and
            special character
          </p>
        </div>

        {success && (
          <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-3">
            <p className="text-green-400 text-sm">{success}</p>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full py-3 px-4 bg-linear-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
};

export default ProfileEdit;
