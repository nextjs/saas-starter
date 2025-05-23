export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-green-50">
      {children}
    </div>
  );
} 