/**
 * Tipos para la API de F1
 */

export type F1Endpoint =
  | 'drivers'
  | 'races'
  | 'sessions'
  | 'laps'
  | 'intervals'
  | 'pit_stops'
  | 'weather'
  | 'positions'
  | 'qualifying'
  | 'race_control_events';

export interface Driver {
  driver_number?: number;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  headshot_url?: string;
  team?: string;
  country_code?: string;
  abbreviation?: string;
}

export interface Race {
  year?: number;
  round?: number;
  date?: string;
  location?: string;
  country?: string;
  circuit_name?: string;
  circuit_key?: number;
  session_key?: number;
}

export interface Session {
  session_key?: number;
  session_name?: string;
  session_type?: 'Practice' | 'Qualifying' | 'Race' | 'SprintQualifying' | 'Sprint';
  date_start?: string;
  date_end?: string;
  gmt_offset?: string;
  is_open?: boolean;
}

export interface Lap {
  session_key?: number;
  driver_number?: number;
  lap_number?: number;
  duration_sector_1?: number;
  duration_sector_2?: number;
  duration_sector_3?: number;
  duration?: number;
  is_pit_out_lap?: boolean;
  is_pit_in_lap?: boolean;
  is_valid_for_qualifying?: boolean;
}

export interface Weather {
  session_key?: number;
  date?: string;
  track_status?: string;
  temperature?: number;
  humidity?: number;
  wind_direction?: number;
  wind_speed?: number;
  air_temperature?: number;
}

export interface F1APIResponse<T> {
  success: boolean;
  endpoint: string;
  queryParams?: Record<string, string | number> | null;
  data: T;
  cached: boolean;
  timestamp: string;
}
