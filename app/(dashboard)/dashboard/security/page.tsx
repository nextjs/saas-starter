"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Lock, Trash2 } from "lucide-react";

export default function SecurityPage() {
  const passwordFormRef = useRef<HTMLFormElement>(null);
  const deleteFormRef = useRef<HTMLFormElement>(null);
  const accountFormRef = useRef<HTMLFormElement>(null);

  // "Fake" password update
  const handlePasswordSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // No real functionality; just reset the form to mimic "success."
    passwordFormRef.current?.reset();
    alert("Your password has been updated (not really).");
  };

  // "Fake" delete account
  const handleDeleteSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    deleteFormRef.current?.reset();
    alert("Your account is deleted (not really).");
  };

  // "Fake" account update
  const handleAccountSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    accountFormRef.current?.reset();
    alert("Your account information has been updated (not really).");
  };

  return (
    <section className="flex-1 p-4 lg:p-8 space-y-8">
      <h1 className="text-lg lg:text-2xl font-medium text-gray-900">
        Security Settings
      </h1>

      {/* Account Information Card */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAccountSubmit} className="space-y-4" ref={accountFormRef}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Enter your name"
                  readOnly
                  // readOnly to mimic "no real editing"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  readOnly
                />
              </div>
            </div>
            <Button
              type="submit"
              className="bg-orange-500 hover:bg-orange-600 text-white mt-2"
            >
              Update Info
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Password Update Card */}
      <Card>
        <CardHeader>
          <CardTitle>Password</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-4"
            onSubmit={handlePasswordSubmit}
            ref={passwordFormRef}
          >
            <div>
              <Label htmlFor="current-password">Current Password</Label>
              <Input
                id="current-password"
                name="currentPassword"
                type="password"
                autoComplete="current-password"
                required
                readOnly
              />
            </div>
            <div>
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                name="newPassword"
                type="password"
                autoComplete="new-password"
                required
                readOnly
              />
            </div>
            <div>
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input
                id="confirm-password"
                name="confirmPassword"
                type="password"
                required
                readOnly
              />
            </div>
            <Button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white">
              <Lock className="mr-2 h-4 w-4" />
              Update Password
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Delete Account Card */}
      <Card>
        <CardHeader>
          <CardTitle>Delete Account</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 mb-4">
            Account deletion is non-reversible. Please proceed with caution.
          </p>
          <form onSubmit={handleDeleteSubmit} className="space-y-4" ref={deleteFormRef}>
            <div>
              <Label htmlFor="delete-password">Confirm Password</Label>
              <Input
                id="delete-password"
                name="password"
                type="password"
                required
                readOnly
              />
            </div>
            <Button
              type="submit"
              variant="destructive"
              className="bg-red-600 hover:bg-red-700"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Account
            </Button>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
