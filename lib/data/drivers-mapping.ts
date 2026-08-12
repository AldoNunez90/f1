export const DRIVER_NUMBER_TO_ID: Record<string, string> = {
  "1": "norris",
  "3": "verstappen",
  "5": "bortoleto",
  "6": "hadjar",
  "10": "gasly",
  "23": "albon",
  "44": "hamilton",
  "14": "alonso",
  "77": "bottas",
  "16": "leclerc",
  "63": "russell",
  "11": "perez",
  "12": "antonelli",
  "55": "sainz",
  "31": "ocon",
  "87": "bearman",
  "27": "hülkenberg",
  "30": "lawson",
  "18": "stroll",
  "43": "colapinto",
  "41": "lindblad",  
  "81": "piastri",

};

export function normalizeDriverId(openF1DriverNumber?: string): string {
  if (!openF1DriverNumber) return "";
  return DRIVER_NUMBER_TO_ID[openF1DriverNumber] || openF1DriverNumber.toLowerCase();
}