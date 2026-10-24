import { NextRequest, NextResponse } from 'next/server';
import { updateCity } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authCheck = requireAuth(request, ['SUPER_ADMIN']);
  if ('errorResponse' in authCheck) return authCheck.errorResponse;

  try {
    const body = await request.json();
    const updated = await updateCity(params.id, body);

    if (!updated) {
      return NextResponse.json({ error: 'City not found' }, { status: 404 });
    }

    try {
      revalidatePath(`/companions-in-${updated.slug}`);
      revalidatePath('/');
    } catch (e) {}

    return NextResponse.json({ success: true, city: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
