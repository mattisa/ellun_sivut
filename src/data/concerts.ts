import raw from './concerts.json';

export interface Concert {
  date: string; // YYYY-MM-DD
  time?: string;
  title: string;
  venue: string;
  city: string;
  description?: string;
  link?: string;
}

const all = raw as Concert[];
// Päivämäärä vertaillaan Suomen aikaan, jotta tämän päivän konsertti pysyy "tulevana" koko päivän.
const today = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Helsinki' }).format(new Date());

export const upcoming = all.filter((c) => c.date >= today).sort((a, b) => a.date.localeCompare(b.date));
export const past = all.filter((c) => c.date < today).sort((a, b) => b.date.localeCompare(a.date));

export const fmt = (d: string) =>
  new Intl.DateTimeFormat('fi-FI', { day: 'numeric', month: 'numeric', year: 'numeric', timeZone: 'UTC' }).format(new Date(d + 'T00:00:00Z'));
