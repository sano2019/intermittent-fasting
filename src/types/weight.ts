export interface WeightLog {
  id: string;
  date: string; // ISO date string "YYYY-MM-DD"
  weight: number;
  unit: "kg" | "lbs";
  note?: string;
  createdAt: string;
}
