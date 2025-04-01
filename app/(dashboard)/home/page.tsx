export default async function HomePage() {
  return (
    <div className="text-primary w-full h-full">
      <div className="w-full h-full">
        <div className="w-full h-[2000px] pr-96">
          <section className="w-full">
            <div className="w-full h-full flex flex-col gap-2 p-4 pr-0 md:p-8">
              <h1 className="text-3xl font-bold">Start Creating!</h1>
              <h2 className="text-slate-400 text-xl">Check out the effects of your kol split</h2>
            </div>
          </section>
        </div>
        <div className="w-96 h-full fixed top-0 right-0 py-6">
          <div className="w-full h-full bg-white rounded-bl-xl rounded-tl-xl flex flex-col gap-2 shadow-[0_0_10px_0_rgba(0,0,0,0.1)] p-4">
            <h1 className="text-3xl font-bold">Start Creating!</h1>
            <h2 className="text-slate-400 text-xl">Check out the effects of your kol split</h2>
          </div>
        </div>
      </div>
    </div>
  );
}
