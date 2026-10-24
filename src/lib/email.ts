import nodemailer from 'nodemailer';

const SMTP_HOST = process.env.SMTP_HOST || 'smtp.mailtrap.io';
const SMTP_PORT = Number(process.env.SMTP_PORT) || 2525;
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@escortvilla.com';

// Create Nodemailer transporter
function getTransporter() {
  if (SMTP_USER && SMTP_PASS && SMTP_USER !== 'smtp-username') {
    return nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });
  }
  return null;
}

const EMAIL_WRAPPER = (content: string, title: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0B070E; color: #FFFFFF; margin: 0; padding: 40px 20px; }
    .container { max-width: 600px; margin: 0 auto; background: linear-gradient(145deg, #1A0D1A 0%, #120914 100%); border-radius: 16px; border: 1px solid rgba(217, 22, 128, 0.3); overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
    .header { background: linear-gradient(135deg, #D91680 0%, #4B1248 100%); padding: 32px; text-align: center; }
    .logo { font-size: 24px; font-weight: 700; letter-spacing: 2px; color: #FFFFFF; text-transform: uppercase; margin: 0; }
    .tagline { font-size: 11px; letter-spacing: 3px; color: #FDEEF4; text-transform: uppercase; margin-top: 6px; opacity: 0.9; }
    .body { padding: 36px 32px; color: #E5E5E5; line-height: 1.6; font-size: 15px; }
    .footer { padding: 24px 32px; border-top: 1px solid rgba(255,255,255,0.08); font-size: 12px; color: #8E8E93; text-align: center; background: #0E0710; }
    .btn { display: inline-block; background: linear-gradient(135deg, #D91680 0%, #E62044 100%); color: #FFFFFF !important; text-decoration: none; padding: 14px 28px; border-radius: 9999px; font-weight: 600; font-size: 14px; margin-top: 20px; letter-spacing: 0.5px; }
    .info-card { background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(217, 22, 128, 0.2); border-radius: 12px; padding: 20px; margin: 20px 0; }
    .info-row { margin-bottom: 8px; font-size: 14px; }
    .label { color: #F8B1D2; font-weight: 600; }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; background: rgba(217,22,128,0.2); color: #EB4495; border: 1px solid rgba(217,22,128,0.4); }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 class="logo">EscortVilla</h1>
      <div class="tagline">Exclusive Event & Travel Companionship</div>
    </div>
    <div class="body">
      ${content}
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} EscortVilla Concierge Services. All rights reserved.</p>
      <p>Discreet, Verified & Professional Companionship Directory.</p>
    </div>
  </div>
</body>
</html>
`;

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<boolean> {
  const transporter = getTransporter();

  if (!transporter) {
    console.log('\n================== [MOCK NODEMAILER DISPATCH] ==================');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Timestamp: ${new Date().toISOString()}`);
    console.log('Status: Dispatched via Development Mock Transport (Configure SMTP in .env for live transmission)');
    console.log('=================================================================\n');
    return true;
  }

  try {
    const info = await transporter.sendMail({
      from: `"EscortVilla Concierge" <no-reply@escortvilla.com>`,
      to,
      subject,
      html,
    });
    console.log(`[Email Service] Sent email to ${to}: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`[Email Service] Failed to send email to ${to}`, error);
    return false;
  }
}

/**
 * 1. Alert SuperAdmin when a new editor registers
 */
export async function sendAdminNewEditorAlert(editorData: {
  id: string;
  name: string;
  email: string;
  agencyOrBio?: string;
}) {
  const html = EMAIL_WRAPPER(`
    <h2 style="color: #FFFFFF; margin-top: 0;">New Editor Registration Pending Review</h2>
    <p>A new agency editor has submitted an application to manage listings on the EscortVilla Directory.</p>
    
    <div class="info-card">
      <div class="info-row"><span class="label">Full Name:</span> ${editorData.name}</div>
      <div class="info-row"><span class="label">Email:</span> ${editorData.email}</div>
      <div class="info-row"><span class="label">Status:</span> <span class="badge">PENDING APPROVAL</span></div>
      ${editorData.agencyOrBio ? `<div class="info-row" style="margin-top: 10px;"><span class="label">Statement / Background:</span><br/>${editorData.agencyOrBio}</div>` : ''}
    </div>

    <p>Please log in to the SuperAdmin portal to verify their credentials and grant publishing privileges.</p>

    <div style="text-align: center;">
      <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/admin/super" class="btn">Open SuperAdmin Dashboard</a>
    </div>
  `, 'New Editor Registration Pending Review');

  return sendEmail({
    to: ADMIN_EMAIL,
    subject: `[EscortVilla Admin] New Editor Registration: ${editorData.name}`,
    html,
  });
}

/**
 * 2. Alert Editor that their account was approved by SuperAdmin
 */
export async function sendEditorApprovedEmail(editorEmail: string, editorName: string) {
  const html = EMAIL_WRAPPER(`
    <h2 style="color: #FFFFFF; margin-top: 0;">Welcome to EscortVilla, ${editorName}</h2>
    <p>Your editor credentials have been officially approved by the EscortVilla SuperAdmin Director. You are now authorized to curate, submit, and manage companion listings on the EscortVilla platform.</p>

    <div class="info-card">
      <div class="info-row"><span class="label">Account Status:</span> <span class="badge" style="background: rgba(34,197,94,0.2); color: #4ade80; border-color: rgba(34,197,94,0.4);">ACTIVE & VERIFIED</span></div>
      <div class="info-row"><span class="label">Assigned Role:</span> Directory Editor</div>
      <div class="info-row"><span class="label">Access Scope:</span> Multi-City Companion Curation</div>
    </div>

    <p>You can now sign in to your Editor Portal and begin submitting candidate profiles for gala dinners, corporate summits, and international travel.</p>

    <div style="text-align: center;">
      <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/admin/editor" class="btn">Access Editor Portal</a>
    </div>
  `, 'Your EscortVilla Editor Account Is Active');

  return sendEmail({
    to: editorEmail,
    subject: 'Welcome to EscortVilla — Your Editor Account Is Approved',
    html,
  });
}

/**
 * 3. Alert Editor regarding status change on their listing
 */
export async function sendListingStatusEmail(
  editorEmail: string,
  listingTitle: string,
  status: 'PUBLISHED' | 'PENDING_REVIEW' | 'DRAFT' | 'ARCHIVED',
  comments?: string
) {
  const isApproved = status === 'PUBLISHED';
  const badgeColor = isApproved
    ? 'background: rgba(34,197,94,0.2); color: #4ade80; border-color: rgba(34,197,94,0.4);'
    : 'background: rgba(234,179,8,0.2); color: #facc15; border-color: rgba(234,179,8,0.4);';

  const html = EMAIL_WRAPPER(`
    <h2 style="color: #FFFFFF; margin-top: 0;">Listing Status Update</h2>
    <p>The moderation status of your companion listing has been updated by the EscortVilla Directory Board.</p>

    <div class="info-card">
      <div class="info-row"><span class="label">Listing Name:</span> ${listingTitle}</div>
      <div class="info-row"><span class="label">New Status:</span> <span class="badge" style="${badgeColor}">${status}</span></div>
      ${comments ? `<div class="info-row" style="margin-top: 10px;"><span class="label">Moderator Note:</span><br/>${comments}</div>` : ''}
    </div>

    ${isApproved ? '<p>This listing is now live on the public city directory and searchable by clients worldwide with on-demand static caching enabled.</p>' : '<p>Please review the moderation notes in your editor portal.</p>'}

    <div style="text-align: center;">
      <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/admin/editor" class="btn">View Editor Dashboard</a>
    </div>
  `, `Listing Status: ${status}`);

  return sendEmail({
    to: editorEmail,
    subject: `[EscortVilla Directory] Listing Update: ${listingTitle} is ${status}`,
    html,
  });
}

/**
 * 4. Alert Admin and Client when an inquiry/booking is submitted
 */
export async function sendInquiryNotification(inquiryData: {
  id: string;
  name: string;
  email: string;
  phone: string;
  targetCity: string;
  companionName?: string;
  eventDate: string | Date;
  message: string;
}) {
  const formattedDate = new Date(inquiryData.eventDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // 4a. Admin Notification
  const adminHtml = EMAIL_WRAPPER(`
    <h2 style="color: #FFFFFF; margin-top: 0;">New VIP Concierge Inquiry Received</h2>
    <p>A new client booking request has been submitted through EscortVilla.</p>

    <div class="info-card">
      <div class="info-row"><span class="label">Client Name:</span> ${inquiryData.name}</div>
      <div class="info-row"><span class="label">Client Email:</span> ${inquiryData.email}</div>
      <div class="info-row"><span class="label">Phone / WhatsApp:</span> ${inquiryData.phone}</div>
      <div class="info-row"><span class="label">Target City:</span> ${inquiryData.targetCity}</div>
      <div class="info-row"><span class="label">Requested Companion:</span> ${inquiryData.companionName || 'General Directory Concierge'}</div>
      <div class="info-row"><span class="label">Event Date:</span> ${formattedDate}</div>
      <div class="info-row" style="margin-top: 10px;"><span class="label">Client Message:</span><br/>${inquiryData.message}</div>
    </div>

    <div style="text-align: center;">
      <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/admin/super" class="btn">Manage in SuperAdmin Inbox</a>
    </div>
  `, 'New VIP Concierge Inquiry');

  await sendEmail({
    to: ADMIN_EMAIL,
    subject: `[VIP Inquiry] ${inquiryData.name} for ${inquiryData.targetCity} (${inquiryData.companionName || 'Concierge Match'})`,
    html: adminHtml,
  });

  // 4b. Client Confirmation
  const clientHtml = EMAIL_WRAPPER(`
    <h2 style="color: #FFFFFF; margin-top: 0;">Your Concierge Request Has Been Received</h2>
    <p>Dear ${inquiryData.name},</p>
    <p>Thank you for contacting the EscortVilla Concierge. We have discreetly registered your inquiry for companionship services in <strong>${inquiryData.targetCity}</strong>.</p>

    <div class="info-card">
      <div class="info-row"><span class="label">Reference ID:</span> #${inquiryData.id.slice(-8).toUpperCase()}</div>
      <div class="info-row"><span class="label">Target City:</span> ${inquiryData.targetCity}</div>
      <div class="info-row"><span class="label">Event Date:</span> ${formattedDate}</div>
      ${inquiryData.companionName ? `<div class="info-row"><span class="label">Requested Host:</span> ${inquiryData.companionName}</div>` : ''}
      <div class="info-row"><span class="label">Current Status:</span> <span class="badge">CONCIERGE REVIEW</span></div>
    </div>

    <p>Our private concierge protocol team will contact you via your preferred communication channel within 2 to 4 business hours to finalize arrangements with complete discretion.</p>
  `, 'EscortVilla Concierge Inquiry Confirmation');

  await sendEmail({
    to: inquiryData.email,
    subject: `EscortVilla — Booking Inquiry Confirmation (#${inquiryData.id.slice(-8).toUpperCase()})`,
    html: clientHtml,
  });

  return true;
}
