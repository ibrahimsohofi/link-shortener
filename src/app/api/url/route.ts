import { type NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import connectDB from '@/lib/db';
import ShortLink from '@/models/ShortLink';
import { getAuthTokenFromRequest, verifyJWT } from '@/lib/auth';

// POST: Create a new short URL
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { url: originalUrl, customSlug } = await req.json();

    if (!originalUrl) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Validate URL
    try {
      new URL(originalUrl);
    } catch (error) {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
    }

    // Get user from auth token (if exists)
    let userId = null;
    const token = getAuthTokenFromRequest(req);
    if (token) {
      const decoded = verifyJWT(token);
      if (decoded) {
        userId = decoded.userId;
      }
    }

    // Generate short code
    let shortCode = customSlug;

    // If no custom slug is provided, generate a random one
    if (!shortCode) {
      shortCode = nanoid(6); // Default length is 6
    } else {
      // Check if custom slug already exists
      const existingLink = await ShortLink.findOne({ shortCode });
      if (existingLink) {
        return NextResponse.json(
          { error: 'Custom slug already in use' },
          { status: 400 }
        );
      }
    }

    // Create short link document
    const shortLink = await ShortLink.create({
      originalUrl,
      shortCode,
      createdBy: userId,
      customSlug: !!customSlug,
      analytics: {
        referrers: {},
        browsers: {},
        devices: {},
        countries: {},
        clicksByDate: {},
      },
    });

    return NextResponse.json({
      shortCode,
      originalUrl,
      shortUrl: `${process.env.NEXT_PUBLIC_BASE_URL || req.nextUrl.origin}/${shortCode}`,
    });
  } catch (error) {
    console.error('Error creating short URL:', error);
    return NextResponse.json(
      { error: 'Failed to create short URL' },
      { status: 500 }
    );
  }
}

// GET: List all short URLs (can be filtered by user if authenticated)
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    // Get user from auth token (if exists)
    let userId = null;
    const token = getAuthTokenFromRequest(req);
    if (token) {
      const decoded = verifyJWT(token);
      if (decoded) {
        userId = decoded.userId;
      }
    }

    // Prepare filter (if user is authenticated, show only their links)
    const filter = userId ? { createdBy: userId } : {};

    // Get pagination parameters
    const { searchParams } = req.nextUrl;
    const page = Number.parseInt(searchParams.get('page') || '1', 10);
    const limit = Number.parseInt(searchParams.get('limit') || '10', 10);
    const skip = (page - 1) * limit;

    // Get links
    const links = await ShortLink.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count
    const total = await ShortLink.countDocuments(filter);

    // Transform to response format
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || req.nextUrl.origin;
    const data = links.map((link) => ({
      id: link._id,
      shortCode: link.shortCode,
      originalUrl: link.originalUrl,
      shortUrl: `${baseUrl}/${link.shortCode}`,
      clicks: link.clicks,
      createdAt: link.createdAt,
      customSlug: link.customSlug,
    }));

    return NextResponse.json({
      data,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching short URLs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch short URLs' },
      { status: 500 }
    );
  }
}
