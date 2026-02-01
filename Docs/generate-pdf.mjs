import { PDFDocument, rgb, StandardFonts, PageSizes, PDFName, PDFArray, PDFDict, PDFNumber } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const screenshotsDir = path.join(__dirname, 'screenshots');

// Brand colors
const NAVY = rgb(0.17, 0.24, 0.33);       // #2B3D54
const BLUE = rgb(0.25, 0.48, 0.73);       // #407ABB
const GRAY = rgb(0.45, 0.50, 0.55);       // #73808C
const LIGHT_GRAY = rgb(0.78, 0.80, 0.82); // #C7CDD1
const WHITE = rgb(1, 1, 1);
const LINK_BLUE = rgb(0.20, 0.47, 0.73);  // #3378BA

const PAGE_W = PageSizes.Letter[0]; // 612
const PAGE_H = PageSizes.Letter[1]; // 792
const MARGIN = 54; // 0.75 inch

// Correct slide-to-content mapping with logical ordering for a user guide
const slides = [
  {
    file: 'slide_01.png',
    title: 'Login Screen',
    desc: 'The branded login interface for Sports Media Charter. Users enter their email and password to access the platform. Options include SSO integration for enterprise organizations, password recovery via "Forgot password?", and a "Request Access" link for new users. Terms of Service and Privacy Policy links are provided at the bottom.'
  },
  {
    file: 'slide_02.png',
    title: 'Create Account',
    desc: 'New user registration screen. Requires Full Name, Email, and Password to create an account. Existing users can navigate back to the Sign In screen. Account creation is typically initiated by an organization administrator who provides access.'
  },
  {
    file: 'slide_03.png',
    title: 'Dashboard - Home Screen',
    desc: 'The main dashboard provides an at-a-glance overview of your charter activity. Key metrics display Active Requests (3), Pending Quotes (2), and Upcoming Flights (1). Quick Actions offer shortcuts to New Request, View Quotes, My Trips, and Team management. The Upcoming Flight card shows route, date, aircraft type, and confirmation status. The Recent Activity feed tracks quotes, submissions, and booking confirmations.'
  },
  {
    file: 'slide_13.png',
    title: 'Dashboard - Search Expanded',
    desc: 'The home screen with the global search bar activated. Users can search across requests, trips, and quotes from a single input field. The search persists over the dashboard layout, allowing quick navigation without leaving the home screen context.'
  },
  {
    file: 'slide_08.png',
    title: 'New Charter Request - One Way',
    desc: 'The primary booking form for one-way charter flights. Users select Trip Type (One Way is highlighted), then configure Flight Details including Departure Airport, Arrival Airport, Date, and Time. Passenger count is adjustable with +/- controls. Urgency Level options are Standard (48-72 hours notice), Urgent (24-48 hours), or Emergency (under 24 hours). Special Requirements can be noted before submitting the request for quotes.'
  },
  {
    file: 'slide_09.png',
    title: 'New Charter Request - Round Trip',
    desc: 'Round trip booking interface showing Leg 1 (outbound) and Leg 2 (return) sections. Each leg has independent departure/arrival airports, dates, and times, allowing flexibility for different routing on the return. Passenger count and urgency level apply to the entire trip.'
  },
  {
    file: 'slide_10.png',
    title: 'New Charter Request - Multi-Leg',
    desc: 'Complex itinerary builder for multi-leg trips. Supports two or more flight legs with an "Add Another Leg" button for dynamic leg addition. Each leg can be independently configured or removed. Ideal for tournament schedules, road trips, and multi-city travel arrangements common in professional sports.'
  },
  {
    file: 'slide_04.png',
    title: 'Airport Selection - Search Interface',
    desc: 'The airport search modal with filter tabs: All, Airport Code, City, and Airport Name. The search field accepts a minimum of 2 characters and returns matching airports from the global database. Results show IATA code, ICAO code, full airport name, and city/country location.'
  },
  {
    file: 'slide_05.png',
    title: 'Airport Selection - By Code (LAX)',
    desc: 'Demonstrates airport code search with the "Airport Code" filter active. Searching "lax" returns LAX (KLAX) - Los Angeles International Airport, Los Angeles, CA, USA. Code search is the fastest way to find a specific airport when the IATA code is known.'
  },
  {
    file: 'slide_06.png',
    title: 'Airport Selection - By City (Denver)',
    desc: 'City-based airport search with the "City" filter active. Typing "denver" returns DEN (KDEN) - Denver International Airport, Denver, CO, USA. City search is useful when users know the destination city but not the specific airport code.'
  },
  {
    file: 'slide_07.png',
    title: 'Airport Selection - By Airport Name',
    desc: 'Airport name search showing results for "van" with the "Airport Name" filter active. Returns Vancouver International (YVR), Van Nuys Airport (VNY - marked as Private), and Helsinki-Vantaa (HEL). Demonstrates flexible international search including private airports designated with a badge.'
  },
  {
    file: 'slide_11.png',
    title: 'Profile & Team Management',
    desc: 'User profile screen showing account details (Dan Kirkpatrick, Team Admin role), Company Information (Dallas Mavericks - NBA Team, home airport DFW), Company Contacts with Primary designation (Sarah Johnson - Travel Coordinator), and Authorized Personnel with role-based permission badges (Can Approve, Can Book). The Administration section at the bottom provides access to User Management for admin users.'
  },
  {
    file: 'slide_12.png',
    title: 'Edit Profile',
    desc: 'Profile editing form with fields for Full Name, Email Address, Phone Number, and Job Title. Includes a Change Photo option for updating the profile avatar, and a Security section with Change Password (showing last changed 30 days ago). Save Changes persists updates to the server.'
  },
  {
    file: 'slide_14.png',
    title: 'Billing & Payments',
    desc: 'Financial management screen displaying Outstanding Balance ($38,000.00) with a Pay Now action and 1 invoice pending. Payment Methods section shows saved cards (Visa as Default, Amex, Chase Business) with Add Payment Method option. Billing Information displays company details and tax ID. Recent Invoices list shows invoice numbers, routes, dates, amounts, and status indicators (Paid/Pending).'
  },
  {
    file: 'slide_18.png',
    title: 'Notifications Settings',
    desc: 'Granular notification preference controls with toggles for: Push Notifications (device alerts), Email Notifications, New Quotes (when quotes are received), Booking Updates (confirmations and changes), Flight Reminders (24 hours before departure), Approval Requests (when bookings need approval), and Marketing & Promotions. Critical booking notifications cannot be disabled.'
  },
  {
    file: 'slide_19.png',
    title: 'Security & Privacy',
    desc: 'Security settings panel organized into sections: Password (Change Password with last-changed date), Authentication (Biometric Login toggle, Two-Factor Authentication), Security Alerts (New Login Alerts), Active Sessions (showing iPhone 15 Pro as Current, MacBook Pro, iPad Air with End session options), Privacy (Download My Data, Privacy Policy link), and Danger Zone (Delete Account). Includes security team contact information.'
  },
  {
    file: 'slide_15.png',
    title: 'Help & Support',
    desc: 'Support hub with a search bar, Contact Us options (Call 24/7 Support Line, Email charter@sportsmedia.net, Live Chat), Frequently Asked Questions covering common topics, and Resources linking to User Guide, Video Tutorials, Terms of Service, and Privacy Policy. Includes a feedback submission section.'
  },
  {
    file: 'slide_20.png',
    title: 'User Guide',
    desc: 'Comprehensive in-app documentation with expandable sections: Getting Started (sign-in instructions, home screen overview, navigation guide), Requesting a Charter, Reviewing Quotes, Managing Bookings, Billing & Payments, Notifications, Team Management, Security & Privacy, and Messaging Your Broker. Each section provides step-by-step instructions.'
  },
  {
    file: 'slide_16.png',
    title: 'Terms of Service',
    desc: 'Sports Media Charter Terms of Service (effective January 1, 2026) with 12 expandable sections: Agreement to Terms (shown expanded), Service Description, User Accounts & Responsibilities, Booking Terms & Conditions, Copyright & Intellectual Property, Trademark Notice, Limitation of Liability, Indemnification, Disclaimers, Governing Law & Disputes, Termination, and Modifications to Terms.'
  },
  {
    file: 'slide_17.png',
    title: 'Privacy Policy',
    desc: 'Sports Media Charter Privacy Policy (effective January 1, 2026) with 13+ sections covering: Introduction (shown expanded with website URL travel.sportsmedia.net), Information We Collect, How We Use Your Information, Information Sharing & Disclosure, Data Security, Two-Factor Authentication Policy, Your Privacy Rights, Download Your Data, Account Deletion, Data Retention, Children\'s Privacy, International Data Transfers, and Changes to This Policy.'
  },
];

async function generatePDF() {
  const pdfDoc = await PDFDocument.create();
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const helveticaOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  // Helper: add an internal link annotation to a page
  function addInternalLink(page, targetPage, x, y, width, height) {
    const context = pdfDoc.context;
    const annot = context.obj({
      Type: 'Annot',
      Subtype: 'Link',
      Rect: [x, y, x + width, y + height],
      Border: [0, 0, 0],
      C: [0, 0, 0],
      Dest: [targetPage.ref, PDFName.of('Fit')],
    });
    const existingAnnots = page.node.lookup(PDFName.of('Annots'));
    if (existingAnnots instanceof PDFArray) {
      existingAnnots.push(context.register(annot));
    } else {
      page.node.set(PDFName.of('Annots'), context.obj([context.register(annot)]));
    }
  }

  // Helper: draw footer on a page
  function drawFooter(page, pageNum, includeTocLink = true) {
    const y = 36;
    // Horizontal line
    page.drawLine({
      start: { x: MARGIN, y: y + 14 },
      end: { x: PAGE_W - MARGIN, y: y + 14 },
      thickness: 0.5,
      color: LIGHT_GRAY,
    });
    // Left: contact info
    page.drawText('Dan Kost  |  danK@sportsmedia.net  |  970-436-0580', {
      x: MARGIN,
      y: y,
      size: 8,
      font: helvetica,
      color: GRAY,
    });
    // Right: page number
    const pageText = `Page ${pageNum}`;
    const pageTextWidth = helvetica.widthOfTextAtSize(pageText, 8);
    page.drawText(pageText, {
      x: PAGE_W - MARGIN - pageTextWidth,
      y: y,
      size: 8,
      font: helvetica,
      color: GRAY,
    });
    // Center: Back to Table of Contents (above the line, not overlapping)
    if (includeTocLink) {
      const tocText = 'Back to Table of Contents';
      const tocWidth = helvetica.widthOfTextAtSize(tocText, 8);
      const tocX = (PAGE_W - tocWidth) / 2;
      page.drawText(tocText, {
        x: tocX,
        y: y + 22,
        size: 8,
        font: helvetica,
        color: LINK_BLUE,
      });
    }
  }

  // Helper: wrap text into lines
  function wrapText(text, font, fontSize, maxWidth) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';
    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const width = font.widthOfTextAtSize(testLine, fontSize);
      if (width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) lines.push(currentLine);
    return lines;
  }

  // ============ PAGE 1: COVER ============
  {
    const page = pdfDoc.addPage(PageSizes.Letter);

    // Try to embed logo
    let logoImage = null;
    const logoPath = path.join(__dirname, '..', 'apps', 'mobile', 'assets', 'images', 'sports-media-logo.png');
    try {
      const logoBytes = fs.readFileSync(logoPath);
      logoImage = await pdfDoc.embedPng(logoBytes);
    } catch {
      // Try other common locations
      try {
        const altPath = path.join(__dirname, 'sports-media-logo.png');
        const logoBytes = fs.readFileSync(altPath);
        logoImage = await pdfDoc.embedPng(logoBytes);
      } catch { /* no logo available */ }
    }

    if (logoImage) {
      const logoDims = logoImage.scale(0.4);
      page.drawImage(logoImage, {
        x: (PAGE_W - logoDims.width) / 2,
        y: 620,
        width: logoDims.width,
        height: logoDims.height,
      });
    }

    // Title
    const title = 'Sports Media Charter';
    const titleWidth = helveticaBold.widthOfTextAtSize(title, 32);
    page.drawText(title, {
      x: (PAGE_W - titleWidth) / 2,
      y: logoImage ? 570 : 580,
      size: 32,
      font: helveticaBold,
      color: NAVY,
    });

    const subtitle = 'Mobile Application Screenshots';
    const subtitleWidth = helvetica.widthOfTextAtSize(subtitle, 18);
    page.drawText(subtitle, {
      x: (PAGE_W - subtitleWidth) / 2,
      y: logoImage ? 540 : 548,
      size: 18,
      font: helvetica,
      color: GRAY,
    });

    // Description
    const descLines = wrapText(
      'This document provides a comprehensive overview of the Sports Media Charter mobile application interface, designed for professional sports organizations to manage private charter aviation services.',
      helvetica, 11, PAGE_W - MARGIN * 2 - 40
    );
    let descY = 470;
    for (const line of descLines) {
      const lw = helvetica.widthOfTextAtSize(line, 11);
      page.drawText(line, {
        x: (PAGE_W - lw) / 2,
        y: descY,
        size: 11,
        font: helvetica,
        color: GRAY,
      });
      descY -= 18;
    }

    // Date and company
    const date = 'January 2026';
    const dateW = helvetica.widthOfTextAtSize(date, 12);
    page.drawText(date, { x: (PAGE_W - dateW) / 2, y: 300, size: 12, font: helvetica, color: NAVY });

    const company = 'A Division of Sports Media, Inc.';
    const compW = helvetica.widthOfTextAtSize(company, 11);
    page.drawText(company, { x: (PAGE_W - compW) / 2, y: 278, size: 11, font: helvetica, color: GRAY });

    drawFooter(page, 1, false);
  }

  // ============ PAGE 2: TABLE OF CONTENTS ============
  const tocPage = pdfDoc.addPage(PageSizes.Letter);
  const tocEntryPositions = []; // store {y, textWidth} for linking after content pages exist
  {
    const page = tocPage;

    page.drawText('Table of Contents', {
      x: MARGIN,
      y: PAGE_H - 80,
      size: 26,
      font: helveticaBold,
      color: NAVY,
    });

    let tocY = PAGE_H - 130;
    slides.forEach((slide, i) => {
      const num = `${i + 1}. `;
      const text = `${num}${slide.title}`;
      const textWidth = helvetica.widthOfTextAtSize(text, 11);
      page.drawText(text, {
        x: MARGIN + 20,
        y: tocY,
        size: 11,
        font: helvetica,
        color: LINK_BLUE,
      });
      tocEntryPositions.push({ y: tocY, width: textWidth });
      // Page number on right
      const pageRef = `${i + 3}`;
      const prW = helvetica.widthOfTextAtSize(pageRef, 11);
      page.drawText(pageRef, {
        x: PAGE_W - MARGIN - prW,
        y: tocY,
        size: 11,
        font: helvetica,
        color: GRAY,
      });
      tocY -= 24;
    });

    drawFooter(page, 2, false);
  }

  // ============ CONTENT PAGES ============
  const contentPages = [];
  for (let i = 0; i < slides.length; i++) {
    const slide = slides[i];
    const pageNum = i + 3;
    const page = pdfDoc.addPage(PageSizes.Letter);

    // Section title
    page.drawText(`${i + 1}. ${slide.title}`, {
      x: MARGIN,
      y: PAGE_H - 72,
      size: 20,
      font: helveticaBold,
      color: NAVY,
    });

    // Embed screenshot
    const imgPath = path.join(screenshotsDir, slide.file);
    let imgY = PAGE_H - 90;
    try {
      const imgBytes = fs.readFileSync(imgPath);
      const img = await pdfDoc.embedPng(imgBytes);

      // Scale image to fit width (max 360px wide, centered)
      const maxImgW = 360;
      const maxImgH = 440;
      const scale = Math.min(maxImgW / img.width, maxImgH / img.height);
      const imgW = img.width * scale;
      const imgH = img.height * scale;
      const imgX = (PAGE_W - imgW) / 2;
      imgY = PAGE_H - 96 - imgH;

      // Light border around image
      page.drawRectangle({
        x: imgX - 1,
        y: imgY - 1,
        width: imgW + 2,
        height: imgH + 2,
        borderColor: LIGHT_GRAY,
        borderWidth: 0.5,
        color: undefined,
      });

      page.drawImage(img, {
        x: imgX,
        y: imgY,
        width: imgW,
        height: imgH,
      });

      imgY -= 20; // space below image
    } catch (err) {
      console.error(`Failed to embed ${slide.file}: ${err.message}`);
      imgY = PAGE_H - 500;
    }

    // Description text below image
    const descMaxWidth = PAGE_W - MARGIN * 2;
    const descLines = wrapText(slide.desc, helvetica, 10, descMaxWidth);
    let textY = Math.min(imgY, 180); // ensure we don't go below footer

    // If there's enough room, place description right below image
    if (imgY > 120) {
      textY = imgY;
    }

    for (const line of descLines) {
      if (textY < 70) break; // don't overlap footer
      page.drawText(line, {
        x: MARGIN,
        y: textY,
        size: 10,
        font: helvetica,
        color: GRAY,
      });
      textY -= 15;
    }

    drawFooter(page, pageNum, true);
    contentPages.push(page);
  }

  // ============ ADD LINK ANNOTATIONS ============
  // TOC entries → content pages
  tocEntryPositions.forEach((entry, i) => {
    addInternalLink(tocPage, contentPages[i], MARGIN + 20, entry.y - 3, entry.width, 15);
  });

  // "Back to Table of Contents" on each content page → TOC page
  for (const cp of contentPages) {
    const tocText = 'Back to Table of Contents';
    const tocWidth = helvetica.widthOfTextAtSize(tocText, 8);
    const tocX = (PAGE_W - tocWidth) / 2;
    addInternalLink(cp, tocPage, tocX, 36 + 22 - 3, tocWidth, 12);
  }

  // Save
  const pdfBytes = await pdfDoc.save();
  const outputPath = path.join(__dirname, 'Sports_Media_Charter_App_Screenshots.pdf');
  fs.writeFileSync(outputPath, pdfBytes);
  console.log(`PDF saved to ${outputPath} (${(pdfBytes.length / 1024).toFixed(1)} KB)`);
  console.log(`Total pages: ${pdfDoc.getPageCount()}`);
}

generatePDF().catch(console.error);
