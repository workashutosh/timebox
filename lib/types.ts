export interface Task {
  id: string;
  name: string;
  duration: number;
  timeLeft: number;
  isActive: boolean;
  isCompleted: boolean;
  priority: "Low" | "Medium" | "High";
  scheduledTime: string; // Stored as ISO string in Firestore
  userId: string;
}