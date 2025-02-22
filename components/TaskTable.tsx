"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2, AlertCircle, Circle, CheckCircle } from "lucide-react"; // Import Lucide icons
import { Task } from "@/lib/types";
import Timer from "./Timer";

interface TaskTableProps {
  tasks: Task[];
  onUpdate: (id: string, updates: Partial<Task>) => void;
  onDelete: (id: string) => void;
}

export default function TaskTable({ tasks, onUpdate, onDelete }: TaskTableProps) {
  const getPriorityRowColor = (priority: Task["priority"]) => {
    switch (priority) {
      case "High":
        return "bg-red-50 hover:bg-red-100";
      case "Medium":
        return "bg-yellow-50 hover:bg-yellow-100";
      case "Low":
        return "bg-green-50 hover:bg-green-100";
      default:
        return "bg-gray-50 hover:bg-gray-100";
    }
  };

  const getPriorityIcon = (priority: Task["priority"]) => {
    switch (priority) {
      case "High":
        return <AlertCircle className="w-4 h-4 text-red-600 inline mr-1" />;
      case "Medium":
        return <Circle className="w-4 h-4 text-yellow-600 inline mr-1" />;
      case "Low":
        return <CheckCircle className="w-4 h-4 text-green-600 inline mr-1" />;
      default:
        return <Circle className="w-4 h-4 text-gray-600 inline mr-1" />;
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Task</TableHead>
          <TableHead>Duration</TableHead>
          <TableHead>Priority</TableHead>
          <TableHead>Timer</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tasks.map((task) => (
          <TableRow key={task.id} className={getPriorityRowColor(task.priority)}>
            <TableCell>{task.name}</TableCell>
            <TableCell>{task.duration} min</TableCell>
            <TableCell>
              {getPriorityIcon(task.priority)}
              <span className="align-middle">{task.priority || "Medium"}</span>
            </TableCell>
            <TableCell>
              <Timer task={task} onUpdate={onUpdate} />
            </TableCell>
            <TableCell>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(task.id)}
                disabled={task.isActive}
                className="text-red-600 hover:text-red-800"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}