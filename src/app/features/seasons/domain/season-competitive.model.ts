import type { AdminSeasonStatus } from './admin-season.model';

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
  status: AdminSeasonStatus;
  startAt: string;
  endAt: string;
};

export type SeasonCompetitiveIndexItem = SeasonCompetitiveInfo & {
  summary: SeasonCompetitiveSummary;
};

export type SeasonsCompetitiveIndex = {
  generatedAt: string;
  activeSeasonSlug: string | null;
  seasons: SeasonCompetitiveIndexItem[];
};

export type SeasonCompetitiveDetail = {
  generatedAt: string;
  season: SeasonCompetitiveInfo;
  summary: SeasonCompetitiveSummary;
};
