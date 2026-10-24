import { NextRequest, NextResponse } from 'next/server';
import { createInquiry, getInquiries, getListingById } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { sendInquiryNotification } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, targetCity, listingId, eventDate, message } = body;

    if (!name || !email || !phone || !targetCity || !eventDate || !message) {
      return NextResponse.json(
        { error: 'All fields (name, email, phone, targetCity, eventDate, message) are required' },
        { status: 400 }
      );
    }

    let companionName = undefined;
    if (listingId) {
      const listing = await getListingById(listingId);
      if (listing) {
        companionName = listing.fullName;
      }
    }

    const newInquiry = await createInquiry({
      name,
      email,
      phone,
      targetCity,
      listingId: listingId || null,
      eventDate,
      message,
    });

    // Send confirmation emails to both client and admin
    await sendInquiryNotification({
      id: newInquiry.id,
      name,
      email,
      phone,
      targetCity,
      companionName,
      eventDate,
      message,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Your inquiry has been discreetly registered with our concierge team.',
        inquiry: newInquiry,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Inquiry submission error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const authCheck = requireAuth(request, ['SUPER_ADMIN']);
  if ('errorResponse' in authCheck) return authCheck.errorResponse;

  try {
    const inquiries = await getInquiries();
    return NextResponse.json({ success: true, count: inquiries.length, inquiries });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
