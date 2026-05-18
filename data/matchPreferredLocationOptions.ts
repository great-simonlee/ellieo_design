/**
 * Preferred location options for Match setup.
 * Replace `MATCH_PREFERRED_AREAS` and `MATCH_NEIGHBORHOODS_BY_AREA` when final lists are ready.
 */
export const MATCH_PREFERRED_AREAS = [
  'Manhattan',
  'Brooklyn',
  'Queens',
] as const;

export type MatchPreferredArea = (typeof MATCH_PREFERRED_AREAS)[number];

/** Neighborhoods keyed by area — swap values when you have the official list. */
export const MATCH_NEIGHBORHOODS_BY_AREA: Record<
  MatchPreferredArea,
  readonly string[]
> = {
  Manhattan: [
    'Battery Park City',
    'Chelsea',
    'Chinatown',
    'East Harlem',
    'East Village',
    'Financial District',
    'Flatiron',
    'Gramercy',
    'Greenwich Village',
    'Harlem',
    "Hell's Kitchen",
    'Hudson Yards',
    'Inwood',
    'Kips Bay',
    'Lower East Side',
    'Midtown',
    'Midtown East',
    'Midtown West',
    'Morningside Heights',
    'Murray Hill',
    'NoHo',
    'Nolita',
    'Roosevelt Island',
    'SoHo',
    'Tribeca',
    'Union Square',
    'Upper East Side',
    'Upper West Side',
    'Washington Heights',
    'West Village',
  ],
  Brooklyn: [
    'Williamsburg',
    'Park Slope',
    'Brooklyn Heights',
    'Bushwick',
    'DUMBO',
  ],
  Queens: ['Astoria', 'Long Island City', 'Forest Hills', 'Sunnyside'],
};

export function neighborhoodsForArea(
  area: MatchPreferredArea | null,
): readonly string[] {
  if (!area) return [];
  return MATCH_NEIGHBORHOODS_BY_AREA[area] ?? [];
}
