'use client';

import type React from 'react';
import { createContext, useContext, useState } from 'react';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';

interface ShortLink {
  id: string;
  shortCode: string;
  originalUrl: string;
  shortUrl: string;
  clicks: number;
  createdAt: string;
  customSlug: boolean;
}

interface ShortLinkWithAnalytics extends ShortLink {
  analytics?: {
    referrers: Record<string, number>;
    browsers: Record<string, number>;
    devices: Record<string, number>;
    countries: Record<string, number>;
    clicksByDate: Record<string, number>;
  };
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

interface UrlContextType {
  links: ShortLink[];
  loading: boolean;
  pagination: Pagination;
  currentLink: ShortLinkWithAnalytics | null;
  createShortLink: (originalUrl: string, customSlug?: string) => Promise<ShortLink>;
  getShortLinks: (page?: number, limit?: number) => Promise<void>;
  getLinkDetails: (shortCode: string) => Promise<ShortLinkWithAnalytics>;
  deleteShortLink: (shortCode: string) => Promise<void>;
}

const defaultPagination: Pagination = {
  total: 0,
  page: 1,
  limit: 10,
  pages: 0,
};

const UrlContext = createContext<UrlContextType | undefined>(undefined);

export function UrlProvider({ children }: { children: React.ReactNode }) {
  const [links, setLinks] = useState<ShortLink[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<Pagination>(defaultPagination);
  const [currentLink, setCurrentLink] = useState<ShortLinkWithAnalytics | null>(null);
  const { toast } = useToast();

  const createShortLink = async (originalUrl: string, customSlug?: string): Promise<ShortLink> => {
    try {
      setLoading(true);
      const { data } = await axios.post('/api/url', {
        url: originalUrl,
        customSlug,
      });

      toast({
        title: 'Success',
        description: 'Short link created successfully',
      });

      // Refresh the links list
      await getShortLinks();

      return data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      console.error('Error creating short link:', error);
      toast({
        title: 'Error',
        description: err.response?.data?.error || 'Failed to create short link',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getShortLinks = async (page = 1, limit = 10) => {
    try {
      setLoading(true);
      const { data } = await axios.get(`/api/url?page=${page}&limit=${limit}`);
      setLinks(data.data);
      setPagination(data.pagination);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      console.error('Error fetching short links:', error);
      toast({
        title: 'Error',
        description: err.response?.data?.error || 'Failed to fetch short links',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getLinkDetails = async (shortCode: string): Promise<ShortLinkWithAnalytics> => {
    try {
      setLoading(true);
      const { data } = await axios.get(`/api/url/${shortCode}`);
      setCurrentLink(data);
      return data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      console.error('Error fetching link details:', error);
      toast({
        title: 'Error',
        description: err.response?.data?.error || 'Failed to fetch link details',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteShortLink = async (shortCode: string) => {
    try {
      setLoading(true);
      await axios.delete(`/api/url/${shortCode}`);

      // Remove the link from the local state
      setLinks(links.filter((link) => link.shortCode !== shortCode));

      toast({
        title: 'Success',
        description: 'Short link deleted successfully',
      });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      console.error('Error deleting short link:', error);
      toast({
        title: 'Error',
        description: err.response?.data?.error || 'Failed to delete short link',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <UrlContext.Provider
      value={{
        links,
        loading,
        pagination,
        currentLink,
        createShortLink,
        getShortLinks,
        getLinkDetails,
        deleteShortLink,
      }}
    >
      {children}
    </UrlContext.Provider>
  );
}

export function useUrl() {
  const context = useContext(UrlContext);
  if (context === undefined) {
    throw new Error('useUrl must be used within a UrlProvider');
  }
  return context;
}
