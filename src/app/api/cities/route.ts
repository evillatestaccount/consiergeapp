import { NextRequest, NextResponse } from 'next/server';
import { createCity, getCities } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function GET(request: NextRequest) {
  try {
    const onlyActive = request.nextUrl.searchParams.get('onlyActive') === 'true';
    const cities = await getCities({ onlyActive });
    return NextResponse.json({ success: true, cities });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authCheck = requireAuth(request, ['SUPER_ADMIN']);
  if ('errorResponse' in authCheck) return authCheck.errorResponse;

  try {
    const body = await request.json();
    const { name, slug, stateOrCountry, heroImage, isActive } = body;

    if (!name || !slug || !stateOrCountry) {
      return NextResponse.json(
        { error: 'Name, slug, and stateOrCountry are required' },
        { status: 400 }
      );
    }

    const newCity = await createCity({
      name,
      slug: slug.toLowerCase().trim(),
      stateOrCountry,
      heroImage: heroImage || 'https://images.unsplash.com/photo-1477959858617-67f30bc75b82?auto=format&fit=crop&w=1600&q=80',
      isActive: isActive ?? true,
    });

    try {
      revalidatePath(`/companions-in-${newCity.slug}`);
      revalidatePath('/');
    } catch (e) {
      // Ignored if build
    }

    return NextResponse.json({ success: true, city: newCity }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
