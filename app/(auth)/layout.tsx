export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-semibold text-navy">
            Coachdazet
          </h1>
          <p className="text-terracotta font-serif italic text-lg mt-1">
            Formation
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
