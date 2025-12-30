import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDeleteUser } from '../hooks/useUserQueries';
import { useAuth } from '../hooks/useAuth';

const AccountDelete: React.FC = () => {
  const [confirmText, setConfirmText] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const { mutateAsync: deleteUser, isPending } = useDeleteUser();
  const { logout } = useAuth();

  const handleDelete = async () => {
    if (confirmText !== 'DELETE') {
      return;
    }

    setError('');

    try {
      await deleteUser();
      // Log out the user to clear auth state
      await logout();
      // Navigate to login page
      navigate('/login', { replace: true });
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
          'Failed to delete account. Please try again.'
      );
    }
  };

  return (
    <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-8">
      <h2 className="text-2xl font-bold text-red-400 mb-4">Delete Account</h2>
      <p className="text-zinc-400 mb-6">
        Once you delete your account, there is no going back. Please be certain.
      </p>

      {!showConfirm ? (
        <button
          onClick={() => setShowConfirm(true)}
          className="px-6 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-medium rounded-lg border border-red-500/30 transition-colors"
        >
          Delete Account
        </button>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Type <span className="font-bold text-red-400">DELETE</span> to
              confirm
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="w-full px-4 py-3 bg-zinc-800/50 border border-red-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              autoFocus
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleDelete}
              disabled={confirmText !== 'DELETE' || isPending}
              className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? 'Deleting...' : 'Permanently Delete'}
            </button>
            <button
              onClick={() => {
                setShowConfirm(false);
                setConfirmText('');
                setError('');
              }}
              disabled={isPending}
              className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountDelete;
