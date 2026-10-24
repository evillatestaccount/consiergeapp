import { NextRequest, NextResponse } from 'next/server';
import { createListing, getListings } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { sendListingStatusEmail } from '@/lib/email';
import { getCityCurrencyConfig } from '@/lib/currency';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const citySlug = searchParams.get('citySlug') || undefined;
    const status = (searchParams.get('status') as any) || undefined;
    const service = searchParams.get('service') || undefined;
    const language = searchParams.get('language') || undefined;
    const availability = searchParams.get('availability') || undefined;
    const search = searchParams.get('search') || undefined;
    const editorId = searchParams.get('editorId') || undefined;

    const minRateStr = searchParams.get('minRate');
    const maxRateStr = searchParams.get('maxRate');
    const minRate = minRateStr ? parseFloat(minRateStr) : undefined;
    const maxRate = maxRateStr ? parseFloat(maxRateStr) : undefined;

    const listings = await getListings({
      citySlug,
      status,
      service,
      language,
      availability,
      search,
      editorId,
      minRate,
      maxRate,
    });

    return NextResponse.json({ success: true, count: listings.length, listings });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authCheck = requireAuth(request, ['SUPER_ADMIN', 'EDITOR']);
  if ('errorResponse' in authCheck) return authCheck.errorResponse;

  const { session } = authCheck;

  try {
    const body = await request.json();
    const {
      fullName,
      headline,
      cityId,
      citySlug,
      languages,
      services,
      hourlyRate,
      dailyRate,
      currency,
      whatsapp,
      availability,
      bio,
      images,
      status: requestedStatus,
    } = body;

    if (!fullName || !headline || !cityId || !citySlug || !bio) {
      return NextResponse.json(
        { error: 'Missing required listing fields: fullName, headline, cityId, citySlug, bio' },
        { status: 400 }
      );
    }

    // Determine status based on role
    let finalStatus: 'DRAFT' | 'PENDING_REVIEW' | 'PUBLISHED' = 'PENDING_REVIEW';
    if (session.role === 'SUPER_ADMIN') {
      finalStatus = requestedStatus || 'PUBLISHED';
    } else {
      // Editor can save as DRAFT or submit for PENDING_REVIEW
      finalStatus = requestedStatus === 'DRAFT' ? 'DRAFT' : 'PENDING_REVIEW';
    }

    const newListing = await createListing({
      editorId: session.userId,
      fullName,
      headline,
      cityId,
      citySlug: citySlug.toLowerCase(),
      languages: Array.isArray(languages) ? languages : ['English'],
      services: Array.isArray(services) ? services : ['Event Host'],
      hourlyRate: Number(hourlyRate) || 250,
      dailyRate: Number(dailyRate) || 1800,
      currency: currency || getCityCurrencyConfig(citySlug).currency,
      whatsapp: whatsapp ? String(whatsapp).trim() : undefined,
      availability: availability || 'AVAILABLE',
      bio,
      images: Array.isArray(images) && images.length > 0 ? images : [
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=900&q=80'
      ],
      status: finalStatus,
      verificationBadge: finalStatus === 'PUBLISHED',
    });

    if (finalStatus === 'PUBLISHED') {
      try {
        revalidatePath(`/companions-in-${newListing.citySlug}`);
        revalidatePath('/');
      } catch (e) {}
    }

    return NextResponse.json({ success: true, listing: newListing }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
