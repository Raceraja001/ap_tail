/**
 * Project Management Domain Types
 * 
 * Comprehensive type definitions for project management entities.
 * Implements Domain-Driven Design principles.
 */

export enum ProjectStatus {
  PLANNING = 'planning',
  ACTIVE = 'active',
  ON_HOLD = 'on_hold',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  IN_REVIEW = 'in_review',
  DONE = 'done',
  BLOCKED = 'blocked',
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum ProjectRole {
  PROJECT_MANAGER = 'project_manager',
  TEAM_LEAD = 'team_lead',
  DEVELOPER = 'developer',
  DESIGNER = 'designer',
  QA_ENGINEER = 'qa_engineer',
  STAKEHOLDER = 'stakeholder',
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  priority: TaskPriority;
  startDate: string;
  endDate: string;
  estimatedHours: number;
  actualHours: number;
  budget: number;
  spentBudget: number;
  progress: number; // 0-100
  ownerId: string;
  teamId: string;
  clientId?: string;
  tags: string[];
  color: string;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  projectId: string;
  assigneeId?: string;
  reporterId: string;
  parentTaskId?: string;
  subtasks: string[];
  estimatedHours: number;
  actualHours: number;
  startDate?: string;
  dueDate?: string;
  completedAt?: string;
  tags: string[];
  attachments: Attachment[];
  comments: Comment[];
  dependencies: string[];
  blockedBy: string[];
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface Team {
  id: string;
  name: string;
  description: string;
  leaderId: string;
  members: TeamMember[];
  projects: string[];
  skills: string[];
  capacity: number; // hours per week
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TeamMember {
  userId: string;
  role: ProjectRole;
  joinedAt: string;
  hourlyRate?: number;
  capacity: number; // hours per week
  skills: string[];
  isActive: boolean;
}

export interface Milestone {
  id: string;
  name: string;
  description: string;
  projectId: string;
  dueDate: string;
  completedAt?: string;
  status: 'pending' | 'completed' | 'overdue';
  tasks: string[];
  progress: number;
  createdAt: string;
  updatedAt: string;
}

export interface TimeEntry {
  id: string;
  userId: string;
  projectId: string;
  taskId?: string;
  description: string;
  hours: number;
  date: string;
  billable: boolean;
  hourlyRate?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  content: string;
  authorId: string;
  taskId?: string;
  projectId?: string;
  parentCommentId?: string;
  mentions: string[];
  attachments: Attachment[];
  createdAt: string;
  updatedAt: string;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  uploadedBy: string;
  uploadedAt: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  company: string;
  phone?: string;
  address?: string;
  projects: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  tasks: Omit<Task, 'id' | 'projectId' | 'createdAt' | 'updatedAt'>[];
  milestones: Omit<Milestone, 'id' | 'projectId' | 'createdAt' | 'updatedAt'>[];
  estimatedDuration: number; // days
  category: string;
  tags: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// Analytics and Reporting Types
export interface ProjectMetrics {
  projectId: string;
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  blockedTasks: number;
  averageTaskCompletionTime: number;
  teamProductivity: number;
  budgetUtilization: number;
  scheduleVariance: number;
  qualityScore: number;
  clientSatisfaction?: number;
}

export interface TeamMetrics {
  teamId: string;
  totalMembers: number;
  activeMembers: number;
  averageCapacityUtilization: number;
  totalHoursLogged: number;
  averageTasksPerMember: number;
  skillDistribution: Record<string, number>;
  performanceRating: number;
}

// Filter and Search Types
export interface ProjectFilters {
  status?: ProjectStatus[];
  priority?: TaskPriority[];
  ownerId?: string;
  teamId?: string;
  clientId?: string;
  tags?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  search?: string;
}

export interface TaskFilters {
  status?: TaskStatus[];
  priority?: TaskPriority[];
  assigneeId?: string;
  projectId?: string;
  tags?: string[];
  dueDate?: {
    start?: string;
    end?: string;
  };
  search?: string;
}

// API Response Types
export interface ProjectSummary {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  overdueProjects: number;
  totalTasks: number;
  completedTasks: number;
  totalTeamMembers: number;
  totalHoursLogged: number;
  averageProjectCompletion: number;
  upcomingDeadlines: Array<{
    projectId: string;
    projectName: string;
    dueDate: string;
    daysRemaining: number;
  }>;
}

export interface ActivityFeed {
  id: string;
  type: 'project_created' | 'task_completed' | 'comment_added' | 'file_uploaded' | 'milestone_reached';
  title: string;
  description: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  projectId?: string;
  projectName?: string;
  taskId?: string;
  taskTitle?: string;
  timestamp: string;
  metadata?: Record<string, any>;
}
