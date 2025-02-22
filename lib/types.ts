export interface Task {
  id: string;
  name: string;
  duration: number;
  timeLeft: number;
  isActive: boolean;
  isCompleted: boolean;
  userId?: string;
  priority?: "Low" | "Medium" | "High";
  scheduledTime?: string; // ISO string (e.g., "2025-03-01T14:30:00Z")
}