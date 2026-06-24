export default function BilanDonneesPage() {
  return (
    <div className="flex flex-col overflow-hidden h-[calc(100vh-3.5rem)] lg:h-screen">
      <iframe
        src="/bilan/donnees.html"
        className="flex-1 w-full border-0"
        title="Vos Données — Bilan Patrimonial"
      />
    </div>
  );
}
