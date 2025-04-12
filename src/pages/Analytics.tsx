import type React from 'react';
import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'sonner';
import gsap from 'gsap';
import { getLinkAnalytics, type LinkAnalytics as LinkAnalyticsType } from '@/services/linkService';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import QRCode from 'react-qr-code'; // Updated import to use react-qr-code

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

type RouteParams = {
  id: string;
};

const Analytics: React.FC = () => {
  const { id } = useParams<RouteParams>();
  const [linkData, setLinkData] = useState<LinkAnalyticsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('clicks');
  const [showQRCode, setShowQRCode] = useState(false);

  // Refs for GSAP animations
  const headerRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<HTMLDivElement>(null);
  const qrModalRef = useRef<HTMLDivElement>(null);

  // Fetch link analytics
  useEffect(() => {
    const fetchLinkAnalytics = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const data = await getLinkAnalytics(id);
        setLinkData(data);
        setError('');
      } catch (err) {
        console.error('Error fetching link analytics:', err);
        setError('Failed to load analytics data. Please try again.');
        toast.error('Failed to load analytics data');
      } finally {
        setLoading(false);
      }
    };

    fetchLinkAnalytics();
  }, [id]);

  // GSAP animations
  useEffect(() => {
    if (!loading && linkData) {
      const tl = gsap.timeline();

      tl.fromTo(
        headerRef.current,
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }
      );

      tl.fromTo(
        statsRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' },
        '-=0.3'
      );

      tl.fromTo(
        chartRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' },
        '-=0.3'
      );
    }
  }, [loading, linkData]);

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

  const handleCopy = () => {
    toast.success('Copied to clipboard!');
  };

  // Prepare chart data
  const prepareChartData = () => {
    if (!linkData) return null;

    // Clicks per day
    if (activeTab === 'clicks') {
      const labels = Object.keys(linkData.clicksPerDay).sort();
      const data = labels.map(date => linkData.clicksPerDay[date]);

      return {
        labels,
        datasets: [
          {
            label: 'Clicks per Day',
            data,
            borderColor: 'rgb(99, 102, 241)',
            backgroundColor: 'rgba(99, 102, 241, 0.2)',
            tension: 0.3,
          },
        ],
      };
    }

    // Referrers
    if (activeTab === 'referrers') {
      const labels = Object.keys(linkData.referrers).filter(r => r !== 'undefined');
      const data = labels.map(referrer => linkData.referrers[referrer]);

      return {
        labels,
        datasets: [
          {
            label: 'Referrers',
            data,
            backgroundColor: [
              'rgba(255, 99, 132, 0.7)',
              'rgba(54, 162, 235, 0.7)',
              'rgba(255, 206, 86, 0.7)',
              'rgba(75, 192, 192, 0.7)',
              'rgba(153, 102, 255, 0.7)',
            ],
            borderWidth: 1,
          },
        ],
      };
    }

    // Countries
    if (activeTab === 'countries') {
      const labels = Object.keys(linkData.countries).filter(c => c !== 'undefined' && c !== 'unknown');
      const data = labels.map(country => linkData.countries[country]);

      return {
        labels,
        datasets: [
          {
            label: 'Countries',
            data,
            backgroundColor: [
              'rgba(255, 99, 132, 0.7)',
              'rgba(54, 162, 235, 0.7)',
              'rgba(255, 206, 86, 0.7)',
              'rgba(75, 192, 192, 0.7)',
              'rgba(153, 102, 255, 0.7)',
            ],
            borderWidth: 1,
          },
        ],
      };
    }

    return null;
  };

  const chartData = prepareChartData();
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: activeTab === 'clicks'
          ? 'Clicks Over Time'
          : activeTab === 'referrers'
          ? 'Top Referrers'
          : 'Top Countries',
      },
    },
    scales: activeTab === 'clicks' ? {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
        },
      },
    } : undefined,
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        <p className="mt-2 text-gray-600 dark:text-gray-400">Loading analytics data...</p>
      </div>
    );
  }

  if (error || !linkData) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 text-3xl mb-4">❌</div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Error Loading Analytics</h3>
        <p className="text-red-600 dark:text-red-400 mb-4">{error || 'Link not found or analytics data is unavailable.'}</p>
        <Link to="/dashboard" className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary/90 transition-colors">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div ref={headerRef} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Link Analytics</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1 truncate" title={linkData.originalUrl}>
              Original URL: {linkData.originalUrl}
            </p>
            <div className="mt-2 flex items-center">
              <span className="text-primary truncate font-medium" title={linkData.shortUrl}>
                {linkData.shortUrl}
              </span>
              <CopyToClipboard text={linkData.shortUrl} onCopy={handleCopy}>
                <button className="ml-2 text-gray-500 hover:text-primary transition-colors" title="Copy to clipboard">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                  </svg>
                </button>
              </CopyToClipboard>
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={() => setShowQRCode(true)}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center space-x-2"
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
              <span>QR Code</span>
            </button>

            <Link
              to="/dashboard"
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div ref={statsRef} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center space-x-4">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-blue-600 dark:text-blue-400">
                <path d="M12 20v-6M6 20V10M18 20V4" />
              </svg>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Total Clicks</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{linkData.totalClicks}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center space-x-4">
            <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-green-600 dark:text-green-400">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Top Country</p>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {Object.entries(linkData.countries)
                  .sort((a, b) => b[1] - a[1])
                  .filter(([country]) => country !== 'unknown' && country !== 'undefined')
                  .length > 0
                  ? Object.entries(linkData.countries)
                      .sort((a, b) => b[1] - a[1])
                      .filter(([country]) => country !== 'unknown' && country !== 'undefined')[0][0]
                  : 'Unknown'
                }
              </h3>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center space-x-4">
            <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-purple-600 dark:text-purple-400">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                <rect width="4" height="12" x="2" y="9" />
                <circle cx="4" cy="4" r="2" />
              </svg>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Top Referrer</p>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white truncate">
                {Object.entries(linkData.referrers)
                  .sort((a, b) => b[1] - a[1])
                  .filter(([referrer]) => referrer !== 'direct' && referrer !== 'undefined')
                  .length > 0
                  ? Object.entries(linkData.referrers)
                      .sort((a, b) => b[1] - a[1])
                      .filter(([referrer]) => referrer !== 'direct' && referrer !== 'undefined')[0][0]
                  : 'Direct'
                }
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div ref={chartRef} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setActiveTab('clicks')}
            className={`px-4 py-2 rounded-md ${
              activeTab === 'clicks'
                ? 'bg-primary text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            } transition-colors`}
          >
            Clicks Over Time
          </button>
          <button
            onClick={() => setActiveTab('referrers')}
            className={`px-4 py-2 rounded-md ${
              activeTab === 'referrers'
                ? 'bg-primary text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            } transition-colors`}
          >
            Referrers
          </button>
          <button
            onClick={() => setActiveTab('countries')}
            className={`px-4 py-2 rounded-md ${
              activeTab === 'countries'
                ? 'bg-primary text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            } transition-colors`}
          >
            Countries
          </button>
        </div>

        <div className="h-80">
          {chartData ? (
            activeTab === 'clicks' ? (
              <Line data={chartData} options={chartOptions} />
            ) : (
              <Bar data={chartData} options={chartOptions} />
            )
          ) : (
            <div className="h-full flex items-center justify-center">
              <p className="text-gray-500 dark:text-gray-400">No data available</p>
            </div>
          )}
        </div>
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
                onClick={() => setShowQRCode(false)}
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
                value={linkData.shortUrl}
                size={200}
                level="H"
                bgColor="#FFFFFF"
                fgColor="#000000"
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

export default Analytics;
