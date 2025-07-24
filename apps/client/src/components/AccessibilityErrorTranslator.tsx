import React from 'react';
import { AlertTriangle, AlertCircle, Info, CheckCircle, XCircle, Zap, Shield, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ErrorSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info' | 'success';
export type ErrorCategory = 'validation' | 'network' | 'permission' | 'timeout' | 'system' | 'security';

export interface AccessibilityError {
  id: string;
  message: string;
  severity: ErrorSeverity;
  category: ErrorCategory;
  technicalDetails?: string;
  suggestedAction?: string;
  timestamp?: Date;
}

interface AccessibilityErrorTranslatorProps {
  error: AccessibilityError;
  className?: string;
  compact?: boolean;
  showTechnicalDetails?: boolean;
}

const severityConfig = {
  critical: {
    color: 'bg-red-500 dark:bg-red-600',
    textColor: 'text-red-700 dark:text-red-300',
    borderColor: 'border-red-200 dark:border-red-800',
    bgColor: 'bg-red-50 dark:bg-red-950/50',
    icon: XCircle,
    label: 'Critical Error',
    priority: 1
  },
  high: {
    color: 'bg-orange-500 dark:bg-orange-600',
    textColor: 'text-orange-700 dark:text-orange-300',
    borderColor: 'border-orange-200 dark:border-orange-800',
    bgColor: 'bg-orange-50 dark:bg-orange-950/50',
    icon: AlertTriangle,
    label: 'High Priority',
    priority: 2
  },
  medium: {
    color: 'bg-yellow-500 dark:bg-yellow-600',
    textColor: 'text-yellow-700 dark:text-yellow-300',
    borderColor: 'border-yellow-200 dark:border-yellow-800',
    bgColor: 'bg-yellow-50 dark:bg-yellow-950/50',
    icon: AlertCircle,
    label: 'Medium Priority',
    priority: 3
  },
  low: {
    color: 'bg-blue-500 dark:bg-blue-600',
    textColor: 'text-blue-700 dark:text-blue-300',
    borderColor: 'border-blue-200 dark:border-blue-800',
    bgColor: 'bg-blue-50 dark:bg-blue-950/50',
    icon: Info,
    label: 'Low Priority',
    priority: 4
  },
  info: {
    color: 'bg-gray-500 dark:bg-gray-600',
    textColor: 'text-gray-700 dark:text-gray-300',
    borderColor: 'border-gray-200 dark:border-gray-800',
    bgColor: 'bg-gray-50 dark:bg-gray-950/50',
    icon: Info,
    label: 'Information',
    priority: 5
  },
  success: {
    color: 'bg-green-500 dark:bg-green-600',
    textColor: 'text-green-700 dark:text-green-300',
    borderColor: 'border-green-200 dark:border-green-800',
    bgColor: 'bg-green-50 dark:bg-green-950/50',
    icon: CheckCircle,
    label: 'Success',
    priority: 6
  }
};

const categoryConfig = {
  validation: {
    icon: AlertCircle,
    label: 'Data Validation',
    description: 'Input data does not meet requirements'
  },
  network: {
    icon: Zap,
    label: 'Network Issue',
    description: 'Connection or server problem'
  },
  permission: {
    icon: Shield,
    label: 'Access Denied',
    description: 'Insufficient permissions'
  },
  timeout: {
    icon: Clock,
    label: 'Request Timeout',
    description: 'Operation took too long'
  },
  system: {
    icon: AlertTriangle,
    label: 'System Error',
    description: 'Internal system malfunction'
  },
  security: {
    icon: Shield,
    label: 'Security Issue',
    description: 'Security-related problem'
  }
};

export function AccessibilityErrorTranslator({ 
  error, 
  className, 
  compact = false,
  showTechnicalDetails = false 
}: AccessibilityErrorTranslatorProps) {
  const severity = severityConfig[error.severity];
  const category = categoryConfig[error.category];
  
  const SeverityIcon = severity.icon;
  const CategoryIcon = category.icon;

  if (compact) {
    return (
      <div 
        className={cn(
          "flex items-center gap-2 p-2 rounded-md border",
          severity.bgColor,
          severity.borderColor,
          className
        )}
        role="alert"
        aria-labelledby={`error-${error.id}-title`}
      >
        <div className={cn("w-2 h-2 rounded-full", severity.color)} />
        <SeverityIcon className={cn("w-4 h-4", severity.textColor)} />
        <span 
          id={`error-${error.id}-title`}
          className={cn("text-sm font-medium", severity.textColor)}
        >
          {error.message}
        </span>
      </div>
    );
  }

  return (
    <div 
      className={cn(
        "rounded-lg border p-4 space-y-3",
        severity.bgColor,
        severity.borderColor,
        className
      )}
      role="alert"
      aria-labelledby={`error-${error.id}-title`}
      aria-describedby={`error-${error.id}-description`}
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="flex items-center gap-2">
          <div className={cn("w-3 h-3 rounded-full", severity.color)} />
          <SeverityIcon className={cn("w-5 h-5", severity.textColor)} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 
              id={`error-${error.id}-title`}
              className={cn("text-lg font-semibold", severity.textColor)}
            >
              {severity.label}
            </h3>
            <span className={cn("text-xs px-2 py-1 rounded-full", severity.color, "text-white")}>
              {error.severity.toUpperCase()}
            </span>
          </div>
          <p 
            id={`error-${error.id}-description`}
            className={cn("text-sm", severity.textColor)}
          >
            {error.message}
          </p>
        </div>
      </div>

      {/* Category Information */}
      <div className="flex items-center gap-2 pl-8">
        <CategoryIcon className={cn("w-4 h-4", severity.textColor)} />
        <span className={cn("text-sm font-medium", severity.textColor)}>
          {category.label}
        </span>
        <span className={cn("text-xs", severity.textColor, "opacity-75")}>
          {category.description}
        </span>
      </div>

      {/* Suggested Action */}
      {error.suggestedAction && (
        <div className={cn("pl-8 text-sm", severity.textColor)}>
          <strong>Suggested Action:</strong> {error.suggestedAction}
        </div>
      )}

      {/* Technical Details (if enabled) */}
      {showTechnicalDetails && error.technicalDetails && (
        <details className="pl-8">
          <summary className={cn("text-sm font-medium cursor-pointer", severity.textColor)}>
            Technical Details
          </summary>
          <pre className={cn("text-xs mt-2 p-2 rounded bg-black/10 dark:bg-white/10 overflow-x-auto", severity.textColor)}>
            {error.technicalDetails}
          </pre>
        </details>
      )}

      {/* Timestamp */}
      {error.timestamp && (
        <div className={cn("pl-8 text-xs opacity-75", severity.textColor)}>
          {error.timestamp.toLocaleString()}
        </div>
      )}
    </div>
  );
}

// Error Collection Component
interface ErrorCollectionProps {
  errors: AccessibilityError[];
  className?: string;
  maxDisplay?: number;
  groupBySeverity?: boolean;
  showTechnicalDetails?: boolean;
}

export function ErrorCollection({ 
  errors, 
  className,
  maxDisplay = 10,
  groupBySeverity = true,
  showTechnicalDetails = false
}: ErrorCollectionProps) {
  const sortedErrors = [...errors].sort((a, b) => {
    const severityA = severityConfig[a.severity].priority;
    const severityB = severityConfig[b.severity].priority;
    return severityA - severityB;
  });

  const displayedErrors = sortedErrors.slice(0, maxDisplay);
  const hiddenCount = errors.length - maxDisplay;

  if (groupBySeverity) {
    const groupedErrors = displayedErrors.reduce((acc, error) => {
      if (!acc[error.severity]) {
        acc[error.severity] = [];
      }
      acc[error.severity].push(error);
      return acc;
    }, {} as Record<ErrorSeverity, AccessibilityError[]>);

    const severityOrder: ErrorSeverity[] = ['critical', 'high', 'medium', 'low', 'info', 'success'];

    return (
      <div className={cn("space-y-4", className)}>
        {severityOrder.map(severity => {
          const severityErrors = groupedErrors[severity];
          if (!severityErrors?.length) return null;

          return (
            <div key={severity} className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {severityConfig[severity].label} ({severityErrors.length})
              </h4>
              <div className="space-y-2">
                {severityErrors.map(error => (
                  <AccessibilityErrorTranslator
                    key={error.id}
                    error={error}
                    compact
                    showTechnicalDetails={showTechnicalDetails}
                  />
                ))}
              </div>
            </div>
          );
        })}
        
        {hiddenCount > 0 && (
          <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">
            +{hiddenCount} more errors not shown
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {displayedErrors.map(error => (
        <AccessibilityErrorTranslator
          key={error.id}
          error={error}
          showTechnicalDetails={showTechnicalDetails}
        />
      ))}
      
      {hiddenCount > 0 && (
        <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">
          +{hiddenCount} more errors not shown
        </div>
      )}
    </div>
  );
}

// Utility function to create errors
export function createAccessibilityError(
  message: string,
  severity: ErrorSeverity,
  category: ErrorCategory,
  options?: {
    technicalDetails?: string;
    suggestedAction?: string;
    timestamp?: Date;
  }
): AccessibilityError {
  return {
    id: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    message,
    severity,
    category,
    timestamp: new Date(),
    ...options
  };
}