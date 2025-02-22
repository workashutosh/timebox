"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import TaskForm from "@/components/TaskForm";
import TaskTable from "@/components/TaskTable";
import Auth from "@/components/Auth";
import Timer from "@/components/Timer";
import { Task } from "@/lib/types";
import { auth, db } from "@/lib/firebase";
import { collection, addDoc, onSnapshot, query, where, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { Table, LayoutGrid, Clock, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [user, setUser] = useState<any>(null);
  const [viewMode, setViewMode] = useState<"table" | "cards" | "calendar">("cards");
  const [timerMode, setTimerMode] = useState<"timebox" | "pomodoro">("timebox");
  const [pomodoroTime, setPomodoroTime] = useState(25 * 60);
  const [isPomodoroRunning, setIsPomodoroRunning] = useState(false);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [remainingTaskTime, setRemainingTaskTime] = useState<number>(0);
  const [currentWeekStart, setCurrentWeekStart] = useState(new Date(new Date().setHours(0, 0, 0, 0)));
  const router = useRouter();

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
        const q = query(collection(db, "tasks"), where("userId", "==", user.uid));
        const unsubscribeTasks = onSnapshot(
          q,
          (snapshot) => {
            const userTasks = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            })) as Task[];
            setTasks(userTasks);
          },
          (error) => {
            console.error("Firestore listener error:", error.message, error.code);
          }
        );
        return () => unsubscribeTasks();
      } else {
        router.push("/");
      }
    });
    return () => unsubscribeAuth();
  }, [router]);

  // Pomodoro Timer Logic
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (isPomodoroRunning && pomodoroTime > 0) {
      interval = setInterval(() => {
        setPomodoroTime((prev) => {
          const newTime = prev - 1;
          setRemainingTaskTime((prev) => Math.max(prev - 1, 0));
          if (newTime <= 0 || remainingTaskTime <= 1) {
            handlePomodoroPhaseEnd();
          }
          return newTime;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPomodoroRunning, pomodoroTime, remainingTaskTime]);

  const handlePomodoroPhaseEnd = () => {
    if (activeTaskId) {
      const currentTask = tasks.find((task) => task.id === activeTaskId);
      if (currentTask && remainingTaskTime <= 0) {
        updateTask(activeTaskId, { isCompleted: true });
      }
    }
    const incompleteTasks = tasks.filter((task) => !task.isCompleted);
    const nextTask = incompleteTasks.find((task) => task.id !== activeTaskId);
    if (nextTask) {
      setActiveTaskId(nextTask.id);
      setRemainingTaskTime(nextTask.duration * 60);
      setPomodoroTime(25 * 60);
    } else {
      setIsPomodoroRunning(false);
      setActiveTaskId(null);
      setPomodoroTime(25 * 60);
    }
  };

  const startPomodoro = () => {
    const incompleteTasks = tasks.filter((task) => !task.isCompleted);
    if (incompleteTasks.length === 0) {
      alert("No incomplete tasks to start a Pomodoro!");
      return;
    }
    const firstTask = incompleteTasks[0];
    setActiveTaskId(firstTask.id);
    setRemainingTaskTime(firstTask.duration * 60);
    setPomodoroTime(25 * 60);
    setIsPomodoroRunning(true);
  };

  const addTask = async (newTask: Omit<Task, "id" | "timeLeft" | "isActive" | "isCompleted" | "priority" | "scheduledTime"> & { scheduledTime?: Date }) => {
    if (!user) return;
    const task = {
      ...newTask,
      timeLeft: newTask.duration * 60,
      isActive: false,
      isCompleted: false,
      priority: newTask.priority || "Medium",
      userId: user.uid,
      scheduledTime: newTask.scheduledTime ? newTask.scheduledTime.toISOString() : undefined,
    };
    try {
      await addDoc(collection(db, "tasks"), task);
    } catch (error) {
      console.error("Error adding task:", error.message, error.code);
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    if (!user) return;
    const taskRef = doc(db, "tasks", id);
    try {
      await updateDoc(taskRef, updates);
    } catch (error) {
      console.error("Error updating task:", error.message, error.code);
    }
  };

  const deleteTask = async (id: string) => {
    if (!user) return;
    const taskRef = doc(db, "tasks", id);
    try {
      await deleteDoc(taskRef);
    } catch (error) {
      console.error("Error deleting task:", error.message, error.code);
    }
  };

  // Task Statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((task) => task.isCompleted).length;
  const totalDuration = tasks.reduce((sum, task) => sum + (task.isCompleted ? 0 : task.duration), 0);
  const pomodoroSessionsNeeded = Math.ceil(totalDuration / 25);
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Card View Component
  const TaskCard = ({ task, onUpdate, onDelete }: { task: Task; onUpdate: (id: string, updates: Partial<Task>) => void; onDelete: (id: string) => void }) => {
    const priorityColor = {
      High: "bg-red-100 border-red-500",
      Medium: "bg-yellow-100 border-yellow-500",
      Low: "bg-green-100 border-green-500",
    }[task.priority || "Medium"];

    return (
      <Card className={`p-2 ${priorityColor} border-l-4 shadow-md hover:shadow-lg transition-shadow ${task.id === activeTaskId ? "ring-2 ring-indigo-500" : ""}`}>
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-md font-semibold text-gray-800">{task.name}</h3>
            <p className="text-xs text-gray-600">{task.duration} min</p>
            {task.scheduledTime && (
              <p className="text-xs text-gray-500">{new Date(task.scheduledTime).toLocaleString()}</p>
            )}
          </div>
          <div className="flex gap-1">
            {timerMode === "timebox" ? (
              <Timer task={task} onUpdate={onUpdate} />
            ) : (
              <span className="text-xs">{task.id === activeTaskId ? "Active" : task.isCompleted ? "Done" : "Pending"}</span>
            )}
            <Button variant="destructive" size="sm" onClick={() => onDelete(task.id)} disabled={task.isActive}>
              Delete
            </Button>
          </div>
        </div>
      </Card>
    );
  };

  // Google Calendar-inspired Calendar View Component
  const CalendarView = ({ tasks }: { tasks: Task[] }) => {
    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const weekStart = new Date(currentWeekStart);
    const weekDays = Array.from({ length: 7 }, (_, i) => {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + i);
      return day;
    });

    const navigateWeek = (direction: "prev" | "next") => {
      const newStart = new Date(weekStart);
      newStart.setDate(weekStart.getDate() + (direction === "prev" ? -7 : 7));
      setCurrentWeekStart(newStart);
    };

    const getTaskPosition = (task: Task) => {
      if (!task.scheduledTime) return null;
      const startTime = new Date(task.scheduledTime);
      const hour = startTime.getHours();
      const minutes = startTime.getMinutes();
      const top = (hour * 60 + minutes) / (24 * 60);
      const height = (task.duration / (24 * 60)) * 100;
      return { top: `${top * 100}%`, height: `${height}%` };
    };

    const priorityColor = (priority: Task["priority"]) =>
      ({
        High: "bg-red-200 border-red-500",
        Medium: "bg-yellow-200 border-yellow-500",
        Low: "bg-green-200 border-green-500",
      }[priority || "Medium"]);

    return (
      <div>
        <div className="flex justify-between items-center mb-2">
          <Button variant="outline" onClick={() => navigateWeek("prev")}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-md font-semibold text-indigo-900">
            {weekStart.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </span>
          <Button variant="outline" onClick={() => navigateWeek("next")}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
        <div className="grid grid-cols-[40px_repeat(7,_1fr)] gap-0.5">
          <div className="col-span-1">
            {hours.map((hour) => (
              <div key={hour} className="h-10 text-right pr-1 text-gray-500 text-xs">
                {hour === 0 ? "12 AM" : hour <= 11 ? `${hour} AM` : hour === 12 ? "12 PM" : `${hour - 12} PM`}
              </div>
            ))}
          </div>
          {weekDays.map((day, index) => (
            <div key={index} className="relative border-l border-gray-200">
              <div className="text-center font-semibold text-indigo-800 py-1 text-sm border-b border-gray-200">
                {daysOfWeek[day.getDay()]} {day.getDate()}
              </div>
              <div className="h-[960px] relative"> {/* Reduced from 1152px */}
                {tasks
                  .filter((task) => task.scheduledTime && new Date(task.scheduledTime).toDateString() === day.toDateString())
                  .map((task) => {
                    const position = getTaskPosition(task);
                    if (!position) return null;
                    return (
                      <div
                        key={task.id}
                        className={`absolute w-full p-0.5 rounded ${priorityColor(task.priority)} border-l-4 text-xs`}
                        style={{ top: position.top, height: position.height }}
                      >
                        {task.name} ({formatTime(task.duration * 60)})
                      </div>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-56 bg-indigo-900 text-white p-4 flex flex-col justify-between"> {/* Reduced from w-64, p-6 */}
        <div>
          <h1 className="text-xl font-bold mb-4 flex items-center"> {/* Reduced from text-2xl, mb-6 */}
            <Clock className="w-5 h-5 mr-1" /> Timebox {/* Reduced icon size */}
          </h1>
          <p className="text-xs opacity-75">Master your tasks, one block at a time.</p> {/* Reduced from text-sm */}
        </div>
        <Auth />
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 overflow-auto"> {/* Reduced from p-6 */}
        {user ? (
          <>
            {/* Header */}
            <div className="mb-4"> {/* Reduced from mb-6 */}
              <h2 className="text-2xl font-bold text-indigo-900">Welcome, {user.displayName}</h2> {/* Reduced from text-3xl */}
              <p className="text-sm text-gray-600">Let’s get those tasks done!</p> {/* Reduced from default */}
            </div>

            {/* Timer Mode Toggle and Pomodoro Controls */}
            <div className="flex justify-between items-center mb-4"> {/* Reduced from mb-6 */}
              <div className="flex gap-1"> {/* Reduced from gap-2 */}
                <Button
                  variant={timerMode === "timebox" ? "default" : "outline"}
                  onClick={() => {
                    setTimerMode("timebox");
                    setIsPomodoroRunning(false);
                    setActiveTaskId(null);
                  }}
                  size="sm" // Added compact size
                >
                  Timebox
                </Button>
                <Button
                  variant={timerMode === "pomodoro" ? "default" : "outline"}
                  onClick={() => setTimerMode("pomodoro")}
                  size="sm" // Added compact size
                >
                  Pomodoro
                </Button>
              </div>
              {timerMode === "pomodoro" && (
                <div className="flex items-center gap-2"> {/* Reduced from gap-4 */}
                  <span className="text-md font-semibold text-indigo-800"> {/* Reduced from text-lg */}
                    {formatTime(pomodoroTime)} - {activeTaskId ? tasks.find(t => t.id === activeTaskId)?.name : "No Task"}
                  </span>
                  <span className="text-xs text-gray-600"> {/* Reduced from text-sm */}
                    {totalDuration > 0 ? `Est. ${pomodoroSessionsNeeded} Pomodoro${pomodoroSessionsNeeded > 1 ? "s" : ""}` : "No tasks left"}
                  </span>
                  {totalDuration > 0 && !isPomodoroRunning && (
                    <Button onClick={startPomodoro} variant="default" size="sm">
                      Start {pomodoroSessionsNeeded} Pomodoro{pomodoroSessionsNeeded > 1 ? "s" : ""}
                    </Button>
                  )}
                  {isPomodoroRunning && (
                    <Button onClick={() => setIsPomodoroRunning(false)} variant="destructive" size="sm">
                      Stop
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Stats and Chart */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4"> {/* Reduced from gap-6, mb-6 */}
              <Card className="p-2 flex items-center justify-center"> {/* Reduced from p-4 */}
                <CardContent className="text-center p-2"> {/* Reduced padding */}
                  <h3 className="text-md font-semibold text-indigo-800 mb-2">Task Progress</h3> {/* Reduced from text-lg, mb-4 */}
                  <div className="w-40 h-40 mx-auto"> {/* Reduced from w-48 h-48 */}
                    <CircularProgressbar
                      value={completionPercentage}
                      text={`${completedTasks}/${totalTasks}`}
                      styles={buildStyles({
                        pathColor: "#22c55e",
                        textColor: "#4f46e5",
                        trailColor: "#e5e7eb",
                        strokeLinecap: "round",
                        pathTransitionDuration: 0.5,
                        textSize: "18px", // Slightly smaller text
                      })}
                    />
                  </div>
                  <p className="mt-2 text-xs text-gray-600">{completionPercentage}% Complete</p> {/* Reduced from mt-4, text-sm */}
                </CardContent>
              </Card>
              <TaskForm onAddTask={addTask} />
            </div>

            {/* View Toggle and Tasks */}
            <div className="flex justify-between items-center mb-2"> {/* Reduced from mb-4 */}
              <h3 className="text-lg font-semibold text-indigo-900">Your Tasks</h3> {/* Reduced from text-xl */}
              <div className="flex gap-1"> {/* Reduced from gap-2 */}
                <Button
                  variant={viewMode === "table" ? "default" : "outline"}
                  onClick={() => setViewMode("table")}
                  className="flex items-center gap-1"
                  size="sm" // Added compact size
                >
                  <Table className="w-4 h-4" /> Table
                </Button>
                <Button
                  variant={viewMode === "cards" ? "default" : "outline"}
                  onClick={() => setViewMode("cards")}
                  className="flex items-center gap-1"
                  size="sm" // Added compact size
                >
                  <LayoutGrid className="w-4 h-4" /> Cards
                </Button>
                <Button
                  variant={viewMode === "calendar" ? "default" : "outline"}
                  onClick={() => setViewMode("calendar")}
                  className="flex items-center gap-1"
                  size="sm" // Added compact size
                >
                  <Calendar className="w-4 h-4" /> Calendar
                </Button>
              </div>
            </div>

            {viewMode === "table" ? (
              <TaskTable tasks={tasks} onUpdate={updateTask} onDelete={deleteTask} />
            ) : viewMode === "cards" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2"> {/* Reduced from gap-4 */}
                {tasks.map((task) => (
                  <TaskCard key={task.id} task={task} onUpdate={updateTask} onDelete={deleteTask} />
                ))}
              </div>
            ) : (
              <CalendarView tasks={tasks} />
            )}
          </>
        ) : (
          <p className="text-center text-gray-600">Loading...</p>
        )}
      </div>
    </div>
  );
}