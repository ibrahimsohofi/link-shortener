import { type NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import ShortLink from '@/models/ShortLink';

interface Params {
  params: {
    shortCode: string;
  };
}

export async function GET(req: NextRequest, { params }: Params) {
  try {
    await connectDB();

    const { shortCode } = params;

    if (!shortCode) {
      return NextResponse.redirect(new URL('/', req.url));
    }

    const shortLink = await ShortLink.findOne({ shortCode });

    if (!shortLink) {
      return NextResponse.redirect(new URL('/?error=not-found', req.url));
    }

    // Get referrer, browser, device, country, etc.
    const referrer = req.headers.get('referer') || 'direct';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    // Simple browser detection
    let browser = 'unknown';
    if (userAgent.includes('Chrome')) browser = 'Chrome';
    else if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Safari')) browser = 'Safari';
    else if (userAgent.includes('Edge')) browser = 'Edge';
    else if (userAgent.includes('MSIE') || userAgent.includes('Trident/')) browser = 'Internet Explorer';

    // Simple device detection
    let device = 'desktop';
    if (userAgent.includes('Mobile')) device = 'mobile';
    else if (userAgent.includes('Tablet')) device = 'tablet';

    // Get date for clicks by date
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    // Update analytics
    // For referrer
    const referrerCount = (shortLink.analytics?.referrers?.get(referrer) || 0) + 1;
    shortLink.analytics.referrers.set(referrer, referrerCount);

    // For browser
    const browserCount = (shortLink.analytics?.browsers?.get(browser) || 0) + 1;
    shortLink.analytics.browsers.set(browser, browserCount);

    // For device
    const deviceCount = (shortLink.analytics?.devices?.get(device) || 0) + 1;
    shortLink.analytics.devices.set(device, deviceCount);

    // For clicks by date
    const dateCount = (shortLink.analytics?.clicksByDate?.get(today) || 0) + 1;
    shortLink.analytics.clicksByDate.set(today, dateCount);

    // Increment click count
    shortLink.clicks += 1;

    // Save the updated document
    await shortLink.save();

    // Redirect to the original URL
    return NextResponse.redirect(shortLink.originalUrl);
  } catch (error) {
    console.error('Error redirecting to original URL:', error);
    return NextResponse.redirect(new URL('/?error=server', req.url));
  }
}
