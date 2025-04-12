import type React from 'react';
import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';

const NotFound: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline();

    tl.fromTo(
      containerRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.7, ease: 'back.out(1.7)' }
    );

    tl.fromTo(
      '.bounce',
      { y: 0 },
      { y: -15, duration: 0.5, repeat: -1, yoyo: true },
      '-=0.2'
    );
  }, []);

  return (
    <div
      ref={containerRef}
      className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4"
    >
      <h1 className="text-9xl font-bold text-primary mb-4 bounce">404</h1>

      <h2 className="text-3xl font-semibold text-gray-900 dark:text-white mb-6">
        Page Not Found
      </h2>

      <p className="text-gray-600 dark:text-gray-400 max-w-md mb-8">
        Oops! The page you are looking for might have been removed, had its name changed,
        or is temporarily unavailable.
      </p>

      <Link
        to="/"
        className="bg-primary text-white px-6 py-3 rounded-md hover:bg-primary/90 transition-colors"
      >
        Go Home
      </Link>
    </div>
  );
};

export default NotFound;
