export type SeasonCompetitiveSummary = {
  matches: number;
  maps: number;
  rounds: number;
  players: number;
  lastMapEndedAt: string | null;
};

export type SeasonCompetitiveInfo = {
  slug: string;
  name: string;
  description: string | null;
  status: string;
  start_at: string;
  end_at: string;
};

export type SeasonCompetitiveIndexItem = SeasonCompetitiveInfo & {
  summary: SeasonCompetitiveSummary;
};

export type SeasonsCompetitiveIndexResponse = {
  generatedAt: string;
  activeSeasonSlug: string | null;
  seasons: SeasonCompetitiveIndexItem[];
};

export type SeasonCompetitiveDetailResponse = {
  generatedAt: string;
  season: SeasonCompetitiveInfo;
  summary: SeasonCompetitiveSummary;
};
