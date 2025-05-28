import React, { useState, useEffect, useRef, useCallback } from 'react';
import { NavLink } from 'react-router-dom';
import io from 'socket.io-client';

const ChatPage = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const [isTyping, setIsTyping] = useState(false);
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const typingTimeoutRef = useRef(null);
  const messagesLoadedRef = useRef(false);
  const socketRef = useRef(null);
  const sendingRef = useRef(false); // Prevent double sending

  // Initialize socket connection once
  useEffect(() => {
    // Don't create new socket if one already exists
    if (socketRef.current) {
      return;
    }

    const newSocket = io('https://marsogramm-back-5.onrender.com', {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    // Socket event listeners
    newSocket.on('connect', () => {
      console.log('Connected to server');
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    // Listen for new messages
    newSocket.on('newMessage', (message) => {
      console.log('New message received via socket:', message);
      setMessages(prev => {
        // More robust duplicate check
        const exists = prev.some(msg => {
          // Check by ID first
          if (msg._id && message._id && msg._id === message._id) {
            return true;
          }
          
          // Check by content and timing for messages without ID
          const timeDiff = Math.abs(new Date(msg.createdAt) - new Date(message.createdAt));
          return (
            msg.message === message.message && 
            msg.senderId === message.senderId && 
            timeDiff < 2000 // 2 seconds tolerance
          );
        });
        
        if (exists) {
          console.log('Duplicate message prevented');
          return prev;
        }
        
        return [...prev, message];
      });
    });

    // Listen for typing indicators
    newSocket.on('userTyping', ({ userId, isTyping: typing }) => {
      setIsTyping(typing);
    });

    // Listen for online users
    newSocket.on('onlineUsers', (users) => {
      setOnlineUsers(users);
    });

    // Cleanup function
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
    };
  }, []); // Empty dependency array to run only once

  // Join room when all data is ready
  useEffect(() => {
    if (socket && currentUser && selectedUser) {
      socket.emit('joinRoom', {
        userId: currentUser.id,
        receiverId: selectedUser._id
      });

      socket.emit('userOnline', currentUser.id);
    }
  }, [socket, currentUser, selectedUser]);

  // Load user data and fetch messages once
  useEffect(() => {
    const initializeChat = async () => {
      try {
        // Load current user data
        const userData = JSON.parse(localStorage.getItem('marsogramUser') || 'null');
        const userId = localStorage.getItem('marsogramUserId');

        if (userData && userId) {
          setCurrentUser({ ...userData, id: userId });
        }

        // Load selected chat user
        const chatUser = JSON.parse(localStorage.getItem('selectedChatUser') || 'null');
        if (chatUser && userId) {
          setSelectedUser(chatUser);
          
          // Fetch fresh messages from server
          if (!messagesLoadedRef.current) {
            await fetchMessages(userId, chatUser._id);
            messagesLoadedRef.current = true;
          }
        }
      } catch (error) {
        console.error('Error initializing chat:', error);
      }
    };

    initializeChat();
  }, []);

  // Auto scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }, []);

  const fetchMessages = useCallback(async (senderId, receiverId) => {
    if (!senderId || !receiverId) return;

    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching messages from:', senderId, 'to:', receiverId);
      
      const response = await fetch(`https://marsogramm-back-5.onrender.com/api/messages/${senderId}/${receiverId}`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to fetch messages`);
      }

      const data = await response.json();
      console.log('Messages fetched from server:', data);
      
      // Sort messages by creation date to ensure proper order
      const sortedMessages = (data || []).sort((a, b) => 
        new Date(a.createdAt) - new Date(b.createdAt)
      );
      
      setMessages(sortedMessages);
      
    } catch (err) {
      setError('Failed to load messages');
      console.error('Error fetching messages:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const sendMessage = useCallback(async () => {
    if (!newMessage.trim() || !currentUser || !selectedUser || sendingRef.current) return;

    const messageText = newMessage.trim();
    
    // Prevent double sending
    sendingRef.current = true;
    
    const messageData = {
      senderId: currentUser.id,
      receiverId: selectedUser._id,
      message: messageText
    };

    try {
      // Clear input immediately for better UX
      setNewMessage('');
      setIsTyping(false);

      console.log('Sending message:', messageData);

      // Send message via HTTP first for persistence
      const response = await fetch('https://marsogramm-back-5.onrender.com/api/messages/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messageData)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to send message`);
      }

      const savedMessage = await response.json();
      console.log('Message saved to database:', savedMessage);

      // Add to local state immediately (only if not exists)
      setMessages(prev => {
        const exists = prev.some(msg => {
          if (msg._id && savedMessage._id && msg._id === savedMessage._id) {
            return true;
          }
          
          const timeDiff = Math.abs(new Date(msg.createdAt) - new Date(savedMessage.createdAt));
          return (
            msg.message === savedMessage.message && 
            msg.senderId === savedMessage.senderId &&
            timeDiff < 2000
          );
        });
        
        if (exists) {
          console.log('Message already exists in local state');
          return prev;
        }
        
        return [...prev, savedMessage];
      });

      // Send via socket for real-time delivery to other user
      if (socket?.connected) {
        socket.emit('sendMessage', savedMessage);
        
        // Stop typing indicator
        socket.emit('stopTyping', {
          userId: currentUser.id,
          receiverId: selectedUser._id
        });
      }

    } catch (err) {
      setError('Failed to send message');
      console.error('Error sending message:', err);
      // Restore message input on error
      setNewMessage(messageText);
    } finally {
      // Reset sending flag
      sendingRef.current = false;
    }
  }, [newMessage, currentUser, selectedUser, socket]);

  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }, [sendMessage]);

  // Debounced typing indicator
  const handleTyping = useCallback((e) => {
    const value = e.target.value;
    setNewMessage(value);

    if (socket && currentUser && selectedUser) {
      if (value.trim()) {
        socket.emit('typing', {
          userId: currentUser.id,
          receiverId: selectedUser._id
        });

        // Clear previous timeout
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }

        // Set new timeout to stop typing
        typingTimeoutRef.current = setTimeout(() => {
          socket.emit('stopTyping', {
            userId: currentUser.id,
            receiverId: selectedUser._id
          });
        }, 1000);
      } else {
        socket.emit('stopTyping', {
          userId: currentUser.id,
          receiverId: selectedUser._id
        });
      }
    }
  }, [socket, currentUser, selectedUser]);

  const getDisplayName = useCallback((user) => {
    if (!user) return '';
    return user.name || user.username?.split('@')[0] || 'Unknown User';
  }, []);

  const getAvatarUrl = useCallback((user) => {
    if (!user) return '';
    return user.avatar && !user.avatar.startsWith('blob:')
      ? user.avatar
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(getDisplayName(user))}&background=6366f1&color=fff`;
  }, [getDisplayName]);

  const formatTime = useCallback((dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  }, []);

  const goBack = useCallback(() => {
    if (socket && currentUser && selectedUser) {
      socket.emit('leaveRoom', {
        userId: currentUser.id,
        receiverId: selectedUser._id
      });
      socket.emit('userOffline', currentUser.id);
    }

    localStorage.removeItem('selectedChatUser');
    window.history.back();
  }, [socket, currentUser, selectedUser]);

  const isUserOnline = useCallback((userId) => {
    return onlineUsers.includes(userId);
  }, [onlineUsers]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      // Reset flags
      messagesLoadedRef.current = false;
      sendingRef.current = false;
    };
  }, []);

  // Refresh messages function
  const refreshMessages = useCallback(() => {
    if (currentUser && selectedUser) {
      messagesLoadedRef.current = false;
      fetchMessages(currentUser.id, selectedUser._id);
      messagesLoadedRef.current = true;
    }
  }, [currentUser, selectedUser, fetchMessages]);

  if (!selectedUser) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-100">
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-600 mb-4">No Chat Selected</h2>
            <p className="text-gray-500 mb-4">Please select a user from the dashboard to start chatting</p>
            <button
              onClick={goBack}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
            >
              Go Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Chat Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center">
        <button
          onClick={goBack}
          className="mr-3 p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="flex items-center flex-grow">
          <div className="relative w-10 h-10 rounded-full overflow-hidden mr-3">
            <img
              src={getAvatarUrl(selectedUser)}
              alt={getDisplayName(selectedUser)}
              className="w-full h-full object-cover"
            />
            {isUserOnline(selectedUser._id) && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
            )}
          </div>
          <div>
            <h1 className="font-semibold text-gray-900">{getDisplayName(selectedUser)}</h1>
            <p className="text-sm text-gray-500">
              {isUserOnline(selectedUser._id) ? 'Online' : selectedUser.username}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={refreshMessages}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            title="Refresh messages"
          >
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          <div className={`w-3 h-3 rounded-full ${socket?.connected ? 'bg-green-500' : 'bg-red-500'}`}
            title={socket?.connected ? 'Connected' : 'Disconnected'}>
          </div>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-grow overflow-y-auto px-4 py-3 space-y-4">
        {loading && (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
            <button
              onClick={() => fetchMessages(currentUser?.id, selectedUser._id)}
              className="ml-2 text-sm underline hover:no-underline"
            >
              Retry
            </button>
          </div>
        )}

        {messages.length === 0 && !loading && (
          <div className="text-center py-8">
            <p className="text-gray-500">No messages yet. Start the conversation!</p>
          </div>
        )}

        {messages.map((message, index) => {
          const isOwnMessage = String(message.senderId) === String(currentUser?.id);
          const showAvatar = index === 0 || messages[index - 1]?.senderId !== message.senderId;

          return (
            <div key={message._id || `${message.senderId}-${message.createdAt}-${index}`} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex max-w-xs lg:max-w-md ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
                {showAvatar && !isOwnMessage && (
                  <div className="w-8 h-8 rounded-full overflow-hidden mr-2 flex-shrink-0">
                    <img
                      src={getAvatarUrl(selectedUser)}
                      alt={getDisplayName(selectedUser)}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className={`px-4 py-2 rounded-2xl ${isOwnMessage
                    ? 'bg-indigo-600 text-white rounded-br-sm'
                    : 'bg-white text-gray-900 rounded-bl-sm border border-gray-200'
                  } ${!showAvatar && !isOwnMessage ? 'ml-10' : ''}`}>
                  <p className="text-sm">{message.message}</p>
                  <p className={`text-xs mt-1 ${isOwnMessage ? 'text-indigo-100' : 'text-gray-500'}`}>
                    {formatTime(message.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex justify-start">
            <div className="flex max-w-xs">
              <div className="w-8 h-8 rounded-full overflow-hidden mr-2 flex-shrink-0">
                <img
                  src={getAvatarUrl(selectedUser)}
                  alt={getDisplayName(selectedUser)}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="bg-white text-gray-900 rounded-2xl rounded-bl-sm border border-gray-200 px-4 py-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 px-4 py-3">
        <div className="flex items-center space-x-3">
          <div className="flex-grow relative">
            <textarea
              value={newMessage}
              onChange={handleTyping}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="w-full px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              rows="1"
              style={{ minHeight: '40px', maxHeight: '120px' }}
            />
          </div>

          <button
            onClick={sendMessage}
            disabled={!newMessage.trim() || sendingRef.current}
            className={`p-2 rounded-full transition-colors ${newMessage.trim() && !sendingRef.current
                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
          >
            {sendingRef.current ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Navigation Bar */}
      <nav className="bg-white border-t border-gray-200 py-3">
        <div className="container mx-auto flex justify-around">
          <NavLink to='/dashboard' className="flex flex-col items-center text-gray-500">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
            <span className="text-xs mt-1">Home</span>
          </NavLink>
          <NavLink to='/chats' className="flex flex-col items-center text-indigo-600">
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

export default ChatPage;