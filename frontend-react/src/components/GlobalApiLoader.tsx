import React, { useState, useEffect } from 'react';
import axios from 'axios';
import GlobalLoader from './GlobalLoader';

export default function GlobalApiLoader() {
  const [isLoading, setIsLoading] = useState(false);
  const [showClose, setShowClose] = useState(false);

  useEffect(() => {
    let activeRequests = 0;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let forceCloseTimer: ReturnType<typeof setTimeout> | null = null;
    let showCloseBtnTimer: ReturnType<typeof setTimeout> | null = null;

    const hideLoader = () => {
      activeRequests = 0;
      if (timer) clearTimeout(timer);
      if (forceCloseTimer) clearTimeout(forceCloseTimer);
      if (showCloseBtnTimer) clearTimeout(showCloseBtnTimer);
      setIsLoading(false);
      setShowClose(false);
    };

    const requestInterceptor = axios.interceptors.request.use((config) => {
      activeRequests++;
      if (activeRequests === 1) {
        // Show loader if request takes longer than 800ms
        timer = setTimeout(() => {
          setIsLoading(true);
          
          // Show close button quickly just in case
          showCloseBtnTimer = setTimeout(() => {
             setShowClose(true);
          }, 2000);

          // Force pop out automatically after 3.5 seconds so the user can see the loaded page
          forceCloseTimer = setTimeout(() => {
             hideLoader();
          }, 3500);

        }, 800);
      }
      return config;
    }, (error) => {
      activeRequests--;
      if (activeRequests <= 0) hideLoader();
      return Promise.reject(error);
    });

    const responseInterceptor = axios.interceptors.response.use((response) => {
      activeRequests--;
      if (activeRequests <= 0) hideLoader();
      return response;
    }, (error) => {
      activeRequests--;
      if (activeRequests <= 0) hideLoader();
      return Promise.reject(error);
    });

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
      hideLoader();
    };
  }, []);

  if (!isLoading) return null;

  return (
    <>
      <GlobalLoader />
      {showClose && (
        <button 
          onClick={() => { setIsLoading(false); setShowClose(false); }}
          className="fixed top-8 right-8 z-[60] px-4 py-2 bg-slate-800 text-white rounded-lg font-bold border border-slate-700 shadow-xl hover:bg-slate-700 transition-colors"
        >
          Close Loader
        </button>
      )}
    </>
  );
}
