'use client';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-[calc(100dvh-68px)] w-full">
      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-0 lg:p-4">{children}</main>
    </div>
  );
}
