import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import LoadingScreen from '@/components/common/LoadingScreen';

const Redirect = () => {
  const { shortCode } = useParams<{ shortCode: string }>();
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const redirectToOriginalUrl = async () => {
      try {
        // Make a request to the backend to get the original URL
        const response = await axios.get(`/links/${shortCode}`);

        // If we get a response with the original URL, redirect to it
        if (response.data && response.data.originalUrl) {
          window.location.href = response.data.originalUrl;
        } else {
          setError('Link not found or has expired');
          setTimeout(() => navigate('/'), 3000);
        }
      } catch (error) {
        console.error('Redirect error:', error);
        setError('This link appears to be invalid or has expired');
        setTimeout(() => navigate('/'), 3000);
      }
    };

    if (shortCode) {
      redirectToOriginalUrl();
    }
  }, [shortCode, navigate]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 rounded-lg p-6 text-center max-w-md">
          <h2 className="text-xl font-semibold text-red-800 dark:text-red-400 mb-2">
            Oops! Something went wrong
          </h2>
          <p className="text-red-600 dark:text-red-300">{error}</p>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Redirecting to homepage in a moment...
          </p>
        </div>
      </div>
    );
  }

  return <LoadingScreen />;
};

export default Redirect;
