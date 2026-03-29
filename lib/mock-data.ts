import { TripBrief, TripOption } from './types';

// Mock trip brief extraction - extracts key details from user message
export function mockExtractTripBrief(userMessage: string, existingBrief?: Partial<TripBrief>) {
  const message = userMessage.toLowerCase();
  const brief: Partial<TripBrief> = { ...existingBrief };

  // Extract destination
  const destinations = ['scottsdale', 'phoenix', 'vegas', 'pebble beach', 'bandon', 'kiawah', 'pinehurst', 'myrtle beach'];
  const foundDest = destinations.find(dest => message.includes(dest));
  if (foundDest) {
    brief.destination = {
      city: foundDest.charAt(0).toUpperCase() + foundDest.slice(1),
      state: foundDest === 'scottsdale' || foundDest === 'phoenix' ? 'AZ' :
             foundDest === 'vegas' ? 'NV' :
             foundDest === 'pebble beach' || foundDest === 'bandon' ? 'CA' :
             foundDest === 'kiawah' ? 'SC' : 'NC'
    };
    brief.trip_name = `${brief.destination.city} Golf Trip`;
  }

  // Extract party size
  const partyMatch = message.match(/(\d+)\s*(guys|people|players|golfers)/);
  if (partyMatch) {
    brief.party = { players: parseInt(partyMatch[1]) };
  }

  // Extract budget
  const budgetMatch = message.match(/\$?(\d+,?\d*)\s*(budget|per person|pp)/);
  if (budgetMatch) {
    const budget = parseInt(budgetMatch[1].replace(',', ''));
    brief.budget = { per_person: budget };
  }

  // Extract dates
  const months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
  const foundMonth = months.findIndex(month => message.includes(month));
  if (foundMonth !== -1) {
    const year = new Date().getFullYear();
    const startDate = new Date(year, foundMonth, 15);
    const endDate = new Date(year, foundMonth, 18);
    brief.dates = {
      start: startDate.toISOString().split('T')[0],
      end: endDate.toISOString().split('T')[0]
    };
  }

  // Extract preferences
  if (message.includes('bachelor')) {
    brief.preferences = { vibe: 'casual', lodging: 'resort' };
  } else if (message.includes('luxury') || message.includes('high end')) {
    brief.preferences = { vibe: 'mixed', lodging: 'resort' };
  } else {
    brief.preferences = { vibe: 'competitive_fun', lodging: 'resort' };
  }

  // Check what's missing
  const missingFields: string[] = [];
  if (!brief.destination) missingFields.push('destination');
  if (!brief.party) missingFields.push('group size');
  if (!brief.budget) missingFields.push('budget');
  if (!brief.dates) missingFields.push('dates');

  return {
    trip_brief: brief,
    missing_fields: missingFields,
    follow_up_question: missingFields.length > 0
      ? `Got it! Can you tell me more about: ${missingFields.join(', ')}?`
      : null
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
