import { TripBrief, TripOption } from './types';

// Mock trip brief extraction - extracts key details from user message
export function mockExtractTripBrief(userMessage: string, existingBrief?: Partial<TripBrief>) {
  const message = userMessage.toLowerCase();
  const brief: Partial<TripBrief> = { ...existingBrief };

  // Extract destination
  const destinations = ['scottsdale', 'phoenix', 'vegas', 'las vegas', 'pebble beach', 'bandon', 'kiawah', 'pinehurst', 'myrtle beach', 'florida', 'orlando', 'miami', 'austin', 'san diego'];
  const foundDest = destinations.find(dest => message.includes(dest));
  if (foundDest) {
    const destName = foundDest === 'las vegas' ? 'Las Vegas' : foundDest.charAt(0).toUpperCase() + foundDest.slice(1);
    const stateMap: Record<string, string> = {
      scottsdale: 'AZ', phoenix: 'AZ', vegas: 'NV', 'las vegas': 'NV',
      'pebble beach': 'CA', bandon: 'OR', kiawah: 'SC', pinehurst: 'NC',
      'myrtle beach': 'SC', florida: 'FL', orlando: 'FL', miami: 'FL',
      austin: 'TX', 'san diego': 'CA'
    };
    brief.destination = {
      city: destName,
      state: stateMap[foundDest] || 'US'
    };
    brief.trip_name = `${brief.destination.city} Golf Trip`;
  }

  // Extract party size
  const partyMatch = message.match(/(\d+)\s*(?:guys|people|players|golfers|buddies|dudes|of us|man|men)/);
  if (partyMatch) {
    brief.party = { players: parseInt(partyMatch[1]) };
  }

  // Extract budget - handle many natural formats:
  //   "$1200/person budget", "$1200 per person", "$1200 pp", "$1200 budget",
  //   "$1200 a head", "$1200 each", "budget of $1200", "budget $1200",
  //   "1200 per person", "$1,200/person"
  const budgetPatterns = [
    /\$\s?(\d+[,.]?\d*)\s*(?:\/|\s*per\s*|\/per\s*|a\s*)?(?:person|head|guy|player|pp|each)/i,
    /\$\s?(\d+[,.]?\d*)\s*(?:budget|total per|per person)/i,
    /budget\s*(?:of\s*)?\$?\s?(\d+[,.]?\d*)/i,
    /(\d+[,.]?\d*)\s*(?:dollars?\s*)?(?:per person|\/person|pp|each|a head|per head|per guy)/i,
    /\$\s?(\d+[,.]?\d*)/i, // last resort: any dollar amount
  ];
  if (!brief.budget) {
    for (const pattern of budgetPatterns) {
      const match = message.match(pattern);
      if (match) {
        const budget = parseInt(match[1].replace(/[,.]/g, ''));
        if (budget > 0) {
          brief.budget = { per_person: budget, scope: 'all_in' };
          break;
        }
      }
    }
  }

  // Extract dates
  const months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
  const foundMonth = months.findIndex(month => message.includes(month));
  // Also check abbreviated months
  const shortMonths = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
  const foundShortMonth = foundMonth === -1 ? shortMonths.findIndex(month => {
    // Match abbreviation as a word boundary (avoid matching "march" with "mar" when full months already checked)
    return new RegExp(`\\b${month}\\b`).test(message);
  }) : -1;
  const monthIndex = foundMonth !== -1 ? foundMonth : foundShortMonth;

  if (monthIndex !== -1 && !brief.dates) {
    const year = new Date().getFullYear();
    // If the month is in the past, assume next year
    const now = new Date();
    const targetYear = monthIndex < now.getMonth() ? year + 1 : year;
    const startDate = new Date(targetYear, monthIndex, 15);
    const endDate = new Date(targetYear, monthIndex, 18);
    brief.dates = {
      start: startDate.toISOString().split('T')[0],
      end: endDate.toISOString().split('T')[0],
      nights: 3,
      flex_days: 0,
    };
  }

  // Also look for "weekend" / "3 days" / "long weekend" patterns
  if (!brief.dates) {
    const springMatch = message.match(/\b(spring|next spring)\b/);
    const fallMatch = message.match(/\b(fall|next fall|autumn)\b/);
    if (springMatch) {
      const year = new Date().getFullYear();
      brief.dates = { start: `${year}-04-15`, end: `${year}-04-18`, nights: 3, flex_days: 0 };
    } else if (fallMatch) {
      const year = new Date().getFullYear();
      brief.dates = { start: `${year}-10-15`, end: `${year}-10-18`, nights: 3, flex_days: 0 };
    }
  }

  // Extract preferences
  if (message.includes('bachelor')) {
    brief.preferences = { vibe: 'casual', lodging: 'resort', travel_mode: 'fly', golf_density: '18_per_day', tee_time: 'mid_morning' };
  } else if (message.includes('luxury') || message.includes('high end') || message.includes('high-end')) {
    brief.preferences = { vibe: 'mixed', lodging: 'resort', travel_mode: 'fly', golf_density: '18_per_day', tee_time: 'mid_morning' };
  } else if (!brief.preferences) {
    brief.preferences = { vibe: 'competitive_fun', lodging: 'resort', travel_mode: 'either', golf_density: '18_per_day', tee_time: 'mid_morning' };
  }

  // Determine what's truly missing (only the essentials: destination + dates + group size)
  // Budget is nice-to-have -- we'll default it if not provided
  const missingFields: string[] = [];
  if (!brief.destination) missingFields.push('destination');
  if (!brief.party) missingFields.push('group size');
  if (!brief.dates) missingFields.push('dates');

  // Apply smart defaults for non-essential fields
  if (!brief.budget) {
    brief.budget = { per_person: 1500, scope: 'all_in' };
  }

  // Generate a caddy-voiced follow-up if fields are missing
  let follow_up_question: string | null = null;
  if (missingFields.length > 0) {
    if (missingFields.includes('destination') && missingFields.length === 1) {
      follow_up_question = "Love it. Where are we headed -- any destination in mind, or want me to pick the best spot for your crew?";
    } else if (missingFields.includes('group size') && missingFields.length === 1) {
      follow_up_question = "Solid plan shaping up. How many guys are we talking -- foursome, eightsome, full shotgun?";
    } else if (missingFields.includes('dates') && missingFields.length === 1) {
      follow_up_question = "Almost dialed in. When are we teeing this up -- got a month or weekend in mind?";
    } else if (missingFields.length === 2) {
      follow_up_question = `Good start. I still need a couple things: ${missingFields.join(' and ')}. What are we working with?`;
    } else {
      follow_up_question = "I'm your caddy -- tell me the basics: where are we going, how many in the group, and when are we playing?";
    }
  }

  return {
    trip_brief: brief,
    missing_fields: missingFields,
    follow_up_question
  };
}

// Mock trip options generator
export function mockGenerateTripOptions(tripBrief: Partial<TripBrief>): TripOption[] {
  const destination = tripBrief.destination?.city || 'Scottsdale';
  const budget = tripBrief.budget?.per_person || 1200;
  const players = tripBrief.party?.players || 8;

  const options: TripOption[] = [
    {
      id: `opt_${Date.now()}_a`,
      title: `${destination} Premium Package`,
      destination: `${destination}, ${tripBrief.destination?.state || 'AZ'}`,
      cost_estimate: {
        per_person_estimated: Math.round(budget * 0.95),
        breakdown: {
          lodging: Math.round(budget * 0.4),
          golf: Math.round(budget * 0.45),
          food: Math.round(budget * 0.1)
        }
      },
      courses: [
        {
          name: 'Troon North Golf Club - Monument Course',
          difficulty: 'Championship',
          price_range: '$200-300',
          features: ['Desert layout', 'Incredible views', 'Pristine conditions']
        },
        {
          name: 'We-Ko-Pa Golf Club - Saguaro Course',
          difficulty: 'Championship',
          price_range: '$150-250',
          features: ['Pure desert golf', 'Native landscape', 'Bill Coore design']
        },
        {
          name: 'Grayhawk Golf Club - Raptor Course',
          difficulty: 'Resort',
          price_range: '$150-200',
          features: ['Tom Fazio design', 'Resort amenities', 'Great conditions']
        }
      ],
      lodging: {
        type: 'resort',
        name_or_area: 'North Scottsdale',
        nights: 3,
      },
      itinerary: [
        {
          day: 'Day 1 - Arrival',
          items: [
            { type: 'travel', label: 'Arrive Phoenix Sky Harbor', time_window: 'Morning' },
            { type: 'activity', label: 'Check-in & settle', time_window: 'Afternoon' },
            { type: 'food', label: 'Welcome dinner at resort', time_window: 'Evening' }
          ]
        },
        {
          day: 'Day 2 - Championship Golf',
          items: [
            { type: 'golf', label: 'Troon North - Monument Course', time_window: '8:00 AM' },
            { type: 'food', label: 'Lunch at clubhouse', time_window: '1:00 PM' },
            { type: 'activity', label: 'Pool & relaxation', time_window: 'Afternoon' },
            { type: 'food', label: 'Dinner in Old Town Scottsdale', time_window: '7:00 PM' }
          ]
        },
        {
          day: 'Day 3 - Desert Golf',
          items: [
            { type: 'golf', label: 'We-Ko-Pa - Saguaro Course', time_window: '8:30 AM' },
            { type: 'food', label: 'Lunch at clubhouse', time_window: '1:00 PM' },
            { type: 'activity', label: 'Spa time or golf practice', time_window: 'Afternoon' },
            { type: 'food', label: 'Group dinner & awards', time_window: '7:00 PM' }
          ]
        },
        {
          day: 'Day 4 - Final Round & Departure',
          items: [
            { type: 'golf', label: 'Grayhawk - Raptor Course', time_window: '7:30 AM' },
            { type: 'food', label: 'Farewell lunch', time_window: '12:00 PM' },
            { type: 'travel', label: 'Depart Phoenix', time_window: 'Afternoon' }
          ]
        }
      ],
      why_it_fits: [
        'Perfect for your group size',
        'Stays within budget',
        'Top-rated desert golf',
        'Great food & nightlife nearby',
        'Easy airport access'
      ]
    },
    {
      id: `opt_${Date.now()}_b`,
      title: `${destination} Value Package`,
      destination: `${destination}, ${tripBrief.destination?.state || 'AZ'}`,
      cost_estimate: {
        per_person_estimated: Math.round(budget * 0.75),
        breakdown: {
          lodging: Math.round(budget * 0.3),
          golf: Math.round(budget * 0.35),
          food: Math.round(budget * 0.1)
        }
      },
      courses: [
        {
          name: 'Talking Stick Golf Club - North Course',
          difficulty: 'Resort',
          price_range: '$100-150',
          features: ['Municipal quality', 'Great value', 'Ben Crenshaw design']
        },
        {
          name: 'Quintero Golf Club',
          difficulty: 'Championship',
          price_range: '$125-175',
          features: ['Hidden gem', 'Desert terrain', 'Rees Jones design']
        }
      ],
      lodging: {
        type: 'hotel',
        name_or_area: 'Central Scottsdale',
        nights: 2,
      },
      itinerary: [
        {
          day: 'Day 1 - Arrival',
          items: [
            { type: 'travel', label: 'Arrive Phoenix', time_window: 'Morning' },
            { type: 'activity', label: 'Check-in', time_window: 'Afternoon' },
            { type: 'food', label: 'Casual group dinner', time_window: 'Evening' }
          ]
        },
        {
          day: 'Day 2 - Golf Day',
          items: [
            { type: 'golf', label: 'Talking Stick - North Course', time_window: '9:00 AM' },
            { type: 'food', label: 'Lunch & drinks', time_window: 'Afternoon' },
            { type: 'activity', label: 'Explore Old Town', time_window: 'Evening' }
          ]
        },
        {
          day: 'Day 3 - Championship Round',
          items: [
            { type: 'golf', label: 'Quintero Golf Club', time_window: '8:00 AM' },
            { type: 'food', label: 'Final dinner celebration', time_window: 'Evening' }
          ]
        }
      ],
      why_it_fits: [
        'Best value for budget',
        'Quality golf experience',
        'More money for nightlife',
        'Central location'
      ]
    },
    {
      id: `opt_${Date.now()}_c`,
      title: `${destination} Luxury Experience`,
      destination: `${destination}, ${tripBrief.destination?.state || 'AZ'}`,
      cost_estimate: {
        per_person_estimated: Math.round(budget * 1.2),
        breakdown: {
          lodging: Math.round(budget * 0.5),
          golf: Math.round(budget * 0.5),
          food: Math.round(budget * 0.2)
        }
      },
      courses: [
        {
          name: 'Desert Highlands Golf Club',
          difficulty: 'Private/Championship',
          price_range: '$300-400',
          features: ['Jack Nicklaus design', 'Private club access', 'Exclusive experience']
        },
        {
          name: 'The Boulders Resort - South Course',
          difficulty: 'Resort',
          price_range: '$200-300',
          features: ['Stunning rock formations', '5-star amenities', 'Iconic desert golf']
        },
        {
          name: 'Estancia Club',
          difficulty: 'Private/Championship',
          price_range: '$250-350',
          features: ['Tom Fazio masterpiece', 'Private access', 'Tournament conditions']
        }
      ],
      lodging: {
        type: 'resort',
        name_or_area: 'North Scottsdale',
        nights: 3,
      },
      itinerary: [
        {
          day: 'Day 1 - VIP Arrival',
          items: [
            { type: 'travel', label: 'Private transfer from airport', time_window: 'Morning' },
            { type: 'activity', label: 'Villa check-in & welcome amenity', time_window: 'Afternoon' },
            { type: 'food', label: 'Chef\'s tasting menu dinner', time_window: 'Evening' }
          ]
        },
        {
          day: 'Day 2 - Private Club Golf',
          items: [
            { type: 'golf', label: 'Desert Highlands (private access)', time_window: '8:00 AM' },
            { type: 'food', label: 'Gourmet clubhouse lunch', time_window: '1:00 PM' },
            { type: 'activity', label: 'Spa & pool time', time_window: 'Afternoon' },
            { type: 'food', label: 'Steakhouse dinner', time_window: '7:30 PM' }
          ]
        },
        {
          day: 'Day 3 - Iconic Desert Golf',
          items: [
            { type: 'golf', label: 'The Boulders - South Course', time_window: '8:30 AM' },
            { type: 'food', label: 'Poolside lunch', time_window: '1:00 PM' },
            { type: 'activity', label: 'Whiskey tasting experience', time_window: '4:00 PM' },
            { type: 'food', label: 'Private chef dinner at villa', time_window: '7:00 PM' }
          ]
        },
        {
          day: 'Day 4 - Championship Finale',
          items: [
            { type: 'golf', label: 'Estancia Club (private access)', time_window: '7:30 AM' },
            { type: 'food', label: 'Awards lunch', time_window: '12:30 PM' },
            { type: 'travel', label: 'Private transfer to airport', time_window: 'Afternoon' }
          ]
        }
      ],
      why_it_fits: [
        'Ultimate golf experience',
        'Private club access',
        'VIP treatment throughout',
        'Unforgettable memories',
        'Worth the premium'
      ]
    }
  ];

  return options;
}
