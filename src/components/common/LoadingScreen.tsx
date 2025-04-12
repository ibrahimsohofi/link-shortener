import type React from 'react';
import { useEffect } from 'react';
import gsap from 'gsap';

const LoadingScreen: React.FC = () => {
  useEffect(() => {
    // GSAP animation for the loading elements
    gsap.fromTo(
      '.loading-dot',
      { scale: 0.5, opacity: 0 },
      {
        scale: 1,
        opacity: 1,
        stagger: 0.2,
        duration: 0.7,
        repeat: -1,
        yoyo: true,
      }
    );

    gsap.to('.loading-text', {
      opacity: 1,
      duration: 1,
      ease: 'power2.inOut'
    });
  }, []);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 z-50">
      <div className="flex items-center justify-center space-x-2 mb-4">
        <div className="loading-dot w-4 h-4 bg-primary rounded-full"></div>
        <div className="loading-dot w-4 h-4 bg-primary rounded-full"></div>
        <div className="loading-dot w-4 h-4 bg-primary rounded-full"></div>
      </div>
      <p className="loading-text text-lg text-gray-600 dark:text-gray-400 opacity-0">
        Loading...
      </p>
    </div>
  );
};

export default LoadingScreen;
