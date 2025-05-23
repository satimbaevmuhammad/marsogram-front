import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Load user data from localStorage
    const userData = JSON.parse(localStorage.getItem('marsogramUser') || 'null');
    const userId = localStorage.getItem('marsogramUserId');
    
    if (userData) {
      setUser({...userData, id: userId});
    }

    // Fetch users from API
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://marsogramm-back-5.onrender.com/api/auth/users');
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      const data = await response.json();
      
      // Filter out current user
      const currentUserId = localStorage.getItem('marsogramUserId');
      const filteredUsers = data.filter(u => u._id !== currentUserId);
      
      setUsers(filteredUsers);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    // Clear auth data and reload page to restart the auth flow
    const keysToRemove = [
      'marsogramUser',
      'marsogramVerified',
      'marsogramEmail', 
      'marsogramIsAuth',
      'marsogramUserId',
      'selectedChatUser'
    ];
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
    });
    
    window.location.reload();
  };

  const handleUserClick = async (selectedUser) => {
    try {
      // Store selected user for messaging
      localStorage.setItem('selectedChatUser', JSON.stringify(selectedUser));
      
      // Get current user ID from localStorage
      const currentUserId = localStorage.getItem('marsogramUserId');
      
      if (!currentUserId) {
        console.error('Current user ID not found');
        return;
      }

      // Send initial greeting message (optional)
      const chatData = {
        senderId: currentUserId,
        receiverId: selectedUser._id,
        message: `Salom, ${getDisplayName(selectedUser)}!`
      };

      try {
        // Send initial message to create chat
        const response = await fetch('https://marsogramm-back-5.onrender.com/api/messages/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(chatData)
        });

        if (response.ok) {
          console.log('Initial message sent successfully');
        }
      } catch (messageError) {
        console.log('Failed to send initial message, but proceeding to chat:', messageError);
      }

      // Navigate to chat page
      navigate('/chats');
      
    } catch (error) {
      console.error('Error initiating chat:', error);
    }
  };

  const getDisplayName = (user) => {
    return user.name || user.username.split('@')[0];
  };

  const getAvatarUrl = (user) => {
    // Use user avatar if available, otherwise use a placeholder
    return user.avatar && user.avatar.startsWith('blob:') 
      ? `https://ui-avatars.com/api/?name=${encodeURIComponent(getDisplayName(user))}&background=6366f1&color=fff`
      : user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(getDisplayName(user))}&background=6366f1&color=fff`;
  };

  const getOnlineStatus = () => {
    // Random online status for demo purposes
    return Math.random() > 0.6;
  };

  // Filter users based on search term
  const filteredUsers = users.filter(userData => {
    const displayName = getDisplayName(userData).toLowerCase();
    const username = userData.username.toLowerCase();
    const search = searchTerm.toLowerCase();
    return displayName.includes(search) || username.includes(search);
  });

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-indigo-600 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">MARSOGRAM</h1>
          {user && (
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full overflow-hidden mr-2">
                <img 
                  src={getAvatarUrl(user)} 
                  alt="User" 
                  className="w-full h-full object-cover" 
                />
              </div>
              <span className="mr-3 text-sm">{getDisplayName(user)}</span>
              <button 
                onClick={handleLogout}
                className="text-sm bg-indigo-700 px-3 py-1 rounded-md hover:bg-indigo-800 transition-colors"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Search Bar */}
      <div className="container mx-auto px-4 py-3">
        <div className="relative">
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full py-2 pl-10 pr-4 rounded-full bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>

      {/* Users List */}
      <div className="container mx-auto flex-grow px-4 py-2">
        <h2 className="font-medium text-gray-600 mb-3">
          Users ({filteredUsers.length})
          {searchTerm && (
            <span className="text-sm text-gray-500 ml-2">
              - searching for "{searchTerm}"
            </span>
          )}
        </h2>
        
        {loading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            Error: {error}
            <button 
              onClick={fetchUsers}
              className="ml-2 text-sm underline hover:no-underline"
            >
              Retry
            </button>
          </div>
        )}

        <div className="space-y-3">
          {filteredUsers.map((userData) => {
            const isOnline = getOnlineStatus();
            return (
              <div 
                key={userData._id} 
                className="flex items-center bg-white p-3 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer hover:bg-gray-50"
                onClick={() => handleUserClick(userData)}
              >
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl overflow-hidden mr-3">
                    <img 
                      src={getAvatarUrl(userData)} 
                      alt={getDisplayName(userData)} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  {isOnline && (
                    <div className="absolute bottom-0 right-2 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  )}
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium text-gray-900">{getDisplayName(userData)}</h3>
                    <span className="text-xs text-gray-500">
                      {isOnline ? 'Active now' : 'Offline'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 truncate">
                    {userData.username}
                  </p>
                </div>
                <div className="ml-2">
                  <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4 8-9 8a9.013 9.013 0 01-5-1.436L3 21l1.436-4C2.586 15.09 3 13.588 3 12c0-5 4-9 9-9s9 4.032 9 9z" />
                  </svg>
                </div>
              </div>
            );
          })}
        </div>

        {!loading && filteredUsers.length === 0 && !error && (
          <div className="text-center py-8 text-gray-500">
            {searchTerm ? `No users found matching "${searchTerm}"` : 'No users found'}
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="block mx-auto mt-2 text-indigo-600 text-sm hover:underline"
              >
                Clear search
              </button>
            )}
          </div>
        )}
      </div>

      {/* Navigation Bar */}
      <nav className="bg-white border-t border-gray-200 py-3">
        <div className="container mx-auto flex justify-around">
          <NavLink to='/dashboard' className="flex flex-col items-center text-indigo-600">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
            <span className="text-xs mt-1">Home</span>
          </NavLink>
          <NavLink to='/chats' className="flex flex-col items-center text-gray-500">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
            </svg>
            <span className="text-xs mt-1">Chats</span>
          </NavLink>
          <NavLink to='/about' className="flex flex-col items-center text-gray-500">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
            <span className="text-xs mt-1">Profile</span>
          </NavLink>
          <NavLink to='/settings' className="flex flex-col items-center text-gray-500">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
            </svg>
            <span className="text-xs mt-1">Settings</span>
          </NavLink>
        </div>
      </nav>
    </div>
  );
};

export default Dashboard;