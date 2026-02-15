import React, { useState, useEffect, useRef, memo, useCallback } from 'react';
import { Heart, Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Search, Home, Music, User, LogOut, Settings, HelpCircle, Trash2, Clock, ListMusic, Disc, Mic2, Album, PlusCircle, History, ChevronDown, Crown, X } from 'lucide-react';
import './App.css';
import Logo from './components/Logo';
import * as api from './api/api';

const SoundStorm = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [currentView, setCurrentView] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(-1);
  const [currentPlaylist, setCurrentPlaylist] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [popularTracks, setPopularTracks] = useState([]);
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [registerData, setRegisterData] = useState({ username: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [supportMessage, setSupportMessage] = useState('');
  const [showSupportSuccess, setShowSupportSuccess] = useState(false);
  const [autoPlay, setAutoPlay] = useState(true);
  const [sleepTimer, setSleepTimer] = useState(0);
  const [showFullPlayer, setShowFullPlayer] = useState(false);
  const [showAddToPlaylistMenu, setShowAddToPlaylistMenu] = useState(null);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [genreTracks, setGenreTracks] = useState([]);
  const [artists, setArtists] = useState([]);
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [artistTracks, setArtistTracks] = useState([]);
  const [artistTopTracks, setArtistTopTracks] = useState([]);
  const [collections, setCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [collectionTracks, setCollectionTracks] = useState([]);
  const [playlistMenuPosition, setPlaylistMenuPosition] = useState(null);
  const [currentSubscription, setCurrentSubscription] = useState('free');
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successTxHash, setSuccessTxHash] = useState('');
  const [showDowngradeModal, setShowDowngradeModal] = useState(false);
  const [showDeletePlaylistModal, setShowDeletePlaylistModal] = useState(false);
  const [playlistToDelete, setPlaylistToDelete] = useState(null);
  const audioRef = useRef(null);
  const sleepTimerRef = useRef(null);

  useEffect(() => {
  if (isLoggedIn) {
    fetchPopularTracks();
    fetchArtists();
    initializeCollections();
    loadUserData();
  }
}, [isLoggedIn]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    let interval;
    if (isPlaying && audioRef.current) {
      interval = setInterval(() => {
        setCurrentTime(audioRef.current.currentTime);
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  useEffect(() => {
    if (sleepTimer > 0) {
      sleepTimerRef.current = setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.pause();
          setIsPlaying(false);
          setSleepTimer(0);
        }
      }, sleepTimer * 60000);
    }
    return () => {
      if (sleepTimerRef.current) {
        clearTimeout(sleepTimerRef.current);
      }
    };
  }, [sleepTimer]);

  const fetchPopularTracks = async () => {
    try {
      const response = await fetch(`https://itunes.apple.com/search?term=top+songs+2024&limit=25&media=music&entity=song`);
      const data = await response.json();
      if (data.results) {
        const tracks = data.results.map((track) => ({
          id: track.trackId,
          title: track.trackName,
          preview: track.previewUrl,
          duration: Math.floor(track.trackTimeMillis / 1000),
          artist: { name: track.artistName },
          album: { 
            title: track.collectionName,
            cover_small: track.artworkUrl100,
            cover_large: track.artworkUrl100.replace('100x100', '600x600')
          },
          cover_small: track.artworkUrl100,
          cover_large: track.artworkUrl100.replace('100x100', '600x600')
        }));
        setPopularTracks(tracks);
      }
    } catch (error) {
      console.error('Error fetching tracks:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      const response = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(searchQuery)}&limit=25&media=music&entity=song`);
      const data = await response.json();
      if (data.results) {
        const tracks = data.results.map((track) => ({
          id: track.trackId,
          title: track.trackName,
          preview: track.previewUrl,
          duration: Math.floor(track.trackTimeMillis / 1000),
          artist: { name: track.artistName },
          album: { 
            title: track.collectionName,
            cover_small: track.artworkUrl100,
            cover_large: track.artworkUrl100.replace('100x100', '600x600')
          },
          cover_small: track.artworkUrl100,
          cover_large: track.artworkUrl100.replace('100x100', '600x600')
        }));
        setSearchResults(tracks);
        setCurrentView('search');
      }
    } catch (error) {
      console.error('Error searching:', error);
    }
  };

  const fetchGenreTracks = async (genre) => {
  try {
    const searchTerms = {
      'Pop': 'pop+music',
      'Rock': 'rock+music',
      'Hip Hop': 'hip+hop+rap',
      'Electronic': 'electronic+dance',
      'Jazz': 'jazz+music',
      'Classical': 'classical+music',
      'Country': 'country+music',
      'R&B': 'r&b+soul'
    };
    
    const term = searchTerms[genre] || genre.toLowerCase();
    const response = await fetch(`https://itunes.apple.com/search?term=${term}&limit=50&media=music&entity=song`);
    const data = await response.json();
    
    if (data.results) {
      const tracks = data.results.map((track) => ({
        id: track.trackId,
        title: track.trackName,
        preview: track.previewUrl,
        duration: Math.floor(track.trackTimeMillis / 1000),
        artist: { name: track.artistName },
        album: { 
          title: track.collectionName,
          cover_small: track.artworkUrl100,
          cover_large: track.artworkUrl100.replace('100x100', '600x600')
        },
        cover_small: track.artworkUrl100,
        cover_large: track.artworkUrl100.replace('100x100', '600x600')
      }));
      setGenreTracks(tracks);
    }
  } catch (error) {
    console.error('Error fetching genre tracks:', error);
  }
};

const handleGenreClick = (genre) => {
  setSelectedGenre(genre);
  setCurrentView('genre-detail');
  fetchGenreTracks(genre);
};

const fetchArtists = async () => {
  try {
    const popularArtists = [
  'Taylor Swift', 'Ed Sheeran', 'Ariana Grande', 'Drake', 'Billie Eilish',
  'The Weeknd', 'Dua Lipa', 'Post Malone', 'Justin Bieber', 'Olivia Rodrigo',
  'Harry Styles', 'Adele', 'Bruno Mars', 'Rihanna', 'Beyoncé',
  'Coldplay', 'Imagine Dragons', 'Eminem'
];
    
    const artistsData = [];
    
    for (const artistName of popularArtists) {
      try {
        const response = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(artistName)}&limit=1&entity=song`);
        const data = await response.json();
        
        if (data.results && data.results.length > 0) {
          const track = data.results[0];
          artistsData.push({
            id: track.artistId,
            name: track.artistName,
            image: track.artworkUrl100.replace('100x100', '600x600')
          });
        }
      } catch (error) {
        console.error(`Error fetching ${artistName}:`, error);
      }
    }
    
    setArtists(artistsData);
  } catch (error) {
    console.error('Error fetching artists:', error);
  }
};

const fetchArtistTracks = async (artistName) => {
  try {
    const response = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(artistName)}&limit=30&entity=song`);
    const data = await response.json();
    
    if (data.results) {
      const tracks = data.results
        .filter(track => track.artistName.toLowerCase() === artistName.toLowerCase())
        .map((track) => ({
          id: track.trackId,
          title: track.trackName,
          preview: track.previewUrl,
          duration: Math.floor(track.trackTimeMillis / 1000),
          artist: { name: track.artistName },
          album: { 
            title: track.collectionName,
            cover_small: track.artworkUrl100,
            cover_large: track.artworkUrl100.replace('100x100', '600x600')
          },
          cover_small: track.artworkUrl100,
          cover_large: track.artworkUrl100.replace('100x100', '600x600')
        }));
      
      setArtistTracks(tracks);
      setArtistTopTracks(tracks.slice(0, 5));
    }
  } catch (error) {
    console.error('Error fetching artist tracks:', error);
  }
};

const handleArtistClick = (artist) => {
  setSelectedArtist(artist);
  setCurrentView('artist-detail');
  fetchArtistTracks(artist.name);
};

const fetchCollectionTracks = async (collectionName, searchTerm) => {
  try {
    const response = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(searchTerm)}&limit=30&entity=song`);
    const data = await response.json();
    
    if (data.results) {
      const tracks = data.results.map((track) => ({
        id: track.trackId,
        title: track.trackName,
        preview: track.previewUrl,
        duration: Math.floor(track.trackTimeMillis / 1000),
        artist: { name: track.artistName },
        album: { 
          title: track.collectionName,
          cover_small: track.artworkUrl100,
          cover_large: track.artworkUrl100.replace('100x100', '600x600')
        },
        cover_small: track.artworkUrl100,
        cover_large: track.artworkUrl100.replace('100x100', '600x600')
      }));
      setCollectionTracks(tracks);
    }
  } catch (error) {
    console.error('Error fetching collection tracks:', error);
  }
};

const handleCollectionClick = (collection) => {
  setSelectedCollection(collection);
  setCurrentView('collection-detail');
  fetchCollectionTracks(collection.name, collection.searchTerm);
};

const initializeCollections = () => {
  const collectionsData = [
    {
      id: 1,
      name: 'Club Bangers',
      description: 'Best tracks for the club',
      searchTerm: 'club+dance+party+edm',
      image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=600',
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      id: 2,
      name: 'Summer Vibes',
      description: 'Perfect for sunny days',
      searchTerm: 'summer+vibes+beach',
      image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600',
      color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    },
    {
      id: 3,
      name: 'Workout Energy',
      description: 'Pump up your workout',
      searchTerm: 'workout+gym+motivation',
      image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600',
      color: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
    },
    {
      id: 4,
      name: 'Chill & Relax',
      description: 'Calm and peaceful vibes',
      searchTerm: 'chill+relax+lofi',
      image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600',
      color: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
    },
    {
      id: 5,
      name: 'Road Trip',
      description: 'Songs for the open road',
      searchTerm: 'road+trip+driving',
      image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600',
      color: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)'
    },
    {
      id: 6,
      name: 'Party Hits',
      description: 'Get the party started',
      searchTerm: 'party+hits+celebration',
      image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600',
      color: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)'
    },
    {
      id: 7,
      name: 'Study Focus',
      description: 'Concentrate better',
      searchTerm: 'study+focus+instrumental',
      image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600',
      color: 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)'
    },
    {
      id: 8,
      name: 'Late Night',
      description: 'For those midnight hours',
      searchTerm: 'night+midnight+slow',
      image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600',
      color: 'linear-gradient(135deg, #434343 0%, #000000 100%)'
    }
  ];
  setCollections(collectionsData);
};

const loadUserData = async () => {
  try {
    // Загрузить избранное
    const favoritesData = await api.getFavorites();
    setFavorites(favoritesData);
    
    // Загрузить недавно прослушанное
    const recentData = await api.getRecentlyPlayed();
    setRecentlyPlayed(recentData);
    
    // Загрузить плейлисты
    const playlistsData = await api.getPlaylists();
    setPlaylists(playlistsData);
    
    // Загрузить подписку
    const subscription = await api.getCurrentSubscription();
    setCurrentSubscription(subscription.plan);
  } catch (error) {
    console.error('Error loading user data:', error);
  }
};

  const validateUsername = (username) => {
    if (username.length < 3) {
      return 'Username must be at least 3 characters';
    }
    if (!/[A-Z]/.test(username)) {
      return 'Username must contain at least one uppercase letter';
    }
    return null;
  };

  const validatePassword = (password) => {
    if (password.length < 5) {
      return 'Password must be at least 5 characters';
    }
    if (!/[A-Z]/.test(password)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return 'Password must contain at least one special character (!@#$%^&*...)';
    }
    return null;
  };

  const handleLogin = async () => {
  const newErrors = {};
  
  if (!loginData.username) {
    newErrors.username = 'Username is required';
  }
  if (!loginData.password) {
    newErrors.password = 'Password is required';
  }

  if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors);
    return;
  }

  try {
    const user = await api.login(loginData.username, loginData.password);
    setCurrentUser(user);
    setIsLoggedIn(true);
    setErrors({});
    
    // Загрузить данные пользователя
    loadUserData();
  } catch (error) {
    setErrors({ general: error.message || 'Login failed' });
  }
};

  const handleRegister = async () => {
  const newErrors = {};
  
  const usernameError = validateUsername(registerData.username);
  if (usernameError) {
    newErrors.username = usernameError;
  }

  if (!registerData.email || !registerData.email.includes('@')) {
    newErrors.email = 'Valid email is required';
  }

  const passwordError = validatePassword(registerData.password);
  if (passwordError) {
    newErrors.password = passwordError;
  }

  if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors);
    return;
  }

  try {
    const user = await api.register(
      registerData.username,
      registerData.email,
      registerData.password
    );
    setCurrentUser(user);
    setIsLoggedIn(true);
    setErrors({});
    
    loadUserData();
  } catch (error) {
    setErrors({ general: error.message || 'Registration failed' });
  }
};

  const handleLogout = async () => {
  try {
    await api.logout();
  } catch (error) {
    console.error('Logout error:', error);
  }
  
  setIsLoggedIn(false);
  setCurrentUser(null);
  setCurrentView('home');
  setCurrentTrack(null);
  setIsPlaying(false);
  if (audioRef.current) {
    audioRef.current.pause();
  }
};

  const handleDeleteAccount = async () => {
  try {
    await api.deleteAccount();
    setShowDeleteModal(false);
    handleLogout();
  } catch (error) {
    console.error('Error deleting account:', error);
  }
};

  const handleSupportSubmit = async () => {
  if (supportMessage.trim()) {
    try {
      await api.sendSupportMessage(supportMessage);
      setShowSupportSuccess(true);
      setSupportMessage('');
      setTimeout(() => setShowSupportSuccess(false), 3000);
    } catch (error) {
      console.error('Error sending support message:', error);
    }
  }
};

  const handleCreatePlaylist = async () => {
  if (newPlaylistName.trim()) {
    try {
      const newPlaylist = await api.createPlaylist(newPlaylistName);
      setPlaylists([...playlists, newPlaylist]);
      setNewPlaylistName('');
      setShowPlaylistModal(false);
    } catch (error) {
      console.error('Error creating playlist:', error);
    }
  }
};

 const handleDeletePlaylist = async (playlistId) => {
  try {
    await api.deletePlaylist(playlistId);
    setPlaylists(prev => prev.filter(p => p.id !== playlistId));
    if (currentView === `playlist-${playlistId}`) {
      setCurrentView('home');
    }
    setShowAddToPlaylistMenu(null);
    setShowDeletePlaylistModal(false);
    setPlaylistToDelete(null);
  } catch (error) {
    console.error('Error deleting playlist:', error);
  }
};

 const handlePurchaseSubscription = async (plan) => {
  if (typeof window.ethereum === 'undefined') {
    alert('Please install MetaMask to purchase a subscription!');
    return;
  }

  try {
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    if (chainId !== '0xaa36a7') {
      alert('Please switch to Sepolia Test Network in MetaMask!');
      
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0xaa36a7' }],
        });
      } catch (switchError) {
        console.error('Failed to switch network:', switchError);
        return;
      }
    }

    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    const account = accounts[0];

    const prices = {
      premium: '0.001',
      premiumPlus: '0.002'
    };

    if (plan === 'free') {
      await api.downgradeSubscription();
      setCurrentSubscription('free');
      setShowPremiumModal(false);
      return;
    }

    const valueInWei = '0x' + (parseFloat(prices[plan]) * 1e18).toString(16);

    const transactionParameters = {
      to: process.env.REACT_APP_RECIPIENT_ADDRESS,
      from: account,
      value: valueInWei,
    };

    const txHash = await window.ethereum.request({
      method: 'eth_sendTransaction',
      params: [transactionParameters],
    });

    console.log('Transaction Hash:', txHash);
    
    // Сохранить покупку на backend
    await api.purchaseSubscription(plan, txHash, prices[plan], account);
    
    setCurrentSubscription(plan);
    setShowPremiumModal(false);
    setSuccessTxHash(txHash);
    setShowSuccessModal(true);
  } catch (error) {
    console.error('Error:', error);
    if (error.code === 4001) {
      alert('Transaction rejected by user');
    } else {
      alert('Transaction failed: ' + error.message);
    }
  }
};

  const addTrackToPlaylist = async (playlistId, track) => {
  try {
    await api.addTrackToPlaylist(playlistId, track);
    setPlaylists(prev => prev.map(playlist => {
      if (playlist.id === playlistId) {
        const trackExists = playlist.tracks.find(t => t.id === track.id);
        if (!trackExists) {
          return { ...playlist, tracks: [...playlist.tracks, track] };
        }
      }
      return playlist;
    }));
    setShowAddToPlaylistMenu(null);
  } catch (error) {
    console.error('Error adding track to playlist:', error);
  }
};

  const removeTrackFromPlaylist = async (playlistId, trackId) => {
  try {
    await api.removeTrackFromPlaylist(playlistId, trackId);
    setPlaylists(prev => prev.map(playlist => {
      if (playlist.id === playlistId) {
        return { ...playlist, tracks: playlist.tracks.filter(t => t.id !== trackId) };
      }
      return playlist;
    }));
  } catch (error) {
    console.error('Error removing track from playlist:', error);
  }
};

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const toggleFavorite = async (track) => {
  const exists = favorites.find(t => t.id === track.id);
  
  try {
    if (exists) {
      await api.removeFavorite(track.id);
      setFavorites(prev => prev.filter(t => t.id !== track.id));
    } else {
      await api.addFavorite(track);
      setFavorites(prev => [...prev, track]);
    }
  } catch (error) {
    console.error('Error toggling favorite:', error);
  }
};

  const isFavorite = (trackId) => {
  return favorites.some(t => t.id === trackId);
};

  const addToRecentlyPlayed = async (track) => {
  try {
    await api.addRecentlyPlayed(track);
    setRecentlyPlayed(prev => {
      const filtered = prev.filter(t => t.id !== track.id);
      return [track, ...filtered].slice(0, 20);
    });
  } catch (error) {
    console.error('Error adding to recently played:', error);
  }
};

  const playTrack = async (track, playlist = null) => {
  // Если это та же песня - просто переключаем паузу
  if (currentTrack?.id === track.id) {
    if (isPlaying) {
      setIsPlaying(false);
      if (audioRef.current) {
        audioRef.current.pause();
      }
    } else {
      setIsPlaying(true);
      if (audioRef.current) {
        try {
          await audioRef.current.play();
        } catch (err) {
          console.error('Play error:', err);
          setIsPlaying(false);
        }
      }
    }
    return;
  }
  
  // Новая песня - полная остановка старой
  if (audioRef.current) {
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    audioRef.current.src = '';
  }
  
  if (playlist) {
    setCurrentPlaylist(playlist);
    const index = playlist.findIndex(t => t.id === track.id);
    setCurrentTrackIndex(index);
  }
  
  setIsPlaying(false);
  setCurrentTime(0);
  setCurrentTrack(track);
  addToRecentlyPlayed(track);
  
  // Загружаем и запускаем новую песню
  await new Promise(resolve => setTimeout(resolve, 100));
  
  if (audioRef.current && track.preview) {
    try {
      audioRef.current.src = track.preview;
      await audioRef.current.load();
      await audioRef.current.play();
      setIsPlaying(true);
    } catch (err) {
      console.error('Play error:', err);
      setIsPlaying(false);
    }
  }
};

  const playNextTrack = () => {
    if (currentPlaylist.length === 0) return;
    const nextIndex = (currentTrackIndex + 1) % currentPlaylist.length;
    const nextTrack = currentPlaylist[nextIndex];
    setCurrentTrackIndex(nextIndex);
    playTrack(nextTrack);
  };

  const playPreviousTrack = () => {
    if (currentPlaylist.length === 0) return;
    const prevIndex = currentTrackIndex - 1 < 0 ? currentPlaylist.length - 1 : currentTrackIndex - 1;
    const prevTrack = currentPlaylist[prevIndex];
    setCurrentTrackIndex(prevIndex);
    playTrack(prevTrack);
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      audioRef.current?.pause();
    } else {
      audioRef.current?.play().catch(err => console.error('Play error:', err));
    }
    setIsPlaying(!isPlaying);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isLoggedIn) {
    return (
      <div className="auth-container">
        <div className="auth-box">
         <div className="auth-header">
  <Logo size={58} />
  <div>
    <h1>
      <span className="sound-text">Sound</span>
      <span className="storm-text">Storm</span>
    </h1>
  </div>
</div>
<p style={{textAlign: 'center', margin: '0 0 40px 0', color: '#b3b3b3', fontSize: '16px', fontWeight: 'bold'}}>Music for everyone</p>

          {!showRegister ? (
            <div className="auth-form">
              <h2>Log in to SoundStorm</h2>
              {errors.general && <div className="error-message">{errors.general}</div>}
              <div className="form-group">
                <label>Username</label>
                <input 
                  type="text" 
                  placeholder="Username" 
                  value={loginData.username}
                  onChange={(e) => setLoginData({...loginData, username: e.target.value})}
                  className={errors.username ? 'error' : ''}
                />
                {errors.username && <span className="error-text">{errors.username}</span>}
              </div>
              <div className="form-group">
                <label>Password</label>
                <input 
                  type="password" 
                  placeholder="Password" 
                  value={loginData.password}
                  onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                  className={errors.password ? 'error' : ''}
                />
                {errors.password && <span className="error-text">{errors.password}</span>}
              </div>
              <button onClick={handleLogin} className="btn-primary">
                Log In
              </button>
              <div className="auth-switch">
                <button onClick={() => { setShowRegister(true); setErrors({}); }}>
                  Don't have an account? Sign up
                </button>
              </div>
            </div>
          ) : (
            <div className="auth-form">
              <h2>Sign up for free</h2>
              <div className="form-group">
                <label>Username</label>
                <input 
                  type="text" 
                  placeholder="Username (min 3 chars, 1 uppercase)" 
                  value={registerData.username}
                  onChange={(e) => setRegisterData({...registerData, username: e.target.value})}
                  className={errors.username ? 'error' : ''}
                />
                {errors.username && <span className="error-text">{errors.username}</span>}
              </div>
              <div className="form-group">
                <label>Email</label>
                <input 
                  type="email" 
                  placeholder="name@domain.com" 
                  value={registerData.email}
                  onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                  className={errors.email ? 'error' : ''}
                />
                {errors.email && <span className="error-text">{errors.email}</span>}
              </div>
              <div className="form-group">
                <label>Password</label>
                <input 
                  type="password" 
                  placeholder="Password (min 5 chars, 1 uppercase, 1 special)" 
                  value={registerData.password}
                  onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                  className={errors.password ? 'error' : ''}
                />
                {errors.password && <span className="error-text">{errors.password}</span>}
              </div>
              <button onClick={handleRegister} className="btn-primary">
                Sign Up
              </button>
              <div className="auth-switch">
                <button onClick={() => { setShowRegister(false); setErrors({}); }}>
                  Already have an account? Log in
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  const TrackRow = memo(({ track, index, playlist, isPlaylistView = false, playlistId = null }) => {
  const isCurrentTrack = currentTrack?.id === track.id;
  const showPlayingIcon = isCurrentTrack && isPlaying;
  
  return (
    <div 
      className="track-row" 
      data-playing={isCurrentTrack ? 'true' : 'false'}
    >
      <div className="track-number">
        <span className="number">{index + 1}</span>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            playTrack(track, playlist);
          }} 
          className="play-btn-small"
        >
          {showPlayingIcon ? <Pause size={16} /> : <Play size={16} />}
        </button>
      </div>
      <div 
        className="track-info" 
        onClick={(e) => {
          e.stopPropagation();
          if (currentTrack) setShowFullPlayer(true);
        }}
      >
        <img src={track.cover_small} alt={track.title} />
        <div className="track-details">
          <div className="track-title">{track.title}</div>
          <div className="track-artist">{track.artist?.name}</div>
        </div>
      </div>
      <div className="track-album">{track.album?.title || 'Single'}</div>
      <div className="track-duration">{formatTime(track.duration)}</div>
      <div className="track-actions">
        <button
          onClick={(e) => { 
            e.stopPropagation(); 
            toggleFavorite(track); 
          }}
          className={isFavorite(track.id) ? 'favorite-btn active' : 'favorite-btn'}
          type="button"
        >
          <Heart size={20} />
        </button>
        
        {isPlaylistView && playlistId ? (
          <button
            onClick={(e) => { 
              e.stopPropagation(); 
              removeTrackFromPlaylist(playlistId, track.id); 
            }}
            className="remove-from-playlist-btn"
            title="Remove from playlist"
            type="button"
          >
            <Trash2 size={20} />
          </button>
        ) : (
          <>
            <button
              onClick={(e) => { 
                e.stopPropagation();
                const isOpen = showAddToPlaylistMenu === track.id;
                
                if (!isOpen) {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setPlaylistMenuPosition({
                    top: rect.top -15,
                    right: window.innerWidth - rect.right
                  });
                } else {
                  setPlaylistMenuPosition(null);
                }
                
                setShowAddToPlaylistMenu(isOpen ? null : track.id); 
              }}
              className="add-to-playlist-btn"
              type="button"
            >
              <PlusCircle size={20} />
            </button>
            {showAddToPlaylistMenu === track.id && playlistMenuPosition && (
              <div 
                className="playlist-menu" 
                onClick={(e) => e.stopPropagation()}
                style={{
                  position: 'fixed',
                  top: `${playlistMenuPosition.top}px`,
                  right: `${playlistMenuPosition.right}px`,
                  transform: 'translateY(-100%)'
                }}
              >
                <div className="playlist-menu-header">Add to playlist</div>
                {playlists.length === 0 ? (
                  <div className="playlist-menu-empty">No playlists yet</div>
                ) : (
                  <div className="playlist-menu-list">
                    {playlists.map(pl => (
                      <button
                        key={pl.id}
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          addTrackToPlaylist(pl.id, track); 
                        }}
                        className="playlist-menu-item"
                        type="button"
                      >
                        <ListMusic size={16} />
                        <span>{pl.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  if (prevProps.track.id !== nextProps.track.id) return false;
  if (prevProps.index !== nextProps.index) return false;
  if (prevProps.isPlaylistView !== nextProps.isPlaylistView) return false;
  return true;
});

TrackRow.displayName = 'TrackRow';

  return (
    <div className="app">
      <div className="main-container">
        <div className="sidebar">
          <div className="sidebar-header" onClick={() => setCurrentView('home')} style={{cursor: 'pointer'}}>
  <Logo size={48} />
  <h1>
    <span style={{color: '#1db954'}}>Sound</span>
    <span style={{color: '#fff'}}>Storm</span>
  </h1>
</div>

          <nav className="sidebar-nav">
            <button onClick={() => setCurrentView('home')} className={currentView === 'home' ? 'active' : ''}>
              <Home size={24} />
              <span>Home</span>
            </button>
            <button onClick={() => setCurrentView('mytracks')} className={currentView === 'mytracks' ? 'active' : ''}>
              <Music size={24} />
              <span>My Tracks</span>
            </button>
            <button onClick={() => setCurrentView('favorites')} className={currentView === 'favorites' ? 'active' : ''}>
              <Heart size={24} />
              <span>Favorites</span>
            </button>
            <button onClick={() => setCurrentView('recent')} className={currentView === 'recent' ? 'active' : ''}>
              <History size={24} />
              <span style={{whiteSpace: 'nowrap'}}>Recently</span>
            </button>
          </nav>

          <div className="sidebar-section">
            <div className="sidebar-section-header">
              <span>Library</span>
            </div>
            <button onClick={() => setCurrentView('genres')} className={currentView === 'genres' ? 'active' : ''}>
              <Disc size={20} />
              <span>Genres</span>
            </button>
            <button onClick={() => setCurrentView('charts')} className={currentView === 'charts' ? 'active' : ''}>
              <ListMusic size={20} />
              <span>Charts</span>
            </button>
            <button onClick={() => setCurrentView('artists')} className={currentView === 'artists' ? 'active' : ''}>
              <Mic2 size={20} />
              <span>Artists</span>
            </button>
            <button onClick={() => setCurrentView('albums')} className={currentView === 'albums' ? 'active' : ''}>
              <Album size={20} />
              <span>Albums</span>
            </button>
          </div>

          <div className="sidebar-section">
            <div className="sidebar-section-header">
              <span>Playlists</span>
              <button onClick={() => setShowPlaylistModal(true)} className="add-playlist-btn">
                <PlusCircle size={16} />
              </button>
            </div>
            {playlists.map(playlist => (
  <div key={playlist.id} className="playlist-item">
    <button 
      onClick={() => setCurrentView(`playlist-${playlist.id}`)} 
      className={currentView === `playlist-${playlist.id}` ? 'playlist-item-btn active' : 'playlist-item-btn'}
    >
      <ListMusic size={20} />
      <span>{playlist.name}</span>
    </button>
    <button
  onClick={(e) => {
    e.stopPropagation();
    setPlaylistToDelete(playlist);
    setShowDeletePlaylistModal(true);
  }}
  className="delete-playlist-btn"
  title="Delete playlist"
>
  <Trash2 size={16} />
</button>
  </div>
))}
          </div>

          <div className="sidebar-footer">
              <button onClick={handleLogout} className="logout-btn">
                <LogOut size={20} />
                <span>Log out</span>
              </button>
          </div>
        </div>

        <div className="content">
          <div className="search-bar">
           <div className="search-input-wrapper">
             <Search className="search-icon" />
              <input
               type="text"
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               onKeyPress={handleSearchKeyPress}
               placeholder="Search for songs, artists..."
              />
           </div>
           <div style={{display: 'flex', gap: '12px', alignItems: 'center'}}>
  <button onClick={() => setShowPremiumModal(true)} className="header-premium-btn">
  <Crown size={20} />
  <span>Premium</span>
</button>
  <button onClick={() => setCurrentView('profile')} className="header-profile-btn">
    <User size={20} />
    <span>{currentUser.username}</span>
  </button>
</div>
          </div>

          <div className="content-body">
            {currentView === 'home' && (
              <div>
                <h2>Popular Right Now</h2>
                <div className="track-list">
                  {popularTracks.map((track, index) => (
                    <TrackRow key={track.id} track={track} index={index} playlist={popularTracks} />
                  ))}
                </div>
              </div>
            )}

            {currentView === 'mytracks' && (
              <div>
                <h2>My Tracks</h2>
                <div className="empty-state">
                  <Music size={64} />
                  <p>Upload your own tracks coming soon!</p>
                </div>
              </div>
            )}

            {currentView === 'search' && (
              <div>
                <h2>Search Results</h2>
                <div className="track-list">
                  {searchResults.map((track, index) => (
                    <TrackRow key={track.id} track={track} index={index} playlist={searchResults} />
                  ))}
                </div>
              </div>
            )}

            {currentView === 'favorites' && (
              <div>
                <h2>Your Favorites</h2>
                {favorites.length === 0 ? (
                  <div className="empty-state">
                    <Heart size={64} />
                    <p>No favorites yet. Start adding songs you love!</p>
                  </div>
                ) : (
                  <div className="track-list">
                    {favorites.map((track, index) => (
                      <TrackRow key={track.id} track={track} index={index} playlist={favorites} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {currentView === 'recent' && (
              <div>
                <h2>Recently Played</h2>
                {recentlyPlayed.length === 0 ? (
                  <div className="empty-state">
                    <History size={64} />
                    <p>No recently played tracks yet.</p>
                  </div>
                ) : (
                  <div className="track-list">
                    {recentlyPlayed.map((track, index) => (
                      <TrackRow key={track.id} track={track} index={index} playlist={recentlyPlayed} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {currentView === 'genres' && (
  <div>
    <h2>Genres</h2>
    <div className="genre-grid">
      {['Pop', 'Rock', 'Hip Hop', 'Electronic', 'Jazz', 'Classical', 'Country', 'R&B'].map(genre => (
        <div 
          key={genre} 
          className="genre-card"
          onClick={() => handleGenreClick(genre)}
        >
          <h3>{genre}</h3>
        </div>
      ))}
    </div>
  </div>
)}

{currentView === 'genre-detail' && selectedGenre && (
  <div>
    <button 
      onClick={() => setCurrentView('genres')} 
      className="back-button"
    >
      ← Back to Genres
    </button>
    <h2>{selectedGenre}</h2>
    {genreTracks.length === 0 ? (
      <div className="empty-state">
        <Music size={64} />
        <p>Loading tracks...</p>
      </div>
    ) : (
      <div className="track-list">
        {genreTracks.map((track, index) => (
          <TrackRow key={track.id} track={track} index={index} playlist={genreTracks} />
        ))}
      </div>
    )}
  </div>
)}

            {currentView === 'charts' && (
              <div>
                <h2>Top Charts</h2>
                <div className="track-list">
                  {popularTracks.map((track, index) => (
                    <TrackRow key={track.id} track={track} index={index} playlist={popularTracks} />
                  ))}
                </div>
              </div>
            )}

            {currentView === 'artists' && (
  <div>
    <h2>Artists</h2>
    {artists.length === 0 ? (
      <div className="empty-state">
        <Mic2 size={64} />
        <p>Loading artists...</p>
      </div>
    ) : (
      <div className="artists-grid">
        {artists.map(artist => (
          <div 
            key={artist.id} 
            className="artist-card"
            onClick={() => handleArtistClick(artist)}
          >
            <img src={artist.image} alt={artist.name} />
            <h3>{artist.name}</h3>
          </div>
        ))}
      </div>
    )}
  </div>
)}

{currentView === 'artist-detail' && selectedArtist && (
  <div>
    <button 
      onClick={() => setCurrentView('artists')} 
      className="back-button"
    >
      ← Back to Artists
    </button>
    <div className="artist-header">
      <img src={selectedArtist.image} alt={selectedArtist.name} className="artist-header-image" />
      <h1>{selectedArtist.name}</h1>
    </div>
    
    <div className="artist-content">
      <div className="top-tracks-section">
        <h2>Top 5 Popular Songs</h2>
        {artistTopTracks.length === 0 ? (
          <div className="empty-state">
            <Music size={64} />
            <p>Loading top tracks...</p>
          </div>
        ) : (
          <div className="track-list">
            {artistTopTracks.map((track, index) => (
              <TrackRow key={track.id} track={track} index={index} playlist={artistTopTracks} />
            ))}
          </div>
        )}
      </div>

      <div className="all-tracks-section">
        <h2>All Songs</h2>
        {artistTracks.length === 0 ? (
          <div className="empty-state">
            <Music size={64} />
            <p>Loading tracks...</p>
          </div>
        ) : (
          <div className="track-list">
            {artistTracks.map((track, index) => (
              <TrackRow key={track.id} track={track} index={index} playlist={artistTracks} />
            ))}
          </div>
        )}
      </div>
    </div>
  </div>
)}

            {currentView === 'albums' && (
  <div>
    <h2>Albums</h2>
    <div className="collections-grid">
      {collections.map(collection => (
        <div 
          key={collection.id} 
          className="collection-card"
          onClick={() => handleCollectionClick(collection)}
          style={{ background: collection.color }}
        >
          <div className="collection-overlay"></div>
          <div className="collection-content">
            <h3>{collection.name}</h3>
            <p>{collection.description}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
)}

{currentView === 'collection-detail' && selectedCollection && (
  <div>
    <button 
      onClick={() => setCurrentView('albums')} 
      className="back-button"
    >
      ← Back to Albums
    </button>
    <div className="collection-header" style={{ background: selectedCollection.color }}>
      <div className="collection-header-content">
        <h1>{selectedCollection.name}</h1>
        <p>{selectedCollection.description}</p>
      </div>
    </div>
    
    {collectionTracks.length === 0 ? (
      <div className="empty-state">
        <Music size={64} />
        <p>Loading tracks...</p>
      </div>
    ) : (
      <div className="track-list">
        {collectionTracks.map((track, index) => (
          <TrackRow key={track.id} track={track} index={index} playlist={collectionTracks} />
        ))}
      </div>
    )}
  </div>
)}

            {currentView.startsWith('playlist-') && (
  <div>
    {(() => {
      const playlistId = currentView.replace('playlist-', '');
      const playlist = playlists.find(p => p.id === playlistId);
      if (!playlist) return null;
      
      return (
        <>
          <div className="playlist-header-section">
  <div className="playlist-header-left">
    <h2>{playlist.name}</h2>
    <span className="playlist-count">{playlist.tracks.length} songs</span>
  </div>
  <button
  onClick={() => {
    setPlaylistToDelete(playlist);
    setShowDeletePlaylistModal(true);
  }}
  className="delete-playlist-btn-large"
>
  <Trash2 size={20} />
  <span>Delete Playlist</span>
</button>
</div>
          {playlist.tracks.length === 0 ? (
            <div className="empty-state">
              <ListMusic size={64} />
              <p>No tracks in this playlist yet. Add some songs!</p>
            </div>
          ) : (
            <div className="track-list">
              {playlist.tracks.map((track, index) => (
                <TrackRow 
                  key={track.id} 
                  track={track} 
                  index={index} 
                  playlist={playlist.tracks}
                  isPlaylistView={true}
                  playlistId={playlistId}
                />
              ))}
            </div>
          )}
        </>
      );
    })()}
  </div>
)}

            {currentView === 'profile' && currentUser && (
              <div>
                <h2>Profile</h2>
                <div className="profile-card">
                  <div className="profile-avatar">
                    <User size={80} />
                  </div>
                  <div className="profile-info">
                    <div className="profile-item">
                      <label>Username:</label>
                      <span>{currentUser.username}</span>
                    </div>
                    <div className="profile-item">
                      <label>Email:</label>
                      <span>{currentUser.email}</span>
                    </div>
                    <div className="profile-item">
                      <label>Member since:</label>
                      <span>{new Date(currentUser.registeredAt).toLocaleDateString()}</span>
                    </div>
                    <div className="profile-item">
                      <label>Favorite tracks:</label>
                      <span>{favorites.length}</span>
                    </div>
                  </div>
                </div>

                <div className="profile-sections">
                  <div className="profile-section">
                    <div className="section-header">
                      <Settings size={24} />
                      <h3>Settings</h3>
                    </div>
                    <div className="section-content">
                      <div className="setting-item">
                         <label>Default Volume</label>
                           <input
                             type="range"
                             min="0"
                             max="1"
                             step="0.01"
                             value={volume}
                             onChange={(e) => setVolume(parseFloat(e.target.value))}
                             className="volume-slider"
                          />
                            <span>{Math.round(volume * 100)}%</span>
                      </div>
                      <div className="setting-item">
                        <label>Auto-play next track</label>
                        <input 
                          type="checkbox" 
                          checked={autoPlay}
                          onChange={(e) => setAutoPlay(e.target.checked)}
                        />
                      </div>
                      <div className="setting-item">
                        <label>Sleep Timer</label>
                        <select 
                          value={sleepTimer} 
                          onChange={(e) => setSleepTimer(parseInt(e.target.value))}
                          className="sleep-timer-select"
                        >
                          <option value="0">Off</option>
                          <option value="15">15 minutes</option>
                          <option value="30">30 minutes</option>
                          <option value="45">45 minutes</option>
                          <option value="60">1 hour</option>
                          <option value="90">1.5 hours</option>
                          <option value="120">2 hours</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="profile-section">
                    <div className="section-header">
                      <HelpCircle size={24} />
                      <h3>Support</h3>
                    </div>
                    <div className="section-content">
                      {showSupportSuccess && (
                        <div className="success-message">Message sent successfully!</div>
                      )}
                      <textarea
                        placeholder="Describe your issue or question..."
                        value={supportMessage}
                        onChange={(e) => setSupportMessage(e.target.value)}
                        rows="4"
                        className="support-textarea"
                      />
                      <button onClick={handleSupportSubmit} className="btn-secondary">
                        Send Message
                      </button>
                    </div>
                  </div>

                  <div className="profile-section danger-section">
                    <div className="section-header">
                      <Trash2 size={24} />
                      <h3>Delete Account</h3>
                    </div>
                    <div className="section-content">
                      <p>This action cannot be undone. All your data will be permanently deleted.</p>
                      <button onClick={() => setShowDeleteModal(true)} className="btn-danger">
                        Delete My Account
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {currentTrack && (
        <div className="player">
          <audio
            ref={audioRef}
            onTimeUpdate={(e) => setCurrentTime(e.target.currentTime)}
            onLoadedMetadata={(e) => setDuration(e.target.duration)}
            onEnded={() => {
              setIsPlaying(false);
              if (autoPlay) {
                playNextTrack();
              }
            }}
          />

          <div className="player-track-info" onClick={() => setShowFullPlayer(true)} style={{cursor: 'pointer'}}>
            <img src={currentTrack.cover_small} alt={currentTrack.title} />
            <div className="player-track-details">
              <div className="player-track-title">{currentTrack.title}</div>
              <div className="player-track-artist">{currentTrack.artist?.name}</div>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); toggleFavorite(currentTrack); }}
              className={`favorite-btn ${isFavorite(currentTrack.id) ? 'active' : ''}`}
            >
              <Heart size={20} />
            </button>
          </div>

          <div className="player-controls">
            <div className="player-buttons">
              <button onClick={playPreviousTrack}><SkipBack size={20} /></button>
              <button onClick={togglePlayPause} className="play-btn">
                {isPlaying ? <Pause size={20} /> : <Play size={20} />}
              </button>
              <button onClick={playNextTrack}><SkipForward size={20} /></button>
            </div>
            <div className="player-progress">
              <span>{formatTime(currentTime)}</span>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${(currentTime / duration) * 100}%` }}></div>
              </div>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          <div className="player-volume">
            <button onClick={() => setIsMuted(!isMuted)}>
              {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                setVolume(parseFloat(e.target.value));
                setIsMuted(false);
              }}
            />
          </div>
        </div>
      )}

      {showFullPlayer && currentTrack && (
        <div className="full-player-overlay" onClick={() => setShowFullPlayer(false)}>
          <div className="full-player" onClick={(e) => e.stopPropagation()}>
            <button className="close-full-player" onClick={() => setShowFullPlayer(false)}>
              <ChevronDown size={32} />
            </button>
            <div className="full-player-content">
              <img src={currentTrack.cover_large} alt={currentTrack.title} className="full-player-cover" />
              <div className="full-player-info">
                <h1>{currentTrack.title}</h1>
                <h2>{currentTrack.artist?.name}</h2>
              </div>
              <div className="full-player-controls">
                <div className="full-player-progress">
                  <span>{formatTime(currentTime)}</span>
                  <div className="progress-bar-large">
                    <div className="progress-fill" style={{ width: `${(currentTime / duration) * 100}%` }}></div>
                  </div>
                  <span>{formatTime(duration)}</span>
                </div>
                <div className="full-player-buttons">
                  <button onClick={playPreviousTrack}><SkipBack size={32} /></button>
                  <button onClick={togglePlayPause} className="full-play-btn">
                    {isPlaying ? <Pause size={40} /> : <Play size={40} />}
                  </button>
                  <button onClick={playNextTrack}><SkipForward size={32} /></button>
                </div>
                <div className="full-player-actions">
                  <button
                    onClick={() => toggleFavorite(currentTrack)}
                    className={`favorite-btn-large ${isFavorite(currentTrack.id) ? 'active' : ''}`}
                  >
                    <Heart size={32} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Delete Account</h3>
            <p>Are you sure you want to delete your account? This action cannot be undone.</p>
            <div className="modal-buttons">
              <button onClick={() => setShowDeleteModal(false)} className="btn-secondary">
                Cancel
              </button>
              <button onClick={handleDeleteAccount} className="btn-danger">
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeletePlaylistModal && playlistToDelete && (
  <div className="modal-overlay">
    <div className="modal">
      <h3>Delete Playlist</h3>
      <p>Are you sure you want to delete "{playlistToDelete.name}"? This action cannot be undone.</p>
      <div className="modal-buttons">
        <button 
          onClick={() => {
            setShowDeletePlaylistModal(false);
            setPlaylistToDelete(null);
          }} 
          className="btn-secondary"
        >
          Cancel
        </button>
        <button 
          onClick={() => handleDeletePlaylist(playlistToDelete.id)} 
          className="btn-danger"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
)}

      {showPlaylistModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Create New Playlist</h3>
            <input
              type="text"
              placeholder="Playlist name"
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              className="playlist-input"
            />
            <div className="modal-buttons">
              <button onClick={() => setShowPlaylistModal(false)} className="btn-secondary">
                Cancel
              </button>
              <button onClick={handleCreatePlaylist} className="btn-primary">
                Create
              </button>
            </div>
          </div>
        </div>
      )}
      {showPremiumModal && (
  <div className="premium-modal-overlay" onClick={() => setShowPremiumModal(false)}>
    <div className="premium-modal" onClick={(e) => e.stopPropagation()}>
      <h2>Choose Your Plan</h2>
      <button className="close-premium-x" onClick={() => setShowPremiumModal(false)}>
  <X size={24} />
</button>
      <div className="premium-plans">
        {/* FREE PLAN */}
        <div className={`premium-plan ${currentSubscription === 'free' ? 'active' : ''}`}>
          <div className="plan-header">
            <div className="plan-name">Free</div>
            <div className="plan-price">$0</div>
            <div className="plan-period">Forever</div>
          </div>
          <div className="plan-features">
            <ul>
              <li>Basic music streaming</li>
              <li>Limited skips per hour</li>
              <li>Ads between songs</li>
              <li>Standard audio quality</li>
              <li>Online playback only</li>
            </ul>
          </div>
          {currentSubscription === 'free' ? (
            <button className="plan-button active-plan" disabled>Active</button>
          ) : (
            <button className="plan-button" onClick={() => {
  setShowPremiumModal(false);
  setShowDowngradeModal(true);
}}>
  Downgrade to Free
</button>
          )}
        </div>

        {/* PREMIUM PLAN */}
        <div className={`premium-plan ${currentSubscription === 'premium' ? 'active' : ''}`}>
          <div className="plan-header">
            <div className="plan-name">Premium</div>
            <div className="plan-price">0.001 ETH</div>
            <div className="plan-period">per month</div>
          </div>
          <div className="plan-features">
            <ul>
              <li>Ad-free music listening</li>
              <li>Unlimited skips</li>
              <li>High quality audio (320kbps)</li>
              <li>Offline playback</li>
              <li>Download up to 1,000 songs</li>
              <li>Play any song, anytime</li>
            </ul>
          </div>
          {currentSubscription === 'premium' ? (
            <button className="plan-button active-plan" disabled>Active</button>
          ) : (
            <button className="plan-button" onClick={() => handlePurchaseSubscription('premium')}>
              Get Premium
            </button>
          )}
        </div>

        {/* PREMIUM PLUS PLAN */}
        <div className={`premium-plan ${currentSubscription === 'premiumPlus' ? 'active' : ''}`}>
          <div className="plan-header">
            <div className="plan-name">Premium Plus</div>
            <div className="plan-price">0.002 ETH</div>
            <div className="plan-period">per month</div>
          </div>
          <div className="plan-features">
            <ul>
              <li>Everything in Premium</li>
              <li>Ultra HD audio quality (FLAC)</li>
              <li>Download unlimited songs</li>
              <li>Early access to new features</li>
              <li>Exclusive premium content</li>
              <li>Priority customer support</li>
              <li>Multi-device streaming (5 devices)</li>
              <li>Custom playlists recommendations</li>
            </ul>
          </div>
          {currentSubscription === 'premiumPlus' ? (
            <button className="plan-button active-plan" disabled>Active</button>
          ) : (
            <button className="plan-button" onClick={() => handlePurchaseSubscription('premiumPlus')}>
              Get Premium Plus
            </button>
          )}
        </div>
      </div>
      <button className="close-premium-btn" onClick={() => setShowPremiumModal(false)}>
        Close
      </button>
    </div>
  </div>
)}
{showSuccessModal && (
  <div className="success-modal-overlay" onClick={() => setShowSuccessModal(false)}>
    <div className="success-modal" onClick={(e) => e.stopPropagation()}>
      <div className="success-icon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      </div>
      <h3>Subscription Activated!</h3>
      <p>Your premium subscription has been successfully activated. Enjoy unlimited music!</p>
      
      {successTxHash && (
        <div className="transaction-hash">
          <p>Transaction Hash:</p>
          <a 
            href={`https://sepolia.etherscan.io/tx/${successTxHash}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="hash-link"
          >
            {successTxHash}
          </a>
        </div>
      )}
      
      <div className="success-modal-buttons">
        <button 
          className="btn-success-primary" 
          onClick={() => setShowSuccessModal(false)}
        >
          Start Listening
        </button>
      </div>
    </div>
  </div>
)}

{showDowngradeModal && (
  <div className="modal-overlay">
    <div className="downgrade-modal">
      <h3>Downgrade to Free Plan?</h3>
      <p>Are you sure you want to downgrade to the Free plan? You will lose access to premium features.</p>
      
      <div className="downgrade-features">
        <p>You will lose:</p>
        <ul>
          <li>Ad-free music listening</li>
          <li>Unlimited skips</li>
          <li>High quality audio</li>
          <li>Offline playback</li>
          <li>Download songs</li>
        </ul>
      </div>
      
      <div className="downgrade-buttons">
        <button 
          onClick={() => setShowDowngradeModal(false)} 
          className="btn-downgrade-cancel"
        >
          Cancel
        </button>
        <button 
          onClick={() => {
            setCurrentSubscription('free');
            setShowDowngradeModal(false);
          }} 
          className="btn-downgrade-confirm"
        >
          Confirm Downgrade
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
};

export default SoundStorm;