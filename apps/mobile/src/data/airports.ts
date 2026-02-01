/**
 * Comprehensive Airport Database for Sports Media Charter
 * Contains major airports with ICAO/IATA codes, city names, and coordinates
 * Optimized for charter jet operations
 */

export interface Airport {
  icao: string;
  iata: string;
  name: string;
  city: string;
  state?: string;
  country: string;
  lat: number;
  lon: number;
  type: 'large' | 'medium' | 'small' | 'private';
  fbo?: string[]; // Fixed Base Operators
}

// Major US Airports - Primary Markets
export const airports: Airport[] = [
  // Northeast
  { icao: 'KJFK', iata: 'JFK', name: 'John F. Kennedy International Airport', city: 'New York', state: 'NY', country: 'USA', lat: 40.6413, lon: -73.7781, type: 'large' },
  { icao: 'KLGA', iata: 'LGA', name: 'LaGuardia Airport', city: 'New York', state: 'NY', country: 'USA', lat: 40.7769, lon: -73.8740, type: 'large' },
  { icao: 'KEWR', iata: 'EWR', name: 'Newark Liberty International Airport', city: 'Newark', state: 'NJ', country: 'USA', lat: 40.6895, lon: -74.1745, type: 'large' },
  { icao: 'KTEB', iata: 'TEB', name: 'Teterboro Airport', city: 'Teterboro', state: 'NJ', country: 'USA', lat: 40.8501, lon: -74.0608, type: 'private', fbo: ['Signature Flight Support', 'Atlantic Aviation', 'Meridian'] },
  { icao: 'KHPN', iata: 'HPN', name: 'Westchester County Airport', city: 'White Plains', state: 'NY', country: 'USA', lat: 41.0670, lon: -73.7076, type: 'medium', fbo: ['Signature Flight Support', 'Million Air'] },
  { icao: 'KBOS', iata: 'BOS', name: 'Boston Logan International Airport', city: 'Boston', state: 'MA', country: 'USA', lat: 42.3656, lon: -71.0096, type: 'large' },
  { icao: 'KBED', iata: 'BED', name: 'Laurence G. Hanscom Field', city: 'Bedford', state: 'MA', country: 'USA', lat: 42.4700, lon: -71.2890, type: 'private', fbo: ['Signature Flight Support', 'Jet Aviation'] },
  { icao: 'KPHL', iata: 'PHL', name: 'Philadelphia International Airport', city: 'Philadelphia', state: 'PA', country: 'USA', lat: 39.8719, lon: -75.2411, type: 'large' },
  { icao: 'KPNE', iata: 'PNE', name: 'Northeast Philadelphia Airport', city: 'Philadelphia', state: 'PA', country: 'USA', lat: 40.0819, lon: -75.0105, type: 'private' },
  { icao: 'KDCA', iata: 'DCA', name: 'Ronald Reagan Washington National Airport', city: 'Washington', state: 'DC', country: 'USA', lat: 38.8512, lon: -77.0402, type: 'large' },
  { icao: 'KIAD', iata: 'IAD', name: 'Washington Dulles International Airport', city: 'Dulles', state: 'VA', country: 'USA', lat: 38.9531, lon: -77.4565, type: 'large' },
  { icao: 'KBWI', iata: 'BWI', name: 'Baltimore/Washington International Airport', city: 'Baltimore', state: 'MD', country: 'USA', lat: 39.1774, lon: -76.6684, type: 'large' },

  // Southeast
  { icao: 'KMIA', iata: 'MIA', name: 'Miami International Airport', city: 'Miami', state: 'FL', country: 'USA', lat: 25.7932, lon: -80.2906, type: 'large' },
  { icao: 'KFLL', iata: 'FLL', name: 'Fort Lauderdale-Hollywood International Airport', city: 'Fort Lauderdale', state: 'FL', country: 'USA', lat: 26.0742, lon: -80.1506, type: 'large' },
  { icao: 'KOPF', iata: 'OPF', name: 'Miami Opa-Locka Executive Airport', city: 'Opa-Locka', state: 'FL', country: 'USA', lat: 25.9070, lon: -80.2784, type: 'private', fbo: ['Signature Flight Support', 'Fontainebleau Aviation'] },
  { icao: 'KPBI', iata: 'PBI', name: 'Palm Beach International Airport', city: 'West Palm Beach', state: 'FL', country: 'USA', lat: 26.6832, lon: -80.0956, type: 'medium' },
  { icao: 'KMCO', iata: 'MCO', name: 'Orlando International Airport', city: 'Orlando', state: 'FL', country: 'USA', lat: 28.4312, lon: -81.3081, type: 'large' },
  { icao: 'KORL', iata: 'ORL', name: 'Orlando Executive Airport', city: 'Orlando', state: 'FL', country: 'USA', lat: 28.5455, lon: -81.3329, type: 'private', fbo: ['Signature Flight Support', 'Atlantic Aviation'] },
  { icao: 'KTPA', iata: 'TPA', name: 'Tampa International Airport', city: 'Tampa', state: 'FL', country: 'USA', lat: 27.9755, lon: -82.5332, type: 'large' },
  { icao: 'KRSW', iata: 'RSW', name: 'Southwest Florida International Airport', city: 'Fort Myers', state: 'FL', country: 'USA', lat: 26.5362, lon: -81.7552, type: 'medium' },
  { icao: 'KATL', iata: 'ATL', name: 'Hartsfield-Jackson Atlanta International Airport', city: 'Atlanta', state: 'GA', country: 'USA', lat: 33.6407, lon: -84.4277, type: 'large' },
  { icao: 'KPDK', iata: 'PDK', name: 'DeKalb-Peachtree Airport', city: 'Atlanta', state: 'GA', country: 'USA', lat: 33.8756, lon: -84.3020, type: 'private', fbo: ['Signature Flight Support', 'Atlantic Aviation', 'Epps Aviation'] },
  { icao: 'KCLT', iata: 'CLT', name: 'Charlotte Douglas International Airport', city: 'Charlotte', state: 'NC', country: 'USA', lat: 35.2140, lon: -80.9431, type: 'large' },
  { icao: 'KRDU', iata: 'RDU', name: 'Raleigh-Durham International Airport', city: 'Raleigh', state: 'NC', country: 'USA', lat: 35.8776, lon: -78.7875, type: 'large' },
  { icao: 'KBNA', iata: 'BNA', name: 'Nashville International Airport', city: 'Nashville', state: 'TN', country: 'USA', lat: 36.1263, lon: -86.6774, type: 'large' },
  { icao: 'KMEM', iata: 'MEM', name: 'Memphis International Airport', city: 'Memphis', state: 'TN', country: 'USA', lat: 35.0424, lon: -89.9767, type: 'large' },
  { icao: 'KJAX', iata: 'JAX', name: 'Jacksonville International Airport', city: 'Jacksonville', state: 'FL', country: 'USA', lat: 30.4941, lon: -81.6879, type: 'large' },
  { icao: 'KMSY', iata: 'MSY', name: 'Louis Armstrong New Orleans International Airport', city: 'New Orleans', state: 'LA', country: 'USA', lat: 29.9934, lon: -90.2580, type: 'large' },

  // Midwest
  { icao: 'KORD', iata: 'ORD', name: "O'Hare International Airport", city: 'Chicago', state: 'IL', country: 'USA', lat: 41.9742, lon: -87.9073, type: 'large' },
  { icao: 'KMDW', iata: 'MDW', name: 'Chicago Midway International Airport', city: 'Chicago', state: 'IL', country: 'USA', lat: 41.7868, lon: -87.7522, type: 'large' },
  { icao: 'KPWK', iata: 'PWK', name: 'Chicago Executive Airport', city: 'Wheeling', state: 'IL', country: 'USA', lat: 42.1142, lon: -87.9015, type: 'private', fbo: ['Signature Flight Support', 'Atlantic Aviation'] },
  { icao: 'KDTW', iata: 'DTW', name: 'Detroit Metropolitan Wayne County Airport', city: 'Detroit', state: 'MI', country: 'USA', lat: 42.2162, lon: -83.3554, type: 'large' },
  { icao: 'KPTK', iata: 'PTK', name: 'Oakland County International Airport', city: 'Pontiac', state: 'MI', country: 'USA', lat: 42.6655, lon: -83.4185, type: 'private' },
  { icao: 'KCLE', iata: 'CLE', name: 'Cleveland Hopkins International Airport', city: 'Cleveland', state: 'OH', country: 'USA', lat: 41.4094, lon: -81.8547, type: 'large' },
  { icao: 'KCMH', iata: 'CMH', name: 'John Glenn Columbus International Airport', city: 'Columbus', state: 'OH', country: 'USA', lat: 39.9980, lon: -82.8919, type: 'large' },
  { icao: 'KCVG', iata: 'CVG', name: 'Cincinnati/Northern Kentucky International Airport', city: 'Cincinnati', state: 'OH', country: 'USA', lat: 39.0488, lon: -84.6678, type: 'large' },
  { icao: 'KIND', iata: 'IND', name: 'Indianapolis International Airport', city: 'Indianapolis', state: 'IN', country: 'USA', lat: 39.7173, lon: -86.2944, type: 'large' },
  { icao: 'KMSP', iata: 'MSP', name: 'Minneapolis-Saint Paul International Airport', city: 'Minneapolis', state: 'MN', country: 'USA', lat: 44.8820, lon: -93.2218, type: 'large' },
  { icao: 'KSTL', iata: 'STL', name: 'St. Louis Lambert International Airport', city: 'St. Louis', state: 'MO', country: 'USA', lat: 38.7487, lon: -90.3700, type: 'large' },
  { icao: 'KMCI', iata: 'MCI', name: 'Kansas City International Airport', city: 'Kansas City', state: 'MO', country: 'USA', lat: 39.2976, lon: -94.7139, type: 'large' },
  { icao: 'KMKE', iata: 'MKE', name: 'Milwaukee Mitchell International Airport', city: 'Milwaukee', state: 'WI', country: 'USA', lat: 42.9472, lon: -87.8966, type: 'large' },

  // Southwest
  { icao: 'KLAS', iata: 'LAS', name: 'Harry Reid International Airport', city: 'Las Vegas', state: 'NV', country: 'USA', lat: 36.0840, lon: -115.1537, type: 'large' },
  { icao: 'KVGT', iata: 'VGT', name: 'North Las Vegas Airport', city: 'North Las Vegas', state: 'NV', country: 'USA', lat: 36.2107, lon: -115.1944, type: 'private', fbo: ['Signature Flight Support', 'Atlantic Aviation'] },
  { icao: 'KHEN', iata: 'HND', name: 'Henderson Executive Airport', city: 'Henderson', state: 'NV', country: 'USA', lat: 35.9728, lon: -115.1344, type: 'private' },
  { icao: 'KPHX', iata: 'PHX', name: 'Phoenix Sky Harbor International Airport', city: 'Phoenix', state: 'AZ', country: 'USA', lat: 33.4373, lon: -112.0078, type: 'large' },
  { icao: 'KSDL', iata: 'SDL', name: 'Scottsdale Airport', city: 'Scottsdale', state: 'AZ', country: 'USA', lat: 33.6229, lon: -111.9107, type: 'private', fbo: ['Signature Flight Support', 'Ross Aviation'] },
  { icao: 'KDFW', iata: 'DFW', name: 'Dallas/Fort Worth International Airport', city: 'Dallas', state: 'TX', country: 'USA', lat: 32.8998, lon: -97.0403, type: 'large' },
  { icao: 'KDAL', iata: 'DAL', name: 'Dallas Love Field', city: 'Dallas', state: 'TX', country: 'USA', lat: 32.8471, lon: -96.8518, type: 'medium' },
  { icao: 'KADS', iata: 'ADS', name: 'Addison Airport', city: 'Addison', state: 'TX', country: 'USA', lat: 32.9686, lon: -96.8364, type: 'private', fbo: ['Million Air', 'Atlantic Aviation'] },
  { icao: 'KHOU', iata: 'HOU', name: 'William P. Hobby Airport', city: 'Houston', state: 'TX', country: 'USA', lat: 29.6454, lon: -95.2789, type: 'medium' },
  { icao: 'KIAH', iata: 'IAH', name: 'George Bush Intercontinental Airport', city: 'Houston', state: 'TX', country: 'USA', lat: 29.9902, lon: -95.3368, type: 'large' },
  { icao: 'KSGR', iata: 'SGR', name: 'Sugar Land Regional Airport', city: 'Sugar Land', state: 'TX', country: 'USA', lat: 29.6223, lon: -95.6565, type: 'private' },
  { icao: 'KSAT', iata: 'SAT', name: 'San Antonio International Airport', city: 'San Antonio', state: 'TX', country: 'USA', lat: 29.5337, lon: -98.4698, type: 'large' },
  { icao: 'KAUS', iata: 'AUS', name: 'Austin-Bergstrom International Airport', city: 'Austin', state: 'TX', country: 'USA', lat: 30.1975, lon: -97.6664, type: 'large' },
  { icao: 'KDEN', iata: 'DEN', name: 'Denver International Airport', city: 'Denver', state: 'CO', country: 'USA', lat: 39.8561, lon: -104.6737, type: 'large' },
  { icao: 'KAPA', iata: 'APA', name: 'Centennial Airport', city: 'Englewood', state: 'CO', country: 'USA', lat: 39.5701, lon: -104.8493, type: 'private', fbo: ['Signature Flight Support', 'TAC Air', 'Modern Aviation'] },
  { icao: 'KASE', iata: 'ASE', name: 'Aspen/Pitkin County Airport', city: 'Aspen', state: 'CO', country: 'USA', lat: 39.2232, lon: -106.8689, type: 'medium' },
  { icao: 'KVNY', iata: 'VNY', name: 'Van Nuys Airport', city: 'Van Nuys', state: 'CA', country: 'USA', lat: 34.2098, lon: -118.4897, type: 'private', fbo: ['Signature Flight Support', 'Castle & Cooke Aviation', 'Clay Lacy Aviation'] },

  // West Coast
  { icao: 'KLAX', iata: 'LAX', name: 'Los Angeles International Airport', city: 'Los Angeles', state: 'CA', country: 'USA', lat: 33.9416, lon: -118.4085, type: 'large' },
  { icao: 'KSNA', iata: 'SNA', name: 'John Wayne Airport', city: 'Santa Ana', state: 'CA', country: 'USA', lat: 33.6762, lon: -117.8674, type: 'medium' },
  { icao: 'KSAN', iata: 'SAN', name: 'San Diego International Airport', city: 'San Diego', state: 'CA', country: 'USA', lat: 32.7336, lon: -117.1897, type: 'large' },
  { icao: 'KCRQ', iata: 'CRQ', name: 'McClellan-Palomar Airport', city: 'Carlsbad', state: 'CA', country: 'USA', lat: 33.1283, lon: -117.2802, type: 'private' },
  { icao: 'KSFO', iata: 'SFO', name: 'San Francisco International Airport', city: 'San Francisco', state: 'CA', country: 'USA', lat: 37.6213, lon: -122.3790, type: 'large' },
  { icao: 'KOAK', iata: 'OAK', name: 'Oakland International Airport', city: 'Oakland', state: 'CA', country: 'USA', lat: 37.7213, lon: -122.2208, type: 'large' },
  { icao: 'KSJC', iata: 'SJC', name: 'San Jose International Airport', city: 'San Jose', state: 'CA', country: 'USA', lat: 37.3626, lon: -121.9291, type: 'large' },
  { icao: 'KPAO', iata: 'PAO', name: 'Palo Alto Airport', city: 'Palo Alto', state: 'CA', country: 'USA', lat: 37.4611, lon: -122.1150, type: 'small' },
  { icao: 'KSEA', iata: 'SEA', name: 'Seattle-Tacoma International Airport', city: 'Seattle', state: 'WA', country: 'USA', lat: 47.4502, lon: -122.3088, type: 'large' },
  { icao: 'KBFI', iata: 'BFI', name: 'Boeing Field/King County International Airport', city: 'Seattle', state: 'WA', country: 'USA', lat: 47.5300, lon: -122.3019, type: 'private', fbo: ['Signature Flight Support', 'Clay Lacy Aviation'] },
  { icao: 'KPDX', iata: 'PDX', name: 'Portland International Airport', city: 'Portland', state: 'OR', country: 'USA', lat: 45.5898, lon: -122.5951, type: 'large' },

  // Hawaii & Alaska
  { icao: 'PHNL', iata: 'HNL', name: 'Daniel K. Inouye International Airport', city: 'Honolulu', state: 'HI', country: 'USA', lat: 21.3187, lon: -157.9225, type: 'large' },
  { icao: 'PHOG', iata: 'OGG', name: 'Kahului Airport', city: 'Kahului', state: 'HI', country: 'USA', lat: 20.8986, lon: -156.4305, type: 'medium' },
  { icao: 'PHKO', iata: 'KOA', name: 'Ellison Onizuka Kona International Airport', city: 'Kailua-Kona', state: 'HI', country: 'USA', lat: 19.7388, lon: -156.0456, type: 'medium' },
  { icao: 'PANC', iata: 'ANC', name: 'Ted Stevens Anchorage International Airport', city: 'Anchorage', state: 'AK', country: 'USA', lat: 61.1743, lon: -149.9962, type: 'large' },

  // Canada - Major Cities
  { icao: 'CYYZ', iata: 'YYZ', name: 'Toronto Pearson International Airport', city: 'Toronto', state: 'ON', country: 'Canada', lat: 43.6777, lon: -79.6248, type: 'large' },
  { icao: 'CYTZ', iata: 'YTZ', name: 'Billy Bishop Toronto City Airport', city: 'Toronto', state: 'ON', country: 'Canada', lat: 43.6275, lon: -79.3962, type: 'medium' },
  { icao: 'CYVR', iata: 'YVR', name: 'Vancouver International Airport', city: 'Vancouver', state: 'BC', country: 'Canada', lat: 49.1967, lon: -123.1815, type: 'large' },
  { icao: 'CYUL', iata: 'YUL', name: 'Montreal-Trudeau International Airport', city: 'Montreal', state: 'QC', country: 'Canada', lat: 45.4706, lon: -73.7408, type: 'large' },
  { icao: 'CYOW', iata: 'YOW', name: 'Ottawa Macdonald-Cartier International Airport', city: 'Ottawa', state: 'ON', country: 'Canada', lat: 45.3225, lon: -75.6692, type: 'large' },
  { icao: 'CYYC', iata: 'YYC', name: 'Calgary International Airport', city: 'Calgary', state: 'AB', country: 'Canada', lat: 51.1215, lon: -114.0076, type: 'large' },
  { icao: 'CYEG', iata: 'YEG', name: 'Edmonton International Airport', city: 'Edmonton', state: 'AB', country: 'Canada', lat: 53.3097, lon: -113.5800, type: 'large' },
  { icao: 'CYWG', iata: 'YWG', name: 'Winnipeg James Armstrong Richardson International Airport', city: 'Winnipeg', state: 'MB', country: 'Canada', lat: 49.9100, lon: -97.2399, type: 'large' },

  // Europe - Major Hubs
  { icao: 'EGLL', iata: 'LHR', name: 'London Heathrow Airport', city: 'London', country: 'United Kingdom', lat: 51.4700, lon: -0.4543, type: 'large' },
  { icao: 'EGLF', iata: 'FAB', name: 'Farnborough Airport', city: 'Farnborough', country: 'United Kingdom', lat: 51.2758, lon: -0.7764, type: 'private', fbo: ['TAG Farnborough', 'Signature Flight Support'] },
  { icao: 'EGGW', iata: 'LTN', name: 'London Luton Airport', city: 'Luton', country: 'United Kingdom', lat: 51.8747, lon: -0.3683, type: 'medium' },
  { icao: 'EGKB', iata: 'BQH', name: 'London Biggin Hill Airport', city: 'Biggin Hill', country: 'United Kingdom', lat: 51.3308, lon: 0.0325, type: 'private' },
  { icao: 'LFPG', iata: 'CDG', name: 'Paris Charles de Gaulle Airport', city: 'Paris', country: 'France', lat: 49.0097, lon: 2.5479, type: 'large' },
  { icao: 'LFPB', iata: 'LBG', name: 'Paris Le Bourget Airport', city: 'Paris', country: 'France', lat: 48.9694, lon: 2.4414, type: 'private', fbo: ['Signature Flight Support', 'Jetex'] },
  { icao: 'LFPO', iata: 'ORY', name: 'Paris Orly Airport', city: 'Paris', country: 'France', lat: 48.7262, lon: 2.3652, type: 'large' },
  { icao: 'EDDF', iata: 'FRA', name: 'Frankfurt Airport', city: 'Frankfurt', country: 'Germany', lat: 50.0379, lon: 8.5622, type: 'large' },
  { icao: 'EDDM', iata: 'MUC', name: 'Munich Airport', city: 'Munich', country: 'Germany', lat: 48.3537, lon: 11.7750, type: 'large' },
  { icao: 'EDDB', iata: 'BER', name: 'Berlin Brandenburg Airport', city: 'Berlin', country: 'Germany', lat: 52.3667, lon: 13.5033, type: 'large' },
  { icao: 'EHAM', iata: 'AMS', name: 'Amsterdam Schiphol Airport', city: 'Amsterdam', country: 'Netherlands', lat: 52.3105, lon: 4.7683, type: 'large' },
  { icao: 'EBBR', iata: 'BRU', name: 'Brussels Airport', city: 'Brussels', country: 'Belgium', lat: 50.9014, lon: 4.4844, type: 'large' },
  { icao: 'LSZH', iata: 'ZRH', name: 'Zurich Airport', city: 'Zurich', country: 'Switzerland', lat: 47.4647, lon: 8.5492, type: 'large' },
  { icao: 'LSGG', iata: 'GVA', name: 'Geneva Airport', city: 'Geneva', country: 'Switzerland', lat: 46.2370, lon: 6.1089, type: 'large' },
  { icao: 'LIRF', iata: 'FCO', name: 'Leonardo da Vinci-Fiumicino Airport', city: 'Rome', country: 'Italy', lat: 41.8003, lon: 12.2389, type: 'large' },
  { icao: 'LIMC', iata: 'MXP', name: 'Milan Malpensa Airport', city: 'Milan', country: 'Italy', lat: 45.6306, lon: 8.7231, type: 'large' },
  { icao: 'LEMD', iata: 'MAD', name: 'Adolfo Suarez Madrid-Barajas Airport', city: 'Madrid', country: 'Spain', lat: 40.4983, lon: -3.5676, type: 'large' },
  { icao: 'LEBL', iata: 'BCN', name: 'Barcelona-El Prat Airport', city: 'Barcelona', country: 'Spain', lat: 41.2974, lon: 2.0833, type: 'large' },
  { icao: 'LPPT', iata: 'LIS', name: 'Lisbon Portela Airport', city: 'Lisbon', country: 'Portugal', lat: 38.7756, lon: -9.1354, type: 'large' },
  { icao: 'LOWW', iata: 'VIE', name: 'Vienna International Airport', city: 'Vienna', country: 'Austria', lat: 48.1103, lon: 16.5697, type: 'large' },
  { icao: 'EKCH', iata: 'CPH', name: 'Copenhagen Airport', city: 'Copenhagen', country: 'Denmark', lat: 55.6180, lon: 12.6508, type: 'large' },
  { icao: 'ESSA', iata: 'ARN', name: 'Stockholm Arlanda Airport', city: 'Stockholm', country: 'Sweden', lat: 59.6519, lon: 17.9186, type: 'large' },
  { icao: 'ENGM', iata: 'OSL', name: 'Oslo Gardermoen Airport', city: 'Oslo', country: 'Norway', lat: 60.1939, lon: 11.1004, type: 'large' },
  { icao: 'EFHK', iata: 'HEL', name: 'Helsinki-Vantaa Airport', city: 'Helsinki', country: 'Finland', lat: 60.3172, lon: 24.9633, type: 'large' },
  { icao: 'EIDW', iata: 'DUB', name: 'Dublin Airport', city: 'Dublin', country: 'Ireland', lat: 53.4264, lon: -6.2499, type: 'large' },
  { icao: 'EGPH', iata: 'EDI', name: 'Edinburgh Airport', city: 'Edinburgh', country: 'United Kingdom', lat: 55.9500, lon: -3.3725, type: 'large' },
  { icao: 'EGCC', iata: 'MAN', name: 'Manchester Airport', city: 'Manchester', country: 'United Kingdom', lat: 53.3537, lon: -2.2750, type: 'large' },
  { icao: 'LGAV', iata: 'ATH', name: 'Athens International Airport', city: 'Athens', country: 'Greece', lat: 37.9364, lon: 23.9445, type: 'large' },
  { icao: 'LTFM', iata: 'IST', name: 'Istanbul Airport', city: 'Istanbul', country: 'Turkey', lat: 41.2753, lon: 28.7519, type: 'large' },

  // Middle East
  { icao: 'OMDB', iata: 'DXB', name: 'Dubai International Airport', city: 'Dubai', country: 'United Arab Emirates', lat: 25.2528, lon: 55.3644, type: 'large' },
  { icao: 'OMDW', iata: 'DWC', name: 'Al Maktoum International Airport', city: 'Dubai', country: 'United Arab Emirates', lat: 24.8967, lon: 55.1614, type: 'large' },
  { icao: 'OMAA', iata: 'AUH', name: 'Abu Dhabi International Airport', city: 'Abu Dhabi', country: 'United Arab Emirates', lat: 24.4330, lon: 54.6511, type: 'large' },
  { icao: 'OERK', iata: 'RUH', name: 'King Khalid International Airport', city: 'Riyadh', country: 'Saudi Arabia', lat: 24.9576, lon: 46.6988, type: 'large' },
  { icao: 'OEJN', iata: 'JED', name: 'King Abdulaziz International Airport', city: 'Jeddah', country: 'Saudi Arabia', lat: 21.6796, lon: 39.1565, type: 'large' },
  { icao: 'OTHH', iata: 'DOH', name: 'Hamad International Airport', city: 'Doha', country: 'Qatar', lat: 25.2731, lon: 51.6081, type: 'large' },
  { icao: 'LLBG', iata: 'TLV', name: 'Ben Gurion Airport', city: 'Tel Aviv', country: 'Israel', lat: 32.0114, lon: 34.8867, type: 'large' },

  // Asia Pacific
  { icao: 'VHHH', iata: 'HKG', name: 'Hong Kong International Airport', city: 'Hong Kong', country: 'Hong Kong', lat: 22.3080, lon: 113.9185, type: 'large' },
  { icao: 'WSSS', iata: 'SIN', name: 'Singapore Changi Airport', city: 'Singapore', country: 'Singapore', lat: 1.3644, lon: 103.9915, type: 'large' },
  { icao: 'RJTT', iata: 'HND', name: 'Tokyo Haneda Airport', city: 'Tokyo', country: 'Japan', lat: 35.5494, lon: 139.7798, type: 'large' },
  { icao: 'RJAA', iata: 'NRT', name: 'Narita International Airport', city: 'Tokyo', country: 'Japan', lat: 35.7647, lon: 140.3864, type: 'large' },
  { icao: 'RKSI', iata: 'ICN', name: 'Incheon International Airport', city: 'Seoul', country: 'South Korea', lat: 37.4602, lon: 126.4407, type: 'large' },
  { icao: 'ZBAA', iata: 'PEK', name: 'Beijing Capital International Airport', city: 'Beijing', country: 'China', lat: 40.0799, lon: 116.6031, type: 'large' },
  { icao: 'ZSPD', iata: 'PVG', name: 'Shanghai Pudong International Airport', city: 'Shanghai', country: 'China', lat: 31.1434, lon: 121.8052, type: 'large' },
  { icao: 'RCTP', iata: 'TPE', name: 'Taiwan Taoyuan International Airport', city: 'Taipei', country: 'Taiwan', lat: 25.0797, lon: 121.2342, type: 'large' },
  { icao: 'VTBS', iata: 'BKK', name: 'Suvarnabhumi Airport', city: 'Bangkok', country: 'Thailand', lat: 13.6900, lon: 100.7501, type: 'large' },
  { icao: 'WMKK', iata: 'KUL', name: 'Kuala Lumpur International Airport', city: 'Kuala Lumpur', country: 'Malaysia', lat: 2.7456, lon: 101.7099, type: 'large' },
  { icao: 'WIII', iata: 'CGK', name: 'Soekarno-Hatta International Airport', city: 'Jakarta', country: 'Indonesia', lat: -6.1256, lon: 106.6558, type: 'large' },
  { icao: 'VDPP', iata: 'PNH', name: 'Phnom Penh International Airport', city: 'Phnom Penh', country: 'Cambodia', lat: 11.5466, lon: 104.8441, type: 'medium' },
  { icao: 'RPLL', iata: 'MNL', name: 'Ninoy Aquino International Airport', city: 'Manila', country: 'Philippines', lat: 14.5086, lon: 121.0194, type: 'large' },
  { icao: 'VIDP', iata: 'DEL', name: 'Indira Gandhi International Airport', city: 'Delhi', country: 'India', lat: 28.5562, lon: 77.1000, type: 'large' },
  { icao: 'VABB', iata: 'BOM', name: 'Chhatrapati Shivaji Maharaj International Airport', city: 'Mumbai', country: 'India', lat: 19.0896, lon: 72.8656, type: 'large' },
  { icao: 'YSSY', iata: 'SYD', name: 'Sydney Kingsford Smith Airport', city: 'Sydney', country: 'Australia', lat: -33.9399, lon: 151.1753, type: 'large' },
  { icao: 'YMML', iata: 'MEL', name: 'Melbourne Airport', city: 'Melbourne', country: 'Australia', lat: -37.6733, lon: 144.8433, type: 'large' },
  { icao: 'YBBN', iata: 'BNE', name: 'Brisbane Airport', city: 'Brisbane', country: 'Australia', lat: -27.3842, lon: 153.1175, type: 'large' },
  { icao: 'YPPH', iata: 'PER', name: 'Perth Airport', city: 'Perth', country: 'Australia', lat: -31.9403, lon: 115.9672, type: 'large' },
  { icao: 'NZAA', iata: 'AKL', name: 'Auckland Airport', city: 'Auckland', country: 'New Zealand', lat: -37.0082, lon: 174.7850, type: 'large' },
  { icao: 'NZWN', iata: 'WLG', name: 'Wellington International Airport', city: 'Wellington', country: 'New Zealand', lat: -41.3272, lon: 174.8053, type: 'medium' },

  // Caribbean & Latin America
  { icao: 'MMMX', iata: 'MEX', name: 'Mexico City International Airport', city: 'Mexico City', country: 'Mexico', lat: 19.4363, lon: -99.0721, type: 'large' },
  { icao: 'MMUN', iata: 'CUN', name: 'Cancun International Airport', city: 'Cancun', country: 'Mexico', lat: 21.0365, lon: -86.8771, type: 'large' },
  { icao: 'MMSM', iata: 'SJD', name: 'Los Cabos International Airport', city: 'San Jose del Cabo', country: 'Mexico', lat: 23.1518, lon: -109.7215, type: 'medium' },
  { icao: 'TNCM', iata: 'SXM', name: 'Princess Juliana International Airport', city: 'St. Maarten', country: 'Sint Maarten', lat: 18.0410, lon: -63.1089, type: 'medium' },
  { icao: 'TIST', iata: 'STT', name: 'Cyril E. King Airport', city: 'Charlotte Amalie', country: 'US Virgin Islands', lat: 18.3373, lon: -64.9734, type: 'medium' },
  { icao: 'TJSJ', iata: 'SJU', name: 'Luis Munoz Marin International Airport', city: 'San Juan', country: 'Puerto Rico', lat: 18.4394, lon: -66.0018, type: 'large' },
  { icao: 'MKJP', iata: 'KIN', name: 'Norman Manley International Airport', city: 'Kingston', country: 'Jamaica', lat: 17.9356, lon: -76.7875, type: 'medium' },
  { icao: 'MYNN', iata: 'NAS', name: 'Lynden Pindling International Airport', city: 'Nassau', country: 'Bahamas', lat: 25.0390, lon: -77.4662, type: 'large' },
  { icao: 'MUCL', iata: 'VRA', name: 'Juan Gualberto Gomez International Airport', city: 'Varadero', country: 'Cuba', lat: 23.0344, lon: -81.4353, type: 'medium' },
  { icao: 'SKBO', iata: 'BOG', name: 'El Dorado International Airport', city: 'Bogota', country: 'Colombia', lat: 4.7016, lon: -74.1469, type: 'large' },
  { icao: 'SEQM', iata: 'UIO', name: 'Mariscal Sucre International Airport', city: 'Quito', country: 'Ecuador', lat: -0.1292, lon: -78.3575, type: 'large' },
  { icao: 'SPIM', iata: 'LIM', name: 'Jorge Chavez International Airport', city: 'Lima', country: 'Peru', lat: -12.0219, lon: -77.1143, type: 'large' },
  { icao: 'SBGR', iata: 'GRU', name: 'Sao Paulo-Guarulhos International Airport', city: 'Sao Paulo', country: 'Brazil', lat: -23.4356, lon: -46.4731, type: 'large' },
  { icao: 'SBGL', iata: 'GIG', name: 'Rio de Janeiro-Galeao International Airport', city: 'Rio de Janeiro', country: 'Brazil', lat: -22.8100, lon: -43.2506, type: 'large' },
  { icao: 'SAEZ', iata: 'EZE', name: 'Ministro Pistarini International Airport', city: 'Buenos Aires', country: 'Argentina', lat: -34.8222, lon: -58.5358, type: 'large' },
  { icao: 'SCEL', iata: 'SCL', name: 'Comodoro Arturo Merino Benitez International Airport', city: 'Santiago', country: 'Chile', lat: -33.3930, lon: -70.7858, type: 'large' },

  // Africa
  { icao: 'FAOR', iata: 'JNB', name: 'O.R. Tambo International Airport', city: 'Johannesburg', country: 'South Africa', lat: -26.1392, lon: 28.2460, type: 'large' },
  { icao: 'FACT', iata: 'CPT', name: 'Cape Town International Airport', city: 'Cape Town', country: 'South Africa', lat: -33.9649, lon: 18.6017, type: 'large' },
  { icao: 'HECA', iata: 'CAI', name: 'Cairo International Airport', city: 'Cairo', country: 'Egypt', lat: 30.1219, lon: 31.4056, type: 'large' },
  { icao: 'DNMM', iata: 'LOS', name: 'Murtala Muhammed International Airport', city: 'Lagos', country: 'Nigeria', lat: 6.5774, lon: 3.3212, type: 'large' },
  { icao: 'HKJK', iata: 'NBO', name: 'Jomo Kenyatta International Airport', city: 'Nairobi', country: 'Kenya', lat: -1.3192, lon: 36.9278, type: 'large' },
  { icao: 'FMEE', iata: 'MRU', name: 'Sir Seewoosagur Ramgoolam International Airport', city: 'Mauritius', country: 'Mauritius', lat: -20.4302, lon: 57.6836, type: 'medium' },
  { icao: 'GMMN', iata: 'CMN', name: 'Mohammed V International Airport', city: 'Casablanca', country: 'Morocco', lat: 33.3675, lon: -7.5900, type: 'large' },
  { icao: 'FMMI', iata: 'TNR', name: 'Ivato International Airport', city: 'Antananarivo', country: 'Madagascar', lat: -18.7969, lon: 47.4789, type: 'medium' },
  { icao: 'FSIA', iata: 'SEZ', name: 'Seychelles International Airport', city: 'Victoria', country: 'Seychelles', lat: -4.6743, lon: 55.5218, type: 'medium' },
];

/**
 * Search airports by query string
 * Matches against ICAO, IATA, city name, and airport name
 */
export type SearchFilter = 'all' | 'code' | 'city' | 'name';

export function searchAirports(query: string, limit: number = 10, filter: SearchFilter = 'all'): Airport[] {
  if (!query || query.length < 2) {
    return [];
  }

  const normalizedQuery = query.toLowerCase().trim();

  const scored = airports
    .map((airport) => {
      let score = 0;

      if (filter === 'code') {
        if (airport.iata.toLowerCase() === normalizedQuery) score = 100;
        else if (airport.icao.toLowerCase() === normalizedQuery) score = 95;
        else if (airport.iata.toLowerCase().startsWith(normalizedQuery)) score = 90;
        else if (airport.icao.toLowerCase().startsWith(normalizedQuery)) score = 85;
      } else if (filter === 'city') {
        if (airport.city.toLowerCase().startsWith(normalizedQuery)) score = 80;
        else if (airport.city.toLowerCase().includes(normalizedQuery)) score = 60;
        else if (airport.state?.toLowerCase() === normalizedQuery) score = 40;
        else if (airport.country.toLowerCase().includes(normalizedQuery)) score = 30;
      } else if (filter === 'name') {
        if (airport.name.toLowerCase().startsWith(normalizedQuery)) score = 80;
        else if (airport.name.toLowerCase().includes(normalizedQuery)) score = 50;
      } else {
        // 'all' — original behavior
        if (airport.iata.toLowerCase() === normalizedQuery) score = 100;
        else if (airport.icao.toLowerCase() === normalizedQuery) score = 95;
        else if (airport.iata.toLowerCase().startsWith(normalizedQuery)) score = 90;
        else if (airport.icao.toLowerCase().startsWith(normalizedQuery)) score = 85;
        else if (airport.city.toLowerCase().startsWith(normalizedQuery)) score = 80;
        else if (airport.city.toLowerCase().includes(normalizedQuery)) score = 60;
        else if (airport.name.toLowerCase().includes(normalizedQuery)) score = 50;
        else if (airport.state?.toLowerCase() === normalizedQuery) score = 40;
        else if (airport.country.toLowerCase().includes(normalizedQuery)) score = 30;
      }

      return { airport, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      const typeOrder = { large: 0, medium: 1, small: 2, private: 3 };
      return typeOrder[a.airport.type] - typeOrder[b.airport.type];
    })
    .slice(0, limit);

  return scored.map((item) => item.airport);
}

/**
 * Get airport by IATA or ICAO code
 */
export function getAirportByCode(code: string): Airport | undefined {
  const normalizedCode = code.toUpperCase().trim();
  return airports.find(
    (airport) =>
      airport.iata === normalizedCode || airport.icao === normalizedCode
  );
}

/**
 * Format airport display string
 */
export function formatAirportDisplay(airport: Airport): string {
  const location = airport.state
    ? `${airport.city}, ${airport.state}`
    : `${airport.city}, ${airport.country}`;
  return `${airport.iata} - ${location}`;
}

/**
 * Format full airport display with name
 */
export function formatAirportFull(airport: Airport): string {
  const location = airport.state
    ? `${airport.city}, ${airport.state}`
    : `${airport.city}, ${airport.country}`;
  return `${airport.iata} - ${airport.name} (${location})`;
}
