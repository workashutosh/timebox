"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DatePicker from "react-datepicker";
import { Task } from "@/lib/types";

interface TaskFormProps {
  onAddTask: (task: Omit<Task, "id" | "timeLeft" | "isActive" | "isCompleted"> & { scheduledTime?: Date }) => void;
}

export default function TaskForm({ onAddTask }: TaskFormProps) {
  const [name, setName] = useState("");
  const [duration, setDuration] = useState("");
  const [priority, setPriority] = useState<"Low" | "Medium" | "High">("Medium");
  const [scheduledTime, setScheduledTime] = useState<Date | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !duration) return;
    onAddTask({ name, duration: parseInt(duration), priority, scheduledTime });
    setName("");
    setDuration("");
    setPriority("Medium");
    setScheduledTime(null);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 mb-6">
      <div className="flex gap-4">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Task name"
          className="w-1/3"
        />
        <Input
          type="number"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          placeholder="Duration (minutes)"
          className="w-1/4"
        />
        <Select value={priority} onValueChange={(value: "Low" | "Medium" | "High") => setPriority(value)}>
          <SelectTrigger className="w-1/4">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Low">Low</SelectItem>
            <SelectItem value="Medium">Medium</SelectItem>
            <SelectItem value="High">High</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex gap-4 items-center">
        <DatePicker
          selected={scheduledTime}
          onChange={(date: Date) => setScheduledTime(date)}
          showTimeSelect
          timeIntervals={15}
          dateFormat="MMMM d, yyyy h:mm aa"
          placeholderText="Schedule task (optional)"
          className="w-full p-2 border rounded"
        />
        <Button type="submit">Add Task</Button>
      </div>
    </form>
  );
}