import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { ApiServiceFactory } from './ApiService';

/**
 * React Query Hooks with Error Handling
 * 
 * Implements Single Responsibility Principle by providing focused data fetching hooks.
 * Includes automatic error handling and optimistic updates.
 */

// Query Keys
export const queryKeys = {
  users: ['users'] as const,
  user: (id: string) => ['users', id] as const,
  analytics: ['analytics'] as const,
  dashboardStats: ['analytics', 'dashboard'] as const,
  chartData: (type: string, period: string) => ['analytics', 'charts', type, period] as const,
  settings: ['settings'] as const,
};

/**
 * User Hooks
 */
export const useUsers = (params?: { page?: number; limit?: number; search?: string }) => {
  const userService = ApiServiceFactory.createUserService();
  
  return useQuery({
    queryKey: [...queryKeys.users, params],
    queryFn: () => userService.getUsers(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    onError: (error: any) => {
      toast.error(error.message || 'Failed to fetch users');
    },
  });
};

export const useUser = (id: string) => {
  const userService = ApiServiceFactory.createUserService();
  
  return useQuery({
    queryKey: queryKeys.user(id),
    queryFn: () => userService.getUser(id),
    enabled: !!id,
    onError: (error: any) => {
      toast.error(error.message || 'Failed to fetch user');
    },
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  const userService = ApiServiceFactory.createUserService();
  
  return useMutation({
    mutationFn: (userData: any) => userService.createUser(userData),
    onSuccess: (data) => {
      // Invalidate and refetch users list
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
      toast.success('User created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create user');
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  const userService = ApiServiceFactory.createUserService();
  
  return useMutation({
    mutationFn: ({ id, userData }: { id: string; userData: any }) => 
      userService.updateUser(id, userData),
    onSuccess: (data, variables) => {
      // Update the specific user in cache
      queryClient.setQueryData(queryKeys.user(variables.id), data);
      // Invalidate users list to ensure consistency
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
      toast.success('User updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update user');
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  const userService = ApiServiceFactory.createUserService();
  
  return useMutation({
    mutationFn: (id: string) => userService.deleteUser(id),
    onSuccess: (_, deletedId) => {
      // Remove user from cache
      queryClient.removeQueries({ queryKey: queryKeys.user(deletedId) });
      // Invalidate users list
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
      toast.success('User deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete user');
    },
  });
};

/**
 * Analytics Hooks
 */
export const useDashboardStats = () => {
  const analyticsService = ApiServiceFactory.createAnalyticsService();
  
  return useQuery({
    queryKey: queryKeys.dashboardStats,
    queryFn: () => analyticsService.getDashboardStats(),
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    onError: (error: any) => {
      toast.error(error.message || 'Failed to fetch dashboard stats');
    },
  });
};

export const useChartData = (type: string, period: string) => {
  const analyticsService = ApiServiceFactory.createAnalyticsService();
  
  return useQuery({
    queryKey: queryKeys.chartData(type, period),
    queryFn: () => analyticsService.getChartData(type, period),
    enabled: !!type && !!period,
    staleTime: 5 * 60 * 1000, // 5 minutes
    onError: (error: any) => {
      toast.error(error.message || 'Failed to fetch chart data');
    },
  });
};

/**
 * Settings Hooks
 */
export const useSettings = () => {
  const settingsService = ApiServiceFactory.createSettingsService();
  
  return useQuery({
    queryKey: queryKeys.settings,
    queryFn: () => settingsService.getSettings(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    onError: (error: any) => {
      toast.error(error.message || 'Failed to fetch settings');
    },
  });
};

export const useUpdateSettings = () => {
  const queryClient = useQueryClient();
  const settingsService = ApiServiceFactory.createSettingsService();
  
  return useMutation({
    mutationFn: (settings: any) => settingsService.updateSettings(settings),
    onMutate: async (newSettings) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.settings });
      
      // Snapshot the previous value
      const previousSettings = queryClient.getQueryData(queryKeys.settings);
      
      // Optimistically update to the new value
      queryClient.setQueryData(queryKeys.settings, newSettings);
      
      // Return a context object with the snapshotted value
      return { previousSettings };
    },
    onError: (error: any, newSettings, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousSettings) {
        queryClient.setQueryData(queryKeys.settings, context.previousSettings);
      }
      toast.error(error.message || 'Failed to update settings');
    },
    onSuccess: () => {
      toast.success('Settings updated successfully');
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: queryKeys.settings });
    },
  });
};

/**
 * Generic Error Handler Hook
 */
export const useErrorHandler = () => {
  return (error: any, customMessage?: string) => {
    const message = customMessage || error.message || 'An unexpected error occurred';
    
    // Log error for debugging
    console.error('API Error:', error);
    
    // Show user-friendly error message
    toast.error(message);
    
    // In production, you might want to send errors to a monitoring service
    if (import.meta.env.PROD) {
      // Example: Sentry.captureException(error);
    }
  };
};
