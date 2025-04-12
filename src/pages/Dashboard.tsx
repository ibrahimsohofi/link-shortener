import type React from 'react';
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import gsap from 'gsap';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import QRCode from 'qrcode.react';
import { getLinks, createLink, deleteLink, type Link as LinkType } from '@/services/linkService';
import { useAuth } from '@/context/AuthContext';

const Dashboard: React.FC = () => {
  const [links, setLinks] = useState<LinkType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showQRCode, setShowQRCode] = useState<string | null>(null);

  // Form states
  const [newUrl, setNewUrl] = useState('');
  const [customSlug, setCustomSlug] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user } = useAuth();

  // Refs for GSAP animations
  const headerRef = useRef<HTMLDivElement>(null);
  const linkListRef = useRef<HTMLDivElement>(null);
  const createFormRef = useRef<HTMLDivElement>(null);
  const qrModalRef = useRef<HTMLDivElement>(null);

  // Fetch user's links
  useEffect(() => {
    fetchLinks();
  }, []);

  // GSAP animations
  useEffect(() => {
    const tl = gsap.timeline();

    tl.fromTo(
      headerRef.current,
      { opacity: 0, y: -20 },
      { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }
    );

    tl.fromTo(
      '.link-card',
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: 'power3.out'
      },
      '-=0.3'
    );
  }, [links]);

  // Animation for create form
  useEffect(() => {
    if (showCreateForm && createFormRef.current) {
      gsap.fromTo(
        createFormRef.current,
        { opacity: 0, y: -20, height: 0 },
        { opacity: 1, y: 0, height: 'auto', duration: 0.5, ease: 'power3.out' }
      );
    }
  }, [showCreateForm]);

  // Animation for QR code modal
  useEffect(() => {
    if (showQRCode && qrModalRef.current) {
      gsap.fromTo(
        qrModalRef.current,
        { opacity: 0, scale: 0.8 },
        { opacity: 1, scale: 1, duration: 0.3, ease: 'back.out(1.7)' }
      );
    }
  }, [showQRCode]);

  const fetchLinks = async () => {
    try {
      setLoading(true);
      const data = await getLinks();
      setLinks(data);
      setError('');
    } catch (err) {
      console.error('Error fetching links:', err);
      setError('Failed to load your links. Please try again.');
      toast.error('Failed to load your links');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLink = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newUrl) {
      toast.error('Please enter a URL');
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await createLink({
        originalUrl: newUrl,
        ...(customSlug ? { customShortCode: customSlug } : {})
      });

      setLinks(prevLinks => [response, ...prevLinks]);
      toast.success('Link created successfully!');

      // Reset form
      setNewUrl('');
      setCustomSlug('');
      setShowCreateForm(false);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to create link';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteLink = async (id: string) => {
    if (!confirm('Are you sure you want to delete this link?')) {
      return;
    }

    try {
      await deleteLink(id);
      setLinks(prevLinks => prevLinks.filter(link => link.id !== id));
      toast.success('Link deleted successfully');
    } catch (err) {
      console.error('Error deleting link:', err);
      toast.error('Failed to delete link');
    }
  };

  const handleCopy = (url: string) => {
    toast.success('Copied to clipboard!');
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div ref={headerRef} className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Your Links</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage and track your shortened URLs
          </p>
        </div>

        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-primary text-white px-4 py-2 rounded-md flex items-center space-x-2 hover:bg-primary/90 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <path d="M12 5v14M5 12h14" />
          </svg>
          <span>{showCreateForm ? 'Cancel' : 'New Link'}</span>
        </button>
      </div>

      {/* Create Link Form */}
      {showCreateForm && (
        <div ref={createFormRef} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Create New Link
          </h2>

          <form onSubmit={handleCreateLink} className="space-y-4">
            <div>
              <label htmlFor="newUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Enter URL to shorten
              </label>
              <input
                type="url"
                id="newUrl"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="https://example.com/very/long/url"
                className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label htmlFor="customSlug" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Custom slug (optional)
              </label>
              <input
                type="text"
                id="customSlug"
                value={customSlug}
                onChange={(e) => setCustomSlug(e.target.value)}
                placeholder="my-custom-url"
                className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary/90 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Creating...' : 'Create Link'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Links List */}
      <div ref={linkListRef}>
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Loading your links...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-red-500 mb-2">❌</div>
            <p className="text-red-600 dark:text-red-400">{error}</p>
            <button
              onClick={fetchLinks}
              className="mt-4 bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : links.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="text-gray-400 text-5xl mb-4">🔗</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No links yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Create your first shortened link by clicking the "New Link" button above
            </p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary/90 transition-colors"
            >
              Create Your First Link
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {links.map((link) => (
              <div
                key={link.id}
                className="link-card bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 dark:text-white truncate" title={link.originalUrl}>
                      {link.originalUrl}
                    </h3>
                    <div className="mt-1 flex items-center">
                      <span className="text-primary truncate font-medium" title={link.shortUrl}>
                        {link.shortUrl}
                      </span>
                      <CopyToClipboard text={link.shortUrl} onCopy={() => handleCopy(link.shortUrl)}>
                        <button className="ml-2 text-gray-500 hover:text-primary transition-colors" title="Copy to clipboard">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                            <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                            <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                          </svg>
                        </button>
                      </CopyToClipboard>
                    </div>
                    <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      <span className="inline-flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 mr-1">
                          <path d="M12 20v-6M6 20V10M18 20V4" />
                        </svg>
                        {link.clicks} clicks
                      </span>
                      <span className="mx-3">•</span>
                      <span>
                        Created {new Date(link.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setShowQRCode(link.shortUrl)}
                      className="p-2 text-gray-600 hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                      title="Generate QR Code"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                        <rect width="5" height="5" x="3" y="3" rx="1" />
                        <rect width="5" height="5" x="16" y="3" rx="1" />
                        <rect width="5" height="5" x="3" y="16" rx="1" />
                        <path d="M21 16h-3a2 2 0 0 0-2 2v3" />
                        <path d="M21 21v.01" />
                        <path d="M12 7v3a2 2 0 0 1-2 2H7" />
                        <path d="M3 12h.01" />
                        <path d="M12 3h.01" />
                        <path d="M12 16v.01" />
                        <path d="M16 12h1" />
                        <path d="M21 12v.01" />
                        <path d="M12 21v-1" />
                      </svg>
                    </button>

                    <Link
                      to={`/analytics/${link.id}`}
                      className="p-2 text-gray-600 hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                      title="View Analytics"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                        <path d="M3 3v18h18" />
                        <path d="m19 9-5 5-4-4-3 3" />
                      </svg>
                    </Link>

                    <button
                      onClick={() => handleDeleteLink(link.id)}
                      className="p-2 text-gray-600 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                      title="Delete Link"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                        <path d="M3 6h18" />
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                        <line x1="10" x2="10" y1="11" y2="17" />
                        <line x1="14" x2="14" y1="11" y2="17" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* QR Code Modal */}
      {showQRCode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            ref={qrModalRef}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 max-w-sm w-full mx-4"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                QR Code
              </h3>
              <button
                onClick={() => setShowQRCode(null)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="flex justify-center p-4 bg-white rounded-lg mb-4">
              <QRCode
                value={showQRCode}
                size={200}
                level="H"
                includeMargin={true}
              />
            </div>

            <div className="text-sm text-gray-600 dark:text-gray-400 mb-4 text-center">
              Scan this QR code to access your shortened URL.
            </div>

            <div className="flex justify-center">
              <button
                onClick={() => {
                  // Create a canvas element
                  const canvas = document.querySelector('canvas');
                  if (canvas) {
                    // Convert the canvas to a data URL
                    const url = canvas.toDataURL('image/png');

                    // Create a link element
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = 'qrcode.png';

                    // Trigger the download
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);

                    toast.success('QR code downloaded!');
                  }
                }}
                className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
              >
                Download QR Code
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
