import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { 
  Project, 
  Task, 
  Team, 
  Milestone, 
  TimeEntry, 
  ProjectFilters, 
  TaskFilters,
  ProjectSummary,
  ActivityFeed,
  TaskStatus,
  ProjectStatus
} from './types';
import {
  ProjectRepository,
  TaskRepository,
  TeamRepository,
  MilestoneRepository,
  TimeTrackingRepository,
  ProjectManagementService
} from './ProjectService';
import { ApiServiceFactory } from '../api/ApiService';
import { mockProjectService } from './MockProjectService';

/**
 * Project Management React Query Hooks
 * 
 * Provides data fetching and mutation hooks for project management.
 * Implements optimistic updates and proper cache management.
 */

// Query Keys
export const projectQueryKeys = {
  all: ['projects'] as const,
  lists: () => [...projectQueryKeys.all, 'list'] as const,
  list: (filters: ProjectFilters) => [...projectQueryKeys.lists(), filters] as const,
  details: () => [...projectQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...projectQueryKeys.details(), id] as const,
  metrics: (id: string) => [...projectQueryKeys.detail(id), 'metrics'] as const,
  
  tasks: ['tasks'] as const,
  tasksList: (filters: TaskFilters) => [...projectQueryKeys.tasks, 'list', filters] as const,
  taskDetail: (id: string) => [...projectQueryKeys.tasks, 'detail', id] as const,
  projectTasks: (projectId: string) => [...projectQueryKeys.tasks, 'project', projectId] as const,
  
  teams: ['teams'] as const,
  teamDetail: (id: string) => [...projectQueryKeys.teams, 'detail', id] as const,
  
  milestones: ['milestones'] as const,
  projectMilestones: (projectId: string) => [...projectQueryKeys.milestones, 'project', projectId] as const,
  
  timeEntries: ['time-entries'] as const,
  userTimeEntries: (userId: string) => [...projectQueryKeys.timeEntries, 'user', userId] as const,
  
  dashboard: ['dashboard'] as const,
  summary: () => [...projectQueryKeys.dashboard, 'summary'] as const,
  activity: () => [...projectQueryKeys.dashboard, 'activity'] as const,
};

// Create service instances
const createProjectService = () => {
  const httpClient = ApiServiceFactory.getHttpClient();
  return new ProjectManagementService(
    new ProjectRepository(httpClient),
    new TaskRepository(httpClient),
    new TeamRepository(httpClient),
    new MilestoneRepository(httpClient),
    new TimeTrackingRepository(httpClient)
  );
};

// Project Hooks
export const useProjects = (filters?: ProjectFilters) => {
  return useQuery({
    queryKey: projectQueryKeys.list(filters || {}),
    queryFn: () => mockProjectService.getProjects(),
    staleTime: 5 * 60 * 1000,
  });
};

export const useProject = (id: string) => {
  const projectRepo = new ProjectRepository(ApiServiceFactory.getHttpClient());
  
  return useQuery({
    queryKey: projectQueryKeys.detail(id),
    queryFn: () => projectRepo.findById(id),
    enabled: !!id,
  });
};

export const useProjectMetrics = (id: string) => {
  const projectRepo = new ProjectRepository(ApiServiceFactory.getHttpClient());
  
  return useQuery({
    queryKey: projectQueryKeys.metrics(id),
    queryFn: () => projectRepo.getMetrics(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  });
};

export const useCreateProject = () => {
  const queryClient = useQueryClient();
  const projectRepo = new ProjectRepository(ApiServiceFactory.getHttpClient());
  
  return useMutation({
    mutationFn: (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => 
      projectRepo.create(projectData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectQueryKeys.lists() });
      toast.success('Project created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create project');
    },
  });
};

export const useUpdateProject = () => {
  const queryClient = useQueryClient();
  const projectRepo = new ProjectRepository(ApiServiceFactory.getHttpClient());
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Project> }) => 
      projectRepo.update(id, data),
    onSuccess: (updatedProject) => {
      queryClient.setQueryData(projectQueryKeys.detail(updatedProject.id), updatedProject);
      queryClient.invalidateQueries({ queryKey: projectQueryKeys.lists() });
      toast.success('Project updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update project');
    },
  });
};

// Task Hooks
export const useTasks = (filters?: TaskFilters) => {
  const taskRepo = new TaskRepository(ApiServiceFactory.getHttpClient());
  
  return useQuery({
    queryKey: projectQueryKeys.tasksList(filters || {}),
    queryFn: () => taskRepo.findAll(filters),
    staleTime: 2 * 60 * 1000,
  });
};

export const useProjectTasks = (projectId: string) => {
  return useQuery({
    queryKey: projectQueryKeys.projectTasks(projectId),
    queryFn: () => mockProjectService.getTasks(projectId),
    staleTime: 2 * 60 * 1000,
    enabled: !!projectId,
  });
};

export const useTask = (id: string) => {
  const taskRepo = new TaskRepository(ApiServiceFactory.getHttpClient());
  
  return useQuery({
    queryKey: projectQueryKeys.taskDetail(id),
    queryFn: () => taskRepo.findById(id),
    enabled: !!id,
  });
};

export const useCreateTask = () => {
  const queryClient = useQueryClient();
  const taskRepo = new TaskRepository(ApiServiceFactory.getHttpClient());
  
  return useMutation({
    mutationFn: (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => 
      taskRepo.create(taskData),
    onSuccess: (newTask) => {
      queryClient.invalidateQueries({ queryKey: projectQueryKeys.projectTasks(newTask.projectId) });
      queryClient.invalidateQueries({ queryKey: projectQueryKeys.tasks });
      toast.success('Task created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create task');
    },
  });
};

export const useUpdateTaskStatus = () => {
  const queryClient = useQueryClient();
  const taskRepo = new TaskRepository(ApiServiceFactory.getHttpClient());
  
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: TaskStatus }) => 
      taskRepo.updateStatus(id, status),
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: projectQueryKeys.taskDetail(id) });
      
      const previousTask = queryClient.getQueryData(projectQueryKeys.taskDetail(id));
      
      queryClient.setQueryData(projectQueryKeys.taskDetail(id), (old: Task) => ({
        ...old,
        status,
        ...(status === TaskStatus.DONE && { completedAt: new Date().toISOString() }),
      }));
      
      return { previousTask };
    },
    onError: (error, { id }, context) => {
      if (context?.previousTask) {
        queryClient.setQueryData(projectQueryKeys.taskDetail(id), context.previousTask);
      }
      toast.error(error.message || 'Failed to update task status');
    },
    onSuccess: (updatedTask) => {
      queryClient.invalidateQueries({ queryKey: projectQueryKeys.projectTasks(updatedTask.projectId) });
      toast.success('Task status updated');
    },
  });
};

// Dashboard Hooks
export const useDashboardSummary = () => {
  return useQuery({
    queryKey: projectQueryKeys.summary(),
    queryFn: () => mockProjectService.getDashboardSummary(),
    staleTime: 5 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
  });
};

export const useActivityFeed = (limit: number = 20) => {
  return useQuery({
    queryKey: [...projectQueryKeys.activity(), limit],
    queryFn: () => mockProjectService.getActivityFeed(limit),
    staleTime: 1 * 60 * 1000,
    refetchInterval: 2 * 60 * 1000, // Refetch every 2 minutes
  });
};

// Team Hooks
export const useTeams = () => {
  return useQuery({
    queryKey: projectQueryKeys.teams,
    queryFn: () => mockProjectService.getTeams(),
    staleTime: 10 * 60 * 1000,
  });
};

export const useTeam = (id: string) => {
  const teamRepo = new TeamRepository(ApiServiceFactory.getHttpClient());
  
  return useQuery({
    queryKey: projectQueryKeys.teamDetail(id),
    queryFn: () => teamRepo.findById(id),
    enabled: !!id,
  });
};

// Time Tracking Hooks
export const useTimeEntries = (userId: string, dateRange?: { start: string; end: string }) => {
  return useQuery({
    queryKey: [...projectQueryKeys.userTimeEntries(userId), dateRange],
    queryFn: () => mockProjectService.getTimeEntries(userId),
    staleTime: 5 * 60 * 1000,
    enabled: !!userId,
  });
};

export const useLogTime = () => {
  const queryClient = useQueryClient();
  const timeRepo = new TimeTrackingRepository(ApiServiceFactory.getHttpClient());
  
  return useMutation({
    mutationFn: (timeEntry: Omit<TimeEntry, 'id' | 'createdAt' | 'updatedAt'>) => 
      timeRepo.create(timeEntry),
    onSuccess: (newEntry) => {
      queryClient.invalidateQueries({ queryKey: projectQueryKeys.userTimeEntries(newEntry.userId) });
      toast.success('Time logged successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to log time');
    },
  });
};
