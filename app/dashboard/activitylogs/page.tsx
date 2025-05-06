'use client';

import { useState } from 'react';
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
import { Loader2, Activity } from 'lucide-react';
import useSWR from 'swr';

// 活动日志项类型定义
interface ActivityLogItem {
  id: number;
  action: string;
  timestamp: string;
  ipAddress: string;
  userName: string;
}

// 活动日志响应类型定义
interface ActivityLogsResponse {
  data: ActivityLogItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// 格式化活动类型显示
function formatAction(action: string): string {
  return action
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

// 活动日志获取函数
const activityFetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Failed to fetch activity logs');
  }
  return res.json();
};

export default function ActivityLogsPage() {
  // 状态管理
  const [page, setPage] = useState(1);
  const limit = 10; // 每页显示的记录数

  // 使用SWR获取活动日志数据
  const { data: response, error, isLoading } = useSWR<ActivityLogsResponse>(
    `/api/activity?page=${page}&limit=${limit}`,
    activityFetcher
  );

  // 从响应中提取数据和分页信息
  const data = response?.data || [];
  const totalPages = response?.totalPages || 1;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Activity Logs</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Activity History</CardTitle>
          <CardDescription>
            View all activity records and operation history for your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              <p>Error loading activity logs</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => window.location.reload()}
              >
                Retry
              </Button>
            </div>
          ) : data && data.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>{log.userName || 'Unknown User'}</TableCell>
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          <Activity className="h-4 w-4 mr-2 text-orange-500" />
                          {formatAction(log.action)}
                        </div>
                      </TableCell>
                      <TableCell>{log.ipAddress || '-'}</TableCell>
                      <TableCell>{new Date(log.timestamp).toLocaleString('en-US')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <Pagination className="mt-4">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      className={page <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>

                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    // 显示当前页附近的页码
                    let pageNum = page;
                    if (page <= 3) {
                      pageNum = i + 1;
                    } else if (page >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = page - 2 + i;
                    }

                    // 确保页码在有效范围内
                    if (pageNum > 0 && pageNum <= totalPages) {
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
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      className={page >= totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No activity records yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
