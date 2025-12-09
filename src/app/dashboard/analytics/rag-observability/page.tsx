'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/i18n/provider';
import PageContainer from '@/components/layout/page-container';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  IconRefresh,
  IconCoin,
  IconClock,
  IconDatabase,
  IconSearch,
  IconAlertTriangle,
  IconCheck,
  IconBrain,
  IconRobot,
  IconLoader2,
} from '@tabler/icons-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';
import {
  getRAGDashboard,
  getAIRequestStats,
  getCostBreakdown,
  getVectorSearchQualityStats,
  getKnowledgeGapSummary,
  getFailingQueries,
  formatCostUSD,
  formatLatency,
  formatTokenCount,
  getPriorityColor,
  type RAGObservabilityDashboard,
  type RequestStats,
  type CostBreakdown,
  type VectorSearchQualityStats,
  type KnowledgeGapSummary,
} from '@/features/ai/services/ai-feedback-service';
import { toast } from 'sonner';

const COLORS = ['#22c55e', '#3b82f6', '#eab308', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function RAGObservabilityPage() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(7);
  const [dashboard, setDashboard] = useState<RAGObservabilityDashboard | null>(null);
  const [requestStats, setRequestStats] = useState<RequestStats | null>(null);
  const [costBreakdown, setCostBreakdown] = useState<CostBreakdown | null>(null);
  const [vectorStats, setVectorStats] = useState<VectorSearchQualityStats | null>(null);
  const [gapSummary, setGapSummary] = useState<KnowledgeGapSummary | null>(null);
  const [failingQueries, setFailingQueries] = useState<Array<{ query_text: string; failure_count: number; avg_similarity: number }>>([]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [dashData, reqStats, costs, vecStats, gaps, failing] = await Promise.all([
        getRAGDashboard(days),
        getAIRequestStats({ days }),
        getCostBreakdown({ days }),
        getVectorSearchQualityStats({ days }),
        getKnowledgeGapSummary(),
        getFailingQueries({ days }),
      ]);
      
      setDashboard(dashData);
      setRequestStats(reqStats);
      setCostBreakdown(costs);
      setVectorStats(vecStats);
      setGapSummary(gaps);
      setFailingQueries(failing);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to load RAG observability data:', error);
      toast.error(t('common.loadError') || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days]);

  if (loading && !dashboard) {
    return (
      <PageContainer>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-32" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {t('analytics.ragObservability.title') || 'RAG Observability'} 🔍
            </h1>
            <p className="text-muted-foreground">
              {t('analytics.ragObservability.description') || 'Monitor AI usage, costs, and RAG performance'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={String(days)} onValueChange={(v) => setDays(Number(v))}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Last 24h</SelectItem>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="14">Last 14 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={loadData} disabled={loading}>
              {loading ? <IconLoader2 className="h-4 w-4 animate-spin" /> : <IconRefresh className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('analytics.ragObservability.totalRequests') || 'Total Requests'}
              </CardTitle>
              <IconRobot className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboard?.total_requests?.toLocaleString() || 0}</div>
              <p className="text-xs text-muted-foreground">
                {requestStats?.success_rate.toFixed(1)}% success rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('analytics.ragObservability.totalTokens') || 'Total Tokens'}
              </CardTitle>
              <IconBrain className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatTokenCount(dashboard?.total_tokens || 0)}</div>
              <p className="text-xs text-muted-foreground">
                {formatTokenCount(requestStats?.total_prompt_tokens || 0)} prompt / {formatTokenCount(requestStats?.total_completion_tokens || 0)} completion
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('analytics.ragObservability.totalCost') || 'Total Cost'}
              </CardTitle>
              <IconCoin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${dashboard?.total_cost_usd?.toFixed(4) || '0.00'}</div>
              <p className="text-xs text-muted-foreground">
                Estimated API cost
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('analytics.ragObservability.avgLatency') || 'Avg Latency'}
              </CardTitle>
              <IconClock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatLatency(dashboard?.avg_latency_ms || 0)}</div>
              <p className="text-xs text-muted-foreground">
                Per request average
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('analytics.ragObservability.vectorSearches') || 'Vector Searches'}
              </CardTitle>
              <IconSearch className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboard?.total_vector_searches?.toLocaleString() || 0}</div>
              <p className="text-xs text-muted-foreground">
                {vectorStats?.empty_rate?.toFixed(1)}% empty results
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('analytics.ragObservability.avgSimilarity') || 'Avg Similarity'}
              </CardTitle>
              <IconDatabase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(dashboard?.avg_similarity_score * 100)?.toFixed(1) || 0}%</div>
              <Progress value={(dashboard?.avg_similarity_score || 0) * 100} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('analytics.ragObservability.knowledgeGaps') || 'Knowledge Gaps'}
              </CardTitle>
              <IconAlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboard?.knowledge_gaps_count || 0}</div>
              <p className="text-xs text-muted-foreground">
                {dashboard?.unresolved_gaps_count || 0} unresolved
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('analytics.ragObservability.searchQuality') || 'Search Quality'}
              </CardTitle>
              <IconCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{vectorStats?.good_rate?.toFixed(1) || 0}%</div>
              <p className="text-xs text-muted-foreground">
                Good quality results
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for detailed views */}
        <Tabs defaultValue="trends" className="space-y-4">
          <TabsList>
            <TabsTrigger value="trends">{t('analytics.ragObservability.trends') || 'Trends'}</TabsTrigger>
            <TabsTrigger value="cost">{t('analytics.ragObservability.costAnalysis') || 'Cost Analysis'}</TabsTrigger>
            <TabsTrigger value="quality">{t('analytics.ragObservability.searchQuality') || 'Search Quality'}</TabsTrigger>
            <TabsTrigger value="gaps">{t('analytics.ragObservability.knowledgeGaps') || 'Knowledge Gaps'}</TabsTrigger>
          </TabsList>

          {/* Trends Tab */}
          <TabsContent value="trends" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>{t('analytics.ragObservability.requestsTrend') || 'Requests Over Time'}</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dashboard?.requests_trend || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tickFormatter={(v) => new Date(v).toLocaleDateString()} />
                      <YAxis />
                      <Tooltip labelFormatter={(v) => new Date(v).toLocaleDateString()} />
                      <Area type="monotone" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t('analytics.ragObservability.tokensTrend') || 'Token Usage Over Time'}</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dashboard?.tokens_trend || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tickFormatter={(v) => new Date(v).toLocaleDateString()} />
                      <YAxis tickFormatter={(v) => formatTokenCount(v)} />
                      <Tooltip labelFormatter={(v) => new Date(v).toLocaleDateString()} formatter={(v: number) => formatTokenCount(v)} />
                      <Area type="monotone" dataKey="value" stroke="#22c55e" fill="#22c55e" fillOpacity={0.3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Usage by Model/Assistant */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>{t('analytics.ragObservability.usageByModel') || 'Usage by Model'}</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={Object.entries(dashboard?.usage_by_model || {}).map(([name, value]) => ({ name, value }))}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      >
                        {Object.keys(dashboard?.usage_by_model || {}).map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t('analytics.ragObservability.usageByAssistant') || 'Usage by Assistant'}</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={Object.entries(dashboard?.usage_by_assistant || {}).map(([name, value]) => ({ name, value }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#8b5cf6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Cost Analysis Tab */}
          <TabsContent value="cost" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>{t('analytics.ragObservability.costByProvider') || 'Cost by Provider'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Provider</TableHead>
                        <TableHead className="text-right">Requests</TableHead>
                        <TableHead className="text-right">Tokens</TableHead>
                        <TableHead className="text-right">Cost</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {costBreakdown?.by_provider?.map((row) => (
                        <TableRow key={row.provider}>
                          <TableCell className="font-medium">{row.provider}</TableCell>
                          <TableCell className="text-right">{row.request_count?.toLocaleString()}</TableCell>
                          <TableCell className="text-right">{formatTokenCount(row.total_tokens || 0)}</TableCell>
                          <TableCell className="text-right">{formatCostUSD(row.total_cost_cents || 0)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t('analytics.ragObservability.costByModel') || 'Cost by Model'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Model</TableHead>
                        <TableHead className="text-right">Requests</TableHead>
                        <TableHead className="text-right">Avg Latency</TableHead>
                        <TableHead className="text-right">Cost</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {costBreakdown?.by_model?.slice(0, 10).map((row) => (
                        <TableRow key={`${row.provider}-${row.model}`}>
                          <TableCell className="font-medium">{row.model}</TableCell>
                          <TableCell className="text-right">{row.request_count?.toLocaleString()}</TableCell>
                          <TableCell className="text-right">{formatLatency(row.avg_latency || 0)}</TableCell>
                          <TableCell className="text-right">{formatCostUSD(row.total_cost_cents || 0)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Search Quality Tab */}
          <TabsContent value="quality" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-green-500" />
                    Good Quality
                  </CardTitle>
                  <CardDescription>Similarity ≥ 80%</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{vectorStats?.good_quality || 0}</div>
                  <p className="text-sm text-muted-foreground">{vectorStats?.good_rate?.toFixed(1)}% of searches</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-yellow-500" />
                    Fair Quality
                  </CardTitle>
                  <CardDescription>Similarity 60-80%</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{vectorStats?.fair_quality || 0}</div>
                  <p className="text-sm text-muted-foreground">{vectorStats?.fair_rate?.toFixed(1)}% of searches</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-red-500" />
                    Poor Quality
                  </CardTitle>
                  <CardDescription>Similarity &lt; 60%</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{vectorStats?.poor_quality || 0}</div>
                  <p className="text-sm text-muted-foreground">{vectorStats?.poor_rate?.toFixed(1)}% of searches</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>{t('analytics.ragObservability.failingQueries') || 'Top Failing Queries'}</CardTitle>
                <CardDescription>Queries with low similarity or no results</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Query</TableHead>
                      <TableHead className="text-right">Failure Count</TableHead>
                      <TableHead className="text-right">Avg Similarity</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(failingQueries.length > 0 ? failingQueries : dashboard?.top_failing_queries || []).slice(0, 10).map((query, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="max-w-md truncate">{query.query_text}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant="destructive">{query.failure_count || query.count}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {((query.avg_similarity || query.avg_sim || 0) * 100).toFixed(1)}%
                        </TableCell>
                      </TableRow>
                    ))}
                    {failingQueries.length === 0 && !dashboard?.top_failing_queries?.length && (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center text-muted-foreground">
                          No failing queries found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Knowledge Gaps Tab */}
          <TabsContent value="gaps" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>{t('analytics.ragObservability.gapsByType') || 'Gaps by Type'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-right">Count</TableHead>
                        <TableHead className="text-right">Total Occurrences</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {gapSummary?.by_type?.map((row) => (
                        <TableRow key={row.gap_type}>
                          <TableCell>
                            <Badge variant="outline">{row.gap_type}</Badge>
                          </TableCell>
                          <TableCell className="text-right">{row.count}</TableCell>
                          <TableCell className="text-right">{row.total_occurrences}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t('analytics.ragObservability.gapsByPriority') || 'Unresolved by Priority'}</CardTitle>
                </CardHeader>
                <CardContent className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={gapSummary?.by_priority || []}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="count"
                        nameKey="priority"
                        label={({ priority, count }) => `${priority}: ${count}`}
                      >
                        {(gapSummary?.by_priority || []).map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>{t('analytics.ragObservability.topGaps') || 'Top Knowledge Gaps'}</CardTitle>
                <CardDescription>Most frequently occurring gaps that need attention</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Query</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead className="text-right">Occurrences</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(gapSummary?.top_gaps || dashboard?.top_knowledge_gaps || []).map((gap) => (
                      <TableRow key={gap.id || gap.query_text}>
                        <TableCell className="max-w-md truncate">{gap.query_text}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{gap.gap_type}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getPriorityColor(gap.priority as any)}>{gap.priority}</Badge>
                        </TableCell>
                        <TableCell className="text-right">{gap.occurrence_count}</TableCell>
                      </TableRow>
                    ))}
                    {!gapSummary?.top_gaps?.length && !dashboard?.top_knowledge_gaps?.length && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground">
                          No knowledge gaps detected
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageContainer>
  );
}
