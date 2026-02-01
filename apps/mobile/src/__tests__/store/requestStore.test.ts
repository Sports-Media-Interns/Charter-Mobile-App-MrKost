import { useRequestStore } from '@/store/requestStore';
import { createMockFlightLeg } from '../test-utils';

describe('requestStore', () => {
  beforeEach(() => {
    useRequestStore.getState().resetDraft();
  });

  it('has correct initial state', () => {
    const state = useRequestStore.getState();
    expect(state.draft.tripType).toBe('round_trip');
    expect(state.draft.passengerCount).toBe(1);
    expect(state.draft.urgency).toBe('standard');
    expect(state.draft.legs).toHaveLength(1);
    expect(state.currentStep).toBe(0);
  });

  it('setDraft updates partial fields', () => {
    useRequestStore.getState().setDraft({ passengerCount: 10 });
    expect(useRequestStore.getState().draft.passengerCount).toBe(10);
    expect(useRequestStore.getState().draft.tripType).toBe('round_trip');
  });

  it('setDraft updates trip type', () => {
    useRequestStore.getState().setDraft({ tripType: 'one_way' });
    expect(useRequestStore.getState().draft.tripType).toBe('one_way');
  });

  it('addLeg appends a leg', () => {
    const leg = createMockFlightLeg({ departureAirport: 'SFO', arrivalAirport: 'ORD' });
    useRequestStore.getState().addLeg(leg);
    expect(useRequestStore.getState().draft.legs).toHaveLength(2);
    expect(useRequestStore.getState().draft.legs[1].departureAirport).toBe('SFO');
  });

  it('updateLeg updates specific leg', () => {
    useRequestStore.getState().updateLeg(0, { departureAirport: 'SFO' });
    expect(useRequestStore.getState().draft.legs[0].departureAirport).toBe('SFO');
  });

  it('updateLeg does not affect other legs', () => {
    useRequestStore.getState().addLeg(createMockFlightLeg({ departureAirport: 'ORD' }));
    useRequestStore.getState().updateLeg(0, { departureAirport: 'SFO' });
    expect(useRequestStore.getState().draft.legs[1].departureAirport).toBe('ORD');
  });

  it('removeLeg removes by index', () => {
    useRequestStore.getState().addLeg(createMockFlightLeg({ departureAirport: 'SFO' }));
    useRequestStore.getState().removeLeg(0);
    expect(useRequestStore.getState().draft.legs).toHaveLength(1);
    expect(useRequestStore.getState().draft.legs[0].departureAirport).toBe('SFO');
  });

  it('setStep updates currentStep', () => {
    useRequestStore.getState().setStep(2);
    expect(useRequestStore.getState().currentStep).toBe(2);
  });

  it('resetDraft resets to initial state', () => {
    useRequestStore.getState().setDraft({ passengerCount: 10, tripType: 'one_way' });
    useRequestStore.getState().setStep(3);
    useRequestStore.getState().resetDraft();
    expect(useRequestStore.getState().draft.passengerCount).toBe(1);
    expect(useRequestStore.getState().currentStep).toBe(0);
  });

  it('setRequests stores requests', () => {
    const requests = [{ id: 'r-1' }, { id: 'r-2' }] as any;
    useRequestStore.getState().setRequests(requests);
    expect(useRequestStore.getState().requests).toHaveLength(2);
  });

  it('setDraft updates urgency', () => {
    useRequestStore.getState().setDraft({ urgency: 'emergency' });
    expect(useRequestStore.getState().draft.urgency).toBe('emergency');
  });

  it('setDraft updates baggageNotes', () => {
    useRequestStore.getState().setDraft({ baggageNotes: 'Fragile items' });
    expect(useRequestStore.getState().draft.baggageNotes).toBe('Fragile items');
  });

  it('setDraft updates specialRequirements', () => {
    useRequestStore.getState().setDraft({ specialRequirements: 'Wheelchair access' });
    expect(useRequestStore.getState().draft.specialRequirements).toBe('Wheelchair access');
  });

  it('addLeg preserves existing legs', () => {
    const initial = useRequestStore.getState().draft.legs[0];
    useRequestStore.getState().addLeg(createMockFlightLeg());
    expect(useRequestStore.getState().draft.legs[0]).toEqual(initial);
  });

  it('removeLeg on last leg leaves empty array', () => {
    useRequestStore.getState().removeLeg(0);
    expect(useRequestStore.getState().draft.legs).toHaveLength(0);
  });
});
