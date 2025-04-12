import { type NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import ShortLink from '@/models/ShortLink';
import { getAuthTokenFromRequest, verifyJWT } from '@/lib/auth';

interface Params {
  params: {
    shortCode: string;
  };
}

// GET: Get details/analytics for a specific short URL
export async function GET(req: NextRequest, { params }: Params) {
  try {
    await connectDB();

    const { shortCode } = params;

    if (!shortCode) {
      return NextResponse.json({ error: 'Short code is required' }, { status: 400 });
    }

    const shortLink = await ShortLink.findOne({ shortCode });

    if (!shortLink) {
      return NextResponse.json({ error: 'Short URL not found' }, { status: 404 });
    }

    // Get user from auth token (if exists)
    const token = getAuthTokenFromRequest(req);

    // Check if the user is authenticated and is the owner of the link
    if (shortLink.createdBy) {
      if (!token) {
        // For links with an owner, only return basic info if not authenticated
        return NextResponse.json({
          shortCode: shortLink.shortCode,
          originalUrl: shortLink.originalUrl,
          shortUrl: `${process.env.NEXT_PUBLIC_BASE_URL || req.nextUrl.origin}/${shortCode}`,
          clicks: shortLink.clicks,
          createdAt: shortLink.createdAt,
          customSlug: shortLink.customSlug,
        });
      }

      const decoded = verifyJWT(token);
      if (!decoded || decoded.userId !== shortLink.createdBy.toString()) {
        // If user is not the owner, only return basic info
        return NextResponse.json({
          shortCode: shortLink.shortCode,
          originalUrl: shortLink.originalUrl,
          shortUrl: `${process.env.NEXT_PUBLIC_BASE_URL || req.nextUrl.origin}/${shortCode}`,
          clicks: shortLink.clicks,
          createdAt: shortLink.createdAt,
          customSlug: shortLink.customSlug,
        });
      }
    }

    // Return full analytics if user is authenticated and is the owner (or if link has no owner)
    return NextResponse.json({
      id: shortLink._id,
      shortCode: shortLink.shortCode,
      originalUrl: shortLink.originalUrl,
      shortUrl: `${process.env.NEXT_PUBLIC_BASE_URL || req.nextUrl.origin}/${shortCode}`,
      clicks: shortLink.clicks,
      createdAt: shortLink.createdAt,
      customSlug: shortLink.customSlug,
      analytics: shortLink.analytics,
    });
  } catch (error) {
    console.error('Error getting short URL details:', error);
    return NextResponse.json(
      { error: 'Failed to get short URL details' },
      { status: 500 }
    );
  }
}

// DELETE: Delete a specific short URL
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    await connectDB();

    const { shortCode } = params;

    if (!shortCode) {
      return NextResponse.json({ error: 'Short code is required' }, { status: 400 });
    }

    const shortLink = await ShortLink.findOne({ shortCode });

    if (!shortLink) {
      return NextResponse.json({ error: 'Short URL not found' }, { status: 404 });
    }

    // Check authentication for links with an owner
    if (shortLink.createdBy) {
      const token = getAuthTokenFromRequest(req);

      if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const decoded = verifyJWT(token);
      if (!decoded || decoded.userId !== shortLink.createdBy.toString()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    // Delete the short URL
    await ShortLink.deleteOne({ shortCode });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting short URL:', error);
    return NextResponse.json(
      { error: 'Failed to delete short URL' },
      { status: 500 }
    );
  }
}
