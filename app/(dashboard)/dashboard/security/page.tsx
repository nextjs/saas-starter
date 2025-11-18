"use client";

import { deleteAccount, updatePassword } from "@/app/(login)/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ActivityType } from "@/lib/db/activity";
import {
  AlertCircle,
  CheckCircle,
  Download,
  Loader2,
  Lock,
  LogIn,
  LogOut,
  Settings,
  Trash2,
  UserMinus,
  UserPlus,
  type LucideIcon,
} from "lucide-react";
import { useActionState, useState } from "react";
import useSWR from "swr";

type PasswordState = {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
  error?: string;
  success?: string;
};

type DeleteState = {
  password?: string;
  error?: string;
  success?: string;
};

const activityIcons: Record<ActivityType, LucideIcon> = {
  [ActivityType.SIGN_UP]: UserPlus,
  [ActivityType.SIGN_IN]: LogIn,
  [ActivityType.SIGN_OUT]: LogOut,
  [ActivityType.UPDATE_PASSWORD]: Lock,
  [ActivityType.DELETE_ACCOUNT]: UserMinus,
  [ActivityType.UPDATE_ACCOUNT]: Settings,
  [ActivityType.ACCEPT_INVITATION]: CheckCircle,
};

function getRelativeTime(date: Date) {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "just now";
  if (diffInSeconds < 3600)
    return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400)
    return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800)
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  return date.toLocaleDateString();
}

function formatAction(action: ActivityType): string {
  switch (action) {
    case ActivityType.SIGN_UP:
      return "You signed up";
    case ActivityType.SIGN_IN:
      return "You signed in";
    case ActivityType.SIGN_OUT:
      return "You signed out";
    case ActivityType.UPDATE_PASSWORD:
      return "You changed your password";
    case ActivityType.DELETE_ACCOUNT:
      return "You deleted your account";
    case ActivityType.UPDATE_ACCOUNT:
      return "You updated your account";
    case ActivityType.ACCEPT_INVITATION:
      return "You accepted an invitation";
    default:
      return "Unknown action occurred";
  }
}

type ActivityLog = {
  id: number;
  action: string;
  timestamp: string;
  ipAddress?: string;
};

export default function SecurityPage() {
  const fetcher = (url: string) => fetch(url).then((res) => res.json());
  const { data: logs } = useSWR<ActivityLog[]>("/api/activity", fetcher);

  const [passwordState, passwordAction, isPasswordPending] = useActionState<
    PasswordState,
    FormData
  >(updatePassword, {});

  const [deleteState, deleteAction, isDeletePending] = useActionState<
    DeleteState,
    FormData
  >(deleteAccount, {});

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  return (
    <section className="flex-1 p-4 lg:p-8">
      <Card className="mb-8">
        <CardHeader className="pt-6">
          <CardTitle>Password</CardTitle>
        </CardHeader>
        <CardContent className="py-6">
          <form className="space-y-4" action={passwordAction}>
            <div>
              <Label htmlFor="current-password" className="mb-2">
                Current Password
              </Label>
              <Input
                id="current-password"
                name="currentPassword"
                type="password"
                autoComplete="current-password"
                required
                minLength={8}
                maxLength={100}
                defaultValue={passwordState.currentPassword}
              />
            </div>
            <div>
              <Label htmlFor="new-password" className="mb-2">
                New Password
              </Label>
              <Input
                id="new-password"
                name="newPassword"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                maxLength={100}
                defaultValue={passwordState.newPassword}
              />
            </div>
            <div>
              <Label htmlFor="confirm-password" className="mb-2">
                Confirm New Password
              </Label>
              <Input
                id="confirm-password"
                name="confirmPassword"
                type="password"
                required
                minLength={8}
                maxLength={100}
                defaultValue={passwordState.confirmPassword}
              />
            </div>
            {passwordState.error && (
              <p className="text-red-500 text-sm">{passwordState.error}</p>
            )}
            {passwordState.success && (
              <p className="text-green-500 text-sm">{passwordState.success}</p>
            )}
            <Button
              type="submit"
              className="bg-orange-500 hover:bg-orange-600 text-white"
              disabled={isPasswordPending}
            >
              {isPasswordPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Lock className="mr-2 h-4 w-4" />
                  Update Password
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader className="pt-6">
          <CardTitle>Account Actions</CardTitle>
        </CardHeader>
        <CardContent className="py-6">
          <p className="text-sm text-gray-500 mb-4">
            Export your data or permanently delete your account.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <form method="get" action="/api/user/export">
              <Button
                type="submit"
                className="bg-white border border-gray-200 text-gray-900 flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export Data
              </Button>
            </form>

            <div className="ml-0 sm:ml-auto">
              <Button
                variant="destructive"
                className="bg-red-600 hover:bg-red-700 flex items-center gap-2"
                onClick={() => setDeleteModalOpen(true)}
              >
                <Trash2 className="h-4 w-4" />
                Delete Account
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={deleteModalOpen}
        title="Delete Account"
        description="Account deletion is non-reversible. Please enter your password to confirm."
        onClose={() => setDeleteModalOpen(false)}
      >
        <form action={deleteAction} className="space-y-4">
          <div>
            <Label htmlFor="delete-password" className="mb-2">
              Confirm Password
            </Label>
            <Input
              id="delete-password"
              name="password"
              type="password"
              required
              minLength={8}
              maxLength={100}
              defaultValue={deleteState.password}
            />
          </div>
          {deleteState.error && (
            <p className="text-red-500 text-sm">{deleteState.error}</p>
          )}
          <div className="flex justify-end">
            <Button
              type="submit"
              variant="destructive"
              className="bg-red-600 hover:bg-red-700 flex items-center gap-2"
              disabled={isDeletePending}
            >
              {isDeletePending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  Delete Account
                </>
              )}
            </Button>
          </div>
        </form>
      </ConfirmDialog>

      <Card>
        <CardHeader className="pt-6">
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="py-6">
          {logs && logs.length > 0 ? (
            <ul className="space-y-4">
              {logs.map((log) => {
                const Icon =
                  activityIcons[log.action as ActivityType] || Settings;
                const formattedAction = formatAction(
                  log.action as ActivityType
                );

                return (
                  <li key={log.id} className="flex items-center space-x-4">
                    <div className="bg-orange-100 rounded-full p-2">
                      <Icon className="w-5 h-5 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {formattedAction}
                        {log.ipAddress && ` from IP ${log.ipAddress}`}
                      </p>
                      <p className="text-xs text-gray-500">
                        {getRelativeTime(new Date(log.timestamp))}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center text-center py-12">
              <AlertCircle className="h-12 w-12 text-orange-500 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No activity yet
              </h3>
              <p className="text-sm text-gray-500 max-w-sm">
                When you perform actions like signing in or updating your
                account, they'll appear here.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
