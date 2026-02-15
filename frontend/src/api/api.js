const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Получить токен из localStorage
const getToken = () => localStorage.getItem('authToken');

// Общая функция для запросов
const apiRequest = async (endpoint, options = {}) => {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// ========== AUTHENTICATION ==========

export const register = async (username, email, password) => {
  const data = await apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, email, password }),
  });
  
  if (data.token) {
    localStorage.setItem('authToken', data.token);
  }
  
  return data;
};

export const login = async (username, password) => {
  const data = await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
  
  if (data.token) {
    localStorage.setItem('authToken', data.token);
  }
  
  return data;
};

export const logout = async () => {
  await apiRequest('/auth/logout', { method: 'POST' });
  localStorage.removeItem('authToken');
};

// ========== USER PROFILE ==========

export const getUserProfile = async () => {
  return await apiRequest('/user/profile');
};

export const deleteAccount = async () => {
  const data = await apiRequest('/user/account', { method: 'DELETE' });
  localStorage.removeItem('authToken');
  return data;
};

export const updateSettings = async (settings) => {
  return await apiRequest('/user/settings', {
    method: 'PUT',
    body: JSON.stringify(settings),
  });
};

// ========== SUBSCRIPTION ==========

export const getCurrentSubscription = async () => {
  return await apiRequest('/subscription/current');
};

export const purchaseSubscription = async (plan, txHash, amount, walletAddress) => {
  return await apiRequest('/subscription/purchase', {
    method: 'POST',
    body: JSON.stringify({ plan, txHash, amount, walletAddress }),
  });
};

export const downgradeSubscription = async () => {
  return await apiRequest('/subscription/downgrade', { method: 'POST' });
};

// ========== FAVORITES ==========

export const getFavorites = async () => {
  return await apiRequest('/favorites');
};

export const addFavorite = async (track) => {
  return await apiRequest('/favorites/add', {
    method: 'POST',
    body: JSON.stringify(track),
  });
};

export const removeFavorite = async (trackId) => {
  return await apiRequest(`/favorites/${trackId}`, { method: 'DELETE' });
};

// ========== RECENTLY PLAYED ==========

export const getRecentlyPlayed = async () => {
  return await apiRequest('/recently-played');
};

export const addRecentlyPlayed = async (track) => {
  return await apiRequest('/recently-played/add', {
    method: 'POST',
    body: JSON.stringify(track),
  });
};

// ========== PLAYLISTS ==========

export const getPlaylists = async () => {
  return await apiRequest('/playlists');
};

export const createPlaylist = async (name) => {
  return await apiRequest('/playlists/create', {
    method: 'POST',
    body: JSON.stringify({ name }),
  });
};

export const deletePlaylist = async (playlistId) => {
  return await apiRequest(`/playlists/${playlistId}`, { method: 'DELETE' });
};

export const addTrackToPlaylist = async (playlistId, track) => {
  return await apiRequest(`/playlists/${playlistId}/tracks`, {
    method: 'POST',
    body: JSON.stringify(track),
  });
};

export const removeTrackFromPlaylist = async (playlistId, trackId) => {
  return await apiRequest(`/playlists/${playlistId}/tracks/${trackId}`, {
    method: 'DELETE',
  });
};

// ========== SUPPORT ==========

export const sendSupportMessage = async (message) => {
  return await apiRequest('/support/message', {
    method: 'POST',
    body: JSON.stringify({ message }),
  });
};