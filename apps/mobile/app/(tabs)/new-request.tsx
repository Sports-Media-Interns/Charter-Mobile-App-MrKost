import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Card, AirportSearch } from '@/components';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Airport } from '@/data/airports';
import { colors as staticColors, typography, spacing, borderRadius, shadows } from '@/theme';
import { useCRMTracker, useCRMFormTracker } from '@/hooks/useCRMTracker';
import { useTheme } from '@/hooks/useTheme';
import { useCreateRequest } from '@/hooks/useRequests';
import { logger } from '@/utils/logger';

type TripType = 'one_way' | 'round_trip' | 'multi_leg';
type Urgency = 'standard' | 'urgent' | 'emergency';

interface FlightLeg {
  id: string;
  departure: Airport | null;
  arrival: Airport | null;
  date: string;
  time: string;
}

export default function NewRequestScreen() {
  const [tripType, setTripType] = useState<TripType>('one_way');
  const [legs, setLegs] = useState<FlightLeg[]>([
    { id: '1', departure: null, arrival: null, date: '', time: '' },
  ]);
  const [passengers, setPassengers] = useState(1);
  const [urgency, setUrgency] = useState<Urgency>('standard');
  const [specialRequirements, setSpecialRequirements] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const { trackEvent, trackFormAbandon } = useCRMTracker();
  const formTracker = useCRMFormTracker('charter_request');
  const formStartedRef = useRef(false);
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const createRequest = useCreateRequest();

  // Track form step changes
  useEffect(() => {
    if (!formStartedRef.current) {
      formStartedRef.current = true;
      trackEvent('request_created');
    }
  }, []);

  // Track form abandonment on unmount (if not submitted)
  useEffect(() => {
    return () => {
      if (!isSubmitting) {
        trackFormAbandon('charter_request', 'unknown');
      }
    };
  }, [isSubmitting]);

  const updateLeg = (index: number, field: keyof FlightLeg, value: FlightLeg[keyof FlightLeg]) => {
    const newLegs = [...legs];
    newLegs[index] = { ...newLegs[index], [field]: value };
    setLegs(newLegs);
  };

  const addLeg = () => {
    const newLeg: FlightLeg = {
      id: Date.now().toString(),
      departure: legs[legs.length - 1]?.arrival || null,
      arrival: null,
      date: '',
      time: '',
    };
    setLegs([...legs, newLeg]);
  };

  const removeLeg = (index: number) => {
    if (legs.length > 1) {
      setLegs(legs.filter((_, i) => i !== index));
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!legs[0]?.departure) errors.departure = 'Select departure airport';
    if (!legs[0]?.arrival) errors.arrival = 'Select arrival airport';
    if (!legs[0]?.date) errors.date = 'Select departure date';
    if (!legs[0]?.time) errors.time = 'Select departure time';
    if (passengers < 1) errors.passengers = 'At least 1 passenger required';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    // Basic validation
    const firstLeg = legs[0];
    if (!firstLeg?.departure || !firstLeg?.arrival) {
      return;
    }

    setIsSubmitting(true);
    formTracker.onSubmit({
      tripType,
      passengerCount: passengers,
      urgency,
      legCount: legs.length,
    });

    try {
      await createRequest.mutateAsync({
        tripType,
        passengerCount: passengers,
        urgency,
        specialRequirements: specialRequirements || undefined,
        legs: legs.map((leg) => ({
          departureAirport: leg.departure?.iata || '',
          arrivalAirport: leg.arrival?.iata || '',
          departureDate: leg.date,
          departureTime: leg.time,
          flexibilityHours: 0,
        })),
      });
      router.back();
    } catch (err) {
      logger.warn('Failed to create request:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const tripTypes = [
    { value: 'one_way', label: 'One Way', icon: 'arrow-forward' as const },
    { value: 'round_trip', label: 'Round Trip', icon: 'swap-horizontal' as const },
    { value: 'multi_leg', label: 'Multi-Leg', icon: 'git-branch' as const },
  ];

  const urgencyOptions = [
    { value: 'standard', label: 'Standard', description: '48-72 hours notice', color: colors.accent[500] },
    { value: 'urgent', label: 'Urgent', description: '24-48 hours notice', color: colors.warning },
    { value: 'emergency', label: 'Emergency', description: 'Under 24 hours', color: colors.error },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background.secondary }]}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.neutral[0], paddingTop: insets.top + spacing[2] }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn} accessibilityLabel="Close" accessibilityRole="button">
          <Ionicons name="close" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>New Charter Request</Text>
        <ThemeToggle color={colors.text.primary} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Trip Type Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trip Type</Text>
          <View style={styles.tripTypeContainer}>
            {tripTypes.map((type) => (
              <TouchableOpacity
                key={type.value}
                style={[
                  styles.tripTypeOption,
                  tripType === type.value && styles.tripTypeOptionActive,
                ]}
                onPress={() => {
                  setTripType(type.value as TripType);
                  if (type.value === 'one_way') {
                    setLegs([legs[0]]);
                  } else if (type.value === 'round_trip') {
                    setLegs([
                      legs[0],
                      {
                        id: '2',
                        departure: legs[0]?.arrival || null,
                        arrival: legs[0]?.departure || null,
                        date: '',
                        time: '',
                      },
                    ]);
                  }
                }}
                accessibilityLabel={type.label}
                accessibilityRole="button"
              >
                <Ionicons
                  name={type.icon}
                  size={20}
                  color={tripType === type.value ? colors.primary[500] : colors.neutral[400]}
                />
                <Text
                  style={[
                    styles.tripTypeLabel,
                    tripType === type.value && styles.tripTypeLabelActive,
                  ]}
                >
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Flight Legs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Flight Details</Text>
          {legs.map((leg, index) => (
            <Card key={leg.id} variant="outlined" style={styles.legCard}>
              {legs.length > 1 && (
                <View style={styles.legHeader}>
                  <View style={styles.legBadge}>
                    <Text style={styles.legBadgeText}>Leg {index + 1}</Text>
                  </View>
                  {tripType === 'multi_leg' && legs.length > 1 && (
                    <TouchableOpacity onPress={() => removeLeg(index)}>
                      <Ionicons name="trash-outline" size={20} color={colors.error} />
                    </TouchableOpacity>
                  )}
                </View>
              )}

              <AirportSearch
                label="Departure Airport"
                placeholder="Search departure airport..."
                value={leg.departure}
                onChange={(airport) => updateLeg(index, 'departure', airport)}
              />

              <View style={styles.swapContainer}>
                <View style={styles.swapLine} />
                <TouchableOpacity
                  style={styles.swapBtn}
                  onPress={() => {
                    const temp = leg.departure;
                    updateLeg(index, 'departure', leg.arrival);
                    updateLeg(index, 'arrival', temp);
                  }}
                >
                  <Ionicons name="swap-vertical" size={20} color={colors.primary[500]} />
                </TouchableOpacity>
                <View style={styles.swapLine} />
              </View>

              <AirportSearch
                label="Arrival Airport"
                placeholder="Search arrival airport..."
                value={leg.arrival}
                onChange={(airport) => updateLeg(index, 'arrival', airport)}
              />

              <View style={styles.dateTimeRow}>
                <View style={styles.dateInput}>
                  <Text style={styles.inputLabel}>Date</Text>
                  <TouchableOpacity style={styles.dateTimeSelector}>
                    <Ionicons name="calendar-outline" size={20} color={colors.neutral[400]} />
                    <TextInput
                      style={styles.dateTimeText}
                      placeholder="MM/DD/YYYY"
                      placeholderTextColor={colors.neutral[400]}
                      value={leg.date}
                      onChangeText={(value) => updateLeg(index, 'date', value)}
                    />
                  </TouchableOpacity>
                </View>
                <View style={styles.timeInput}>
                  <Text style={styles.inputLabel}>Time</Text>
                  <TouchableOpacity style={styles.dateTimeSelector}>
                    <Ionicons name="time-outline" size={20} color={colors.neutral[400]} />
                    <TextInput
                      style={styles.dateTimeText}
                      placeholder="HH:MM"
                      placeholderTextColor={colors.neutral[400]}
                      value={leg.time}
                      onChangeText={(value) => updateLeg(index, 'time', value)}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </Card>
          ))}

          {tripType === 'multi_leg' && (
            <TouchableOpacity style={styles.addLegBtn} onPress={addLeg}>
              <Ionicons name="add-circle" size={24} color={colors.primary[500]} />
              <Text style={styles.addLegText}>Add Another Leg</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Passengers */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Passengers</Text>
          <Card variant="outlined">
            <View style={styles.passengerRow}>
              <View style={styles.passengerInfo}>
                <Ionicons name="people" size={24} color={colors.primary[500]} />
                <Text style={styles.passengerLabel}>Number of Passengers</Text>
              </View>
              <View style={styles.passengerControls}>
                <TouchableOpacity
                  style={[
                    styles.passengerBtn,
                    passengers <= 1 && styles.passengerBtnDisabled,
                  ]}
                  onPress={() => setPassengers(Math.max(1, passengers - 1))}
                  disabled={passengers <= 1}
                  accessibilityLabel="Decrease passengers"
                  accessibilityRole="button"
                >
                  <Ionicons
                    name="remove"
                    size={20}
                    color={passengers <= 1 ? colors.neutral[300] : colors.primary[500]}
                  />
                </TouchableOpacity>
                <Text style={styles.passengerCount}>{passengers}</Text>
                <TouchableOpacity
                  style={styles.passengerBtn}
                  onPress={() => setPassengers(passengers + 1)}
                  accessibilityLabel="Increase passengers"
                  accessibilityRole="button"
                >
                  <Ionicons name="add" size={20} color={colors.primary[500]} />
                </TouchableOpacity>
              </View>
            </View>
          </Card>
        </View>

        {/* Urgency */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Urgency Level</Text>
          <View style={styles.urgencyContainer}>
            {urgencyOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.urgencyOption,
                  urgency === option.value && styles.urgencyOptionActive,
                  urgency === option.value && { borderColor: option.color },
                ]}
                onPress={() => setUrgency(option.value as Urgency)}
              >
                <View
                  style={[
                    styles.urgencyDot,
                    { backgroundColor: option.color },
                  ]}
                />
                <View style={styles.urgencyContent}>
                  <Text
                    style={[
                      styles.urgencyLabel,
                      urgency === option.value && { color: option.color },
                    ]}
                  >
                    {option.label}
                  </Text>
                  <Text style={styles.urgencyDescription}>{option.description}</Text>
                </View>
                {urgency === option.value && (
                  <Ionicons name="checkmark-circle" size={22} color={option.color} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Special Requirements */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Special Requirements</Text>
          <Card variant="outlined">
            <TextInput
              style={styles.notesInput}
              placeholder="Enter any special requirements, baggage notes, catering requests, etc."
              placeholderTextColor={colors.neutral[400]}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              value={specialRequirements}
              onChangeText={setSpecialRequirements}
            />
          </Card>
        </View>

        {/* Submit Button */}
        <View style={styles.submitSection}>
          <Button
            title="Submit Request for Quotes"
            onPress={handleSubmit}
            loading={isSubmitting}
            disabled={isSubmitting}
            variant="gold"
            size="lg"
            icon="paper-plane"
            iconPosition="right"
          />
          <Text style={styles.submitNote}>
            You'll receive quotes from our network of trusted charter operators within 2-4 hours.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const colors = staticColors;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  header: {
    backgroundColor: colors.neutral[0],
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[4],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  closeBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing[4],
    paddingBottom: 100,
  },
  section: {
    marginBottom: spacing[6],
  },
  sectionTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing[3],
  },
  tripTypeContainer: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  tripTypeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.neutral[0],
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[3],
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.border.light,
    gap: spacing[2],
  },
  tripTypeOptionActive: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[50],
  },
  tripTypeLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.neutral[500],
  },
  tripTypeLabelActive: {
    color: colors.primary[500],
  },
  legCard: {
    marginBottom: spacing[3],
  },
  legHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  legBadge: {
    backgroundColor: colors.primary[100],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.full,
  },
  legBadgeText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary[500],
  },
  swapContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing[2],
  },
  swapLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border.light,
  },
  swapBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: spacing[2],
  },
  dateTimeRow: {
    flexDirection: 'row',
    gap: spacing[3],
    marginTop: spacing[2],
  },
  dateInput: {
    flex: 1.5,
  },
  timeInput: {
    flex: 1,
  },
  inputLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    marginBottom: spacing[2],
  },
  dateTimeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral[0],
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing[3],
    height: 48,
    gap: spacing[2],
  },
  dateTimeText: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
  },
  addLegBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[3],
    gap: spacing[2],
  },
  addLegText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.primary[500],
  },
  passengerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  passengerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  passengerLabel: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
  },
  passengerControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  passengerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  passengerBtnDisabled: {
    backgroundColor: colors.neutral[100],
  },
  passengerCount: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.primary[500],
    marginHorizontal: spacing[4],
    minWidth: 40,
    textAlign: 'center',
  },
  urgencyContainer: {
    gap: spacing[2],
  },
  urgencyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral[0],
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.border.light,
  },
  urgencyOptionActive: {
    backgroundColor: colors.neutral[50],
  },
  urgencyDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing[3],
  },
  urgencyContent: {
    flex: 1,
  },
  urgencyLabel: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
  },
  urgencyDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginTop: spacing[1],
  },
  notesInput: {
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  submitSection: {
    marginTop: spacing[4],
  },
  submitNote: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: spacing[3],
    lineHeight: 20,
  },
});
