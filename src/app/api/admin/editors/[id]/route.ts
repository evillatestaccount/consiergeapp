import { NextRequest, NextResponse } from 'next/server';
import { getUserById, updateUserStatus } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { sendEditorApprovedEmail } from '@/lib/email';
import { UserStatus } from '@/lib/types';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authCheck = requireAuth(request, ['SUPER_ADMIN']);
  if ('errorResponse' in authCheck) return authCheck.errorResponse;

  try {
    const body = await request.json();
    const { status } = body;

    if (!['ACTIVE', 'PENDING_APPROVAL', 'SUSPENDED'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be ACTIVE, PENDING_APPROVAL, or SUSPENDED' },
        { status: 400 }
      );
    }

    const existing = await getUserById(params.id);
    if (!existing) {
      return NextResponse.json({ error: 'Editor not found' }, { status: 404 });
    }

    const wasPending = existing.status === 'PENDING_APPROVAL';
    const isNowActive = status === 'ACTIVE';

    const updated = await updateUserStatus(params.id, status as UserStatus);

    // If approved from pending to active, trigger Nodemailer automated welcome email
    if (wasPending && isNowActive) {
      await sendEditorApprovedEmail(existing.email, existing.name);
    }

    return NextResponse.json({
      success: true,
      user: {
        id: updated!.id,
        name: updated!.name,
        email: updated!.email,
        role: updated!.role,
        status: updated!.status,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
