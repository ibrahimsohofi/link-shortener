import type React from 'react';
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import gsap from 'gsap';
import { createLink } from '@/services/linkService';
import { CopyToClipboard } from 'react-copy-to-clipboard';

const Home: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [url, setUrl] = useState('');
  const [customSlug, setCustomSlug] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Refs for GSAP animations
  const heroRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  // GSAP animations
  useEffect(() => {
    const tl = gsap.timeline();

    tl.fromTo(
      heroRef.current,
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }
    );

    tl.fromTo(
      formRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' },
      '-=0.5'
    );

    // Features section animation
    gsap.fromTo(
      '.feature-card',
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: 'power3.out',
        stagger: 0.2,
        scrollTrigger: {
          trigger: '.features-section',
          start: 'top 80%',
        }
      }
    );
  }, []);

  // Animation for result section
  useEffect(() => {
    if (shortUrl && resultRef.current) {
      gsap.fromTo(
        resultRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }
      );
    }
  }, [shortUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!url) {
      toast.error('Please enter a URL');
      return;
    }

    try {
      setIsLoading(true);

      const response = await createLink({
        originalUrl: url,
        ...(customSlug ? { customShortCode: customSlug } : {})
      });

      setShortUrl(response.shortUrl);
      toast.success('URL shortened successfully!');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to shorten URL';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    toast.success('Copied to clipboard!');
  };

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section ref={heroRef} className="text-center space-y-6 py-12">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white">
          Shorten Your <span className="text-primary">Links</span> with Style
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Create short, memorable links that drive more clicks and increase brand recognition.
          Track performance with advanced analytics.
        </p>

        {!isAuthenticated && (
          <div className="pt-4">
            <Link to="/register" className="bg-primary text-white px-6 py-3 rounded-md text-lg font-semibold hover:bg-primary/90 transition-colors">
              Sign Up Free
            </Link>
          </div>
        )}
      </section>

      {/* URL Shortener Form */}
      <section className="max-w-3xl mx-auto px-4">
        <form ref={formRef} onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 space-y-6">
          <div className="space-y-2">
            <label htmlFor="url" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Enter your long URL
            </label>
            <input
              type="url"
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/very/long/url/that/needs/shortening"
              className="w-full px-4 py-3 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="customSlug" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Custom slug (optional)
            </label>
            <input
              type="text"
              id="customSlug"
              value={customSlug}
              onChange={(e) => setCustomSlug(e.target.value)}
              placeholder="my-custom-url"
              className="w-full px-4 py-3 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary text-white py-3 rounded-md font-medium hover:bg-primary/90 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Shortening...' : 'Shorten URL'}
          </button>
        </form>

        {/* Result */}
        {shortUrl && (
          <div
            ref={resultRef}
            className="mt-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900 rounded-lg p-6"
          >
            <h3 className="text-lg font-semibold text-green-800 dark:text-green-400 mb-2">
              Your shortened URL is ready!
            </h3>

            <div className="flex items-center">
              <input
                type="text"
                value={shortUrl}
                readOnly
                className="flex-grow px-4 py-3 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none"
              />
              <CopyToClipboard text={shortUrl} onCopy={handleCopy}>
                <button className="bg-primary text-white px-4 py-3 rounded-r-md hover:bg-primary/90 transition-colors">
                  Copy
                </button>
              </CopyToClipboard>
            </div>

            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              {isAuthenticated ? (
                <Link to="/dashboard" className="text-primary hover:underline">
                  Go to your dashboard
                </Link>
              ) : (
                <Link to="/register" className="text-primary hover:underline">
                  Sign up for free
                </Link>
              )}{' '}
              to track clicks and manage your links!
            </p>
          </div>
        )}
      </section>

      {/* Features Section */}
      <section className="features-section py-16 bg-gray-100 dark:bg-gray-800/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Powerful Features
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="feature-card bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-primary">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Custom Short Links
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Create memorable, branded links that reflect your content and enhance your brand identity.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="feature-card bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-primary">
                  <path d="M3 3v18h18" />
                  <path d="m19 9-5 5-4-4-3 3" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Advanced Analytics
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Track clicks, geographic locations, referral sources, and more with detailed link analytics.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="feature-card bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-primary">
                  <rect width="18" height="18" x="3" y="3" rx="2" />
                  <path d="M7 7h.01" />
                  <path d="M17 7h.01" />
                  <path d="M7 17h.01" />
                  <path d="M17 17h.01" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                QR Code Generation
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Generate QR codes for your short links to make them easily accessible from print and physical media.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
