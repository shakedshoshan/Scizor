'use client';

import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';

interface UserAvatarProps {
  user: User;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const UserAvatar: React.FC<UserAvatarProps> = ({ user, size = 'md', className = '' }) => {
  const [imageError, setImageError] = useState(false);
  const [photoURL, setPhotoURL] = useState<string | null>(null);

  useEffect(() => {
    // Get the photo URL from the user's provider data
    const getPhotoURL = () => {
      // First try the main user photoURL
      if (user.photoURL) {
        return user.photoURL;
      }
      
      // If not available, check provider data (especially for Google users)
      if (user.providerData && user.providerData.length > 0) {
        // Look for Google provider data first
        const googleProvider = user.providerData.find(provider => provider.providerId === 'google.com');
        if (googleProvider?.photoURL) {
          return googleProvider.photoURL;
        }
        
        // Fall back to any provider with a photo URL
        const providerWithPhoto = user.providerData.find(provider => provider.photoURL);
        if (providerWithPhoto?.photoURL) {
          return providerWithPhoto.photoURL;
        }
      }
      
      return null;
    };

    const url = getPhotoURL();
    setPhotoURL(url);
    setImageError(false);
  }, [user]);

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20'
  };

  const getInitials = () => {
    if (user.displayName) {
      return user.displayName
        .split(' ')
        .map(name => name.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (user.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  const getBackgroundColor = () => {
    // Generate a consistent color based on user ID or email
    const seed = user.uid || user.email || 'default';
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-red-500',
      'bg-yellow-500',
      'bg-teal-500'
    ];
    const index = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  };

  if (photoURL && !imageError) {
    return (
      <img
        src={photoURL}
        alt={`${user.displayName || user.email || 'User'} avatar`}
        className={`${sizeClasses[size]} rounded-full object-cover ${className}`}
        onError={() => setImageError(true)}
      />
    );
  }

  return (
    <div
      className={`${sizeClasses[size]} rounded-full ${getBackgroundColor()} flex items-center justify-center text-white font-semibold ${className}`}
    >
      {getInitials()}
    </div>
  );
};

export default UserAvatar; 