export interface PowerStation {
  station_name: string;
  generation_type: string;
  scheduled_generation: number;
  non_scheduled_generation: number;
}

export interface PowerStationFilters {
  state_code?: string;
  generation_type?: string;
  limit?: number;
}
export interface PowerStationPortfolio {
  state_name: string;
  state_code: string;

  total_stations: number;

  total_scheduled_generation: number;

  total_non_scheduled_generation: number;

  thermal_generation: number;

  hydro_generation: number;

  renewable_generation: number;

  gas_generation: number;

  nuclear_generation: number;
}