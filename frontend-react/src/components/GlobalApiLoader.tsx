import React, { useState, useEffect } from 'react';
import axios from 'axios';
import GlobalLoader from './GlobalLoader';

export default function GlobalApiLoader() {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let activeRequests = 0;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const requestInterceptor = axios.interceptors.request.use((config) => {
      activeRequests++;
      // Only start the timer for the first active request
      if (activeRequests === 1) {
        // Show loader if request takes longer than 800ms
        timer = setTimeout(() => {
          setIsLoading(true);
        }, 800);
      }
      return config;
    }, (error) => {
      activeRequests--;
      if (activeRequests <= 0) {
        activeRequests = 0;
        if (timer) clearTimeout(timer);
        setIsLoading(false);
      }
      return Promise.reject(error);
    });

    const responseInterceptor = axios.interceptors.response.use((response) => {
      activeRequests--;
      if (activeRequests <= 0) {
        activeRequests = 0;
        if (timer) clearTimeout(timer);
        setIsLoading(false);
      }
      return response;
    }, (error) => {
      activeRequests--;
      if (activeRequests <= 0) {
        activeRequests = 0;
        if (timer) clearTimeout(timer);
        setIsLoading(false);
      }
      return Promise.reject(error);
    });

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
      if (timer) clearTimeout(timer);
    };
  }, []);

  if (!isLoading) return null;

  // Re-use the existing global loader when API is slow
  return <GlobalLoader />;
}
