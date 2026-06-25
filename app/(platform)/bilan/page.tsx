"use client";

import { useRef, useState } from "react";

type ClientKey = "aurora"|"quentin"|"sybille"|"alexandre"|"benedicte"|"benoit"|"emma"|"zineb";
type ClientData = { _label: string } & Record<string, string>;

const CLIENTS: Record<ClientKey, ClientData> = {
  aurora: {
    _label: "Aurora chargée ✅",
    date_evaluation:"2025-09-10", age:"38", situation:"couple",
    salaire_net:"4200", bonus_net:"0", salaire_3ans:"5500",
    epargne_mensuelle:"500", grosses_depenses:"60000",
    comptes_cheques:"2000", cel:"0", pel:"0", livret_a:"24700",
    ldd:"17000", lep:"0", divers_liquidites:"0",
    dette_montant:"0", dette_taux:"0", dette_debut:"", dette_duree:"0", dette_capital_du_direct:"0",
    rp_lieu:"Arcueil", rp_valeur:"250000", rp_emprunt_initial:"250000",
    rp_taux:"3.6", rp_debut:"2023-09-01", rp_duree:"25",
    loc_lieu:"", loc_valeur:"0", loc_emprunt_initial:"0", loc_taux:"0",
    loc_debut:"", loc_duree:"0", loc_loyers:"0", loc_charges:"0", scpi:"0",
    cto:"0", pea:"0", per:"21000", pee:"10000",
    av_fonds_euros:"16000", av_uc:"0", autres_invests:"0",
  },
  quentin: {
    _label: "Quentin chargé ✅",
    date_evaluation:"2026-03-30", age:"26", situation:"couple",
    salaire_net:"5500", bonus_net:"458", salaire_3ans:"6750",
    epargne_mensuelle:"2600", grosses_depenses:"0",
    comptes_cheques:"8000", cel:"0", pel:"6600", livret_a:"0",
    ldd:"0", lep:"0", divers_liquidites:"0",
    dette_montant:"30000", dette_taux:"1.9", dette_debut:"", dette_duree:"0", dette_capital_du_direct:"18300",
    rp_lieu:"Doubs", rp_valeur:"175000", rp_emprunt_initial:"107500",
    rp_taux:"3.25", rp_debut:"2024-07-17", rp_duree:"15",
    loc_lieu:"", loc_valeur:"0", loc_emprunt_initial:"0", loc_taux:"0",
    loc_debut:"", loc_duree:"0", loc_loyers:"0", loc_charges:"0", scpi:"0",
    cto:"7250", pea:"2900", per:"10600", pee:"0",
    av_fonds_euros:"9000", av_uc:"0", autres_invests:"0",
  },
  sybille: {
    _label: "Sybille chargée ✅",
    date_evaluation:"2026-01-03", age:"42", situation:"marie",
    salaire_net:"10545", bonus_net:"0", salaire_3ans:"10000",
    epargne_mensuelle:"105", grosses_depenses:"0",
    comptes_cheques:"10000", cel:"0", pel:"75000", livret_a:"76500",
    ldd:"0", lep:"0", divers_liquidites:"400",
    dette_montant:"0", dette_taux:"0", dette_debut:"", dette_duree:"0", dette_capital_du_direct:"0",
    rp_lieu:"Reims", rp_valeur:"700000", rp_emprunt_initial:"737965",
    rp_taux:"1.15", rp_debut:"2022-01-05", rp_duree:"25",
    loc_lieu:"Franconville", loc_valeur:"275000", loc_emprunt_initial:"251100",
    loc_taux:"1.6", loc_debut:"2018-11-10", loc_duree:"25",
    loc_loyers:"840", loc_charges:"200", scpi:"0",
    cto:"0", pea:"11000", per:"0", pee:"13573",
    av_fonds_euros:"38000", av_uc:"0", autres_invests:"0",
  },
  alexandre: {
    _label: "Alexandre chargé ✅",
    date_evaluation:"2026-05-01", age:"32", situation:"couple",
    salaire_net:"4800", bonus_net:"0", salaire_3ans:"6100",
    epargne_mensuelle:"1495", grosses_depenses:"0",
    comptes_cheques:"213000", cel:"0", pel:"0", livret_a:"14000",
    ldd:"0", lep:"0", divers_liquidites:"0",
    dette_montant:"20000", dette_taux:"3.75", dette_debut:"2024-10-14", dette_duree:"5", dette_capital_du_direct:"14036",
    rp_lieu:"Dettwiller", rp_valeur:"400000", rp_emprunt_initial:"301000",
    rp_taux:"1.1", rp_debut:"2021-03-01", rp_duree:"20",
    loc_lieu:"Dettwiller", loc_valeur:"200000", loc_emprunt_initial:"234000",
    loc_taux:"1.2", loc_debut:"2021-03-01", loc_duree:"20",
    loc_loyers:"1900", loc_charges:"300", scpi:"0",
    cto:"500", pea:"3500", per:"0", pee:"0",
    av_fonds_euros:"0", av_uc:"0", autres_invests:"530800",
  },
  benedicte: {
    _label: "Bénédicte chargée ✅",
    date_evaluation:"2026-05-07", age:"35", situation:"couple",
    salaire_net:"3637", bonus_net:"418", salaire_3ans:"4547",
    epargne_mensuelle:"2000", grosses_depenses:"40000",
    comptes_cheques:"0", cel:"0", pel:"0", livret_a:"25490",
    ldd:"12243", lep:"0", divers_liquidites:"25299",
    dette_montant:"0", dette_taux:"0", dette_debut:"", dette_duree:"0", dette_capital_du_direct:"0",
    rp_lieu:"Clamart (92)", rp_valeur:"500000", rp_emprunt_initial:"263000",
    rp_taux:"3.7", rp_debut:"2024-07-01", rp_duree:"25",
    loc_lieu:"Montrouge (92)", loc_valeur:"155000", loc_emprunt_initial:"100000",
    loc_taux:"3.17", loc_debut:"2026-04-15", loc_duree:"20",
    loc_loyers:"950", loc_charges:"75", scpi:"0",
    cto:"0", pea:"0", per:"12625", pee:"38374",
    av_fonds_euros:"20000", av_uc:"0", autres_invests:"0",
  },
  benoit: {
    _label: "Benoit chargé ✅",
    date_evaluation:"2026-06-12", age:"47", situation:"couple",
    salaire_net:"10000", bonus_net:"0", salaire_3ans:"12000",
    epargne_mensuelle:"2000", grosses_depenses:"50000",
    comptes_cheques:"5000", cel:"15300", pel:"0", livret_a:"25000",
    ldd:"12800", lep:"0", divers_liquidites:"0",
    dette_montant:"0", dette_taux:"0", dette_debut:"", dette_duree:"0", dette_capital_du_direct:"0",
    rp_lieu:"Bègles (33)", rp_valeur:"450000", rp_emprunt_initial:"310000",
    rp_taux:"1.4", rp_debut:"2026-09-10", rp_duree:"20",
    loc_lieu:"Biscarosse", loc_valeur:"220000", loc_emprunt_initial:"205000",
    loc_taux:"2.42", loc_debut:"2025-10-10", loc_duree:"20",
    loc_loyers:"550", loc_charges:"100", scpi:"0",
    cto:"1000", pea:"45000", per:"5800", pee:"38000",
    av_fonds_euros:"11000", av_uc:"0", autres_invests:"854000",
  },
  emma: {
    _label: "Emma chargée ✅",
    date_evaluation:"2025-10-23", age:"28", situation:"couple",
    salaire_net:"3200", bonus_net:"0", salaire_3ans:"3840",
    epargne_mensuelle:"1000", grosses_depenses:"0",
    comptes_cheques:"3000", cel:"0", pel:"40000", livret_a:"20805",
    ldd:"12888", lep:"0", divers_liquidites:"20000",
    dette_montant:"0", dette_taux:"0", dette_debut:"", dette_duree:"0", dette_capital_du_direct:"0",
    rp_lieu:"", rp_valeur:"0", rp_emprunt_initial:"0",
    rp_taux:"0", rp_debut:"", rp_duree:"0",
    loc_lieu:"", loc_valeur:"0", loc_emprunt_initial:"0", loc_taux:"0",
    loc_debut:"", loc_duree:"0", loc_loyers:"0", loc_charges:"0", scpi:"0",
    cto:"0", pea:"100", per:"592", pee:"27954",
    av_fonds_euros:"36311", av_uc:"57592", autres_invests:"0",
  },
  zineb: {
    _label: "Zineb chargée ✅",
    date_evaluation:"2025-05-01", age:"25", situation:"celibataire",
    salaire_net:"2200", bonus_net:"450", salaire_3ans:"3500",
    epargne_mensuelle:"550", grosses_depenses:"0",
    comptes_cheques:"0", cel:"0", pel:"0", livret_a:"0",
    ldd:"0", lep:"0", divers_liquidites:"0",
    dette_montant:"0", dette_taux:"0", dette_debut:"", dette_duree:"0", dette_capital_du_direct:"0",
    rp_lieu:"", rp_valeur:"0", rp_emprunt_initial:"0",
    rp_taux:"0", rp_debut:"", rp_duree:"0",
    loc_lieu:"", loc_valeur:"0", loc_emprunt_initial:"0", loc_taux:"0",
    loc_debut:"", loc_duree:"0", loc_loyers:"0", loc_charges:"0", scpi:"0",
    cto:"505", pea:"513", per:"8132", pee:"0",
    av_fonds_euros:"0", av_uc:"0", autres_invests:"0",
  },
};

export default function BilanPage() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [selected, setSelected] = useState<string>("");
  const [toast, setToast] = useState<string>("");

  function loadClient() {
    if (!selected) return;
    const raw = { ...CLIENTS[selected as ClientKey] };
    const label = raw._label;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _label, ...data } = raw;

    localStorage.setItem("bilan_donnees", JSON.stringify(data));
    ["plan_immo_data","plan_bourse_data","plan_epargne_data",
     "plan_budget_data","plan_salaire_data"].forEach(k => localStorage.removeItem(k));

    // Reload iframe so bilan picks up the new localStorage data
    if (iframeRef.current) {
      iframeRef.current.src = "/bilan/index.html";
    }

    setToast(label);
    setTimeout(() => setToast(""), 3000);
  }

  return (
    <div className="flex flex-col h-full min-h-[calc(100vh-4rem)]">
      <div className="px-6 py-4 border-b border-gray-200 bg-white flex items-center justify-between shrink-0">
        <div>
          <h1 className="font-display text-xl font-semibold text-navy">Calculateur de Patrimoine</h1>
          <p className="text-sm text-gray-500 mt-0.5">Bilan patrimonial complet — Coach Dazet</p>
        </div>
        <div className="flex items-center gap-3">
          {/* ── Sélecteur client ── */}
          <div
            style={{
              background: "#1B2B4A",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "6px 12px",
              borderRadius: "8px",
              fontSize: "0.82rem",
            }}
          >
            <span style={{ opacity: 0.7, whiteSpace: "nowrap" }}>🗂 Client :</span>
            <select
              value={selected}
              onChange={e => setSelected(e.target.value)}
              style={{
                padding: "3px 8px", borderRadius: "6px", border: "none",
                fontSize: "0.82rem", background: "#fff", color: "#1B2B4A",
                cursor: "pointer", maxWidth: "140px",
              }}
            >
              <option value="">— Sélectionner —</option>
              <option value="aurora">Aurora</option>
              <option value="quentin">Quentin</option>
              <option value="sybille">Sybille</option>
              <option value="alexandre">Alexandre</option>
              <option value="benedicte">Bénédicte</option>
              <option value="benoit">Benoit</option>
              <option value="emma">Emma</option>
              <option value="zineb">Zineb</option>
            </select>
            <button
              onClick={loadClient}
              style={{
                padding: "4px 12px", background: "#C0603A", color: "#fff",
                border: "none", borderRadius: "6px", fontSize: "0.82rem",
                fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap",
              }}
            >
              Charger →
            </button>
            {toast && (
              <span style={{ color: "#4ade80", fontWeight: 600, fontSize: "0.78rem", whiteSpace: "nowrap" }}>
                {toast}
              </span>
            )}
          </div>
          <a
            href="/bilan/index.html"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-gray-400 hover:text-navy transition-colors whitespace-nowrap"
          >
            Ouvrir en plein écran ↗
          </a>
        </div>
      </div>
      <iframe
        ref={iframeRef}
        src="/bilan/index.html"
        className="flex-1 w-full border-0"
        style={{ minHeight: "calc(100vh - 8rem)" }}
        title="Calculateur de Patrimoine"
      />
    </div>
  );
}
