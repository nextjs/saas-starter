'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Users, Settings, Shield, Activity, Menu } from 'lucide-react';
import { AppSidebar } from '@/components/app-sidebar';
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger
} from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbList
} from '@/components/ui/breadcrumb';

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {

  const pathname = usePathname();

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 flex flex-col">
        <div className="flex-1 flex">
          {/* Main content */}
          <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
              <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                <div className="flex items-center gap-2 px-4">
                  <SidebarTrigger className="-ml-1" />
                  <Separator orientation="vertical" className="mr-2 h-4" />
                  <Breadcrumb>
                    <BreadcrumbList>
                      <BreadcrumbItem className="hidden md:block">
                        <BreadcrumbLink href="/">
                          Home
                        </BreadcrumbLink>
                      </BreadcrumbItem>
                      <BreadcrumbSeparator className="hidden md:block" />
                      <BreadcrumbItem>
                        <BreadcrumbPage>{pathname.split('/').pop()}</BreadcrumbPage>
                      </BreadcrumbItem>
                    </BreadcrumbList>
                  </Breadcrumb>
                </div>
              </header>
              <main className="flex-1 overflow-y-auto bg-background p-6">
                {children}
              </main>
            </SidebarInset>
          </SidebarProvider>


        </div>
      </div>
    </div>

  );
}
