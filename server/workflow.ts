import { logger } from './logger';
import { backupManager } from './backup';
import { searchEngine } from './search';
import { cache } from './cache';
import { performanceMonitor } from './performance';

export interface WorkflowRule {
  id: string;
  name: string;
  description: string;
  trigger: WorkflowTrigger;
  conditions: WorkflowCondition[];
  actions: WorkflowAction[];
  isActive: boolean;
  priority: number;
  createdAt: Date;
  lastExecuted?: Date;
  executionCount: number;
}

export interface WorkflowTrigger {
  type: 'schedule' | 'event' | 'metric' | 'manual';
  config: {
    schedule?: string; // cron expression
    event?: string; // event name
    metric?: {
      name: string;
      operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
      value: number;
    };
  };
}

export interface WorkflowCondition {
  type: 'time' | 'metric' | 'data' | 'custom';
  config: {
    timeRange?: { start: string; end: string };
    metric?: {
      name: string;
      operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
      value: number;
    };
    dataCheck?: {
      table: string;
      condition: string;
    };
    customFunction?: string;
  };
}

export interface WorkflowAction {
  type: 'backup' | 'cache_clear' | 'notification' | 'search_reindex' | 'custom';
  config: {
    backupDescription?: string;
    cachePattern?: string;
    notificationMessage?: string;
    customFunction?: string;
    parameters?: Record<string, any>;
  };
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  startTime: Date;
  endTime?: Date;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  logs: string[];
  error?: string;
  result?: any;
}

class WorkflowManager {
  private static instance: WorkflowManager;
  private workflows: Map<string, WorkflowRule> = new Map();
  private executions: Map<string, WorkflowExecution> = new Map();
  private scheduledJobs: Map<string, NodeJS.Timeout> = new Map();

  private constructor() {
    this.initializeDefaultWorkflows();
    this.startWorkflowEngine();
  }

  static getInstance(): WorkflowManager {
    if (!WorkflowManager.instance) {
      WorkflowManager.instance = new WorkflowManager();
    }
    return WorkflowManager.instance;
  }

  private initializeDefaultWorkflows(): void {
    // Auto backup workflow
    this.addWorkflow({
      id: 'auto-backup-daily',
      name: 'Daily Automatic Backup',
      description: 'Creates a backup every day at 2 AM',
      trigger: {
        type: 'schedule',
        config: {
          schedule: '0 2 * * *' // 2 AM daily
        }
      },
      conditions: [],
      actions: [{
        type: 'backup',
        config: {
          backupDescription: 'Automated daily backup'
        }
      }],
      isActive: true,
      priority: 1,
      createdAt: new Date(),
      executionCount: 0
    });

    // Performance monitoring workflow
    this.addWorkflow({
      id: 'performance-alert',
      name: 'Performance Alert',
      description: 'Alerts when error rate is too high',
      trigger: {
        type: 'metric',
        config: {
          metric: {
            name: 'errorRate',
            operator: 'gt',
            value: 10
          }
        }
      },
      conditions: [],
      actions: [{
        type: 'notification',
        config: {
          notificationMessage: 'High error rate detected - investigate immediately'
        }
      }],
      isActive: true,
      priority: 2,
      createdAt: new Date(),
      executionCount: 0
    });

    // Cache cleanup workflow
    this.addWorkflow({
      id: 'cache-cleanup-hourly',
      name: 'Hourly Cache Cleanup',
      description: 'Clears expired cache entries every hour',
      trigger: {
        type: 'schedule',
        config: {
          schedule: '0 * * * *' // Every hour
        }
      },
      conditions: [],
      actions: [{
        type: 'cache_clear',
        config: {
          cachePattern: 'expired:*'
        }
      }],
      isActive: true,
      priority: 3,
      createdAt: new Date(),
      executionCount: 0
    });

    // Search index rebuild workflow
    this.addWorkflow({
      id: 'search-reindex-weekly',
      name: 'Weekly Search Reindex',
      description: 'Rebuilds search index every Sunday at 3 AM',
      trigger: {
        type: 'schedule',
        config: {
          schedule: '0 3 * * 0' // 3 AM on Sundays
        }
      },
      conditions: [],
      actions: [{
        type: 'search_reindex',
        config: {}
      }],
      isActive: true,
      priority: 4,
      createdAt: new Date(),
      executionCount: 0
    });

    logger.info('Default workflows initialized', {
      count: this.workflows.size
    });
  }

  addWorkflow(workflow: WorkflowRule): void {
    this.workflows.set(workflow.id, workflow);
    
    if (workflow.isActive && workflow.trigger.type === 'schedule') {
      this.scheduleWorkflow(workflow);
    }
    
    logger.info('Workflow added', {
      id: workflow.id,
      name: workflow.name
    });
  }

  removeWorkflow(id: string): boolean {
    const workflow = this.workflows.get(id);
    if (!workflow) return false;
    
    // Cancel scheduled job if exists
    const scheduledJob = this.scheduledJobs.get(id);
    if (scheduledJob) {
      clearInterval(scheduledJob);
      this.scheduledJobs.delete(id);
    }
    
    this.workflows.delete(id);
    
    logger.info('Workflow removed', { id, name: workflow.name });
    return true;
  }

  async executeWorkflow(id: string, manualTrigger = false): Promise<WorkflowExecution> {
    const workflow = this.workflows.get(id);
    if (!workflow) {
      throw new Error(`Workflow not found: ${id}`);
    }

    const executionId = `${id}-${Date.now()}`;
    const execution: WorkflowExecution = {
      id: executionId,
      workflowId: id,
      startTime: new Date(),
      status: 'running',
      logs: []
    };

    this.executions.set(executionId, execution);

    try {
      execution.logs.push(`Starting workflow: ${workflow.name}`);
      
      // Check conditions
      if (!manualTrigger) {
        for (const condition of workflow.conditions) {
          const conditionMet = await this.evaluateCondition(condition);
          execution.logs.push(`Condition ${condition.type}: ${conditionMet ? 'passed' : 'failed'}`);
          
          if (!conditionMet) {
            execution.status = 'cancelled';
            execution.endTime = new Date();
            execution.logs.push('Workflow cancelled due to unmet conditions');
            return execution;
          }
        }
      }

      // Execute actions
      for (const action of workflow.actions) {
        execution.logs.push(`Executing action: ${action.type}`);
        await this.executeAction(action, execution);
      }

      execution.status = 'completed';
      execution.endTime = new Date();
      execution.logs.push('Workflow completed successfully');

      // Update workflow execution count and last executed time
      workflow.executionCount++;
      workflow.lastExecuted = new Date();

      logger.info('Workflow executed successfully', {
        workflowId: id,
        executionId,
        duration: execution.endTime.getTime() - execution.startTime.getTime()
      });

    } catch (error) {
      execution.status = 'failed';
      execution.endTime = new Date();
      execution.error = error instanceof Error ? error.message : 'Unknown error';
      execution.logs.push(`Workflow failed: ${execution.error}`);

      logger.error('Workflow execution failed', {
        workflowId: id,
        executionId,
        error: execution.error
      });
    }

    return execution;
  }

  private async evaluateCondition(condition: WorkflowCondition): Promise<boolean> {
    switch (condition.type) {
      case 'time':
        if (condition.config.timeRange) {
          const now = new Date();
          const start = new Date(condition.config.timeRange.start);
          const end = new Date(condition.config.timeRange.end);
          return now >= start && now <= end;
        }
        return true;

      case 'metric':
        if (condition.config.metric) {
          const metrics = performanceMonitor.getMetrics();
          const metricValue = (metrics as any)[condition.config.metric.name];
          if (metricValue !== undefined) {
            return this.compareValues(
              metricValue,
              condition.config.metric.operator,
              condition.config.metric.value
            );
          }
        }
        return false;

      case 'data':
        // Could implement database checks here
        return true;

      case 'custom':
        // Could implement custom condition functions here
        return true;

      default:
        return true;
    }
  }

  private async executeAction(action: WorkflowAction, execution: WorkflowExecution): Promise<void> {
    switch (action.type) {
      case 'backup':
        const description = action.config.backupDescription || 'Workflow automated backup';
        const fileName = await backupManager.createBackup(description);
        execution.logs.push(`Backup created: ${fileName}`);
        break;

      case 'cache_clear':
        if (action.config.cachePattern) {
          const cleared = cache.deletePattern(action.config.cachePattern);
          execution.logs.push(`Cache cleared: ${cleared} entries`);
        } else {
          cache.clear();
          execution.logs.push('All cache cleared');
        }
        break;

      case 'notification':
        const message = action.config.notificationMessage || 'Workflow notification';
        logger.warn('Workflow notification', { message });
        execution.logs.push(`Notification sent: ${message}`);
        break;

      case 'search_reindex':
        await searchEngine.rebuildSearchIndex();
        execution.logs.push('Search index rebuilt');
        break;

      case 'custom':
        execution.logs.push('Custom action executed');
        break;

      default:
        execution.logs.push(`Unknown action type: ${action.type}`);
    }
  }

  private compareValues(value: number, operator: string, target: number): boolean {
    switch (operator) {
      case 'gt': return value > target;
      case 'gte': return value >= target;
      case 'lt': return value < target;
      case 'lte': return value <= target;
      case 'eq': return value === target;
      default: return false;
    }
  }

  private scheduleWorkflow(workflow: WorkflowRule): void {
    if (!workflow.trigger.config.schedule) return;

    // Simple interval scheduling (in a real app, use a proper cron library)
    const scheduleMinutes = this.parseCronToMinutes(workflow.trigger.config.schedule);
    if (scheduleMinutes > 0) {
      const interval = setInterval(async () => {
        if (workflow.isActive) {
          await this.executeWorkflow(workflow.id);
        }
      }, scheduleMinutes * 60 * 1000);

      this.scheduledJobs.set(workflow.id, interval);
    }
  }

  private parseCronToMinutes(cron: string): number {
    // Simple cron parser - in production, use a proper cron library
    const parts = cron.split(' ');
    if (parts.length === 5) {
      const minute = parts[0];
      const hour = parts[1];
      
      if (minute === '0' && hour === '*') {
        return 60; // Every hour
      } else if (minute === '0' && hour !== '*') {
        return 24 * 60; // Daily
      }
    }
    return 60; // Default to hourly
  }

  private startWorkflowEngine(): void {
    // Monitor performance metrics for trigger evaluation
    setInterval(() => {
      this.checkMetricTriggers();
    }, 30000); // Check every 30 seconds

    logger.info('Workflow engine started');
  }

  private async checkMetricTriggers(): Promise<void> {
    const metrics = performanceMonitor.getMetrics();
    
    for (const workflow of this.workflows.values()) {
      if (!workflow.isActive || workflow.trigger.type !== 'metric') continue;
      
      const trigger = workflow.trigger;
      if (trigger.config.metric) {
        const metricValue = (metrics as any)[trigger.config.metric.name];
        if (metricValue !== undefined) {
          const shouldTrigger = this.compareValues(
            metricValue,
            trigger.config.metric.operator,
            trigger.config.metric.value
          );
          
          if (shouldTrigger) {
            // Avoid triggering too frequently
            const lastExecution = workflow.lastExecuted;
            const cooldown = 5 * 60 * 1000; // 5 minutes
            
            if (!lastExecution || Date.now() - lastExecution.getTime() > cooldown) {
              await this.executeWorkflow(workflow.id);
            }
          }
        }
      }
    }
  }

  getWorkflows(): WorkflowRule[] {
    return Array.from(this.workflows.values());
  }

  getWorkflow(id: string): WorkflowRule | undefined {
    return this.workflows.get(id);
  }

  getExecutions(workflowId?: string): WorkflowExecution[] {
    const executions = Array.from(this.executions.values());
    if (workflowId) {
      return executions.filter(exec => exec.workflowId === workflowId);
    }
    return executions;
  }

  getExecution(id: string): WorkflowExecution | undefined {
    return this.executions.get(id);
  }

  toggleWorkflow(id: string): boolean {
    const workflow = this.workflows.get(id);
    if (!workflow) return false;
    
    workflow.isActive = !workflow.isActive;
    
    if (workflow.isActive && workflow.trigger.type === 'schedule') {
      this.scheduleWorkflow(workflow);
    } else if (!workflow.isActive) {
      const scheduledJob = this.scheduledJobs.get(id);
      if (scheduledJob) {
        clearInterval(scheduledJob);
        this.scheduledJobs.delete(id);
      }
    }
    
    logger.info('Workflow toggled', {
      id,
      name: workflow.name,
      isActive: workflow.isActive
    });
    
    return true;
  }
}

export const workflowManager = WorkflowManager.getInstance();