import { NextRequest, NextResponse } from 'next/server';
import { updateInquiryStatus } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authCheck = requireAuth(request, ['SUPER_ADMIN']);
  if ('errorResponse' in authCheck) return authCheck.errorResponse;

  try {
    const body = await request.json();
    const { status } = body;

    if (!['NEW', 'CONTACTED', 'RESOLVED'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be NEW, CONTACTED, or RESOLVED' },
        { status: 400 }
      );
    }

    const updated = await updateInquiryStatus(params.id, status);
    if (!updated) {
      return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, inquiry: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
