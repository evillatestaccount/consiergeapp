import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { SEED_CITIES, SEED_INQUIRIES, SEED_LISTINGS, SEED_USERS } from '../src/lib/data';

const prisma = new PrismaClient();

async function main() {
  console.log('✨ [EscortVilla Directory] Starting database seed...');

  // 1. Ensure local JSON fallback store is populated
  const dataDir = path.join(process.cwd(), '.data');
  const dataFile = path.join(dataDir, 'store.json');

  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const initialStore = {
    users: SEED_USERS,
    cities: SEED_CITIES,
    listings: SEED_LISTINGS,
    inquiries: SEED_INQUIRIES,
  };

  fs.writeFileSync(dataFile, JSON.stringify(initialStore, null, 2), 'utf-8');
  console.log(`✅ [Local Store] Synchronized ${dataFile} with seed records.`);

  // 2. Attempt PostgreSQL seed via Prisma if database is reachable
  try {
    console.log('🔄 Checking connection to PostgreSQL database...');
    await prisma.$queryRaw`SELECT 1`;
    console.log('📡 Connected to PostgreSQL database! Seeding Prisma tables...');

    // Seed Users
    for (const u of SEED_USERS) {
      await prisma.user.upsert({
        where: { email: u.email },
        update: {
          name: u.name,
          passwordHash: u.passwordHash,
          role: u.role as any,
          status: u.status as any,
        },
        create: {
          id: u.id,
          name: u.name,
          email: u.email,
          passwordHash: u.passwordHash,
          role: u.role as any,
          status: u.status as any,
        },
      });
    }
    console.log(`✅ Seeded ${SEED_USERS.length} Users (SuperAdmin & Editors) into PostgreSQL.`);

    // Seed Cities
    for (const c of SEED_CITIES) {
      await prisma.city.upsert({
        where: { slug: c.slug },
        update: {
          name: c.name,
          stateOrCountry: c.stateOrCountry,
          heroImage: c.heroImage,
          isActive: c.isActive,
        },
        create: {
          id: c.id,
          name: c.name,
          slug: c.slug,
          stateOrCountry: c.stateOrCountry,
          heroImage: c.heroImage,
          isActive: c.isActive,
        },
      });
    }
    console.log(`✅ Seeded ${SEED_CITIES.length} Cities into PostgreSQL.`);

    // Seed Listings
    for (const l of SEED_LISTINGS) {
      await prisma.companionListing.upsert({
        where: { id: l.id },
        update: {
          fullName: l.fullName,
          headline: l.headline,
          cityId: l.cityId,
          citySlug: l.citySlug,
          languages: l.languages,
          services: l.services,
          hourlyRate: l.hourlyRate,
          dailyRate: l.dailyRate,
          currency: l.currency,
          whatsapp: l.whatsapp || null,
          availability: l.availability as any,
          bio: l.bio,
          images: l.images,
          status: l.status as any,
          verificationBadge: l.verificationBadge,
        },
        create: {
          id: l.id,
          editorId: l.editorId,
          fullName: l.fullName,
          headline: l.headline,
          cityId: l.cityId,
          citySlug: l.citySlug,
          languages: l.languages,
          services: l.services,
          hourlyRate: l.hourlyRate,
          dailyRate: l.dailyRate,
          currency: l.currency,
          whatsapp: l.whatsapp || null,
          availability: l.availability as any,
          bio: l.bio,
          images: l.images,
          status: l.status as any,
          verificationBadge: l.verificationBadge,
        },
      });
    }
    console.log(`✅ Seeded ${SEED_LISTINGS.length} Companion Listings into PostgreSQL.`);

    // Seed Inquiries
    for (const i of SEED_INQUIRIES) {
      await prisma.inquiry.upsert({
        where: { id: i.id },
        update: {
          name: i.name,
          email: i.email,
          phone: i.phone,
          targetCity: i.targetCity,
          listingId: i.listingId || null,
          eventDate: new Date(i.eventDate),
          message: i.message,
          status: i.status as any,
        },
        create: {
          id: i.id,
          name: i.name,
          email: i.email,
          phone: i.phone,
          targetCity: i.targetCity,
          listingId: i.listingId || null,
          eventDate: new Date(i.eventDate),
          message: i.message,
          status: i.status as any,
        },
      });
    }
    console.log(`✅ Seeded ${SEED_INQUIRIES.length} Inquiries into PostgreSQL.`);
  } catch (err: any) {
    console.log(`ℹ️ [PostgreSQL Notice] PostgreSQL was not reachable (${err.message}).`);
    console.log('ℹ️ Application will seamlessly use the pre-seeded embedded store until a live PostgreSQL instance is configured.');
  } finally {
    await prisma.$disconnect();
  }

  console.log('\n🎉 Seed process completed successfully!');
  console.log('----------------------------------------------------');
  console.log('SuperAdmin Credentials:');
  console.log('  Email:    admin@auradirectory.com');
  console.log('  Password: AdminPass123!');
  console.log('Editor Credentials:');
  console.log('  Email:    sophia.editor@auradirectory.com');
  console.log('  Password: EditorPass123!');
  console.log('----------------------------------------------------\n');
}

main().catch(e => {
  console.error('Seed script error:', e);
  process.exit(1);
});
