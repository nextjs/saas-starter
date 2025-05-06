'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Badge } from '@/components/ui/badge';
import { Loader2, Activity, Clock, Key, AlertCircle } from 'lucide-react';
import useSWR from 'swr';
import { format } from 'date-fns';
import { Progress } from '@/components/ui/progress';

// 定义API使用记录类型
type ApiUsageRecord = {
  id: string;
  endpoint: string;
  creditsConsumed: number;
  executionTimeMs: number;
  responseStatus: number;
  ipAddress: string;
  timestamp: string;
  apiKeyName: string | null;
};

// 定义分页响应类型
type PaginatedResponse = {
  data: ApiUsageRecord[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

// 定义用户用量统计类型
type UsageStats = {
  usedCredits: number;
  totalCredits: number;
  percentUsed: number;
};

// 定义积分信息响应类型
type CreditsResponse = {
  teamId: number;
  availableCredits: number;
  creditBatches: any[];
};

// 数据获取函数
const fetcher = (url: string) => fetch(url).then((res) => res.json());

/**
 * API使用记录页面组件
 * 显示用户API使用情况和历史记录
 */
export default function ApiUsagePage() {
  // 当前页码状态
  const [page, setPage] = useState(1);
  const limit = 10; // 每页显示10条记录

  // 使用SWR获取分页数据
  const { data, error, isLoading } = useSWR<PaginatedResponse>(
    `/api/usage?page=${page}&limit=${limit}`,
    fetcher
  );

  // 使用SWR获取积分数据
  const { data: creditsData, error: creditsError } = useSWR<CreditsResponse>(
    '/api/credits',
    fetcher
  );

  // 使用SWR获取API使用统计
  const { data: usageStatsData } = useSWR('/api/usage/stats', fetcher);

  // 计算用户用量统计
  const usageStats: UsageStats = useMemo(() => {
    // 如果有积分数据，使用真实数据
    if (creditsData && usageStatsData) {
      const usedCredits = usageStatsData.creditsUsed || 0;
      const totalCredits = creditsData.availableCredits || 0;
      const percentUsed = totalCredits > 0 ? (usedCredits / totalCredits) * 100 : 0;
      
      return {
        usedCredits,
        totalCredits,
        percentUsed
      };
    }
    
    // 否则返回默认值
    return {
      usedCredits: 0,
      totalCredits: 0,
      percentUsed: 0
    };
  }, [creditsData, usageStatsData]);

  // 获取状态徽章颜色
  const getStatusBadgeColor = (status: number) => {
    if (status >= 200 && status < 300) return 'bg-green-100 text-green-800';
    if (status >= 400 && status < 500) return 'bg-yellow-100 text-yellow-800';
    if (status >= 500) return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  // 获取用量进度条颜色
  const getUsageProgressColor = (percent: number) => {
    if (percent < 50) return 'bg-green-500';
    if (percent < 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // 格式化时间戳
  const formatTimestamp = (timestamp: string) => {
    try {
      return format(new Date(timestamp), 'yyyy-MM-dd HH:mm:ss');
    } catch (e) {
      return 'Invalid date';
    }
  };

  // 渲染分页控件
  const renderPagination = () => {
    if (!data || data.totalPages <= 1) return null;

    return (
      <Pagination className="mt-4">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className={page <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
            />
          </PaginationItem>
          
          {Array.from({ length: Math.min(5, data.totalPages) }, (_, i) => {
            // 显示当前页附近的页码
            let pageNum = page;
            if (page <= 3) {
              pageNum = i + 1;
            } else if (page >= data.totalPages - 2) {
              pageNum = data.totalPages - 4 + i;
            } else {
              pageNum = page - 2 + i;
            }
            
            // 确保页码在有效范围内
            if (pageNum > 0 && pageNum <= data.totalPages) {
              return (
                <PaginationItem key={pageNum}>
                  <PaginationLink
                    onClick={() => setPage(pageNum)}
                    isActive={page === pageNum}
                  >
                    {pageNum}
                  </PaginationLink>
                </PaginationItem>
              );
            }
            return null;
          })}
          
          <PaginationItem>
            <PaginationNext 
              onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
              className={page >= data.totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  return (
    <section className="flex-1 p-4 lg:p-8">
      <h1 className="text-lg lg:text-2xl font-medium mb-6">API Usage Records</h1>
      
      {/* 用户用量统计卡片 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>API Credits Usage This Month</CardTitle>
          <CardDescription>
            View your current API credit usage and remaining balance
          </CardDescription>
        </CardHeader>
        <CardContent>
          {creditsError ? (
            <div className="text-center py-4 text-red-500">
              <p>Error loading credit information</p>
              <Button 
                variant="outline" 
                className="mt-2"
                onClick={() => window.location.reload()}
              >
                Retry
              </Button>
            </div>
          ) : !creditsData ? (
            <div className="flex justify-center items-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">
                  Used {usageStats.usedCredits} / {usageStats.totalCredits} credits
                </span>
                <span className="text-sm font-medium">
                  {usageStats.percentUsed.toFixed(1)}%
                </span>
              </div>
              
              <Progress 
                value={usageStats.percentUsed} 
                className={`h-2 ${getUsageProgressColor(usageStats.percentUsed)}`}
              />
              
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{usageStats.totalCredits - usageStats.usedCredits} credits remaining</span>
                {usageStats.percentUsed > 80 && (
                  <span className="flex items-center text-red-500">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    High credit usage
                  </span>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* API调用历史卡片 */}
      <Card>
        <CardHeader>
          <CardTitle>API Call History</CardTitle>
          <CardDescription>
            View your API call records and usage statistics
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              <p>Error loading API usage records</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => window.location.reload()}
              >
                Retry
              </Button>
            </div>
          ) : data && data.data.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Endpoint</TableHead>
                    <TableHead>API Key</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Credits Used</TableHead>
                    <TableHead>Execution Time</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.data.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">{record.endpoint}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Key className="h-3 w-3 mr-1 text-gray-500" />
                          {record.apiKeyName || 'Unknown Key'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusBadgeColor(record.responseStatus)}>
                          {record.responseStatus}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Activity className="h-3 w-3 mr-1 text-gray-500" />
                          {record.creditsConsumed}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-1 text-gray-500" />
                          {record.executionTimeMs}ms
                        </div>
                      </TableCell>
                      <TableCell>{record.ipAddress}</TableCell>
                      <TableCell>{formatTimestamp(record.timestamp)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {renderPagination()}
            </>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No API usage records found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
