import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ChatMessage, TripBrief, TripOption, PlanningState, GroupResponses } from './types';

interface PlanningStore {
  // State
  currentState: PlanningState;
  messages: ChatMessage[];
  tripBrief: Partial<TripBrief> | null;
  options: TripOption[];
  selectedOptions: string[]; // IDs of options user/group likes
  finalOption: TripOption | null;
  groupResponses: GroupResponses | null;
  isLoading: boolean;
  currentView: 'chat' | 'options' | 'vote' | 'itinerary';
  tripId: string | null;

  // Actions
  setState: (state: PlanningState) => void;
  setView: (view: 'chat' | 'options' | 'vote' | 'itinerary') => void;
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  updateTripBrief: (brief: Partial<TripBrief>) => void;
  setOptions: (options: TripOption[]) => void;
  toggleOptionSelection: (optionId: string) => void;
  setFinalOption: (option: TripOption) => void;
  setGroupResponses: (responses: GroupResponses) => void;
  setLoading: (loading: boolean) => void;
  setTripId: (id: string) => void;
  reset: () => void;
}

export const usePlanningStore = create<PlanningStore>()(
  persist(
    (set) => ({
      // Initial State
      currentState: 'S0_START',
      messages: [],
      tripBrief: null,
      options: [],
      selectedOptions: [],
      finalOption: null,
      groupResponses: null,
      isLoading: false,
      currentView: 'chat',
      tripId: null,

      // Actions
      setState: (state) => set({ currentState: state }),

      setView: (view) => set({ currentView: view }),

      addMessage: (message) =>
        set((state) => ({
          messages: [
            ...state.messages,
            {
              ...message,
              id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              timestamp: new Date(),
            },
          ],
        })),

      updateTripBrief: (brief) =>
        set((state) => ({
          tripBrief: { ...state.tripBrief, ...brief },
        })),

      setOptions: (options) => set({ options }),

      toggleOptionSelection: (optionId) =>
        set((state) => ({
          selectedOptions: state.selectedOptions.includes(optionId)
            ? state.selectedOptions.filter((id) => id !== optionId)
            : [...state.selectedOptions, optionId],
        })),

      setFinalOption: (option) => set({ finalOption: option }),

      setGroupResponses: (responses) => set({ groupResponses: responses }),

      setLoading: (loading) => set({ isLoading: loading }),

      setTripId: (id) => set({ tripId: id }),

      reset: () =>
        set({
          currentState: 'S0_START',
          messages: [],
          tripBrief: null,
          options: [],
          selectedOptions: [],
          finalOption: null,
          groupResponses: null,
          isLoading: false,
          currentView: 'chat',
          tripId: null,
        }),
    }),
    {
      name: 'thecaddy-trip-storage',
    }
  )
);
