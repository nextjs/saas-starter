'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Music, BookOpen, Sparkles, Clock, ChevronRight } from 'lucide-react';
import useSWR from 'swr';
import { User } from '@/lib/db/schema';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const RECENT_DRAFTS = [
  { id: 1, title: 'Midnight Rain', updated: '2 hours ago', status: 'In Progress' },
  { id: 2, title: 'Summer Ghost', updated: 'Yesterday', status: 'Draft' },
  { id: 3, title: 'Neon Dreams', updated: '3 days ago', status: 'Completed' },
];

export default function OverviewPage() {
  const { data: user } = useSWR<User>('/api/user', fetcher);

  return (
    <div className="flex-1 p-4 lg:p-8 space-y-8">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
            Welcome back, {user?.name?.split(' ')[0] || 'Songwriter'}!
          </h1>
          <p className="text-gray-500 mt-1">Ready to find your next rhyme?</p>
        </div>
        <Avatar className="size-12 hidden sm:flex">
          <AvatarFallback className="bg-orange-100 text-orange-600 font-bold">
            {user?.name?.[0] || user?.email?.[0] || 'U'}
          </AvatarFallback>
        </Avatar>
      </div>

      {/* Quick Actions - Mobile Optimized Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Button className="h-24 flex flex-col items-center justify-center space-y-2 bg-orange-500 hover:bg-orange-600 text-white shadow-md border-none">
          <PlusCircle className="size-6" />
          <span className="font-semibold text-sm">New Song</span>
        </Button>
        <Button variant="outline" className="h-24 flex flex-col items-center justify-center space-y-2 hover:bg-gray-50 shadow-sm">
          <Music className="size-6 text-orange-500" />
          <span className="font-semibold text-sm">Library</span>
        </Button>
        <Button variant="outline" className="h-24 flex flex-col items-center justify-center space-y-2 hover:bg-gray-50 shadow-sm">
          <BookOpen className="size-6 text-orange-500" />
          <span className="font-semibold text-sm">Dictionary</span>
        </Button>
        <Button variant="outline" className="h-24 flex flex-col items-center justify-center space-y-2 hover:bg-gray-50 shadow-sm">
          <Sparkles className="size-6 text-orange-500" />
          <span className="font-semibold text-sm">AI Helper</span>
        </Button>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Drafts List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Clock className="mr-2 size-5 text-gray-400" />
              Recent Drafts
            </h2>
            <Button variant="ghost" size="sm" className="text-orange-500 hover:text-orange-600 p-0">
              View all
            </Button>
          </div>

          <div className="space-y-3">
            {RECENT_DRAFTS.map((draft) => (
              <div
                key={draft.id}
                className="group flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex items-center space-x-4">
                  <div className="size-10 rounded-lg bg-orange-50 flex items-center justify-center group-hover:bg-orange-100 transition-colors">
                    <Music className="size-5 text-orange-500" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{draft.title}</h3>
                    <p className="text-xs text-gray-400">Edited {draft.updated}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`hidden sm:inline-block text-xs px-2 py-1 rounded-full ${
                    draft.status === 'Completed' ? 'bg-green-100 text-green-700' :
                    draft.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {draft.status}
                  </span>
                  <ChevronRight className="size-5 text-gray-300 group-hover:text-gray-500 transition-colors" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-6">
          {/* Writing Goal Widget */}
          <div className="p-6 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl text-white shadow-lg relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="font-bold text-lg mb-1">Writing Streak</h3>
              <p className="text-orange-100 text-sm mb-4">You have written for 5 days in a row!</p>
              <div className="w-full bg-white/20 rounded-full h-2 mb-2">
                <div className="bg-white h-full rounded-full w-3/4" />
              </div>
              <p className="text-xs text-orange-500 bg-white inline-block px-2 py-1 rounded-md font-bold mt-2">
                75% OF WEEKLY GOAL
              </p>
            </div>
            <Sparkles className="absolute -bottom-4 -right-4 size-24 text-white/10 rotate-12" />
          </div>

          {/* Daily Inspiration */}
          <div className="p-5 bg-white rounded-xl border border-gray-100 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <Sparkles className="mr-2 size-4 text-orange-500" />
              Daily Inspiration
            </h3>
            <p className="text-sm text-gray-600 italic">
              "The music is not in the notes, but in the silence between."
            </p>
            <p className="text-xs text-gray-400 mt-2 text-right">— Wolfgang Amadeus Mozart</p>
          </div>
        </div>
      </div>
    </div>
  );
}
