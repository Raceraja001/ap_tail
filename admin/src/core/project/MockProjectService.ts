import { 
  Project, 
  Task, 
  Team, 
  Milestone, 
  TimeEntry, 
  ProjectSummary, 
  ActivityFeed, 
  ProjectStatus, 
  TaskStatus, 
  TaskPriority,
  UserRole 
} from './types';

/**
 * Mock Project Service for Development
 * 
 * Provides mock data for development and testing purposes.
 */
export class MockProjectService {
  // Mock data
  private mockProjects: Project[] = [
    {
      id: '1',
      name: 'E-commerce Platform',
      description: 'Building a modern e-commerce platform with React and Node.js',
      status: ProjectStatus.ACTIVE,
      priority: TaskPriority.HIGH,
      startDate: '2024-01-01',
      endDate: '2024-06-30',
      budget: 150000,
      spentBudget: 75000,
      estimatedHours: 1200,
      actualHours: 600,
      progress: 65,
      tags: ['React', 'Node.js', 'E-commerce'],
      teamId: '1',
      managerId: '1',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-15T00:00:00Z',
    },
    {
      id: '2',
      name: 'Mobile App Redesign',
      description: 'Complete redesign of the mobile application with new UI/UX',
      status: ProjectStatus.ACTIVE,
      priority: TaskPriority.MEDIUM,
      startDate: '2024-02-01',
      endDate: '2024-05-31',
      budget: 80000,
      spentBudget: 32000,
      estimatedHours: 800,
      actualHours: 320,
      progress: 40,
      tags: ['Mobile', 'UI/UX', 'React Native'],
      teamId: '2',
      managerId: '2',
      createdAt: '2024-02-01T00:00:00Z',
      updatedAt: '2024-02-15T00:00:00Z',
    },
    {
      id: '3',
      name: 'API Integration',
      description: 'Integration with third-party APIs for enhanced functionality',
      status: ProjectStatus.COMPLETED,
      priority: TaskPriority.MEDIUM,
      startDate: '2023-10-01',
      endDate: '2023-12-31',
      budget: 50000,
      spentBudget: 48000,
      estimatedHours: 400,
      actualHours: 380,
      progress: 100,
      tags: ['API', 'Integration', 'Backend'],
      teamId: '1',
      managerId: '1',
      createdAt: '2023-10-01T00:00:00Z',
      updatedAt: '2023-12-31T00:00:00Z',
    },
  ];

  private mockTasks: Task[] = [
    {
      id: '1',
      title: 'Setup project structure',
      description: 'Initialize the project with proper folder structure and dependencies',
      status: TaskStatus.DONE,
      priority: TaskPriority.HIGH,
      projectId: '1',
      assigneeId: '1',
      estimatedHours: 8,
      actualHours: 6,
      dueDate: '2024-01-05',
      tags: ['Setup', 'Infrastructure'],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-05T00:00:00Z',
    },
    {
      id: '2',
      title: 'Design user authentication',
      description: 'Create login and registration forms with validation',
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.HIGH,
      projectId: '1',
      assigneeId: '2',
      estimatedHours: 16,
      actualHours: 8,
      dueDate: '2024-01-20',
      tags: ['Authentication', 'Frontend'],
      createdAt: '2024-01-10T00:00:00Z',
      updatedAt: '2024-01-15T00:00:00Z',
    },
  ];

  private mockTeams: Team[] = [
    {
      id: '1',
      name: 'Frontend Team',
      description: 'Responsible for user interface and user experience',
      members: [
        { userId: '1', role: UserRole.ADMIN, joinedAt: '2024-01-01' },
        { userId: '2', role: UserRole.USER, joinedAt: '2024-01-01' },
      ],
      projects: ['1', '3'],
      skills: ['React', 'TypeScript', 'CSS'],
      capacity: 160,
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    {
      id: '2',
      name: 'Mobile Team',
      description: 'Mobile application development team',
      members: [
        { userId: '3', role: UserRole.USER, joinedAt: '2024-02-01' },
        { userId: '4', role: UserRole.USER, joinedAt: '2024-02-01' },
      ],
      projects: ['2'],
      skills: ['React Native', 'iOS', 'Android'],
      capacity: 160,
      isActive: true,
      createdAt: '2024-02-01T00:00:00Z',
      updatedAt: '2024-02-01T00:00:00Z',
    },
  ];

  private mockTimeEntries: TimeEntry[] = [
    {
      id: '1',
      userId: '1',
      projectId: '1',
      taskId: '1',
      description: 'Setting up project structure',
      hours: 6,
      date: '2024-01-05',
      billable: true,
      createdAt: '2024-01-05T00:00:00Z',
      updatedAt: '2024-01-05T00:00:00Z',
    },
    {
      id: '2',
      userId: '2',
      projectId: '1',
      taskId: '2',
      description: 'Working on authentication design',
      hours: 8,
      date: '2024-01-15',
      billable: true,
      createdAt: '2024-01-15T00:00:00Z',
      updatedAt: '2024-01-15T00:00:00Z',
    },
  ];

  private mockActivityFeed: ActivityFeed[] = [
    {
      id: '1',
      type: 'project_created',
      title: 'New project created',
      description: 'E-commerce Platform project has been created',
      userId: '1',
      projectId: '1',
      timestamp: '2024-01-01T00:00:00Z',
      metadata: { projectName: 'E-commerce Platform' },
    },
    {
      id: '2',
      type: 'task_completed',
      title: 'Task completed',
      description: 'Setup project structure task has been completed',
      userId: '1',
      projectId: '1',
      taskId: '1',
      timestamp: '2024-01-05T00:00:00Z',
      metadata: { taskTitle: 'Setup project structure' },
    },
  ];

  async getDashboardSummary(): Promise<ProjectSummary> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const activeProjects = this.mockProjects.filter(p => p.status === ProjectStatus.ACTIVE);
    const completedProjects = this.mockProjects.filter(p => p.status === ProjectStatus.COMPLETED);
    const completedTasks = this.mockTasks.filter(t => t.status === TaskStatus.DONE);
    const totalHours = this.mockTimeEntries.reduce((sum, entry) => sum + entry.hours, 0);

    return {
      totalProjects: this.mockProjects.length,
      activeProjects: activeProjects.length,
      completedProjects: completedProjects.length,
      overdueProjects: 0,
      totalTasks: this.mockTasks.length,
      completedTasks: completedTasks.length,
      totalTeamMembers: this.mockTeams.reduce((sum, team) => sum + team.members.length, 0),
      totalHoursLogged: totalHours,
      averageProjectCompletion: this.mockProjects.reduce((sum, p) => sum + p.progress, 0) / this.mockProjects.length,
      upcomingDeadlines: [],
    };
  }

  async getActivityFeed(limit: number = 20): Promise<ActivityFeed[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    return this.mockActivityFeed.slice(0, limit);
  }

  async getProjects(): Promise<Project[]> {
    await new Promise(resolve => setTimeout(resolve, 400));
    return this.mockProjects;
  }

  async getTasks(projectId?: string): Promise<Task[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return projectId 
      ? this.mockTasks.filter(task => task.projectId === projectId)
      : this.mockTasks;
  }

  async getTeams(): Promise<Team[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return this.mockTeams;
  }

  async getTimeEntries(userId?: string): Promise<TimeEntry[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return userId 
      ? this.mockTimeEntries.filter(entry => entry.userId === userId)
      : this.mockTimeEntries;
  }
}

// Singleton instance
export const mockProjectService = new MockProjectService();
