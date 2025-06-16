"use client";

import { useState } from "react";

import {
  IconBell,
  IconCalendar,
  IconCalendarEvent,
  IconCheckbox,
  IconClock,
  IconClockHour3,
  IconDots,
  IconFilter,
  IconPlus,
  IconSortAscending,
  IconTarget,
  IconTrendingUp,
  IconUsers,
} from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: "high" | "medium" | "low";
  dueDate: string;
  project: string;
  assignee?: string;
  tags: string[];
  timeEstimate?: string;
}

interface Event {
  id: string;
  title: string;
  time: string;
  duration: string;
  type: "meeting" | "focus" | "break" | "call";
  attendees?: string[];
  location?: string;
}

interface Project {
  id: string;
  name: string;
  progress: number;
  tasksCount: number;
  completedTasks: number;
  dueDate: string;
  team: string[];
}

const tasks: Task[] = [
  {
    id: "1",
    title: "Design system documentation",
    description: "Create comprehensive documentation for the new design system",
    completed: false,
    priority: "high",
    dueDate: "2025-01-15",
    project: "Design System",
    assignee: "John Doe",
    tags: ["documentation", "design"],
    timeEstimate: "4h",
  },
  {
    id: "2",
    title: "API integration testing",
    completed: true,
    priority: "medium",
    dueDate: "2025-01-14",
    project: "Backend",
    tags: ["testing", "api"],
    timeEstimate: "2h",
  },
  {
    id: "3",
    title: "User feedback analysis",
    completed: false,
    priority: "medium",
    dueDate: "2025-01-16",
    project: "Research",
    tags: ["research", "analysis"],
    timeEstimate: "3h",
  },
  {
    id: "4",
    title: "Weekly team standup preparation",
    completed: false,
    priority: "low",
    dueDate: "2025-01-15",
    project: "Management",
    tags: ["meeting", "planning"],
    timeEstimate: "30m",
  },
];

const todayEvents: Event[] = [
  {
    id: "1",
    title: "Daily Standup",
    time: "9:00 AM",
    duration: "30 min",
    type: "meeting",
    attendees: ["Team Alpha"],
  },
  {
    id: "2",
    title: "Design Review",
    time: "2:00 PM",
    duration: "1 hour",
    type: "meeting",
    attendees: ["Design Team"],
  },
  {
    id: "3",
    title: "Focus Time - Development",
    time: "10:00 AM",
    duration: "2 hours",
    type: "focus",
  },
];

const projects: Project[] = [
  {
    id: "1",
    name: "Design System",
    progress: 65,
    tasksCount: 12,
    completedTasks: 8,
    dueDate: "Jan 20, 2025",
    team: ["John", "Sarah", "Mike"],
  },
  {
    id: "2",
    name: "Mobile App",
    progress: 40,
    tasksCount: 18,
    completedTasks: 7,
    dueDate: "Feb 15, 2025",
    team: ["Alice", "Bob"],
  },
];

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "high":
      return "bg-red-500";
    case "medium":
      return "bg-yellow-500";
    case "low":
      return "bg-green-500";
    default:
      return "bg-gray-500";
  }
};

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const completedTasksToday = tasks.filter((task) => task.completed).length;
  const totalTasks = tasks.length;
  const completionRate = Math.round((completedTasksToday / totalTasks) * 100);

  return (
    <div className="bg-background min-h-screen p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-foreground text-3xl font-bold">
              Good morning, John! 👋
            </h1>
            <p className="text-muted-foreground">
              Here&apos;s what&apos;s on your plate today
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <IconBell className="size-4" />
              <span className="hidden sm:inline">Notifications</span>
            </Button>
            <Button size="sm">
              <IconPlus className="size-4" />
              <span className="hidden sm:inline">New Task</span>
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900">
                  <IconTarget className="size-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Tasks Today</p>
                  <p className="text-2xl font-bold">
                    {completedTasksToday}/{totalTasks}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-green-100 p-2 dark:bg-green-900">
                  <IconTrendingUp className="size-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">
                    Completion Rate
                  </p>
                  <p className="text-2xl font-bold">{completionRate}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-purple-100 p-2 dark:bg-purple-900">
                  <IconCalendarEvent className="size-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">
                    Meetings Today
                  </p>
                  <p className="text-2xl font-bold">
                    {todayEvents.filter((e) => e.type === "meeting").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-orange-100 p-2 dark:bg-orange-900">
                  <IconClockHour3 className="size-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Focus Time</p>
                  <p className="text-2xl font-bold">4h</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Today's Schedule */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <IconCalendar className="text-muted-foreground size-5" />
                    <CardTitle>Today&apos;s Schedule</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {todayEvents.map((event) => (
                    <div
                      key={event.id}
                      className="flex items-center gap-3 rounded-lg border p-3"
                    >
                      <div className="text-muted-foreground text-xs">
                        <div className="font-medium">{event.time}</div>
                        <div>{event.duration}</div>
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">{event.title}</div>
                        {event.attendees && (
                          <div className="text-muted-foreground text-xs">
                            {event.attendees.join(", ")}
                          </div>
                        )}
                      </div>
                      <Badge
                        variant={
                          event.type === "meeting" ? "default" : "secondary"
                        }
                      >
                        {event.type}
                      </Badge>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" className="w-full">
                    <IconPlus className="size-4" />
                    Add Event
                  </Button>
                </CardContent>
              </Card>

              {/* Priority Tasks */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <IconCheckbox className="text-muted-foreground size-5" />
                    <CardTitle>Priority Tasks</CardTitle>
                  </div>
                  <CardAction>
                    <Button variant="outline" size="sm">
                      View All
                    </Button>
                  </CardAction>
                </CardHeader>
                <CardContent className="space-y-3">
                  {tasks.slice(0, 4).map((task) => (
                    <div
                      key={task.id}
                      className="hover:bg-muted/50 flex items-center gap-3 rounded-lg border p-3 transition-colors"
                    >
                      <Checkbox checked={task.completed} className="size-4" />
                      <div className="min-w-0 flex-1">
                        <div
                          className={`text-sm font-medium ${task.completed ? "text-muted-foreground line-through" : ""}`}
                        >
                          {task.title}
                        </div>
                        <div className="mt-1 flex items-center gap-2">
                          <div
                            className={`size-2 rounded-full ${getPriorityColor(task.priority)}`}
                          />
                          <span className="text-muted-foreground text-xs">
                            {task.project}
                          </span>
                          {task.timeEstimate && (
                            <Badge variant="outline" className="text-xs">
                              {task.timeEstimate}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-muted-foreground text-xs">
                        {task.dueDate}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Projects Overview and Recent Activity */}
            <div className="grid gap-6 lg:grid-cols-3">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Active Projects</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    {projects.map((project) => (
                      <div key={project.id} className="rounded-lg border p-4">
                        <div className="mb-3 flex items-center justify-between">
                          <h3 className="font-medium">{project.name}</h3>
                          <Button variant="ghost" size="icon">
                            <IconDots className="size-4" />
                          </Button>
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              Progress
                            </span>
                            <span className="font-medium">
                              {project.progress}%
                            </span>
                          </div>
                          <Progress value={project.progress} className="h-2" />
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                              {project.completedTasks}/{project.tasksCount}{" "}
                              tasks
                            </span>
                            <span className="text-muted-foreground">
                              Due {project.dueDate}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <IconUsers className="text-muted-foreground size-3" />
                            <span className="text-muted-foreground text-xs">
                              {project.team.join(", ")}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity & Notifications */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    {
                      action: "Completed task",
                      item: "API integration testing",
                      time: "2 hours ago",
                      type: "success",
                    },
                    {
                      action: "Added comment",
                      item: "Design system docs",
                      time: "4 hours ago",
                      type: "info",
                    },
                    {
                      action: "Meeting scheduled",
                      item: "Design Review",
                      time: "1 day ago",
                      type: "warning",
                    },
                    {
                      action: "Project updated",
                      item: "Mobile App progress",
                      time: "2 days ago",
                      type: "info",
                    },
                  ].map((activity, index) => (
                    <div
                      key={index}
                      className="hover:bg-muted/50 flex items-start gap-3 rounded-lg p-2 transition-colors"
                    >
                      <div
                        className={`mt-2 size-2 rounded-full ${
                          activity.type === "success"
                            ? "bg-green-500"
                            : activity.type === "warning"
                              ? "bg-yellow-500"
                              : "bg-blue-500"
                        }`}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm">
                          <span className="font-medium">{activity.action}</span>
                          <span className="text-muted-foreground">
                            {" "}
                            {activity.item}
                          </span>
                        </div>
                        <div className="text-muted-foreground text-xs">
                          {activity.time}
                        </div>
                      </div>
                    </div>
                  ))}

                  <Button variant="outline" size="sm" className="mt-4 w-full">
                    View All Activity
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="tasks" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>My Tasks</CardTitle>
                <CardAction>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <IconFilter className="size-4" />
                      Filter
                    </Button>
                    <Button variant="outline" size="sm">
                      <IconSortAscending className="size-4" />
                      Sort
                    </Button>
                    <Button size="sm">
                      <IconPlus className="size-4" />
                      New Task
                    </Button>
                  </div>
                </CardAction>
              </CardHeader>
              <CardContent className="space-y-2">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="hover:bg-muted/50 flex items-center gap-3 rounded-lg border p-3 transition-colors"
                  >
                    <Checkbox checked={task.completed} className="size-4" />
                    <div className="min-w-0 flex-1">
                      <div
                        className={`font-medium ${task.completed ? "text-muted-foreground line-through" : ""}`}
                      >
                        {task.title}
                      </div>
                      {task.description && (
                        <div className="text-muted-foreground mt-1 text-sm">
                          {task.description}
                        </div>
                      )}
                      <div className="mt-2 flex items-center gap-2">
                        <div
                          className={`size-2 rounded-full ${getPriorityColor(task.priority)}`}
                        />
                        <span className="text-muted-foreground text-xs">
                          {task.project}
                        </span>
                        {task.tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className="text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-muted-foreground text-xs">
                        {task.dueDate}
                      </div>
                      {task.timeEstimate && (
                        <div className="text-muted-foreground mt-1 text-xs">
                          {task.timeEstimate}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schedule" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Today's Detailed Schedule */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Today&apos;s Schedule</CardTitle>
                  <CardAction>
                    <Button size="sm">
                      <IconPlus className="size-4" />
                      Add Event
                    </Button>
                  </CardAction>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Time blocks */}
                  <div className="space-y-2">
                    {[
                      {
                        time: "9:00 AM",
                        event: "Daily Standup",
                        duration: "30 min",
                        type: "meeting",
                      },
                      {
                        time: "10:00 AM",
                        event: "Focus Time - Development",
                        duration: "2 hours",
                        type: "focus",
                      },
                      {
                        time: "12:00 PM",
                        event: "Lunch Break",
                        duration: "1 hour",
                        type: "break",
                      },
                      {
                        time: "2:00 PM",
                        event: "Design Review",
                        duration: "1 hour",
                        type: "meeting",
                      },
                      {
                        time: "3:30 PM",
                        event: "Client Call",
                        duration: "45 min",
                        type: "call",
                      },
                      {
                        time: "5:00 PM",
                        event: "Wrap up tasks",
                        duration: "1 hour",
                        type: "focus",
                      },
                    ].map((block, index) => (
                      <div
                        key={index}
                        className="hover:bg-muted/50 flex items-center gap-4 rounded-lg p-3 transition-colors"
                      >
                        <div className="text-muted-foreground w-20 text-sm font-medium">
                          {block.time}
                        </div>
                        <div className="bg-primary/20 h-8 w-1 rounded-full" />
                        <div className="flex-1">
                          <div className="font-medium">{block.event}</div>
                          <div className="text-muted-foreground text-sm">
                            {block.duration}
                          </div>
                        </div>
                        <Badge
                          variant={
                            block.type === "meeting" ? "default" : "secondary"
                          }
                        >
                          {block.type}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Time Tracking */}
              <Card>
                <CardHeader>
                  <CardTitle>Time Tracking</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold">4h 32m</div>
                    <div className="text-muted-foreground text-sm">
                      Today&apos;s work time
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Development</span>
                      <span className="text-sm font-medium">2h 15m</span>
                    </div>
                    <Progress value={65} className="h-2" />

                    <div className="flex items-center justify-between">
                      <span className="text-sm">Meetings</span>
                      <span className="text-sm font-medium">1h 30m</span>
                    </div>
                    <Progress value={45} className="h-2" />

                    <div className="flex items-center justify-between">
                      <span className="text-sm">Planning</span>
                      <span className="text-sm font-medium">47m</span>
                    </div>
                    <Progress value={25} className="h-2" />
                  </div>

                  <Button variant="outline" size="sm" className="w-full">
                    <IconClock className="size-4" />
                    Start Timer
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Weekly Overview */}
            <Card>
              <CardHeader>
                <CardTitle>This Week&apos;s Focus</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-7">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                    (day, index) => (
                      <div
                        key={day}
                        className={`rounded-lg border p-3 ${index === 2 ? "border-primary bg-primary/5" : ""}`}
                      >
                        <div className="text-sm font-medium">{day}</div>
                        <div className="text-muted-foreground mt-1 text-xs">
                          {index === 0 && "Sprint Planning"}
                          {index === 1 && "Development"}
                          {index === 2 && "Today - Reviews"}
                          {index === 3 && "Testing"}
                          {index === 4 && "Demo Day"}
                          {index === 5 && "Documentation"}
                          {index === 6 && "Rest"}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="projects" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Projects</CardTitle>
                <CardAction>
                  <Button size="sm">
                    <IconPlus className="size-4" />
                    New Project
                  </Button>
                </CardAction>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {projects.map((project) => (
                    <Card key={project.id}>
                      <CardHeader>
                        <CardTitle className="text-lg">
                          {project.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            Progress
                          </span>
                          <span className="font-medium">
                            {project.progress}%
                          </span>
                        </div>
                        <Progress value={project.progress} className="h-2" />
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Tasks</span>
                            <span>
                              {project.completedTasks}/{project.tasksCount}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Due Date
                            </span>
                            <span>{project.dueDate}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <IconUsers className="text-muted-foreground size-4" />
                          <div className="flex -space-x-1">
                            {project.team.slice(0, 3).map((member, index) => (
                              <div
                                key={index}
                                className="bg-muted border-background flex size-6 items-center justify-center rounded-full border-2 text-xs"
                              >
                                {member[0]}
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
