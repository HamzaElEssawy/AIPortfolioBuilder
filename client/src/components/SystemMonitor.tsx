import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Activity, Clock, AlertTriangle, TrendingUp, Server, Database } from "lucide-react";

interface PerformanceMetrics {
  requestCount: number;
  averageResponseTime: number;
  errorRate: number;
  slowRequests: number;
  memoryUsage: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
    external: number;
    arrayBuffers: number;
  };
  uptime: number;
}

interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  context?: Record<string, any>;
}

interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  services: {
    database: 'online' | 'offline' | 'degraded';
    api: 'online' | 'offline' | 'degraded';
    storage: 'online' | 'offline' | 'degraded';
  };
  lastChecked: string;
}

export default function SystemMonitor() {
  const [logLevel, setLogLevel] = useState<string>('all');

  const { data: metrics, isLoading: metricsLoading } = useQuery<PerformanceMetrics>({
    queryKey: ["/api/admin/system/metrics"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: logs = [], isLoading: logsLoading } = useQuery<LogEntry[]>({
    queryKey: ["/api/admin/system/logs", logLevel],
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  const { data: health, isLoading: healthLoading } = useQuery<SystemHealth>({
    queryKey: ["/api/admin/system/health"],
    refetchInterval: 15000, // Refresh every 15 seconds
  });

  const formatBytes = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'online':
        return 'bg-green-500';
      case 'warning':
      case 'degraded':
        return 'bg-yellow-500';
      case 'critical':
      case 'offline':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getLogLevelColor = (level: string) => {
    switch (level) {
      case 'error':
        return 'text-red-600 bg-red-50';
      case 'warn':
        return 'text-yellow-600 bg-yellow-50';
      case 'info':
        return 'text-blue-600 bg-blue-50';
      case 'debug':
        return 'text-gray-600 bg-gray-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  if (metricsLoading || healthLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <Activity className="mx-auto h-8 w-8 animate-spin" />
          <p className="mt-2 text-sm text-gray-500">Loading system metrics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">System Monitor</h2>
          <p className="text-muted-foreground">
            Real-time performance metrics and system health
          </p>
        </div>
        {health && (
          <Badge 
            variant={health.status === 'healthy' ? 'default' : 'destructive'}
            className="text-sm"
          >
            System {health.status}
          </Badge>
        )}
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
          <TabsTrigger value="health">Health Check</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics?.requestCount || 0}</div>
                <p className="text-xs text-muted-foreground">Last hour</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics?.averageResponseTime || 0}ms</div>
                <p className="text-xs text-muted-foreground">Average latency</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics?.errorRate || 0}%</div>
                <p className="text-xs text-muted-foreground">Error percentage</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Uptime</CardTitle>
                <Server className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metrics ? formatUptime(metrics.uptime) : '0m'}
                </div>
                <p className="text-xs text-muted-foreground">Current session</p>
              </CardContent>
            </Card>
          </div>

          {metrics && (
            <Card>
              <CardHeader>
                <CardTitle>Memory Usage</CardTitle>
                <CardDescription>Current memory consumption breakdown</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Heap Used</span>
                    <span>{formatBytes(metrics.memoryUsage.heapUsed)}</span>
                  </div>
                  <Progress 
                    value={(metrics.memoryUsage.heapUsed / metrics.memoryUsage.heapTotal) * 100} 
                    className="h-2"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">RSS:</span>
                    <span className="ml-2 font-medium">{formatBytes(metrics.memoryUsage.rss)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Heap Total:</span>
                    <span className="ml-2 font-medium">{formatBytes(metrics.memoryUsage.heapTotal)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">External:</span>
                    <span className="ml-2 font-medium">{formatBytes(metrics.memoryUsage.external)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Array Buffers:</span>
                    <span className="ml-2 font-medium">{formatBytes(metrics.memoryUsage.arrayBuffers)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>Detailed performance analysis</CardDescription>
            </CardHeader>
            <CardContent>
              {metrics && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{metrics.requestCount}</div>
                      <div className="text-sm text-muted-foreground">Total Requests</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{metrics.averageResponseTime}ms</div>
                      <div className="text-sm text-muted-foreground">Avg Response</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">{metrics.slowRequests}</div>
                      <div className="text-sm text-muted-foreground">Slow Requests</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-red-600">{metrics.errorRate}%</div>
                      <div className="text-sm text-muted-foreground">Error Rate</div>
                    </div>
                  </div>

                  {metrics.errorRate > 5 && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        High error rate detected ({metrics.errorRate}%). Consider investigating recent changes.
                      </AlertDescription>
                    </Alert>
                  )}

                  {metrics.averageResponseTime > 500 && (
                    <Alert>
                      <Clock className="h-4 w-4" />
                      <AlertDescription>
                        Slow response times detected ({metrics.averageResponseTime}ms average). Performance optimization may be needed.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Logs</CardTitle>
              <CardDescription>Recent application logs and events</CardDescription>
              <div className="flex gap-2">
                <Button
                  variant={logLevel === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setLogLevel('all')}
                >
                  All
                </Button>
                <Button
                  variant={logLevel === 'error' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setLogLevel('error')}
                >
                  Errors
                </Button>
                <Button
                  variant={logLevel === 'warn' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setLogLevel('warn')}
                >
                  Warnings
                </Button>
                <Button
                  variant={logLevel === 'info' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setLogLevel('info')}
                >
                  Info
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {logsLoading ? (
                <div className="text-center py-4">Loading logs...</div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {logs.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">
                      No logs found for the selected level
                    </div>
                  ) : (
                    logs.map((log, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-3 border rounded-lg text-sm"
                      >
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getLogLevelColor(log.level)}`}
                        >
                          {log.level.toUpperCase()}
                        </Badge>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium">{log.message}</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(log.timestamp).toLocaleString()}
                          </div>
                          {log.context && (
                            <pre className="text-xs text-muted-foreground mt-1 whitespace-pre-wrap">
                              {JSON.stringify(log.context, null, 2)}
                            </pre>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="health" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Health</CardTitle>
              <CardDescription>Service status and health checks</CardDescription>
            </CardHeader>
            <CardContent>
              {health && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(health.status)}`} />
                    <span className="font-medium">Overall Status: {health.status}</span>
                    <span className="text-sm text-muted-foreground">
                      Last checked: {new Date(health.lastChecked).toLocaleString()}
                    </span>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Database className="h-4 w-4" />
                          Database
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(health.services.database)}`} />
                          <span className="capitalize">{health.services.database}</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Server className="h-4 w-4" />
                          API Server
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(health.services.api)}`} />
                          <span className="capitalize">{health.services.api}</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Activity className="h-4 w-4" />
                          Storage
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(health.services.storage)}`} />
                          <span className="capitalize">{health.services.storage}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}