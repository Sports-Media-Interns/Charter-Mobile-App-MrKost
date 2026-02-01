import { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, borderRadius, typography, spacing, shadows } from '@/theme';
import {
  Airport,
  SearchFilter,
  searchAirports,
  formatAirportDisplay,
} from '@/data/airports';

interface AirportSearchProps {
  label?: string;
  placeholder?: string;
  value?: Airport | null;
  onChange: (airport: Airport | null) => void;
  error?: string;
  disabled?: boolean;
}

export function AirportSearch({
  label,
  placeholder = 'Search airports...',
  value,
  onChange,
  error,
  disabled = false,
}: AirportSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Airport[]>([]);
  const [searchFilter, setSearchFilter] = useState<SearchFilter>('all');
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const filterOptions: { value: SearchFilter; label: string; icon: string }[] = [
    { value: 'all', label: 'All', icon: 'globe-outline' },
    { value: 'code', label: 'Airport Code', icon: 'pricetag-outline' },
    { value: 'city', label: 'City', icon: 'business-outline' },
    { value: 'name', label: 'Airport Name', icon: 'airplane-outline' },
  ];

  const handleSearch = useCallback((text: string, filter?: SearchFilter) => {
    setQuery(text);
    const activeFilter = filter ?? searchFilter;
    if (text.length >= 2) {
      const searchResults = searchAirports(text, 15, activeFilter);
      setResults(searchResults);
    } else {
      setResults([]);
    }
  }, [searchFilter]);

  const handleSelect = useCallback(
    (airport: Airport) => {
      onChange(airport);
      setIsOpen(false);
      setQuery('');
      setResults([]);
    },
    [onChange]
  );

  const handleClear = useCallback(() => {
    onChange(null);
  }, [onChange]);

  const openModal = useCallback(() => {
    if (!disabled) {
      setIsOpen(true);
      setQuery('');
      setResults([]);
    }
  }, [disabled]);

  const renderAirportItem = ({ item }: { item: Airport }) => (
    <TouchableOpacity
      style={styles.resultItem}
      onPress={() => handleSelect(item)}
      activeOpacity={0.7}
      accessibilityLabel={`${item.iata} - ${item.name}, ${item.city}`}
      accessibilityRole="button"
    >
      <View style={styles.resultIcon}>
        <Ionicons
          name={item.type === 'private' ? 'business' : 'airplane'}
          size={20}
          color={colors.primary[500]}
        />
      </View>
      <View style={styles.resultContent}>
        <View style={styles.resultHeader}>
          <Text style={styles.resultCode}>{item.iata}</Text>
          <Text style={styles.resultIcao}>{item.icao}</Text>
          {item.type === 'private' && (
            <View style={styles.privateBadge}>
              <Text style={styles.privateBadgeText}>Private</Text>
            </View>
          )}
        </View>
        <Text style={styles.resultName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.resultLocation}>
          {item.state
            ? `${item.city}, ${item.state}, ${item.country}`
            : `${item.city}, ${item.country}`}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      <TouchableOpacity
        style={[
          styles.selector,
          disabled && styles.selectorDisabled,
          error && styles.selectorError,
        ]}
        onPress={openModal}
        disabled={disabled}
        activeOpacity={0.7}
        accessibilityLabel={label || "Select airport"}
        accessibilityRole="button"
      >
        {value ? (
          <View style={styles.selectedValue}>
            <View style={styles.selectedIcon}>
              <Ionicons name="airplane" size={18} color={colors.primary[500]} />
            </View>
            <View style={styles.selectedContent}>
              <Text style={styles.selectedCode}>{value.iata}</Text>
              <Text style={styles.selectedLocation}>
                {value.city}
                {value.state ? `, ${value.state}` : ''}
              </Text>
            </View>
            <TouchableOpacity onPress={handleClear} style={styles.clearBtn}>
              <Ionicons name="close-circle" size={20} color={colors.neutral[400]} />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.placeholderContainer}>
            <Ionicons
              name="search"
              size={20}
              color={colors.neutral[400]}
              style={styles.searchIcon}
            />
            <Text style={styles.placeholder}>{placeholder}</Text>
          </View>
        )}
      </TouchableOpacity>

      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={14} color={colors.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <Modal
        visible={isOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsOpen(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Airport</Text>
            <TouchableOpacity
              onPress={() => setIsOpen(false)}
              style={styles.closeBtn}
            >
              <Ionicons name="close" size={24} color={colors.neutral[600]} />
            </TouchableOpacity>
          </View>

          {/* Search Filter Tabs */}
          <View style={styles.filterContainer}>
            {filterOptions.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.filterTab,
                  searchFilter === opt.value && styles.filterTabActive,
                ]}
                onPress={() => {
                  setSearchFilter(opt.value);
                  handleSearch(query, opt.value);
                }}
              >
                <Ionicons
                  name={opt.icon as keyof typeof Ionicons.glyphMap}
                  size={14}
                  color={searchFilter === opt.value ? colors.neutral[0] : colors.neutral[500]}
                />
                <Text
                  style={[
                    styles.filterTabText,
                    searchFilter === opt.value && styles.filterTabTextActive,
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.searchContainer}>
            <Ionicons
              name="search"
              size={20}
              color={colors.neutral[400]}
              style={styles.searchInputIcon}
            />
            <TextInput
              ref={inputRef}
              style={styles.searchInput}
              placeholder={
                searchFilter === 'code' ? 'Enter airport code (e.g. JFK, LAX)...' :
                searchFilter === 'city' ? 'Enter city name (e.g. New York)...' :
                searchFilter === 'name' ? 'Enter airport name (e.g. Kennedy)...' :
                'Search by code, city, or name...'
              }
              placeholderTextColor={colors.neutral[400]}
              value={query}
              onChangeText={(text) => handleSearch(text)}
              autoFocus
              autoCapitalize={searchFilter === 'code' ? 'characters' : 'words'}
              autoCorrect={false}
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => handleSearch('')}>
                <Ionicons name="close-circle" size={20} color={colors.neutral[400]} />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.resultsContainer}>
            {query.length < 2 ? (
              <View style={styles.emptyState}>
                <Ionicons
                  name="airplane-outline"
                  size={48}
                  color={colors.neutral[300]}
                />
                <Text style={styles.emptyStateTitle}>Search for an airport</Text>
                <Text style={styles.emptyStateText}>
                  Enter at least 2 characters to search by airport code (JFK, LAX),
                  city name (New York), or airport name.
                </Text>
              </View>
            ) : results.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons
                  name="search-outline"
                  size={48}
                  color={colors.neutral[300]}
                />
                <Text style={styles.emptyStateTitle}>No airports found</Text>
                <Text style={styles.emptyStateText}>
                  Try a different search term or check your spelling.
                </Text>
              </View>
            ) : (
              <FlatList
                data={results}
                keyExtractor={(item) => item.icao}
                renderItem={renderAirportItem}
                contentContainerStyle={styles.resultsList}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              />
            )}
          </View>

          <View style={styles.modalFooter}>
            <Text style={styles.footerText}>
              {results.length > 0
                ? `${results.length} airport${results.length !== 1 ? 's' : ''} found`
                : 'Search our database of 150+ airports worldwide'}
            </Text>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing[4],
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    marginBottom: spacing[2],
  },
  selector: {
    backgroundColor: colors.neutral[0],
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: borderRadius.lg,
    height: 56,
    justifyContent: 'center',
    paddingHorizontal: spacing[4],
  },
  selectorDisabled: {
    backgroundColor: colors.neutral[100],
    opacity: 0.7,
  },
  selectorError: {
    borderColor: colors.error,
  },
  placeholderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchIcon: {
    marginRight: spacing[3],
  },
  placeholder: {
    fontSize: typography.fontSize.base,
    color: colors.neutral[400],
  },
  selectedValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[3],
  },
  selectedContent: {
    flex: 1,
  },
  selectedCode: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary[500],
  },
  selectedLocation: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  clearBtn: {
    padding: spacing[1],
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing[1],
  },
  errorText: {
    fontSize: typography.fontSize.sm,
    color: colors.error,
    marginLeft: spacing[1],
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[6],
    paddingTop: spacing[6],
    paddingBottom: spacing[4],
    backgroundColor: colors.neutral[0],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  modalTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  closeBtn: {
    padding: spacing[2],
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing[4],
    paddingTop: spacing[3],
    gap: spacing[2],
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    borderRadius: borderRadius.full,
    backgroundColor: colors.neutral[100],
    gap: 4,
  },
  filterTabActive: {
    backgroundColor: colors.primary[500],
  },
  filterTabText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    color: colors.neutral[500],
  },
  filterTabTextActive: {
    color: colors.neutral[0],
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral[0],
    marginHorizontal: spacing[4],
    marginVertical: spacing[4],
    paddingHorizontal: spacing[4],
    height: 48,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
    ...shadows.sm,
  },
  searchInputIcon: {
    marginRight: spacing[3],
  },
  searchInput: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    height: '100%',
  },
  resultsContainer: {
    flex: 1,
  },
  resultsList: {
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[4],
  },
  resultItem: {
    flexDirection: 'row',
    backgroundColor: colors.neutral[0],
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    marginBottom: spacing[2],
    ...shadows.sm,
  },
  resultIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[3],
  },
  resultContent: {
    flex: 1,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[1],
  },
  resultCode: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary[500],
    marginRight: spacing[2],
  },
  resultIcao: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginRight: spacing[2],
  },
  privateBadge: {
    backgroundColor: colors.secondary[100],
    paddingHorizontal: spacing[2],
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  privateBadgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    color: colors.secondary[700],
  },
  resultName: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    marginBottom: spacing[1],
  },
  resultLocation: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[8],
  },
  emptyStateTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginTop: spacing[4],
    marginBottom: spacing[2],
  },
  emptyStateText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  modalFooter: {
    backgroundColor: colors.neutral[0],
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  footerText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});
