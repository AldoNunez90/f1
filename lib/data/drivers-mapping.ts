export const DRIVER_NUMBER_TO_ID: Record<string, string> = {
  "1": "verstappen",
  "81": "piastri",
  "4": "norris",
  "16": "leclerc",
  "55": "sainz",
  "44": "hamilton",
  "63": "russell",
  "14": "alonso",
  "18": "stroll",
  "10": "gasly",
  "31": "ocon",
  "23": "albon",
  "2": "sargeant",
  "3": "ricciardo",
  "22": "tsunoda",
  "77": "bottas",
  "24": "zhou",
  "20": "magnussen",
  "27": "hulkenberg",
  "43": "colapinto",
  "30": "lawson",
  "87": "bearman",
  "12": "antonelli",
  "5": "bortoleto",
  "7": "doohan",
  "11": "perez",
};

export function normalizeDriverId(openF1DriverNumber?: string): string {
  if (!openF1DriverNumber) return "";
  return DRIVER_NUMBER_TO_ID[openF1DriverNumber] || openF1DriverNumber.toLowerCase();
}