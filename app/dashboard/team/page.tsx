'use client';

import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
  CardDescription
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import { customerPortalAction } from '@/lib/payments/actions';
import { useActionState } from 'react';
import { TeamDataWithMembers, User } from '@/lib/db/schema';
import { removeTeamMember, inviteTeamMember, updateTeamName } from '@/app/(auth)/actions';
import useSWR, { mutate } from 'swr';
import { Suspense, useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { 
  Loader2, 
  PlusCircle, 
  Users, 
  Calendar, 
  CreditCard, 
  Settings, 
  Shield,
  Edit,
  Save
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

type ActionState = {
  error?: string;
  success?: string;
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function TeamInfoSkeleton() {
  return (
    <Card className="mb-8 h-[200px]">
      <CardHeader>
        <CardTitle>团队信息</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="animate-pulse space-y-4">
          <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
          <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
          <div className="h-4 w-1/3 bg-gray-200 rounded"></div>
        </div>
      </CardContent>
    </Card>
  );
}

function TeamInfo() {
  const { data: teamData } = useSWR<TeamDataWithMembers>('/api/team', fetcher);
  const { data: user } = useSWR<User>('/api/user', fetcher);
  const isOwner = user?.role === 'owner';
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [updateState, updateAction, isUpdatePending] = useActionState<
    ActionState,
    FormData
  >(updateTeamName, {});

  // 当团队数据加载完成后，设置初始团队名称
  useEffect(() => {
    if (teamData) {
      setNewTeamName(teamData.name || '');
    }
  }, [teamData]);

  // 处理表单提交成功后的操作
  useEffect(() => {
    if (updateState.success) {
      setDialogOpen(false);
      mutate('/api/team');
    }
  }, [updateState.success]);

  if (!teamData) {
    return <TeamInfoSkeleton />;
  }

  const createdDate = teamData.createdAt 
    ? new Date(teamData.createdAt).toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : '未知';
    
  // 格式化订阅续费日期
  const renewalDate = teamData.subscriptionRenewsAt
    ? new Date(teamData.subscriptionRenewsAt).toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : '未知';
    
  // 获取订阅状态的中文描述和样式
  const getSubscriptionStatusInfo = (status: string | null | undefined) => {
    if (!status) return { text: '未激活', className: 'text-gray-500' };
    
    switch (status) {
      case 'active':
        return { text: '已激活', className: 'text-green-600' };
      case 'trialing':
        return { text: '试用中', className: 'text-blue-600' };
      case 'canceled':
        return { text: '已取消', className: 'text-red-600' };
      case 'unpaid':
        return { text: '未付款', className: 'text-amber-600' };
      default:
        return { text: status, className: 'text-gray-500' };
    }
  };
  
  const statusInfo = getSubscriptionStatusInfo(teamData.subscriptionStatus);

  return (
    <Card className="mb-8">
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle className="text-2xl">{teamData.name || '我的团队'}</CardTitle>
          <CardDescription>团队基本信息和设置</CardDescription>
        </div>
        {isOwner && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <Edit className="h-4 w-4" />
                <span>编辑</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>编辑团队信息</DialogTitle>
                <DialogDescription>
                  修改您的团队名称。点击保存按钮确认更改。
                </DialogDescription>
              </DialogHeader>
              <form action={updateAction} className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="teamName">团队名称</Label>
                  <Input
                    id="teamName"
                    name="teamName"
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                    placeholder="请输入团队名称"
                  />
                </div>
                {updateState.error && (
                  <p className="text-red-500 text-sm">{updateState.error}</p>
                )}
                <DialogFooter className="mt-4">
                  <DialogClose asChild>
                    <Button variant="outline" type="button">
                      取消
                    </Button>
                  </DialogClose>
                  <Button
                    type="submit"
                    className="bg-orange-500 hover:bg-orange-600 text-white"
                    disabled={isUpdatePending}
                  >
                    {isUpdatePending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        保存中...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        保存更改
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">团队 ID</h3>
              <p className="font-medium">{teamData.id}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">创建时间</h3>
              <p className="font-medium flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                {createdDate}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">成员数量</h3>
              <p className="font-medium flex items-center">
                <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                {teamData.teamMembers?.length || 0} 人
              </p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">当前套餐</h3>
              <div className="flex items-center">
                <CreditCard className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="font-medium mr-2">{teamData.planName || '免费版'}</span>
                <span className={`text-sm ${statusInfo.className}`}>
                  ({statusInfo.text})
                </span>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">套餐有效期</h3>
              <p className="font-medium flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                {teamData.subscriptionStatus === 'active' || teamData.subscriptionStatus === 'trialing' 
                  ? `${renewalDate} 到期` 
                  : '无有效订阅'}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">安全状态</h3>
              <p className="font-medium flex items-center">
                <Shield className="h-4 w-4 mr-2 text-muted-foreground" />
                正常
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TeamMembersSkeleton() {
  return (
    <Card className="mb-8 h-[140px]">
      <CardHeader>
        <CardTitle>Team Members</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="animate-pulse space-y-4 mt-1">
          <div className="flex items-center space-x-4">
            <div className="size-8 rounded-full bg-gray-200"></div>
            <div className="space-y-2">
              <div className="h-4 w-32 bg-gray-200 rounded"></div>
              <div className="h-3 w-14 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TeamMembers() {
  const { data: teamData } = useSWR<TeamDataWithMembers>('/api/team', fetcher);
  const [removeState, removeAction, isRemovePending] = useActionState<
    ActionState,
    FormData
  >(removeTeamMember, {});

  const getUserDisplayName = (user: Pick<User, 'id' | 'name' | 'email'>) => {
    return user.name || user.email || 'Unknown User';
  };

  if (!teamData?.teamMembers?.length) {
    return (
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No team members yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Team Members</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {teamData.teamMembers.map((member, index) => (
            <li key={member.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Avatar>
                  {/* 
                    This app doesn't save profile images, but here
                    is how you'd show them:

                    <AvatarImage
                      src={member.user.image || ''}
                      alt={getUserDisplayName(member.user)}
                    />
                  */}
                  <AvatarFallback>
                    {getUserDisplayName(member.user)
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">
                    {getUserDisplayName(member.user)}
                  </p>
                  <p className="text-sm text-muted-foreground capitalize">
                    {member.role}
                  </p>
                </div>
              </div>
              {index > 1 ? (
                <form action={removeAction}>
                  <input type="hidden" name="memberId" value={member.id} />
                  <Button
                    type="submit"
                    variant="outline"
                    size="sm"
                    disabled={isRemovePending}
                  >
                    {isRemovePending ? 'Removing...' : 'Remove'}
                  </Button>
                </form>
              ) : null}
            </li>
          ))}
        </ul>
        {removeState?.error && (
          <p className="text-red-500 mt-4">{removeState.error}</p>
        )}
      </CardContent>
    </Card>
  );
}

function InviteTeamMemberSkeleton() {
  return (
    <Card className="h-[260px]">
      <CardHeader>
        <CardTitle>Invite Team Member</CardTitle>
      </CardHeader>
    </Card>
  );
}

function InviteTeamMember() {
  const { data: user } = useSWR<User>('/api/user', fetcher);
  const isOwner = user?.role === 'owner';
  const [inviteState, inviteAction, isInvitePending] = useActionState<
    ActionState,
    FormData
  >(inviteTeamMember, {});

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invite Team Member</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={inviteAction} className="space-y-4">
          <div>
            <Label htmlFor="email" className="mb-2">
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Enter email"
              required
              disabled={!isOwner}
            />
          </div>
          <div>
            <Label>Role</Label>
            <RadioGroup
              defaultValue="member"
              name="role"
              className="flex space-x-4"
              disabled={!isOwner}
            >
              <div className="flex items-center space-x-2 mt-2">
                <RadioGroupItem value="member" id="member" />
                <Label htmlFor="member">Member</Label>
              </div>
              <div className="flex items-center space-x-2 mt-2">
                <RadioGroupItem value="owner" id="owner" />
                <Label htmlFor="owner">Owner</Label>
              </div>
            </RadioGroup>
          </div>
          {inviteState?.error && (
            <p className="text-red-500">{inviteState.error}</p>
          )}
          {inviteState?.success && (
            <p className="text-green-500">{inviteState.success}</p>
          )}
          <Button
            type="submit"
            className="bg-orange-500 hover:bg-orange-600 text-white"
            disabled={isInvitePending || !isOwner}
          >
            {isInvitePending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Inviting...
              </>
            ) : (
              <>
                <PlusCircle className="mr-2 h-4 w-4" />
                Invite Member
              </>
            )}
          </Button>
        </form>
      </CardContent>
      {!isOwner && (
        <CardFooter>
          <p className="text-sm text-muted-foreground">
            You must be a team owner to invite new members.
          </p>
        </CardFooter>
      )}
    </Card>
  );
}

function SubscriptionSkeleton() {
  return (
    <Card className="h-[300px]">
      <CardHeader>
        <CardTitle>订阅管理</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="animate-pulse space-y-4">
          <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
          <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
          <div className="h-4 w-2/3 bg-gray-200 rounded"></div>
          <div className="h-10 w-1/4 bg-gray-200 rounded mt-6"></div>
        </div>
      </CardContent>
    </Card>
  );
}

function ManageSubscription() {
  const { data: teamData } = useSWR<TeamDataWithMembers>('/api/team', fetcher);
  const { data: user } = useSWR<User>('/api/user', fetcher);
  const isOwner = user?.role === 'owner';
  
  if (!teamData) {
    return <SubscriptionSkeleton />;
  }
  
  // 获取订阅状态的中文描述和样式
  const getSubscriptionStatusInfo = (status: string | null | undefined) => {
    if (!status) return { text: '未激活', className: 'text-gray-500' };
    
    switch (status) {
      case 'active':
        return { text: '已激活', className: 'text-green-600' };
      case 'trialing':
        return { text: '试用中', className: 'text-blue-600' };
      case 'canceled':
        return { text: '已取消', className: 'text-red-600' };
      case 'unpaid':
        return { text: '未付款', className: 'text-amber-600' };
      default:
        return { text: status, className: 'text-gray-500' };
    }
  };
  
  const statusInfo = getSubscriptionStatusInfo(teamData.subscriptionStatus);
  
  // 格式化订阅续费日期
  const renewalDate = teamData.subscriptionRenewsAt
    ? new Date(teamData.subscriptionRenewsAt).toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : '未知';
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>订阅管理</CardTitle>
        <CardDescription>
          管理您的团队订阅计划和付款信息
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">当前套餐</h3>
            <p className="text-xl font-semibold flex items-center">
              {teamData.planName || '免费版'}
              <span className={`text-sm ml-2 ${statusInfo.className}`}>
                ({statusInfo.text})
              </span>
            </p>
          </div>
          
          {(teamData.subscriptionStatus === 'active' || teamData.subscriptionStatus === 'trialing') && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">下次续费日期</h3>
              <p className="font-medium">{renewalDate}</p>
            </div>
          )}
          
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">套餐功能</h3>
            <ul className="list-disc list-inside space-y-1 text-sm">
              {teamData.planName === 'Pro' ? (
                <>
                  <li>每月 10,000 API 调用</li>
                  <li>最多 100 个 API 密钥</li>
                  <li>最多 100 个团队成员</li>
                  <li>优先技术支持</li>
                </>
              ) : teamData.planName === 'Plus' ? (
                <>
                  <li>每月 5,000 API 调用</li>
                  <li>最多 50 个 API 密钥</li>
                  <li>最多 50 个团队成员</li>
                </>
              ) : (
                <>
                  <li>每月 1,000 API 调用</li>
                  <li>最多 10 个 API 密钥</li>
                  <li>最多 10 个团队成员</li>
                </>
              )}
            </ul>
          </div>
        </div>
        
        {isOwner && (
          <div className="pt-4">
            <form action={customerPortalAction}>
              <Button 
                type="submit" 
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                <CreditCard className="mr-2 h-4 w-4" />
                管理订阅
              </Button>
            </form>
            <p className="text-xs text-muted-foreground mt-2">
              您将被重定向到安全的支付页面管理您的订阅
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function TeamPage() {
  return (
    <section className="flex-1 p-4 lg:p-8">
      <h1 className="text-lg lg:text-2xl font-medium mb-6">团队管理</h1>
      
      <Suspense fallback={<TeamInfoSkeleton />}>
        <TeamInfo />
      </Suspense>
      
      <Tabs defaultValue="members" className="mb-8">
        <TabsList className="mb-4">
          <TabsTrigger value="members" className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            团队成员
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-1">
            <Settings className="h-4 w-4" />
            订阅管理
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="members" className="space-y-6">
          <Suspense fallback={<TeamMembersSkeleton />}>
            <TeamMembers />
          </Suspense>
          
          <Suspense fallback={<InviteTeamMemberSkeleton />}>
            <InviteTeamMember />
          </Suspense>
        </TabsContent>
        
        <TabsContent value="settings">
          <Suspense fallback={<SubscriptionSkeleton />}>
            <ManageSubscription />
          </Suspense>
        </TabsContent>
      </Tabs>
    </section>
  );
}
