export type Role = 'SUPER_ADMIN' | 'EDITOR';
export type UserStatus = 'PENDING_APPROVAL' | 'ACTIVE' | 'SUSPENDED';
export type AvailabilityStatus = 'AVAILABLE' | 'WEEKENDS_ONLY' | 'BOOKED';
export type ListingStatus = 'DRAFT' | 'PENDING_REVIEW' | 'PUBLISHED' | 'ARCHIVED';
export type InquiryStatus = 'NEW' | 'CONTACTED' | 'RESOLVED';

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
  status: UserStatus;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface City {
  id: string;
  name: string;
  slug: string;
  stateOrCountry: string;
  heroImage: string;
  isActive: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface CompanionListing {
  id: string;
  editorId: string;
  editor?: {
    id: string;
    name: string;
    email: string;
  };
  fullName: string;
  headline: string;
  cityId: string;
  city?: City;
  citySlug: string;
  languages: string[];
  services: string[];
  hourlyRate: number;
  dailyRate: number;
  currency: string;
  whatsapp?: string | null;
  availability: AvailabilityStatus;
  bio: string;
  images: string[];
  status: ListingStatus;
  verificationBadge: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  targetCity: string;
  listingId?: string | null;
  listing?: {
    id: string;
    fullName: string;
    headline: string;
  } | null;
  eventDate: string | Date;
  message: string;
  status: InquiryStatus;
  createdAt: string | Date;
}

export interface AuthSession {
  userId: string;
  name: string;
  email: string;
  role: Role;
  status: UserStatus;
}
