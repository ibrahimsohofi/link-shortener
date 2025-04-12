import axios from 'axios';

export interface Link {
  id: string;
  originalUrl: string;
  shortUrl: string;
  shortCode: string;
  clicks: number;
  createdAt: string;
}

export interface LinkAnalytics extends Link {
  totalClicks: number;
  clicksPerDay: Record<string, number>;
  userAgents: Record<string, number>;
  referrers: Record<string, number>;
  countries: Record<string, number>;
}

export interface CreateLinkParams {
  originalUrl: string;
  customShortCode?: string;
}

// Create a new shortened URL
export const createLink = async (data: CreateLinkParams): Promise<Link> => {
  const response = await axios.post('/api/links', data);
  return response.data;
};

// Get all links for authenticated user
export const getLinks = async (): Promise<Link[]> => {
  const response = await axios.get('/api/links');
  return response.data;
};

// Get a specific link by ID
export const getLinkById = async (id: string): Promise<Link> => {
  const response = await axios.get(`/api/links/detail/${id}`);
  return response.data;
};

// Delete a link
export const deleteLink = async (id: string): Promise<void> => {
  await axios.delete(`/api/links/${id}`);
};

// Get analytics for a link
export const getLinkAnalytics = async (id: string): Promise<LinkAnalytics> => {
  const response = await axios.get(`/api/links/analytics/${id}`);
  return response.data;
};
