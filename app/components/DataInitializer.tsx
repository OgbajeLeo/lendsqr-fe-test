'use client';

import { useEffect } from 'react';
import userData from '../data/userData.json';

export default function DataInitializer() {
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    // Check if data already exists in localStorage
    const existingData = localStorage.getItem('userData');
    
    // Only initialize if data doesn't exist
    if (!existingData) {
      try {
        // Save userData to localStorage
        localStorage.setItem('userData', JSON.stringify(userData));
        console.log('User data initialized in localStorage');
      } catch (error) {
        console.error('Error saving user data to localStorage:', error);
        // If localStorage is full, try to clear old data or handle the error
        if (error instanceof Error && error.name === 'QuotaExceededError') {
          console.warn('LocalStorage quota exceeded. Consider using IndexedDB for large datasets.');
        }
      }
    }
  }, []);

  // This component doesn't render anything
  return null;
}
