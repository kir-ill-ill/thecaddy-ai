import fs from 'fs/promises';
import path from 'path';
import { TripBrief, TripOption } from './types';

export interface StoredTrip {
  id: string;
  tripBrief: Partial<TripBrief>;
  options: TripOption[];
  selectedOptions: string[];
  votes: {
    [voterId: string]: {
      name: string;
      votedFor: string[]; // Option IDs
      timestamp: string;
    };
  };
  createdAt: string;
  updatedAt: string;
  creatorName?: string;
}

const TRIPS_DIR = path.join(process.cwd(), 'data', 'trips');

// Ensure trips directory exists
async function ensureTripsDir() {
  try {
    await fs.mkdir(TRIPS_DIR, { recursive: true });
  } catch (error) {
    console.error('Error creating trips directory:', error);
  }
}

// Generate unique trip ID
export function generateTripId(): string {
  return `trip_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// Save trip to file
export async function saveTrip(trip: StoredTrip): Promise<void> {
  await ensureTripsDir();
  const filePath = path.join(TRIPS_DIR, `${trip.id}.json`);
  await fs.writeFile(filePath, JSON.stringify(trip, null, 2), 'utf-8');
}

// Load trip from file
export async function loadTrip(tripId: string): Promise<StoredTrip | null> {
  try {
    const filePath = path.join(TRIPS_DIR, `${tripId}.json`);
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading trip:', error);
    return null;
  }
}

// Add vote to trip
export async function addVote(
  tripId: string,
  voterId: string,
  voterName: string,
  optionIds: string[]
): Promise<StoredTrip | null> {
  const trip = await loadTrip(tripId);
  if (!trip) return null;

  trip.votes[voterId] = {
    name: voterName,
    votedFor: optionIds,
    timestamp: new Date().toISOString(),
  };
  trip.updatedAt = new Date().toISOString();

  await saveTrip(trip);
  return trip;
}

// Get vote summary for trip
export function getVoteSummary(trip: StoredTrip) {
  const optionVotes: { [optionId: string]: number } = {};
  const voters: { [voterId: string]: string } = {};
  let totalVoters = 0;

  Object.entries(trip.votes).forEach(([voterId, vote]) => {
    voters[voterId] = vote.name;
    totalVoters++;

    vote.votedFor.forEach((optionId) => {
      optionVotes[optionId] = (optionVotes[optionId] || 0) + 1;
    });
  });

  // Rank options by vote count
  const rankedOptions = Object.entries(optionVotes)
    .map(([optionId, votes]) => ({ optionId, votes }))
    .sort((a, b) => b.votes - a.votes);

  return {
    optionVotes,
    voters,
    totalVoters,
    rankedOptions,
    consensus: rankedOptions.length > 0 && rankedOptions[0].votes / totalVoters >= 0.6,
  };
}

// List all trips (for dashboard)
export async function listTrips(): Promise<StoredTrip[]> {
  await ensureTripsDir();
  try {
    const files = await fs.readdir(TRIPS_DIR);
    const trips = await Promise.all(
      files
        .filter((f) => f.endsWith('.json'))
        .map(async (file) => {
          const data = await fs.readFile(path.join(TRIPS_DIR, file), 'utf-8');
          return JSON.parse(data);
        })
    );
    return trips.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    console.error('Error listing trips:', error);
    return [];
  }
}
