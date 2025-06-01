// src/data/leagues.ts
export interface League {
  id: string;
  name: string;
  logoKey: keyof typeof import('../assets/leagueLogos').leagueLogos;
  route: string;
}

export const leagues: League[] = [
  { id: "1", name: "Liga Española", logoKey: "la_liga", route: "/la_liga" },
  { id: "2", name: "Premier League", logoKey: "premier", route: "/tabla1" },
  { id: "3", name: "Serie A", logoKey: "serie_a", route: "/tabla3" },
  { id: "4", name: "Bundesliga", logoKey: "bundesliga", route: "/tabla4" },
  { id: "5", name: "Ligue 1", logoKey: "ligue_1", route: "/tabla5" },
  { id: "6", name: "Champions League", logoKey: "champions", route: "/tabla6" },
  { id: "7", name: "Europa League", logoKey: "europa", route: "/tabla7" },
];
