import fs from 'fs';
import path from 'path';
import prisma from './prisma';
import { SEED_CITIES, SEED_INQUIRIES, SEED_LISTINGS, SEED_USERS } from './data';
import { City, CompanionListing, Inquiry, InquiryStatus, ListingStatus, Role, User, UserStatus } from './types';

interface DatabaseStore {
  users: User[];
  cities: City[];
  listings: CompanionListing[];
  inquiries: Inquiry[];
}

const DATA_DIR = path.join(process.cwd(), '.data');
const DATA_FILE = path.join(DATA_DIR, 'store.json');

import net from 'net';

// Memory cache
let inMemoryStore: DatabaseStore | null = null;
let isPostgresAvailable: boolean | null = null;

function probePort(host: string, port: number, timeoutMs = 80): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(timeoutMs);
    socket.once('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.once('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.once('error', () => {
      socket.destroy();
      resolve(false);
    });
    socket.connect(port, host);
  });
}

// Test if PostgreSQL via Prisma is reachable
async function checkPostgres(): Promise<boolean> {
  if (isPostgresAvailable !== null) return isPostgresAvailable;

  const dbUrl = process.env.DATABASE_URL || '';
  if (!dbUrl || dbUrl.includes('localhost:5432') || dbUrl.includes('127.0.0.1:5432')) {
    const isOpen = await probePort('127.0.0.1', 5432, 60);
    if (!isOpen) {
      isPostgresAvailable = false;
      return false;
    }
  }

  try {
    await prisma.$queryRaw`SELECT 1`;
    isPostgresAvailable = true;
    console.log('[Database] Connected to PostgreSQL via Prisma');
    return true;
  } catch (err) {
    isPostgresAvailable = false;
    return false;
  }
}

function loadLocalStore(): DatabaseStore {
  if (inMemoryStore) return inMemoryStore;

  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      inMemoryStore = JSON.parse(content);
      return inMemoryStore!;
    }
  } catch (err) {
    console.warn('[Database] Failed to read store file, falling back to seed data', err);
  }

  inMemoryStore = {
    users: [...SEED_USERS],
    cities: [...SEED_CITIES],
    listings: [...SEED_LISTINGS],
    inquiries: [...SEED_INQUIRIES],
  };

  saveLocalStore();
  return inMemoryStore;
}

function saveLocalStore() {
  if (!inMemoryStore) return;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(inMemoryStore, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[Database] Failed to save local store file', err);
  }
}

// -------------------------------------------------------------
// UNIFIED DATA ACCESS METHODS
// -------------------------------------------------------------

export async function getCities(options?: { onlyActive?: boolean }): Promise<City[]> {
  const usePg = await checkPostgres();
  if (usePg) {
    try {
      const cities = await prisma.city.findMany({
        where: options?.onlyActive ? { isActive: true } : undefined,
        orderBy: { name: 'asc' },
      });
      return cities.map(c => ({
        ...c,
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.updatedAt.toISOString(),
      }));
    } catch (err) {
      console.warn('[Database] Prisma city query error, falling back to local store', err);
    }
  }

  const store = loadLocalStore();
  let result = store.cities;
  if (options?.onlyActive) {
    result = result.filter(c => c.isActive);
  }
  return result;
}

export async function getCityBySlug(slug?: string): Promise<City | null> {
  if (!slug) return null;
  const usePg = await checkPostgres();
  if (usePg) {
    try {
      const city = await prisma.city.findUnique({ where: { slug: slug.toLowerCase() } });
      if (city) {
        return {
          ...city,
          createdAt: city.createdAt.toISOString(),
          updatedAt: city.updatedAt.toISOString(),
        };
      }
      return null;
    } catch (err) {
      console.warn('[Database] Prisma getCityBySlug error', err);
    }
  }

  const store = loadLocalStore();
  const searchSlug = slug.toLowerCase();
  return store.cities.find(c => c.slug && c.slug.toLowerCase() === searchSlug) || null;
}

export async function createCity(data: {
  name: string;
  slug: string;
  stateOrCountry: string;
  heroImage: string;
  isActive?: boolean;
}): Promise<City> {
  const usePg = await checkPostgres();
  if (usePg) {
    try {
      const created = await prisma.city.create({
        data: {
          name: data.name,
          slug: data.slug.toLowerCase(),
          stateOrCountry: data.stateOrCountry,
          heroImage: data.heroImage,
          isActive: data.isActive ?? true,
        },
      });
      return {
        ...created,
        createdAt: created.createdAt.toISOString(),
        updatedAt: created.updatedAt.toISOString(),
      };
    } catch (err) {
      console.warn('[Database] Prisma createCity error', err);
    }
  }

  const store = loadLocalStore();
  const newCity: City = {
    id: `city-${Date.now()}`,
    name: data.name,
    slug: data.slug.toLowerCase(),
    stateOrCountry: data.stateOrCountry,
    heroImage: data.heroImage,
    isActive: data.isActive ?? true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  store.cities.push(newCity);
  saveLocalStore();
  return newCity;
}

export async function updateCity(
  id: string,
  data: Partial<Omit<City, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<City | null> {
  const usePg = await checkPostgres();
  if (usePg) {
    try {
      const updated = await prisma.city.update({
        where: { id },
        data: {
          ...data,
          slug: data.slug ? data.slug.toLowerCase() : undefined,
        },
      });
      return {
        ...updated,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
      };
    } catch (err) {
      console.warn('[Database] Prisma updateCity error', err);
    }
  }

  const store = loadLocalStore();
  const idx = store.cities.findIndex(c => c.id === id);
  if (idx === -1) return null;
  store.cities[idx] = {
    ...store.cities[idx],
    ...data,
    slug: data.slug ? data.slug.toLowerCase() : store.cities[idx].slug,
    updatedAt: new Date().toISOString(),
  };
  saveLocalStore();
  return store.cities[idx];
}

// -------------------------------------------------------------
// LISTINGS
// -------------------------------------------------------------

export interface GetListingsFilter {
  citySlug?: string;
  status?: ListingStatus | 'ALL';
  service?: string;
  language?: string;
  minRate?: number;
  maxRate?: number;
  availability?: string;
  search?: string;
  editorId?: string;
}

export async function getListings(filter: GetListingsFilter = {}): Promise<CompanionListing[]> {
  const usePg = await checkPostgres();
  if (usePg) {
    try {
      const where: any = {};
      if (filter.citySlug && filter.citySlug !== 'all') {
        where.citySlug = filter.citySlug.toLowerCase();
      }
      if (filter.status && filter.status !== 'ALL') {
        where.status = filter.status;
      }
      if (filter.editorId) {
        where.editorId = filter.editorId;
      }
      if (filter.availability && filter.availability !== 'ALL') {
        where.availability = filter.availability;
      }
      if (filter.minRate || filter.maxRate) {
        where.hourlyRate = {};
        if (filter.minRate) where.hourlyRate.gte = filter.minRate;
        if (filter.maxRate) where.hourlyRate.lte = filter.maxRate;
      }
      if (filter.service && filter.service !== 'ALL') {
        where.services = { has: filter.service };
      }
      if (filter.language && filter.language !== 'ALL') {
        where.languages = { has: filter.language };
      }

      const listings = await prisma.companionListing.findMany({
        where,
        include: {
          city: true,
          editor: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      let results: CompanionListing[] = listings.map(l => ({
        ...l,
        createdAt: l.createdAt.toISOString(),
        updatedAt: l.updatedAt.toISOString(),
      }));

      if (filter.search) {
        const q = filter.search.toLowerCase();
        results = results.filter(
          l =>
            l.fullName.toLowerCase().includes(q) ||
            l.headline.toLowerCase().includes(q) ||
            l.bio.toLowerCase().includes(q)
        );
      }

      return results;
    } catch (err) {
      console.warn('[Database] Prisma getListings error', err);
    }
  }

  const store = loadLocalStore();
  let result = [...store.listings];

  if (filter.citySlug && filter.citySlug !== 'all') {
    result = result.filter(l => l.citySlug.toLowerCase() === filter.citySlug!.toLowerCase());
  }

  if (filter.status && filter.status !== 'ALL') {
    result = result.filter(l => l.status === filter.status);
  }

  if (filter.editorId) {
    result = result.filter(l => l.editorId === filter.editorId);
  }

  if (filter.availability && filter.availability !== 'ALL') {
    result = result.filter(l => l.availability === filter.availability);
  }

  if (filter.service && filter.service !== 'ALL') {
    result = result.filter(l => l.services.includes(filter.service!));
  }

  if (filter.language && filter.language !== 'ALL') {
    result = result.filter(l => l.languages.includes(filter.language!));
  }

  if (filter.minRate !== undefined) {
    result = result.filter(l => l.hourlyRate >= filter.minRate!);
  }

  if (filter.maxRate !== undefined) {
    result = result.filter(l => l.hourlyRate <= filter.maxRate!);
  }

  if (filter.search) {
    const q = filter.search.toLowerCase();
    result = result.filter(
      l =>
        l.fullName.toLowerCase().includes(q) ||
        l.headline.toLowerCase().includes(q) ||
        l.bio.toLowerCase().includes(q)
    );
  }

  // Populate city and editor references if needed
  result = result.map(l => ({
    ...l,
    city: store.cities.find(c => c.id === l.cityId || c.slug === l.citySlug),
    editor: store.users
      .filter(u => u.id === l.editorId)
      .map(u => ({ id: u.id, name: u.name, email: u.email }))[0],
  }));

  return result;
}

export async function getListingById(id: string): Promise<CompanionListing | null> {
  const usePg = await checkPostgres();
  if (usePg) {
    try {
      const listing = await prisma.companionListing.findUnique({
        where: { id },
        include: {
          city: true,
          editor: {
            select: { id: true, name: true, email: true },
          },
        },
      });
      if (listing) {
        return {
          ...listing,
          createdAt: listing.createdAt.toISOString(),
          updatedAt: listing.updatedAt.toISOString(),
        };
      }
      return null;
    } catch (err) {
      console.warn('[Database] Prisma getListingById error', err);
    }
  }

  const store = loadLocalStore();
  const listing = store.listings.find(l => l.id === id);
  if (!listing) return null;

  return {
    ...listing,
    city: store.cities.find(c => c.id === listing.cityId || c.slug === listing.citySlug),
    editor: store.users
      .filter(u => u.id === listing.editorId)
      .map(u => ({ id: u.id, name: u.name, email: u.email }))[0],
  };
}

export async function createListing(data: Omit<CompanionListing, 'id' | 'createdAt' | 'updatedAt'>): Promise<CompanionListing> {
  const usePg = await checkPostgres();
  if (usePg) {
    try {
      const created = await prisma.companionListing.create({
        data: {
          editorId: data.editorId,
          fullName: data.fullName,
          headline: data.headline,
          cityId: data.cityId,
          citySlug: data.citySlug.toLowerCase(),
          languages: data.languages,
          services: data.services,
          hourlyRate: Number(data.hourlyRate),
          dailyRate: Number(data.dailyRate),
          currency: data.currency || 'USD',
          whatsapp: data.whatsapp || null,
          availability: data.availability as any,
          bio: data.bio,
          images: data.images,
          status: data.status as any,
          verificationBadge: data.verificationBadge ?? false,
        },
        include: { city: true },
      });
      return {
        ...created,
        createdAt: created.createdAt.toISOString(),
        updatedAt: created.updatedAt.toISOString(),
      };
    } catch (err) {
      console.warn('[Database] Prisma createListing error', err);
    }
  }

  const store = loadLocalStore();
  const newListing: CompanionListing = {
    ...data,
    id: `comp-${Date.now()}`,
    citySlug: data.citySlug.toLowerCase(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  store.listings.unshift(newListing);
  saveLocalStore();
  return newListing;
}

export async function updateListing(
  id: string,
  data: Partial<Omit<CompanionListing, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<CompanionListing | null> {
  const usePg = await checkPostgres();
  if (usePg) {
    try {
      const { city: _c, editor: _e, ...cleanData } = data as any;
      const updatePayload: any = {
        ...cleanData,
      };
      if (data.hourlyRate !== undefined) updatePayload.hourlyRate = Number(data.hourlyRate);
      if (data.dailyRate !== undefined) updatePayload.dailyRate = Number(data.dailyRate);
      if (data.citySlug) updatePayload.citySlug = data.citySlug.toLowerCase();

      const updated = await prisma.companionListing.update({
        where: { id },
        data: updatePayload,
        include: { city: true },
      });
      return {
        ...updated,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
      };
    } catch (err) {
      console.warn('[Database] Prisma updateListing error', err);
    }
  }

  const store = loadLocalStore();
  const idx = store.listings.findIndex(l => l.id === id);
  if (idx === -1) return null;

  store.listings[idx] = {
    ...store.listings[idx],
    ...data,
    updatedAt: new Date().toISOString(),
  };
  saveLocalStore();
  return store.listings[idx];
}

export async function deleteListing(id: string): Promise<boolean> {
  const usePg = await checkPostgres();
  if (usePg) {
    try {
      await prisma.companionListing.delete({ where: { id } });
      return true;
    } catch (err) {
      console.warn('[Database] Prisma deleteListing error', err);
    }
  }

  const store = loadLocalStore();
  const initialLen = store.listings.length;
  store.listings = store.listings.filter(l => l.id !== id);
  saveLocalStore();
  return store.listings.length < initialLen;
}

// -------------------------------------------------------------
// USERS & AUTH
// -------------------------------------------------------------

export async function getUserByEmail(email: string): Promise<User | null> {
  const normalized = email.toLowerCase().trim();
  const usePg = await checkPostgres();
  if (usePg) {
    try {
      const user = await prisma.user.findUnique({ where: { email: normalized } });
      if (user) {
        return {
          ...user,
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString(),
        };
      }
      return null;
    } catch (err) {
      console.warn('[Database] Prisma getUserByEmail error', err);
    }
  }

  const store = loadLocalStore();
  return store.users.find(u => u.email.toLowerCase() === normalized) || null;
}

export async function getUserById(id: string): Promise<User | null> {
  const usePg = await checkPostgres();
  if (usePg) {
    try {
      const user = await prisma.user.findUnique({ where: { id } });
      if (user) {
        return {
          ...user,
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString(),
        };
      }
      return null;
    } catch (err) {
      console.warn('[Database] Prisma getUserById error', err);
    }
  }

  const store = loadLocalStore();
  return store.users.find(u => u.id === id) || null;
}

export async function createUser(data: {
  name: string;
  email: string;
  passwordHash: string;
  role?: Role;
  status?: UserStatus;
}): Promise<User> {
  const normalized = data.email.toLowerCase().trim();
  const usePg = await checkPostgres();
  if (usePg) {
    try {
      const created = await prisma.user.create({
        data: {
          name: data.name,
          email: normalized,
          passwordHash: data.passwordHash,
          role: data.role || 'EDITOR',
          status: data.status || 'PENDING_APPROVAL',
        },
      });
      return {
        ...created,
        createdAt: created.createdAt.toISOString(),
        updatedAt: created.updatedAt.toISOString(),
      };
    } catch (err) {
      console.warn('[Database] Prisma createUser error', err);
    }
  }

  const store = loadLocalStore();
  const newUser: User = {
    id: `user-${Date.now()}`,
    name: data.name,
    email: normalized,
    passwordHash: data.passwordHash,
    role: data.role || 'EDITOR',
    status: data.status || 'PENDING_APPROVAL',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  store.users.push(newUser);
  saveLocalStore();
  return newUser;
}

export async function getUsers(): Promise<User[]> {
  const usePg = await checkPostgres();
  if (usePg) {
    try {
      const users = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
      });
      return users.map(u => ({
        ...u,
        createdAt: u.createdAt.toISOString(),
        updatedAt: u.updatedAt.toISOString(),
      }));
    } catch (err) {
      console.warn('[Database] Prisma getUsers error', err);
    }
  }

  const store = loadLocalStore();
  return store.users;
}

export async function updateUserStatus(id: string, status: UserStatus): Promise<User | null> {
  const usePg = await checkPostgres();
  if (usePg) {
    try {
      const updated = await prisma.user.update({
        where: { id },
        data: { status },
      });
      return {
        ...updated,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
      };
    } catch (err) {
      console.warn('[Database] Prisma updateUserStatus error', err);
    }
  }

  const store = loadLocalStore();
  const idx = store.users.findIndex(u => u.id === id);
  if (idx === -1) return null;
  store.users[idx].status = status;
  store.users[idx].updatedAt = new Date().toISOString();
  saveLocalStore();
  return store.users[idx];
}

// -------------------------------------------------------------
// INQUIRIES
// -------------------------------------------------------------

export async function createInquiry(data: {
  name: string;
  email: string;
  phone: string;
  targetCity: string;
  listingId?: string | null;
  eventDate: Date | string;
  message: string;
}): Promise<Inquiry> {
  const usePg = await checkPostgres();
  if (usePg) {
    try {
      const created = await prisma.inquiry.create({
        data: {
          name: data.name,
          email: data.email,
          phone: data.phone,
          targetCity: data.targetCity,
          listingId: data.listingId || null,
          eventDate: new Date(data.eventDate),
          message: data.message,
          status: 'NEW',
        },
        include: {
          listing: {
            select: { id: true, fullName: true, headline: true },
          },
        },
      });
      return {
        ...created,
        eventDate: created.eventDate.toISOString(),
        createdAt: created.createdAt.toISOString(),
      };
    } catch (err) {
      console.warn('[Database] Prisma createInquiry error', err);
    }
  }

  const store = loadLocalStore();
  const newInq: Inquiry = {
    id: `inq-${Date.now()}`,
    name: data.name,
    email: data.email,
    phone: data.phone,
    targetCity: data.targetCity,
    listingId: data.listingId || null,
    eventDate: new Date(data.eventDate).toISOString(),
    message: data.message,
    status: 'NEW',
    createdAt: new Date().toISOString(),
  };
  if (data.listingId) {
    const listing = store.listings.find(l => l.id === data.listingId);
    if (listing) {
      newInq.listing = {
        id: listing.id,
        fullName: listing.fullName,
        headline: listing.headline,
      };
    }
  }
  store.inquiries.unshift(newInq);
  saveLocalStore();
  return newInq;
}

export async function getInquiries(): Promise<Inquiry[]> {
  const usePg = await checkPostgres();
  if (usePg) {
    try {
      const inquiries = await prisma.inquiry.findMany({
        include: {
          listing: {
            select: { id: true, fullName: true, headline: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
      return inquiries.map(i => ({
        ...i,
        eventDate: i.eventDate.toISOString(),
        createdAt: i.createdAt.toISOString(),
      }));
    } catch (err) {
      console.warn('[Database] Prisma getInquiries error', err);
    }
  }

  const store = loadLocalStore();
  return store.inquiries.map(i => {
    if (i.listingId && !i.listing) {
      const listing = store.listings.find(l => l.id === i.listingId);
      if (listing) {
        return {
          ...i,
          listing: {
            id: listing.id,
            fullName: listing.fullName,
            headline: listing.headline,
          },
        };
      }
    }
    return i;
  });
}

export async function updateInquiryStatus(id: string, status: InquiryStatus): Promise<Inquiry | null> {
  const usePg = await checkPostgres();
  if (usePg) {
    try {
      const updated = await prisma.inquiry.update({
        where: { id },
        data: { status },
      });
      return {
        ...updated,
        eventDate: updated.eventDate.toISOString(),
        createdAt: updated.createdAt.toISOString(),
      };
    } catch (err) {
      console.warn('[Database] Prisma updateInquiryStatus error', err);
    }
  }

  const store = loadLocalStore();
  const idx = store.inquiries.findIndex(i => i.id === id);
  if (idx === -1) return null;
  store.inquiries[idx].status = status;
  saveLocalStore();
  return store.inquiries[idx];
}

// -------------------------------------------------------------
// DASHBOARD STATS
// -------------------------------------------------------------

export async function getDashboardStats() {
  const listings = await getListings({ status: 'ALL' });
  const users = await getUsers();
  const inquiries = await getInquiries();
  const cities = await getCities();

  return {
    totalListings: listings.length,
    publishedListings: listings.filter(l => l.status === 'PUBLISHED').length,
    pendingListings: listings.filter(l => l.status === 'PENDING_REVIEW').length,
    draftListings: listings.filter(l => l.status === 'DRAFT').length,
    totalEditors: users.filter(u => u.role === 'EDITOR').length,
    pendingEditors: users.filter(u => u.role === 'EDITOR' && u.status === 'PENDING_APPROVAL').length,
    totalInquiries: inquiries.length,
    newInquiries: inquiries.filter(i => i.status === 'NEW').length,
    totalCities: cities.length,
  };
}
