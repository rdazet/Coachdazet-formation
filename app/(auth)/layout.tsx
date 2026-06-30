import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8">
          <Image
            src="/logo-auth.png"
            alt="Coachdazet Formation"
            width={320}
            height={58}
            priority
            className="w-full h-auto rounded-lg"
          />
        </div>
        {children}
      </div>
    </div>
  );
}
