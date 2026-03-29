import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { TripBrief, TripOption } from './types';
import { StoredTrip } from './trip-storage';

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

const COLORS = {
  forest: '#1A4D2E',
  sand: '#F5F5DC',
  gold: '#D4AF37',
  white: '#FFFFFF',
  gray: '#6B7280',
  lightGray: '#F3F4F6',
};

export function generateTripPDF(trip: StoredTrip, winningOption?: TripOption): Blob {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPos = 20;

  // === HEADER ===
  doc.setFillColor(COLORS.forest);
  doc.rect(0, 0, pageWidth, 50, 'F');

  // Golf icon (emoji)
  doc.setFontSize(24);
  doc.setTextColor(COLORS.white);
  doc.text('⛳', 15, 20);

  // Trip name
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  const tripName = trip.tripBrief?.trip_name || 'Golf Trip Itinerary';
  doc.text(tripName, 30, 22);

  // Destination
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  const destination = trip.tripBrief?.destination?.city
    ? `${trip.tripBrief.destination.city}, ${trip.tripBrief.destination.state || ''}`
    : 'TBD';
  doc.text(`📍 ${destination}`, 30, 32);

  // Date range
  if (trip.tripBrief?.dates?.start && trip.tripBrief?.dates?.end) {
    const startDate = new Date(trip.tripBrief.dates.start).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    const endDate = new Date(trip.tripBrief.dates.end).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    doc.text(`📅 ${startDate} - ${endDate}`, 30, 40);
  }

  yPos = 60;

  // === TRIP DETAILS ===
  doc.setTextColor(COLORS.forest);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Trip Details', 15, yPos);
  yPos += 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(COLORS.gray);

  const details = [];
  if (trip.tripBrief?.party?.players) {
    details.push(['Group Size', `${trip.tripBrief.party.players} players`]);
  }
  if (trip.tripBrief?.budget?.per_person) {
    details.push(['Budget', `$${trip.tripBrief.budget.per_person}/person`]);
  }
  if (trip.tripBrief?.preferences?.vibe) {
    details.push(['Vibe', trip.tripBrief.preferences.vibe.replace(/_/g, ' ')]);
  }
  if (trip.tripBrief?.preferences?.lodging) {
    details.push(['Lodging', trip.tripBrief.preferences.lodging.replace(/_/g, ' ')]);
  }

  if (details.length > 0) {
    doc.autoTable({
      startY: yPos,
      head: [],
      body: details,
      theme: 'plain',
      styles: {
        fontSize: 10,
        cellPadding: 3,
        textColor: COLORS.gray,
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 40 },
        1: { cellWidth: 'auto' },
      },
      margin: { left: 15, right: 15 },
    });
    yPos = (doc as any).lastAutoTable.finalY + 10;
  }

  // === SELECTED OPTION ===
  const option = winningOption || trip.options[0];
  if (option) {
    doc.setTextColor(COLORS.forest);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Selected Trip Package', 15, yPos);
    yPos += 10;

    // Option title box
    doc.setFillColor(COLORS.lightGray);
    doc.roundedRect(15, yPos, pageWidth - 30, 15, 2, 2, 'F');

    doc.setFontSize(14);
    doc.setTextColor(COLORS.forest);
    doc.setFont('helvetica', 'bold');
    doc.text(option.title, 20, yPos + 8);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(option.destination, 20, yPos + 13);

    yPos += 20;

    // Cost estimate
    doc.setFontSize(12);
    doc.setTextColor(COLORS.forest);
    doc.setFont('helvetica', 'bold');
    doc.text(`$${option.cost_estimate.per_person_estimated} per person`, 20, yPos);
    yPos += 10;

    // === COURSES ===
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(COLORS.forest);
    doc.text('Golf Courses', 15, yPos);
    yPos += 8;

    const courseData = option.courses.map((course, idx) => [
      `⛳ Round ${idx + 1}`,
      course.name,
      course.difficulty || 'TBD',
    ]);

    doc.autoTable({
      startY: yPos,
      head: [['Round', 'Course Name', 'Difficulty']],
      body: courseData,
      theme: 'striped',
      headStyles: {
        fillColor: COLORS.forest,
        textColor: COLORS.white,
        fontSize: 10,
        fontStyle: 'bold',
      },
      styles: {
        fontSize: 9,
        cellPadding: 4,
      },
      margin: { left: 15, right: 15 },
    });
    yPos = (doc as any).lastAutoTable.finalY + 10;

    // === LODGING ===
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(COLORS.forest);
    doc.text('Lodging', 15, yPos);
    yPos += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(COLORS.gray);
    doc.text(`Type: ${option.lodging.type}`, 20, yPos);
    yPos += 6;
    doc.text(`Location: ${option.lodging.area}`, 20, yPos);
    yPos += 10;

    // === ITINERARY ===
    if (option.itinerary && option.itinerary.length > 0) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(COLORS.forest);
      doc.text('Daily Itinerary', 15, yPos);
      yPos += 8;

      option.itinerary.forEach((day) => {
        // Day header
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(COLORS.forest);
        doc.text(day.day, 20, yPos);
        yPos += 6;

        // Day items
        day.items.forEach((item) => {
          doc.setFontSize(9);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(COLORS.gray);

          const icon = item.type === 'golf' ? '⛳' : item.type === 'food' ? '🍴' : '📍';
          doc.text(`${icon} ${item.time_window || ''} - ${item.label}`, 25, yPos);
          yPos += 5;
        });

        yPos += 3;
      });
    }

    // === WHY THIS WORKS ===
    if (option.why_it_fits && option.why_it_fits.length > 0) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(COLORS.forest);
      doc.text('Why This Trip Works', 15, yPos);
      yPos += 8;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(COLORS.gray);

      option.why_it_fits.forEach((reason) => {
        doc.text(`✓ ${reason}`, 20, yPos);
        yPos += 6;
      });
    }
  }

  // === FOOTER ===
  const footerY = pageHeight - 20;
  doc.setFillColor(COLORS.lightGray);
  doc.rect(0, footerY, pageWidth, 20, 'F');

  doc.setFontSize(9);
  doc.setTextColor(COLORS.gray);
  doc.setFont('helvetica', 'italic');
  doc.text('Generated by TheCaddy.AI - Your AI Golf Trip Planner', pageWidth / 2, footerY + 10, {
    align: 'center',
  });

  doc.text(new Date().toLocaleDateString('en-US'), pageWidth / 2, footerY + 15, {
    align: 'center',
  });

  // Return as blob
  return doc.output('blob');
}

// Client-side helper to download PDF
export function downloadTripPDF(trip: StoredTrip, winningOption?: TripOption) {
  const blob = generateTripPDF(trip, winningOption);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const tripName = trip.tripBrief?.trip_name || 'golf-trip';
  const fileName = `${tripName.replace(/\s+/g, '-').toLowerCase()}-itinerary.pdf`;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
