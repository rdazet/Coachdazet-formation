export default function BilanDonneesPage() {
  return (
    <div className="flex flex-col h-full min-h-[calc(100vh-4rem)]">
      <iframe
        src="/bilan/donnees.html"
        className="flex-1 w-full border-0"
        style={{ minHeight: "calc(100vh - 4rem)" }}
        title="Vos Données — Bilan Patrimonial"
      />
    </div>
  );
}
