export default function BilanPage() {
  return (
    <div className="flex flex-col h-full min-h-[calc(100vh-4rem)]">
      <div className="px-6 py-4 border-b border-gray-200 bg-white flex items-center justify-between shrink-0">
        <div>
          <h1 className="font-display text-xl font-semibold text-navy">Calculateur de Patrimoine</h1>
          <p className="text-sm text-gray-500 mt-0.5">Bilan patrimonial complet — Coach Dazet</p>
        </div>
        <a
          href="/bilan/index.html"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-gray-400 hover:text-navy transition-colors"
        >
          Ouvrir en plein écran ↗
        </a>
      </div>
      <iframe
        src="/bilan/index.html"
        className="flex-1 w-full border-0"
        style={{ minHeight: "calc(100vh - 8rem)" }}
        title="Calculateur de Patrimoine"
      />
    </div>
  );
}
