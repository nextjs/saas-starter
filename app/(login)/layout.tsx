import Header from '@/components/header';


export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <section className="min-h-[100dvh] flex flex-col ">
      <Header />
      {children}
    </section>
  );
}