import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [contacts, setContacts] = useState([
    {
      id: 1,
      name: 'Masei Esterhuizen',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
      status: 'Active now',
      time: '5m',
      unread: 2,
      online: true
    },
    {
      id: 2,
      name: 'Michael Ivory',
      avatar: 'https://randomuser.me/api/portraits/men/43.jpg',
      status: 'Active 2h ago',
      time: '1h',
      unread: 0,
      online: false
    },
    {
      id: 3,
      name: 'Joseph Uy',
      avatar: 'https://randomuser.me/api/portraits/men/57.jpg',
      status: 'Active 30m ago',
      time: '2h',
      unread: 0,
      online: false
    },
    {
      id: 4,
      name: 'Thomas Johnson',
      avatar: 'https://randomuser.me/api/portraits/men/24.jpg',
      status: 'Active 5m ago',
      time: '1d',
      unread: 0,
      online: false
    },
    {
      id: 5,
      name: 'Tina',
      avatar: 'https://randomuser.me/api/portraits/women/47.jpg',
      status: 'Active now',
      time: '3d',
      unread: 1,
      online: true
    },
    {
      id: 6,
      name: 'Michael Ivory',
      avatar: 'https://randomuser.me/api/portraits/men/43.jpg',
      status: 'Active 1h ago',
      time: '1w',
      unread: 0,
      online: false
    },
    {
      id: 7,
      name: 'Joseph Uy',
      avatar: 'https://randomuser.me/api/portraits/men/57.jpg',
      status: 'Active 2h ago',
      time: '1w',
      unread: 0,
      online: false
    }
  ]);

  useEffect(() => {
    // Load user data from localStorage
    const userData = localStorage.getItem('marsogramUser');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    // Clear auth data and reload page to restart the auth flow
    localStorage.removeItem('marsogramUser');
    localStorage.removeItem('marsogramVerified');
    localStorage.removeItem('marsogramEmail');
    localStorage.removeItem('marsogramIsAuth');
    window.location.reload();
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-indigo-600 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">PROGRESSIVE WEB APP</h1>
          {user && (
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full overflow-hidden mr-2">
                <img src={user.avatar || 'https://randomuser.me/api/portraits/lego/1.jpg'} alt="User" className="w-full h-full object-cover" />
              </div>
              <button 
                onClick={handleLogout}
                className="text-sm bg-indigo-700 px-3 py-1 rounded-md hover:bg-indigo-800"
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
            placeholder="Search"
            className="w-full py-2 pl-10 pr-4 rounded-full bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>

      {/* Contact List */}
      <div className="container mx-auto flex-grow px-4 py-2">
        <h2 className="font-medium text-gray-600 mb-3">Recent Chats</h2>
        <div className="space-y-3">
          {contacts.map((contact) => (
            <div key={contact.id} className="flex items-center bg-white p-3 rounded-xl shadow-sm">
              <div className="relative">
                <div className="w-12 h-12 rounded-xl overflow-hidden mr-3">
                  <img src={contact.avatar} alt={contact.name} className="w-full h-full object-cover" />
                </div>
                {contact.online && (
                  <div className="absolute bottom-0 right-2 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                )}
              </div>
              <div className="flex-grow">
                <div className="flex justify-between items-start">
                  <h3 className="font-medium">{contact.name}</h3>
                  <span className="text-xs text-gray-500">{contact.time}</span>
                </div>
                <p className="text-sm text-gray-500 truncate">{contact.status}</p>
              </div>
              {contact.unread > 0 && (
                <div className="ml-2 w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center">
                  <span className="text-xs text-white font-medium">{contact.unread}</span>
                </div>
              )}
            </div>
          ))}
        </div>
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
          <NavLink to='chats' className="flex flex-col items-center text-gray-500">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
            </svg>
            <span className="text-xs mt-1">Chats</span>
          </NavLink>
          <NavLink to='about' className="flex flex-col items-center text-gray-500">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
            <span className="text-xs mt-1">Profile</span>
          </NavLink>
          <NavLink to='settings' className="flex flex-col items-center text-gray-500">
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