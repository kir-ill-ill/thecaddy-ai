import {
  sql,
  Destination,
  Course,
  Lodging,
  getDestinations,
  getCoursesByDestination,
  getLodgingByDestination
} from './db';
import {
  TripBrief,
  TripOption,
  CoursePick,
  LodgingPick,
  ItineraryDay,
  ItineraryItem,
  CostEstimate,
  ScoreBreakdown,
  CourseRole
} from './types';

// US State coordinates for distance calculations
const STATE_COORDS: Record<string, { lat: number; lng: number }> = {
  AL: { lat: 32.806671, lng: -86.791130 },
  AZ: { lat: 34.048927, lng: -111.093735 },
  CA: { lat: 36.778259, lng: -119.417931 },
  FL: { lat: 27.994402, lng: -81.760254 },
  GA: { lat: 33.247875, lng: -83.441162 },
  MO: { lat: 38.573936, lng: -92.603760 },
  NC: { lat: 35.782169, lng: -80.793457 },
  NV: { lat: 39.876019, lng: -117.224121 },
  PA: { lat: 41.203323, lng: -77.194527 },
  SC: { lat: 33.836082, lng: -81.163727 },
  VA: { lat: 37.431573, lng: -78.656894 },
};

// Major city coordinates
const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  'Philadelphia_PA': { lat: 39.9526, lng: -75.1652 },
  'New York_NY': { lat: 40.7128, lng: -74.0060 },
  'Boston_MA': { lat: 42.3601, lng: -71.0589 },
  'Washington_DC': { lat: 38.9072, lng: -77.0369 },
  'Atlanta_GA': { lat: 33.7490, lng: -84.3880 },
  'Chicago_IL': { lat: 41.8781, lng: -87.6298 },
  'Dallas_TX': { lat: 32.7767, lng: -96.7970 },
  'Houston_TX': { lat: 29.7604, lng: -95.3698 },
  'Phoenix_AZ': { lat: 33.4484, lng: -112.0740 },
  'Los Angeles_CA': { lat: 34.0522, lng: -118.2437 },
  'San Francisco_CA': { lat: 37.7749, lng: -122.4194 },
  'Denver_CO': { lat: 39.7392, lng: -104.9903 },
  'Miami_FL': { lat: 25.7617, lng: -80.1918 },
  'Orlando_FL': { lat: 28.5383, lng: -81.3792 },
  'Charlotte_NC': { lat: 35.2271, lng: -80.8431 },
  'Nashville_TN': { lat: 36.1627, lng: -86.7816 },
  'Detroit_MI': { lat: 42.3314, lng: -83.0458 },
  'Minneapolis_MN': { lat: 44.9778, lng: -93.2650 },
  'Seattle_WA': { lat: 47.6062, lng: -122.3321 },
  'Las Vegas_NV': { lat: 36.1699, lng: -115.1398 },
};

// Calculate distance between two points (Haversine formula)
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Estimate drive time (roughly 50 mph average)
function estimateDriveHours(distanceMiles: number): number {
  return distanceMiles / 50;
}

// Get origin coordinates
function getOriginCoords(city: string, state: string): { lat: number; lng: number } {
  const key = `${city}_${state}`;
  if (CITY_COORDS[key]) return CITY_COORDS[key];
  if (STATE_COORDS[state]) return STATE_COORDS[state];
  // Default to center of US
  return { lat: 39.8283, lng: -98.5795 };
}

// Score a destination based on trip brief
function scoreDestination(
  destination: Destination,
  tripBrief: TripBrief,
  originCoords: { lat: number; lng: number }
): number {
  let score = 50; // Base score

  // Distance/travel score (higher is better for closer destinations when driving)
  if (destination.lat && destination.lng) {
    const distance = calculateDistance(
      originCoords.lat, originCoords.lng,
      Number(destination.lat), Number(destination.lng)
    );
    const driveHours = estimateDriveHours(distance);

    if (tripBrief.preferences.travel_mode === 'drive') {
      const maxHours = tripBrief.constraints.max_drive_hours || 4;
      if (driveHours <= maxHours) {
        score += 30 * (1 - driveHours / maxHours); // Closer = more points
      } else if (driveHours <= maxHours * 1.5) {
        score += 10; // Still reasonable
      } else {
        score -= 20; // Too far for driving
      }
    } else if (tripBrief.preferences.travel_mode === 'fly') {
      // Flying destinations get bonus for being further (more destination feel)
      if (distance > 500) score += 15;
    }
  }

  // Vibe match
  if (destination.vibe && destination.vibe.includes(tripBrief.preferences.vibe)) {
    score += 20;
  }

  // Budget match
  const avgGreenFee = ((destination.avg_green_fee_low || 0) + (destination.avg_green_fee_high || 0)) / 2;
  const avgLodging = destination.avg_lodging_per_night || 150;
  const estimatedPerDay = avgGreenFee + avgLodging / 2 + 50; // Per person per day estimate
  const estimatedTotal = estimatedPerDay * tripBrief.dates.nights;

  if (estimatedTotal <= tripBrief.budget.per_person) {
    score += 25; // Within budget
  } else if (estimatedTotal <= tripBrief.budget.per_person * 1.2) {
    score += 10; // Slightly over
  } else {
    score -= 15; // Over budget
  }

  // Season match (check if trip month is in best_months)
  const tripMonth = new Date(tripBrief.dates.start).getMonth() + 1;
  if (destination.best_months && destination.best_months.includes(tripMonth)) {
    score += 15;
  }

  return Math.max(0, Math.min(100, score));
}

// Generate itinerary for a trip option
function generateItinerary(
  tripBrief: TripBrief,
  courses: Course[],
  destination: Destination
): ItineraryDay[] {
  const nights = tripBrief.dates.nights;
  const itinerary: ItineraryDay[] = [];
  let courseIndex = 0;

  // Determine rounds per day based on golf_density
  const density = tripBrief.preferences.golf_density;
  const roundsPerDay = density === '36_daily' ? 2 : 1;
  const allowDoubleDay = density === '36_one_day_ok' || density === '36_daily';

  // Determine tee time window
  const teeTimeWindows: Record<string, string> = {
    'early': '07:00-12:00',
    'mid_morning': '09:00-14:00',
    'noon': '11:00-16:00',
    'flex': '08:00-15:00',
  };
  const teeWindow = teeTimeWindows[tripBrief.preferences.tee_time] || '09:00-14:00';

  for (let day = 0; day <= nights; day++) {
    const dayLabel = day === 0 ? 'Arrival Day' : day === nights ? 'Departure Day' : `Day ${day}`;
    const items: ItineraryItem[] = [];

    if (day === 0) {
      // Arrival day
      items.push({
        type: 'travel',
        label: `Travel to ${destination.name}`,
        time_window: '08:00-14:00',
      });
      items.push({
        type: 'rest',
        label: 'Check in & settle',
        time_window: '14:00-16:00',
      });
      // Maybe afternoon round if arriving early
      if (courseIndex < courses.length && tripBrief.preferences.tee_time !== 'early') {
        items.push({
          type: 'golf',
          label: `${courses[courseIndex].name} (18 holes)`,
          time_window: '14:00-18:00',
          notes: 'Optional arrival day round',
        });
        courseIndex++;
      }
      items.push({
        type: 'meal',
        label: 'Group dinner',
        time_window: '19:00-21:00',
      });
    } else if (day === nights) {
      // Departure day
      items.push({
        type: 'rest',
        label: 'Check out',
        time_window: '08:00-10:00',
      });
      items.push({
        type: 'travel',
        label: 'Travel home',
        time_window: '10:00-16:00',
      });
    } else {
      // Full golf day
      items.push({
        type: 'meal',
        label: 'Breakfast',
        time_window: '07:00-08:30',
      });

      if (courseIndex < courses.length) {
        items.push({
          type: 'golf',
          label: `${courses[courseIndex].name} (18 holes)`,
          time_window: teeWindow,
        });
        courseIndex++;
      }

      // Second round if allowed and we have courses
      if (allowDoubleDay && courseIndex < courses.length && day === Math.floor(nights / 2)) {
        items.push({
          type: 'golf',
          label: `${courses[courseIndex].name} (18 holes)`,
          time_window: '14:00-18:00',
          notes: '36-hole day',
        });
        courseIndex++;
      }

      items.push({
        type: 'meal',
        label: 'Dinner',
        time_window: '19:00-21:00',
      });

      if (day === 1 || day === Math.floor(nights / 2)) {
        items.push({
          type: 'nightlife',
          label: 'Evening activities',
          time_window: '21:00-23:00',
        });
      }
    }

    itinerary.push({ day_label: dayLabel, items });
  }

  return itinerary;
}

// Calculate cost estimate
function calculateCostEstimate(
  tripBrief: TripBrief,
  courses: Course[],
  lodging: Lodging | null,
  destination: Destination
): CostEstimate {
  const nights = tripBrief.dates.nights;
  const players = tripBrief.party.players;
  const isWeekend = new Date(tripBrief.dates.start).getDay() >= 5;

  // Golf costs
  let golfTotal = 0;
  courses.forEach(course => {
    const fee = isWeekend ? (course.green_fee_weekend || 100) : (course.green_fee_weekday || 80);
    golfTotal += fee;
  });

  // Lodging costs (per person)
  let lodgingTotal = 0;
  if (lodging) {
    const nightlyRate = ((lodging.price_per_night_low || 150) + (lodging.price_per_night_high || 250)) / 2;
    const roomsNeeded = Math.ceil(players / (lodging.sleeps || 4));
    lodgingTotal = (nightlyRate * nights * roomsNeeded) / players;
  } else {
    // Estimate from destination average
    lodgingTotal = (destination.avg_lodging_per_night || 150) * nights / 2;
  }

  // Food estimate ($60/day per person)
  const foodTotal = 60 * (nights + 1);

  // Transport (gas/rental)
  const transportTotal = tripBrief.preferences.travel_mode === 'drive' ? 50 : 100;

  // Misc (tips, drinks, etc)
  const miscTotal = 50 * nights;

  const perPersonEstimated = Math.round(golfTotal + lodgingTotal + foodTotal + transportTotal + miscTotal);

  return {
    per_person_target: tripBrief.budget.per_person,
    per_person_estimated: perPersonEstimated,
    confidence: Math.abs(perPersonEstimated - tripBrief.budget.per_person) < 200 ? 'high' : 'medium',
    breakdown: {
      lodging: Math.round(lodgingTotal),
      golf: Math.round(golfTotal),
      food: Math.round(foodTotal),
      local_transport: Math.round(transportTotal),
      misc: Math.round(miscTotal),
    },
    assumptions: [
      `${courses.length} rounds of golf`,
      `${nights} nights lodging`,
      'Includes estimated meals and incidentals',
    ],
  };
}

// Calculate score breakdown
function calculateScoreBreakdown(
  tripBrief: TripBrief,
  destination: Destination,
  courses: Course[],
  costEstimate: CostEstimate,
  originCoords: { lat: number; lng: number }
): ScoreBreakdown {
  // Budget fit (100 = exactly on budget)
  const budgetRatio = costEstimate.per_person_estimated / tripBrief.budget.per_person;
  const budgetFit = Math.max(0, Math.min(100, 100 - Math.abs(1 - budgetRatio) * 100));

  // Travel fit
  let travelFit = 70;
  if (destination.lat && destination.lng) {
    const distance = calculateDistance(
      originCoords.lat, originCoords.lng,
      Number(destination.lat), Number(destination.lng)
    );
    const driveHours = estimateDriveHours(distance);
    const maxHours = tripBrief.constraints.max_drive_hours || 4;

    if (tripBrief.preferences.travel_mode === 'drive') {
      travelFit = driveHours <= maxHours ? 90 : driveHours <= maxHours * 1.5 ? 60 : 30;
    } else {
      travelFit = 80; // Flying is usually fine
    }
  }

  // Logistics (courses clustered, resort convenience, etc)
  const hasResort = courses.some(c => c.resort_course);
  const logistics = hasResort ? 85 : 70;

  // Vibe match
  const vibeMatch = destination.vibe?.includes(tripBrief.preferences.vibe) ? 90 : 60;

  // Course quality
  const avgQuality = courses.reduce((sum, c) => sum + (c.quality_score || 70), 0) / courses.length;
  const courseQualityProxy = Math.round(avgQuality);

  // Total weighted score
  const total = Math.round(
    budgetFit * 0.25 +
    travelFit * 0.20 +
    logistics * 0.15 +
    vibeMatch * 0.15 +
    courseQualityProxy * 0.25
  );

  return {
    total,
    budget_fit: Math.round(budgetFit),
    travel_fit: Math.round(travelFit),
    logistics,
    vibe_match: vibeMatch,
    course_quality_proxy: courseQualityProxy,
  };
}

// Generate why it fits reasons
function generateWhyItFits(
  tripBrief: TripBrief,
  destination: Destination,
  courses: Course[],
  costEstimate: CostEstimate,
  driveHours: number
): string[] {
  const reasons: string[] = [];

  // Travel reason
  if (tripBrief.preferences.travel_mode === 'drive' && driveHours <= (tripBrief.constraints.max_drive_hours || 4)) {
    reasons.push(`${Math.round(driveHours * 10) / 10} hour drive from ${tripBrief.origin.city}`);
  }

  // Budget reason
  if (costEstimate.per_person_estimated <= tripBrief.budget.per_person) {
    reasons.push('Within your budget');
  } else if (costEstimate.per_person_estimated <= tripBrief.budget.per_person * 1.1) {
    reasons.push('Close to budget target');
  }

  // Course quality
  const topCourse = courses.reduce((best, c) => (c.quality_score || 0) > (best.quality_score || 0) ? c : best);
  if (topCourse.quality_score && topCourse.quality_score >= 85) {
    reasons.push(`Features ${topCourse.name} (rated ${topCourse.quality_score}/100)`);
  }

  // Rounds
  reasons.push(`${courses.length} rounds over ${tripBrief.dates.nights} nights`);

  // Vibe
  if (destination.vibe?.includes(tripBrief.preferences.vibe)) {
    reasons.push(`${destination.name} known for ${tripBrief.preferences.vibe.replace('_', ' ')} golf`);
  }

  // Season
  const tripMonth = new Date(tripBrief.dates.start).getMonth() + 1;
  if (destination.best_months?.includes(tripMonth)) {
    reasons.push('Great time of year to visit');
  }

  return reasons.slice(0, 5);
}

// Main planning function
export async function generateTripOptions(tripBrief: TripBrief): Promise<TripOption[]> {
  const originCoords = getOriginCoords(tripBrief.origin.city, tripBrief.origin.state);

  // Get all destinations and score them
  const destinations = await getDestinations();

  const scoredDestinations = destinations.map(dest => ({
    destination: dest,
    score: scoreDestination(dest, tripBrief, originCoords),
    driveHours: dest.lat && dest.lng
      ? estimateDriveHours(calculateDistance(
        originCoords.lat, originCoords.lng,
        Number(dest.lat), Number(dest.lng)
      ))
      : 99,
  })).filter(d => {
    // Filter by drive hours if driving
    if (tripBrief.preferences.travel_mode === 'drive') {
      const maxHours = (tripBrief.constraints.max_drive_hours || 4) * 1.5;
      return d.driveHours <= maxHours;
    }
    return true;
  }).sort((a, b) => b.score - a.score);

  // Pick top 3 destinations for variety
  const selectedDestinations = scoredDestinations.slice(0, 3);

  // Generate trip option for each destination
  const options: TripOption[] = [];

  for (let i = 0; i < selectedDestinations.length; i++) {
    const { destination, driveHours } = selectedDestinations[i];

    // Get courses and lodging for this destination
    const courses = await getCoursesByDestination(destination.id);
    const lodgingOptions = await getLodgingByDestination(destination.id);

    // Select courses for the trip (based on nights and density)
    const roundsNeeded = tripBrief.dates.nights + (tripBrief.preferences.golf_density.includes('36') ? 1 : 0);
    const selectedCourses = courses.slice(0, Math.min(roundsNeeded, courses.length));

    // Select best matching lodging
    let selectedLodging = lodgingOptions.find(l => {
      if (tripBrief.preferences.lodging === 'any') return true;
      if (tripBrief.preferences.lodging === 'house_or_resort') {
        return l.lodging_type === 'house' || l.lodging_type === 'resort';
      }
      return l.lodging_type === tripBrief.preferences.lodging;
    }) || lodgingOptions[0];

    // Build course picks
    const coursePicks: CoursePick[] = selectedCourses.map((course, idx) => ({
      name: course.name,
      role: (idx === 0 ? 'anchor' : idx === 1 ? 'value' : 'vibes') as CourseRole,
      holes: 18,
      notes: course.description || undefined,
    }));

    // Build lodging pick
    const lodgingPick: LodgingPick = {
      type: (selectedLodging?.lodging_type as any) || 'hotel',
      name_or_area: selectedLodging?.name || destination.name,
      nights: tripBrief.dates.nights,
      notes: selectedLodging?.description || undefined,
    };

    // Generate itinerary
    const itinerary = generateItinerary(tripBrief, selectedCourses, destination);

    // Calculate costs
    const costEstimate = calculateCostEstimate(tripBrief, selectedCourses, selectedLodging, destination);

    // Calculate scores
    const scoreBreakdown = calculateScoreBreakdown(tripBrief, destination, selectedCourses, costEstimate, originCoords);

    // Generate reasons
    const whyItFits = generateWhyItFits(tripBrief, destination, selectedCourses, costEstimate, driveHours);

    // Create option titles
    const titles = [
      `${destination.name} Getaway`,
      `${destination.region} Experience`,
      `${destination.name} Golf Trip`,
    ];
    const taglines = [
      `Best overall match for your group`,
      `Great value with quality courses`,
      `Premium experience within reach`,
    ];

    options.push({
      id: `opt_${String.fromCharCode(97 + i)}`, // opt_a, opt_b, opt_c
      title: titles[i % titles.length],
      tagline: taglines[i % taglines.length],
      destination: `${destination.name}, ${destination.state}`,
      need_research: false,
      courses: coursePicks,
      lodging: lodgingPick,
      itinerary,
      cost_estimate: costEstimate,
      score_breakdown: scoreBreakdown,
      why_it_fits: whyItFits,
    });
  }

  // Sort by total score
  options.sort((a, b) => b.score_breakdown.total - a.score_breakdown.total);

  return options;
}

// Quick search for destinations by origin
export async function searchDestinationsByOrigin(
  originCity: string,
  originState: string,
  maxDriveHours: number = 4
): Promise<(Destination & { driveHours: number })[]> {
  const originCoords = getOriginCoords(originCity, originState);
  const destinations = await getDestinations();

  return destinations
    .map(dest => {
      const driveHours = dest.lat && dest.lng
        ? estimateDriveHours(calculateDistance(
          originCoords.lat, originCoords.lng,
          Number(dest.lat), Number(dest.lng)
        ))
        : 99;
      return { ...dest, driveHours };
    })
    .filter(d => d.driveHours <= maxDriveHours * 1.5)
    .sort((a, b) => a.driveHours - b.driveHours);
}
