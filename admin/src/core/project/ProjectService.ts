import { BaseRepository } from '../data/Repository';
import { 
  Project, 
  Task, 
  Team, 
  Milestone, 
  TimeEntry, 
  ProjectFilters, 
  TaskFilters,
  ProjectMetrics,
  ProjectSummary,
  ActivityFeed,
  ProjectStatus,
  TaskStatus
} from './types';

/**
 * Project Management Services
 * 
 * Implements business logic for project management operations.
 * Follows Service Layer Pattern and Single Responsibility Principle.
 */

export class ProjectRepository extends BaseRepository<Project> {
  protected endpoint = '/projects';

  async findByStatus(status: ProjectStatus): Promise<Project[]> {
    return this.findAll({ filters: { status } });
  }

  async findByTeam(teamId: string): Promise<Project[]> {
    return this.findAll({ filters: { teamId } });
  }

  async findByOwner(ownerId: string): Promise<Project[]> {
    return this.findAll({ filters: { ownerId } });
  }

  async updateProgress(id: string, progress: number): Promise<Project> {
    return this.update(id, { progress });
  }

  async archive(id: string): Promise<Project> {
    return this.update(id, { isArchived: true });
  }

  async getMetrics(id: string): Promise<ProjectMetrics> {
    const response = await this.httpClient.get(`${this.endpoint}/${id}/metrics`);
    return response.data || response;
  }

  async duplicate(id: string, newName: string): Promise<Project> {
    const response = await this.httpClient.post(`${this.endpoint}/${id}/duplicate`, { name: newName });
    return response.data || response;
  }
}

export class TaskRepository extends BaseRepository<Task> {
  protected endpoint = '/tasks';

  async findByProject(projectId: string, filters?: TaskFilters): Promise<Task[]> {
    return this.findAll({ ...filters, filters: { ...filters?.filters, projectId } });
  }

  async findByAssignee(assigneeId: string, filters?: TaskFilters): Promise<Task[]> {
    return this.findAll({ ...filters, filters: { ...filters?.filters, assigneeId } });
  }

  async findByStatus(status: TaskStatus): Promise<Task[]> {
    return this.findAll({ filters: { status } });
  }

  async updateStatus(id: string, status: TaskStatus): Promise<Task> {
    const updateData: Partial<Task> = { status };
    if (status === TaskStatus.DONE) {
      updateData.completedAt = new Date().toISOString();
    }
    return this.update(id, updateData);
  }

  async assignTask(id: string, assigneeId: string): Promise<Task> {
    return this.update(id, { assigneeId });
  }

  async addComment(taskId: string, comment: string, authorId: string): Promise<Task> {
    const response = await this.httpClient.post(`${this.endpoint}/${taskId}/comments`, {
      content: comment,
      authorId,
    });
    return response.data || response;
  }

  async addAttachment(taskId: string, attachment: FormData): Promise<Task> {
    const response = await this.httpClient.post(`${this.endpoint}/${taskId}/attachments`, attachment, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data || response;
  }

  async logTime(taskId: string, timeEntry: Omit<TimeEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    const response = await this.httpClient.post(`${this.endpoint}/${taskId}/time`, timeEntry);
    return response.data || response;
  }

  async getSubtasks(parentId: string): Promise<Task[]> {
    const response = await this.httpClient.get(`${this.endpoint}/${parentId}/subtasks`);
    return response.data || response;
  }

  async reorderTasks(projectId: string, taskIds: string[]): Promise<void> {
    await this.httpClient.put(`/projects/${projectId}/tasks/reorder`, { taskIds });
  }
}

export class TeamRepository extends BaseRepository<Team> {
  protected endpoint = '/teams';

  async addMember(teamId: string, userId: string, role: string): Promise<Team> {
    const response = await this.httpClient.post(`${this.endpoint}/${teamId}/members`, {
      userId,
      role,
    });
    return response.data || response;
  }

  async removeMember(teamId: string, userId: string): Promise<Team> {
    const response = await this.httpClient.delete(`${this.endpoint}/${teamId}/members/${userId}`);
    return response.data || response;
  }

  async updateMemberRole(teamId: string, userId: string, role: string): Promise<Team> {
    const response = await this.httpClient.put(`${this.endpoint}/${teamId}/members/${userId}`, {
      role,
    });
    return response.data || response;
  }

  async getWorkload(teamId: string): Promise<any> {
    const response = await this.httpClient.get(`${this.endpoint}/${teamId}/workload`);
    return response.data || response;
  }
}

export class MilestoneRepository extends BaseRepository<Milestone> {
  protected endpoint = '/milestones';

  async findByProject(projectId: string): Promise<Milestone[]> {
    return this.findAll({ filters: { projectId } });
  }

  async markComplete(id: string): Promise<Milestone> {
    return this.update(id, { 
      status: 'completed',
      completedAt: new Date().toISOString(),
    });
  }

  async getUpcoming(days: number = 30): Promise<Milestone[]> {
    const response = await this.httpClient.get(`${this.endpoint}/upcoming?days=${days}`);
    return response.data || response;
  }
}

export class TimeTrackingRepository extends BaseRepository<TimeEntry> {
  protected endpoint = '/time-entries';

  async findByUser(userId: string, dateRange?: { start: string; end: string }): Promise<TimeEntry[]> {
    const params = { filters: { userId }, ...dateRange };
    return this.findAll(params);
  }

  async findByProject(projectId: string, dateRange?: { start: string; end: string }): Promise<TimeEntry[]> {
    const params = { filters: { projectId }, ...dateRange };
    return this.findAll(params);
  }

  async getTotalHours(filters: any): Promise<number> {
    const response = await this.httpClient.get(`${this.endpoint}/total`, { params: filters });
    return response.total || response.data?.total || 0;
  }

  async generateTimesheet(userId: string, startDate: string, endDate: string): Promise<any> {
    const response = await this.httpClient.get(`${this.endpoint}/timesheet`, {
      params: { userId, startDate, endDate },
    });
    return response.data || response;
  }
}

/**
 * Project Management Service
 * 
 * High-level service orchestrating project management operations.
 */
export class ProjectManagementService {
  constructor(
    private projectRepo: ProjectRepository,
    private taskRepo: TaskRepository,
    private teamRepo: TeamRepository,
    private milestoneRepo: MilestoneRepository,
    private timeRepo: TimeTrackingRepository
  ) {}

  async getDashboardSummary(): Promise<ProjectSummary> {
    const [projects, tasks, teams, timeEntries] = await Promise.all([
      this.projectRepo.findAll(),
      this.taskRepo.findAll(),
      this.teamRepo.findAll(),
      this.timeRepo.findAll(),
    ]);

    const activeProjects = projects.filter(p => p.status === ProjectStatus.ACTIVE);
    const completedProjects = projects.filter(p => p.status === ProjectStatus.COMPLETED);
    const completedTasks = tasks.filter(t => t.status === TaskStatus.DONE);
    const totalHours = timeEntries.reduce((sum, entry) => sum + entry.hours, 0);

    return {
      totalProjects: projects.length,
      activeProjects: activeProjects.length,
      completedProjects: completedProjects.length,
      overdueProjects: 0, // Calculate based on end dates
      totalTasks: tasks.length,
      completedTasks: completedTasks.length,
      totalTeamMembers: teams.reduce((sum, team) => sum + team.members.length, 0),
      totalHoursLogged: totalHours,
      averageProjectCompletion: projects.reduce((sum, p) => sum + p.progress, 0) / projects.length,
      upcomingDeadlines: [], // Calculate upcoming deadlines
    };
  }

  async getActivityFeed(limit: number = 20): Promise<ActivityFeed[]> {
    // This would typically aggregate activities from multiple sources
    const response = await this.projectRepo.httpClient.get('/activity-feed', { params: { limit } });
    return response.data || response;
  }

  async createProjectFromTemplate(templateId: string, projectData: Partial<Project>): Promise<Project> {
    const response = await this.projectRepo.httpClient.post('/projects/from-template', {
      templateId,
      ...projectData,
    });
    return response.data || response;
  }

  async bulkUpdateTasks(taskIds: string[], updates: Partial<Task>): Promise<Task[]> {
    const response = await this.taskRepo.httpClient.put('/tasks/bulk-update', {
      taskIds,
      updates,
    });
    return response.data || response;
  }

  async generateProjectReport(projectId: string, type: 'summary' | 'detailed' | 'timeline'): Promise<any> {
    const response = await this.projectRepo.httpClient.get(`/projects/${projectId}/reports/${type}`);
    return response.data || response;
  }
}
