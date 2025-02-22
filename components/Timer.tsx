"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Task } from "@/lib/types";

interface TimerProps {
    task: Task;
    onUpdate: (id: string, updates: Partial<Task>) => void; // Updated to string
  }

export default function Timer({ task, onUpdate }: TimerProps) {
  const [seconds, setSeconds] = useState(task.timeLeft);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (task.isActive && seconds > 0) {
      interval = setInterval(() => {
        setSeconds((prev) => {
          const newSeconds = prev - 1;
          onUpdate(task.id, { timeLeft: newSeconds }); // This triggers setTasks in Home
          if (newSeconds <= 0) {
            onUpdate(task.id, { isActive: false, isCompleted: true });
          }
          return newSeconds;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [task.isActive, seconds, task.id, onUpdate]);

  const toggleTimer = () => {
    onUpdate(task.id, { isActive: !task.isActive });
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins}:${remainingSecs < 10 ? "0" : ""}${remainingSecs}`;
  };

  return (
    <div className="flex items-center gap-2">
      <span>{formatTime(seconds)}</span>
      {!task.isCompleted && (
        <Button size="sm" onClick={toggleTimer}>
          {task.isActive ? "Pause" : "Start"}
        </Button>
      )}
    </div>
  );
}