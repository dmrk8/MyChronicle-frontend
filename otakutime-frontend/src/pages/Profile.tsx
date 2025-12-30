import React from 'react';
import { useAuth } from '../hooks/useAuth';
import ProfileEdit from '../components/ProfileEdit';
import AccountDelete from '../components/AccountDelete';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 via-black to-zinc-900 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Profile Settings
          </h1>
          <p className="text-zinc-400">
            Manage your account settings and preferences
          </p>
        </div>

        {/* User Info Card */}
        <div className="bg-zinc-900/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-zinc-800 p-8 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-3xl">
                {user?.username.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                {user?.username}
              </h2>
              <p className="text-zinc-500 text-sm mt-1">
                Member since{' '}
                {new Date(user?.createdAt || '').toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Profile Edit Section */}
        <div className="mb-8">
          <ProfileEdit />
        </div>

        {/* Account Delete Section */}
        <AccountDelete />
      </div>
    </div>
  );
};

export default ProfilePage;
