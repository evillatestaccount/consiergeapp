import { NextRequest, NextResponse } from 'next/server';
import { deleteListing, getListingById, getUserById, updateListing } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { sendListingStatusEmail } from '@/lib/email';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const listing = await getListingById(params.id);
    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, listing });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authCheck = requireAuth(request, ['SUPER_ADMIN', 'EDITOR']);
  if ('errorResponse' in authCheck) return authCheck.errorResponse;

  const { session } = authCheck;

  try {
    const existing = await getListingById(params.id);
    if (!existing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    // Role verification
    if (session.role === 'EDITOR' && existing.editorId !== session.userId) {
      return NextResponse.json(
        { error: 'Forbidden: You can only edit your own listings' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const updateData: any = { ...body };

    // Editors cannot directly set status to PUBLISHED
    if (session.role === 'EDITOR' && updateData.status === 'PUBLISHED') {
      updateData.status = 'PENDING_REVIEW';
    }

    // If SuperAdmin is approving to PUBLISHED
    const wasPublished = existing.status === 'PUBLISHED';
    const isNowPublished = updateData.status === 'PUBLISHED';

    if (isNowPublished) {
      updateData.verificationBadge = true;
    }

    const updated = await updateListing(params.id, updateData);

    if (updated) {
      // If newly published or updated published listing, trigger on-demand ISR revalidation
      if (isNowPublished || wasPublished) {
        try {
          revalidatePath(`/companions-in-${updated.citySlug}`);
          if (existing.citySlug !== updated.citySlug) {
            revalidatePath(`/companions-in-${existing.citySlug}`);
          }
          revalidatePath('/');
          revalidatePath(`/profile/${updated.id}`);
        } catch (e) {
          console.warn('Revalidation warning in patch:', e);
        }
      }

      // If status changed by SuperAdmin, notify editor via email
      if (session.role === 'SUPER_ADMIN' && updateData.status && updateData.status !== existing.status) {
        const editor = await getUserById(existing.editorId);
        if (editor) {
          await sendListingStatusEmail(
            editor.email,
            updated.fullName,
            updated.status as any,
            body.moderatorComment
          );
        }
      }
    }

    return NextResponse.json({ success: true, listing: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authCheck = requireAuth(request, ['SUPER_ADMIN', 'EDITOR']);
  if ('errorResponse' in authCheck) return authCheck.errorResponse;

  const { session } = authCheck;

  try {
    const existing = await getListingById(params.id);
    if (!existing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    if (session.role === 'EDITOR' && existing.editorId !== session.userId) {
      return NextResponse.json(
        { error: 'Forbidden: You can only delete your own listings' },
        { status: 403 }
      );
    }

    await deleteListing(params.id);

    try {
      revalidatePath(`/companions-in-${existing.citySlug}`);
      revalidatePath('/');
    } catch (e) {}

    return NextResponse.json({ success: true, message: 'Listing deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
