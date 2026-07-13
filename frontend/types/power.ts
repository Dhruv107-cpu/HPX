export interface LiveGenerationSummary {
  report_timestamp: string;
  fetched_at: string;

  demand_met: number;
  thermal_generation: number;
  gas_generation: number;
  nuclear_generation: number;
  hydro_generation: number;
  renewable_generation: number;
  storage_generation: number;
  other_generation: number;
  transnational_exchange: number;
}

export interface LiveGenerationTrend {
  time: string;
  demand_met: number;
  // Added fields to match the new AreaChart requirements
  thermal_generation: number;
  hydro_generation: number;
}
export interface GenerationTrend {
  time: string;

  thermal_generation: number;
  hydro_generation: number;
  renewable_generation: number;
  gas_generation: number;
  nuclear_generation: number;
  storage_generation: number;
  other_generation: number;
}