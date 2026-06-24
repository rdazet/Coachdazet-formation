import dynamic from "next/dynamic";

const ClientsTestPage = dynamic(() => import("./ClientsTestPage"), {
  ssr: false,
  loading: () => (
    <div className="p-6 text-sm text-gray-500">Chargement...</div>
  ),
});

export default function Page() {
  return <ClientsTestPage />;
}
