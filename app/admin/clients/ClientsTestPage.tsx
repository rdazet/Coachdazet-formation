// @ts-nocheck
"use client";

import { useState, useCallback, useRef } from "react";
import { Upload, Download, ChevronDown, ChevronRight } from "lucide-react";

// ── Données clients (pour sélecteur bilan) ─────────────────────────────────
const BILAN_CLIENTS: Record<string, Record<string, string> & { _label: string }> = {
  aurora:    { _label:"Aurora",    date_evaluation:"2025-09-10", age:"38", situation:"couple",       salaire_net:"4200",  bonus_net:"0",    salaire_3ans:"5500",  epargne_mensuelle:"500",  grosses_depenses:"60000",  comptes_cheques:"2000",   cel:"0",     pel:"0",     livret_a:"24700", ldd:"17000", lep:"0",  divers_liquidites:"0",     dette_montant:"0",     dette_taux:"0",    dette_debut:"",          dette_duree:"0",  dette_capital_du_direct:"0",    rp_lieu:"Arcueil",           rp_valeur:"250000", rp_emprunt_initial:"250000",  rp_taux:"3.6",  rp_debut:"2023-09-01", rp_duree:"25", loc_lieu:"",              loc_valeur:"0",      loc_emprunt_initial:"0",    loc_taux:"0",    loc_debut:"",           loc_duree:"0",  loc_loyers:"0",   loc_charges:"0",    scpi:"0",    cto:"0",    pea:"0",    per:"21000", pee:"10000",  av_fonds_euros:"16000",  av_uc:"0",      autres_invests:"0" },
  quentin:   { _label:"Quentin",   date_evaluation:"2026-03-30", age:"26", situation:"couple",       salaire_net:"5500",  bonus_net:"458",  salaire_3ans:"6750",  epargne_mensuelle:"2600", grosses_depenses:"0",      comptes_cheques:"8000",   cel:"0",     pel:"6600",  livret_a:"0",     ldd:"0",     lep:"0",  divers_liquidites:"0",     dette_montant:"30000", dette_taux:"1.9",  dette_debut:"",          dette_duree:"0",  dette_capital_du_direct:"18300", rp_lieu:"Doubs",             rp_valeur:"175000", rp_emprunt_initial:"107500",  rp_taux:"3.25", rp_debut:"2024-07-17", rp_duree:"15", loc_lieu:"",              loc_valeur:"0",      loc_emprunt_initial:"0",    loc_taux:"0",    loc_debut:"",           loc_duree:"0",  loc_loyers:"0",   loc_charges:"0",    scpi:"0",    cto:"7250", pea:"2900", per:"10600", pee:"0",      av_fonds_euros:"9000",   av_uc:"0",      autres_invests:"0" },
  sybille:   { _label:"Sybille",   date_evaluation:"2026-01-03", age:"42", situation:"marie",        salaire_net:"10545", bonus_net:"0",    salaire_3ans:"10000", epargne_mensuelle:"105",  grosses_depenses:"0",      comptes_cheques:"10000",  cel:"0",     pel:"75000", livret_a:"76500", ldd:"0",     lep:"0",  divers_liquidites:"400",   dette_montant:"0",     dette_taux:"0",    dette_debut:"",          dette_duree:"0",  dette_capital_du_direct:"0",    rp_lieu:"Reims",             rp_valeur:"700000", rp_emprunt_initial:"737965",  rp_taux:"1.15", rp_debut:"2022-01-05", rp_duree:"25", loc_lieu:"Franconville",  loc_valeur:"275000", loc_emprunt_initial:"251100", loc_taux:"1.6",  loc_debut:"2018-11-10", loc_duree:"25", loc_loyers:"840", loc_charges:"200",  scpi:"0",    cto:"0",    pea:"11000",per:"0",     pee:"13573",  av_fonds_euros:"38000",  av_uc:"0",      autres_invests:"0" },
  alexandre: { _label:"Alexandre", date_evaluation:"2026-05-01", age:"32", situation:"couple",       salaire_net:"4800",  bonus_net:"0",    salaire_3ans:"6100",  epargne_mensuelle:"1495", grosses_depenses:"0",      comptes_cheques:"213000", cel:"0",     pel:"0",     livret_a:"14000", ldd:"0",     lep:"0",  divers_liquidites:"0",     dette_montant:"20000", dette_taux:"3.75", dette_debut:"2024-10-14", dette_duree:"5",  dette_capital_du_direct:"14036", rp_lieu:"Dettwiller",        rp_valeur:"400000", rp_emprunt_initial:"301000",  rp_taux:"1.1",  rp_debut:"2021-03-01", rp_duree:"20", loc_lieu:"Dettwiller",    loc_valeur:"200000", loc_emprunt_initial:"234000", loc_taux:"1.2",  loc_debut:"2021-03-01", loc_duree:"20", loc_loyers:"1900",loc_charges:"300",  scpi:"0",    cto:"500",  pea:"3500", per:"0",     pee:"0",      av_fonds_euros:"0",      av_uc:"0",      autres_invests:"530800" },
  benedicte: { _label:"Bénédicte", date_evaluation:"2026-05-07", age:"35", situation:"couple",       salaire_net:"3637",  bonus_net:"418",  salaire_3ans:"4547",  epargne_mensuelle:"2000", grosses_depenses:"40000",  comptes_cheques:"0",      cel:"0",     pel:"0",     livret_a:"25490", ldd:"12243", lep:"0",  divers_liquidites:"25299", dette_montant:"0",     dette_taux:"0",    dette_debut:"",          dette_duree:"0",  dette_capital_du_direct:"0",    rp_lieu:"Clamart (92)",      rp_valeur:"500000", rp_emprunt_initial:"263000",  rp_taux:"3.7",  rp_debut:"2024-07-01", rp_duree:"25", loc_lieu:"Montrouge (92)",loc_valeur:"155000", loc_emprunt_initial:"100000", loc_taux:"3.17", loc_debut:"2026-04-15", loc_duree:"20", loc_loyers:"950", loc_charges:"75",   scpi:"0",    cto:"0",    pea:"0",    per:"12625", pee:"38374",  av_fonds_euros:"20000",  av_uc:"0",      autres_invests:"0" },
  benoit:    { _label:"Benoit",    date_evaluation:"2026-06-12", age:"47", situation:"couple",       salaire_net:"10000", bonus_net:"0",    salaire_3ans:"12000", epargne_mensuelle:"2000", grosses_depenses:"50000",  comptes_cheques:"5000",   cel:"15300", pel:"0",     livret_a:"25000", ldd:"12800", lep:"0",  divers_liquidites:"0",     dette_montant:"0",     dette_taux:"0",    dette_debut:"",          dette_duree:"0",  dette_capital_du_direct:"0",    rp_lieu:"Bègles (33)",       rp_valeur:"450000", rp_emprunt_initial:"310000",  rp_taux:"1.4",  rp_debut:"2026-09-10", rp_duree:"20", loc_lieu:"Biscarosse",    loc_valeur:"220000", loc_emprunt_initial:"205000", loc_taux:"2.42", loc_debut:"2025-10-10", loc_duree:"20", loc_loyers:"550", loc_charges:"100",  scpi:"0",    cto:"1000", pea:"45000",per:"5800",  pee:"38000",  av_fonds_euros:"11000",  av_uc:"0",      autres_invests:"854000" },
  sophie:    { _label:"Sophie",    date_evaluation:"2026-02-17", age:"55", situation:"celibataire",  salaire_net:"3600",  bonus_net:"0",    salaire_3ans:"3700",  epargne_mensuelle:"950",  grosses_depenses:"20000",  comptes_cheques:"2000",   cel:"15000", pel:"11800", livret_a:"25200", ldd:"12100", lep:"0",  divers_liquidites:"9000",  dette_montant:"0",     dette_taux:"0",    dette_debut:"",          dette_duree:"0",  dette_capital_du_direct:"0",    rp_lieu:"Rennes",            rp_valeur:"180000", rp_emprunt_initial:"50000",   rp_taux:"0.9",  rp_debut:"2019-09-18", rp_duree:"8",  loc_lieu:"",              loc_valeur:"0",      loc_emprunt_initial:"0",    loc_taux:"0",    loc_debut:"",           loc_duree:"0",  loc_loyers:"0",   loc_charges:"0",    scpi:"0",    cto:"0",    pea:"0",    per:"15000", pee:"124000", av_fonds_euros:"49000",  av_uc:"0",      autres_invests:"0" },
  louise:    { _label:"Louise",    date_evaluation:"2026-03-15", age:"39", situation:"couple",       salaire_net:"4000",  bonus_net:"4167", salaire_3ans:"10000", epargne_mensuelle:"5000", grosses_depenses:"30000",  comptes_cheques:"24000",  cel:"0",     pel:"0",     livret_a:"23000", ldd:"12000", lep:"0",  divers_liquidites:"80000", dette_montant:"0",     dette_taux:"0",    dette_debut:"",          dette_duree:"0",  dette_capital_du_direct:"0",    rp_lieu:"Villeurbanne",      rp_valeur:"290000", rp_emprunt_initial:"200000",  rp_taux:"3",    rp_debut:"2026-07-01", rp_duree:"15", loc_lieu:"Lyon",          loc_valeur:"320000", loc_emprunt_initial:"123000", loc_taux:"1.1",  loc_debut:"2019-07-01", loc_duree:"15", loc_loyers:"1284",loc_charges:"100",  scpi:"0",    cto:"0",    pea:"0",    per:"35950", pee:"0",      av_fonds_euros:"24000",  av_uc:"0",      autres_invests:"38800" },
  maxime:    { _label:"Maxime",    date_evaluation:"2026-04-11", age:"31", situation:"couple",       salaire_net:"4203",  bonus_net:"350",  salaire_3ans:"4750",  epargne_mensuelle:"850",  grosses_depenses:"14500",  comptes_cheques:"0",      cel:"0",     pel:"8380",  livret_a:"0",     ldd:"5360",  lep:"0",  divers_liquidites:"0",     dette_montant:"0",     dette_taux:"0",    dette_debut:"",          dette_duree:"0",  dette_capital_du_direct:"0",    rp_lieu:"",                  rp_valeur:"0",      rp_emprunt_initial:"0",       rp_taux:"0",    rp_debut:"",           rp_duree:"0",  loc_lieu:"",              loc_valeur:"0",      loc_emprunt_initial:"0",    loc_taux:"0",    loc_debut:"",           loc_duree:"0",  loc_loyers:"0",   loc_charges:"0",    scpi:"0",    cto:"0",    pea:"0",    per:"15014", pee:"2500",   av_fonds_euros:"3200",   av_uc:"8700",   autres_invests:"2000" },
  ronan:     { _label:"Ronan",     date_evaluation:"2026-04-16", age:"24", situation:"celibataire",  salaire_net:"6067",  bonus_net:"0",    salaire_3ans:"8000",  epargne_mensuelle:"1500", grosses_depenses:"100000", comptes_cheques:"5313",   cel:"0",     pel:"0",     livret_a:"4294",  ldd:"2661",  lep:"76", divers_liquidites:"0",     dette_montant:"0",     dette_taux:"0",    dette_debut:"",          dette_duree:"0",  dette_capital_du_direct:"0",    rp_lieu:"",                  rp_valeur:"0",      rp_emprunt_initial:"0",       rp_taux:"0",    rp_debut:"",           rp_duree:"0",  loc_lieu:"",              loc_valeur:"0",      loc_emprunt_initial:"0",    loc_taux:"0",    loc_debut:"",           loc_duree:"0",  loc_loyers:"0",   loc_charges:"0",    scpi:"0",    cto:"2222", pea:"15",   per:"0",     pee:"0",      av_fonds_euros:"0",      av_uc:"0",      autres_invests:"10925" },
  juliette:  { _label:"Juliette",  date_evaluation:"2026-03-06", age:"33", situation:"couple",       salaire_net:"3100",  bonus_net:"1500", salaire_3ans:"4750",  epargne_mensuelle:"1500", grosses_depenses:"100000", comptes_cheques:"4500",   cel:"0",     pel:"68000", livret_a:"19000", ldd:"12000", lep:"0",  divers_liquidites:"0",     dette_montant:"0",     dette_taux:"0",    dette_debut:"",          dette_duree:"0",  dette_capital_du_direct:"0",    rp_lieu:"",                  rp_valeur:"0",      rp_emprunt_initial:"0",       rp_taux:"0",    rp_debut:"",           rp_duree:"0",  loc_lieu:"Lormont",       loc_valeur:"180000", loc_emprunt_initial:"189370", loc_taux:"1.49", loc_debut:"2020-06-01", loc_duree:"25", loc_loyers:"580", loc_charges:"1105", scpi:"6000", cto:"0", pea:"0", per:"8700", pee:"30000", av_fonds_euros:"30000", av_uc:"0", autres_invests:"2000", loc2_lieu:"Marseille", loc2_valeur:"110000", loc2_emprunt_initial:"110000", loc2_taux:"3.1", loc2_debut:"2025-07-01", loc2_duree:"25", loc2_loyers:"690", loc2_charges:"636" },
};

// Charge SheetJS depuis CDN (évite les problèmes de bundling Turbopack)
function loadXLSX(): Promise<unknown> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") return reject("SSR");
    if ((window as unknown as { XLSX: unknown }).XLSX) {
      return resolve((window as unknown as { XLSX: unknown }).XLSX);
    }
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
    script.onload = () => resolve((window as unknown as { XLSX: unknown }).XLSX);
    script.onerror = () => reject(new Error("Impossible de charger SheetJS"));
    document.head.appendChild(script);
  });
}

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

interface ClientData {
  nom: string;
  age: number;
  situation_familiale: string;
  salaire_net: number;
  bonus_net: number;
  epargne_mensuelle: number;
  salaire_futur: number;
  grosses_depenses: number;
  comptes_cheques: number;
  cel: number;
  pel: number;
  livret_a: number;
  ldd: number;
  lep: number;
  divers_liquidites: number;
  dette_montant: number;
  dette_taux_pct: number;
  dette_debut: string;
  dette_duree: number;
  dette_capital_direct: number;
  rp_valeur: number;
  rp_emprunt: number;
  rp_taux_pct: number;
  rp_debut: string;
  rp_duree: number;
  loc_valeur: number;
  loc_emprunt: number;
  loc_taux_pct: number;
  loc_debut: string;
  loc_duree: number;
  loc_loyers: number;
  loc_charges: number;
  scpi: number;
  loc2_valeur: number;
  loc2_emprunt: number;
  loc2_taux_pct: number;
  loc2_debut: string;
  loc2_duree: number;
  loc2_loyers: number;
  loc2_charges: number;
  cto: number;
  pea: number;
  per: number;
  pee: number;
  av_fonds_euros: number;
  av_uc: number;
  autres_invests: number;
  date_evaluation: string;
}

type RowDef =
  | { type: "section"; label: string }
  | { type: "row"; label: string; fmt: "currency" | "pct" | "text" | "years" | "number"; value: (d: ClientData) => number | string }
  | { type: "note"; label: string };

// ═══════════════════════════════════════════════════════════
// PARSING HELPERS
// ═══════════════════════════════════════════════════════════

function num(v: unknown): number {
  if (v === null || v === undefined || v === "") return 0;
  if (typeof v === "number") return isNaN(v) ? 0 : v;
  const s = String(v).trim();
  if (s === "-" || s === "") return 0;
  const n = parseFloat(s.replace(",", "."));
  return isNaN(n) ? 0 : n;
}
function str(v: unknown): string {
  if (v === null || v === undefined) return "";
  return String(v);
}
function parseTauxPct(v: unknown): number {
  if (v === null || v === undefined || v === "") return 0;
  if (typeof v === "string") {
    const n = parseFloat(v.replace("%", "").trim());
    return isNaN(n) ? 0 : n;
  }
  if (typeof v === "number") {
    return v > 1 ? v : v * 100;
  }
  return 0;
}
function parseDate(v: unknown): string {
  if (!v) return "";
  if (v instanceof Date) return v.toISOString().split("T")[0];
  if (typeof v === "string") return v.slice(0, 10);
  // SheetJS peut renvoyer un objet Date-like
  if (typeof v === "object" && v !== null && "getTime" in v) {
    return (v as Date).toISOString().split("T")[0];
  }
  return "";
}
function getCellValue(ws: unknown, row: number, col: number): unknown {
  const X = (window as unknown as { XLSX: unknown }).XLSX as { utils: { encode_cell: (c: { r: number; c: number }) => string } };
  const addr = X.utils.encode_cell({ r: row - 1, c: col - 1 });
  const cell = (ws as Record<string, { v: unknown }>)[addr];
  return cell ? cell.v : null;
}

// ═══════════════════════════════════════════════════════════
// EXCEL PARSING  (feuille "Questionnaire", 11 clients cols 3–13)
// Structure :
//   Ligne 7  : Noms
//   Ligne 9  : Âge
//   Ligne 10 : Situation
//   Ligne 13 : Salaire net        Ligne 14 : Bonus
//   Ligne 16 : Épargne mensuelle  Ligne 17 : Salaire futur  Ligne 18 : Grosses dépenses
//   Lignes 21-27 : Liquidités (comptes, CEL, PEL, LA, LDD, LEP, divers)
//   Lignes 30-34 : Dette hors RP
//   Lignes 38-42 : RP
//   Lignes 46-53 : Locatif 1 + SCPI (ligne 53)
//   Lignes 57-63 : Locatif 2
//   Lignes 66-72 : Bourse (CTO/PEA/PER/PEE/AV euros/AV UC/Autres)
// ═══════════════════════════════════════════════════════════

function parseExcel(wb: unknown): ClientData[] {
  const ws = (wb as { Sheets: Record<string, unknown> }).Sheets["Questionnaire"];
  if (!ws) return [];
  const clients: ClientData[] = [];
  for (let col = 3; col <= 13; col++) {
    const nom = getCellValue(ws, 7, col);
    if (!nom) continue;
    clients.push({
      nom: str(nom),
      date_evaluation: parseDate(getCellValue(ws, 8, col)),
      age: num(getCellValue(ws, 9, col)),
      situation_familiale: str(getCellValue(ws, 10, col)),
      salaire_net: num(getCellValue(ws, 13, col)),
      bonus_net: num(getCellValue(ws, 14, col)),
      epargne_mensuelle: num(getCellValue(ws, 16, col)),
      salaire_futur: num(getCellValue(ws, 17, col)),
      grosses_depenses: num(getCellValue(ws, 18, col)),
      comptes_cheques: num(getCellValue(ws, 21, col)),
      cel: num(getCellValue(ws, 22, col)),
      pel: num(getCellValue(ws, 23, col)),
      livret_a: num(getCellValue(ws, 24, col)),
      ldd: num(getCellValue(ws, 25, col)),
      lep: num(getCellValue(ws, 26, col)),
      divers_liquidites: num(getCellValue(ws, 27, col)),
      dette_montant: num(getCellValue(ws, 30, col)),
      dette_taux_pct: parseTauxPct(getCellValue(ws, 31, col)),
      dette_debut: parseDate(getCellValue(ws, 32, col)),
      dette_duree: num(getCellValue(ws, 33, col)),
      dette_capital_direct: num(getCellValue(ws, 34, col)),
      rp_valeur: num(getCellValue(ws, 38, col)),
      rp_emprunt: num(getCellValue(ws, 39, col)),
      rp_taux_pct: parseTauxPct(getCellValue(ws, 40, col)),
      rp_debut: parseDate(getCellValue(ws, 41, col)),
      rp_duree: num(getCellValue(ws, 42, col)),
      // Locatif 1
      loc_valeur: num(getCellValue(ws, 46, col)),
      loc_emprunt: num(getCellValue(ws, 47, col)),
      loc_taux_pct: parseTauxPct(getCellValue(ws, 48, col)),
      loc_debut: parseDate(getCellValue(ws, 49, col)),
      loc_duree: num(getCellValue(ws, 50, col)),
      loc_loyers: num(getCellValue(ws, 51, col)),
      loc_charges: num(getCellValue(ws, 52, col)),
      scpi: num(getCellValue(ws, 53, col)),
      // Locatif 2
      loc2_valeur: num(getCellValue(ws, 57, col)),
      loc2_emprunt: num(getCellValue(ws, 58, col)),
      loc2_taux_pct: parseTauxPct(getCellValue(ws, 59, col)),
      loc2_debut: parseDate(getCellValue(ws, 60, col)),
      loc2_duree: num(getCellValue(ws, 61, col)),
      loc2_loyers: num(getCellValue(ws, 62, col)),
      loc2_charges: num(getCellValue(ws, 63, col)),
      // Bourse (lignes 66-72)
      cto: num(getCellValue(ws, 66, col)),
      pea: num(getCellValue(ws, 67, col)),
      per: num(getCellValue(ws, 68, col)),
      pee: num(getCellValue(ws, 69, col)),
      av_fonds_euros: num(getCellValue(ws, 70, col)),
      av_uc: num(getCellValue(ws, 71, col)),
      autres_invests: num(getCellValue(ws, 72, col)),
    });
  }
  return clients;
}

// ═══════════════════════════════════════════════════════════
// CALCULATION ENGINE
// ═══════════════════════════════════════════════════════════

// CRD aujourd'hui (depuis date de début jusqu'à refDate, ou aujourd'hui si non fournie)
function crdMonthly(principal: number, tauxPct: number, years: number, startDate: string, refDate?: string): number {
  if (!principal || !years || !startDate) return 0;
  const start = new Date(startDate);
  const today = refDate ? new Date(refDate) : new Date();
  if (isNaN(start.getTime()) || start > today) return principal;
  let months = (today.getFullYear() - start.getFullYear()) * 12 + (today.getMonth() - start.getMonth());
  if (today.getDate() < start.getDate()) months--;
  months = Math.max(0, months);
  const total = years * 12;
  if (months >= total) return 0;
  const r = tauxPct / 100 / 12;
  if (r === 0) return principal - (principal / total) * months;
  const pmt = (principal * r) / (1 - Math.pow(1 + r, -total));
  let bal = principal;
  for (let i = 0; i < months; i++) bal -= pmt - bal * r;
  return Math.max(0, bal);
}

// CRD à un horizon futur (yearsAhead depuis refDate, ou aujourd'hui si non fournie)
function crdAtFuture(principal: number, tauxPct: number, years: number, startDate: string, yearsAhead: number, refDate?: string): number {
  if (!principal || !years || !startDate) return 0;
  const start = new Date(startDate);
  const today = refDate ? new Date(refDate) : new Date();
  if (isNaN(start.getTime())) return 0;
  let pastMonths = (today.getFullYear() - start.getFullYear()) * 12 + (today.getMonth() - start.getMonth());
  if (today.getDate() < start.getDate()) pastMonths--;
  if (start > today) pastMonths = 0;
  pastMonths = Math.max(0, pastMonths);
  const targetMonth = pastMonths + Math.round(yearsAhead * 12);
  const totalMonths = years * 12;
  if (targetMonth >= totalMonths) return 0;
  const r = tauxPct / 100 / 12;
  if (r === 0) return Math.max(0, principal * (1 - targetMonth / totalMonths));
  const powN = Math.pow(1 + r, totalMonths);
  const powt = Math.pow(1 + r, targetMonth);
  return Math.max(0, principal * (powN - powt) / (powN - 1));
}

function mc(tauxDecimal: number, years: number): number {
  if (tauxDecimal === 0 || years === 0) return years > 0 ? 1 / (years * 12) : 0;
  const pow = Math.pow(1 + tauxDecimal, years);
  return (tauxDecimal * pow) / (pow - 1) / 12;
}

function defaultMois(age: number): number {
  if (age < 30) return 3;
  if (age < 50) return 6;
  if (age < 65) return 12;
  return 24;
}

// ── Données dérivées ──────────────────────────────────────
function base(d: ClientData) {
  const salaire = d.salaire_net + d.bonus_net;
  const epargne = d.epargne_mensuelle;
  const cashBrut = d.comptes_cheques + d.cel + d.pel + d.livret_a + d.ldd + d.lep + d.divers_liquidites;
  const ref = d.date_evaluation || undefined;
  const detteCRD = d.dette_capital_direct > 0
    ? d.dette_capital_direct
    : crdMonthly(d.dette_montant, d.dette_taux_pct, d.dette_duree, d.dette_debut, ref);
  const cashNet = cashBrut - detteCRD;
  const bourse = d.cto + d.pea + d.per + d.pee + d.av_uc + d.autres_invests;
  const rpCRD = crdMonthly(d.rp_emprunt, d.rp_taux_pct, d.rp_duree, d.rp_debut, ref);
  const rpNet = d.rp_valeur - rpCRD;
  const locCRD = crdMonthly(d.loc_emprunt, d.loc_taux_pct, d.loc_duree, d.loc_debut, ref);
  const locNet = d.loc_valeur - locCRD;
  const loc2CRD = crdMonthly(d.loc2_emprunt, d.loc2_taux_pct, d.loc2_duree, d.loc2_debut, ref);
  const loc2Net = d.loc2_valeur - loc2CRD;
  const allLocNet = locNet + loc2Net;
  const rpMens = d.rp_emprunt > 0 && d.rp_duree > 0
    ? mc(d.rp_taux_pct / 100, d.rp_duree) * d.rp_emprunt
    : 0;
  return { salaire, epargne, cashBrut, detteCRD, cashNet, bourse, rpCRD, rpNet, locCRD, locNet, loc2CRD, loc2Net, allLocNet, rpMens };
}

// ── Projections patrimoine à 65 ans ───────────────────────
// Hypothèses :
//   - Cash reste en livrets (2%/an, stable en termes réels)
//   - Bourse + AV + épargne mensuelle croît au taux rendement
//   - Immobilier : valeur stable, crédit s'amortit
const RENDEMENT_BASE = 0.05;   // scénario actuel (5%/an)
const RENDEMENT_OPTI = 0.07;   // scénario optimisé (7%/an, meilleure allocation)

function patrimoineActuel(d: ClientData): number {
  const b = base(d);
  return b.cashNet + b.bourse + d.av_fonds_euros + b.rpNet + b.allLocNet + d.scpi;
}

function patrimoine65(d: ClientData, rendement: number): number {
  const yearsTo65 = Math.max(0, 65 - d.age);
  if (yearsTo65 <= 0) return patrimoineActuel(d);
  const b = base(d);
  const months = yearsTo65 * 12;
  const r = rendement / 12;

  // Actifs financiers + épargne mensuelle
  const bourseInit = b.bourse + d.av_fonds_euros;
  const bourseAt65 = bourseInit * Math.pow(1 + r, months)
    + d.epargne_mensuelle * (Math.pow(1 + r, months) - 1) / r;

  const ref = d.date_evaluation || undefined;
  // Immobilier : valeur stable, CRD s'amortit
  const rpNet65 = d.rp_valeur - crdAtFuture(d.rp_emprunt, d.rp_taux_pct, d.rp_duree, d.rp_debut, yearsTo65, ref);
  const locNet65 = d.loc_valeur - crdAtFuture(d.loc_emprunt, d.loc_taux_pct, d.loc_duree, d.loc_debut, yearsTo65, ref);
  const loc2Net65 = d.loc2_valeur - crdAtFuture(d.loc2_emprunt, d.loc2_taux_pct, d.loc2_duree, d.loc2_debut, yearsTo65, ref);

  return b.cashNet + bourseAt65 + rpNet65 + locNet65 + loc2Net65 + d.scpi;
}

// ═══════════════════════════════════════════════════════════
// TABLE DEFINITIONS
// ═══════════════════════════════════════════════════════════

const TABLE_DONNEES: RowDef[] = [
  { type: "section", label: "IDENTITÉ" },
  { type: "row", label: "Âge", fmt: "number", value: d => d.age },
  { type: "row", label: "Situation familiale", fmt: "text", value: d => d.situation_familiale },
  { type: "section", label: "REVENUS ET DÉPENSES" },
  { type: "row", label: "Salaire net mensuel", fmt: "currency", value: d => d.salaire_net },
  { type: "row", label: "Bonus net mensuel", fmt: "currency", value: d => d.bonus_net },
  { type: "row", label: "Total salaire net", fmt: "currency", value: d => d.salaire_net + d.bonus_net },
  { type: "row", label: "Épargne mensuelle", fmt: "currency", value: d => d.epargne_mensuelle },
  { type: "row", label: "Salaire dans 3 ans", fmt: "currency", value: d => d.salaire_futur },
  { type: "row", label: "Grosses dépenses (5 ans)", fmt: "currency", value: d => d.grosses_depenses },
  { type: "section", label: "ARGENT DISPONIBLE" },
  { type: "row", label: "Comptes chèques", fmt: "currency", value: d => d.comptes_cheques },
  { type: "row", label: "CEL", fmt: "currency", value: d => d.cel },
  { type: "row", label: "PEL", fmt: "currency", value: d => d.pel },
  { type: "row", label: "Livret A", fmt: "currency", value: d => d.livret_a },
  { type: "row", label: "LDD", fmt: "currency", value: d => d.ldd },
  { type: "row", label: "LEP", fmt: "currency", value: d => d.lep },
  { type: "row", label: "Divers", fmt: "currency", value: d => d.divers_liquidites },
  { type: "section", label: "DETTE (hors RP)" },
  { type: "row", label: "Montant emprunté", fmt: "currency", value: d => d.dette_montant },
  { type: "row", label: "Taux", fmt: "pct", value: d => d.dette_taux_pct / 100 },
  { type: "row", label: "Début", fmt: "text", value: d => d.dette_debut },
  { type: "row", label: "Durée (ans)", fmt: "number", value: d => d.dette_duree },
  { type: "row", label: "Capital restant dû (direct)", fmt: "currency", value: d => d.dette_capital_direct },
  { type: "section", label: "RÉSIDENCE PRINCIPALE" },
  { type: "row", label: "Valeur", fmt: "currency", value: d => d.rp_valeur },
  { type: "row", label: "Montant emprunté", fmt: "currency", value: d => d.rp_emprunt },
  { type: "row", label: "Taux", fmt: "pct", value: d => d.rp_taux_pct / 100 },
  { type: "row", label: "Début", fmt: "text", value: d => d.rp_debut },
  { type: "row", label: "Durée (ans)", fmt: "number", value: d => d.rp_duree },
  { type: "section", label: "INVESTISSEMENT LOCATIF 1" },
  { type: "row", label: "Valeur", fmt: "currency", value: d => d.loc_valeur },
  { type: "row", label: "Montant emprunté", fmt: "currency", value: d => d.loc_emprunt },
  { type: "row", label: "Taux", fmt: "pct", value: d => d.loc_taux_pct / 100 },
  { type: "row", label: "Début", fmt: "text", value: d => d.loc_debut },
  { type: "row", label: "Durée (ans)", fmt: "number", value: d => d.loc_duree },
  { type: "row", label: "Loyers mensuels", fmt: "currency", value: d => d.loc_loyers },
  { type: "row", label: "Charges mensuelles", fmt: "currency", value: d => d.loc_charges },
  { type: "row", label: "SCPI", fmt: "currency", value: d => d.scpi },
  { type: "section", label: "INVESTISSEMENT LOCATIF 2" },
  { type: "row", label: "Valeur", fmt: "currency", value: d => d.loc2_valeur },
  { type: "row", label: "Montant emprunté", fmt: "currency", value: d => d.loc2_emprunt },
  { type: "row", label: "Taux", fmt: "pct", value: d => d.loc2_taux_pct / 100 },
  { type: "row", label: "Début", fmt: "text", value: d => d.loc2_debut },
  { type: "row", label: "Durée (ans)", fmt: "number", value: d => d.loc2_duree },
  { type: "row", label: "Loyers mensuels", fmt: "currency", value: d => d.loc2_loyers },
  { type: "row", label: "Charges mensuelles", fmt: "currency", value: d => d.loc2_charges },
  { type: "section", label: "INVESTISSEMENTS EN BOURSE" },
  { type: "row", label: "CTO", fmt: "currency", value: d => d.cto },
  { type: "row", label: "PEA", fmt: "currency", value: d => d.pea },
  { type: "row", label: "PER", fmt: "currency", value: d => d.per },
  { type: "row", label: "PEE / Intéressement", fmt: "currency", value: d => d.pee },
  { type: "row", label: "AV fonds euros", fmt: "currency", value: d => d.av_fonds_euros },
  { type: "row", label: "AV unités de compte", fmt: "currency", value: d => d.av_uc },
  { type: "row", label: "Autres investissements", fmt: "currency", value: d => d.autres_invests },
];

const TABLE_BILAN: RowDef[] = [
  { type: "section", label: "REVENUS" },
  { type: "row", label: "Revenus nets mensuels", fmt: "currency", value: d => d.salaire_net + d.bonus_net },
  { type: "row", label: "Épargne mensuelle", fmt: "currency", value: d => d.epargne_mensuelle },
  { type: "row", label: "Taux d'épargne", fmt: "pct", value: d => {
    const s = d.salaire_net + d.bonus_net;
    return s > 0 ? d.epargne_mensuelle / s : 0;
  }},
  { type: "row", label: "Dépenses mensuelles", fmt: "currency", value: d => {
    const s = d.salaire_net + d.bonus_net;
    return Math.max(0, s - d.epargne_mensuelle);
  }},
  { type: "section", label: "PATRIMOINE CASH" },
  { type: "row", label: "Cash brut (livrets + comptes)", fmt: "currency", value: d =>
    d.comptes_cheques + d.cel + d.pel + d.livret_a + d.ldd + d.lep + d.divers_liquidites },
  { type: "row", label: "Dettes (hors RP)", fmt: "currency", value: d => base(d).detteCRD },
  { type: "row", label: "Cash NET", fmt: "currency", value: d => base(d).cashNet },
  { type: "section", label: "PATRIMOINE BOURSE" },
  { type: "row", label: "CTO + PEA + PER + PEE", fmt: "currency", value: d => d.cto + d.pea + d.per + d.pee },
  { type: "row", label: "AV fonds euros (fonds sécurité)", fmt: "currency", value: d => d.av_fonds_euros },
  { type: "row", label: "AV UC + Autres", fmt: "currency", value: d => d.av_uc + d.autres_invests },
  { type: "row", label: "Total Bourse", fmt: "currency", value: d => base(d).bourse },
  { type: "section", label: "IMMOBILIER — RÉSIDENCE PRINCIPALE" },
  { type: "row", label: "Valeur RP", fmt: "currency", value: d => d.rp_valeur },
  { type: "row", label: "CRD RP", fmt: "currency", value: d => base(d).rpCRD },
  { type: "row", label: "RP nette", fmt: "currency", value: d => base(d).rpNet },
  { type: "row", label: "Mensualités RP", fmt: "currency", value: d => base(d).rpMens },
  { type: "row", label: "Taux d'endettement RP", fmt: "pct", value: d => {
    const s = d.salaire_net + d.bonus_net;
    return s > 0 ? base(d).rpMens / s : 0;
  }},
  { type: "section", label: "IMMOBILIER — LOCATIF 1" },
  { type: "row", label: "Valeur locatif 1", fmt: "currency", value: d => d.loc_valeur },
  { type: "row", label: "CRD locatif 1", fmt: "currency", value: d => base(d).locCRD },
  { type: "row", label: "Locatif 1 net", fmt: "currency", value: d => base(d).locNet },
  { type: "section", label: "IMMOBILIER — LOCATIF 2" },
  { type: "row", label: "Valeur locatif 2", fmt: "currency", value: d => d.loc2_valeur },
  { type: "row", label: "CRD locatif 2", fmt: "currency", value: d => base(d).loc2CRD },
  { type: "row", label: "Locatif 2 net", fmt: "currency", value: d => base(d).loc2Net },
  { type: "section", label: "TOTAUX" },
  { type: "row", label: "Patrimoine brut", fmt: "currency", value: d => {
    const b = base(d);
    return (d.comptes_cheques + d.cel + d.pel + d.livret_a + d.ldd + d.lep + d.divers_liquidites)
      + b.bourse + d.av_fonds_euros + d.rp_valeur + d.loc_valeur + d.loc2_valeur + d.scpi;
  }},
  { type: "row", label: "Patrimoine net", fmt: "currency", value: d => patrimoineActuel(d) },
  { type: "row", label: "dont Immo net (RP + locatifs)", fmt: "currency", value: d => {
    const b = base(d);
    return b.rpNet + b.allLocNet;
  }},
];

const TABLE_PLAN_EPARGNE: RowDef[] = [
  { type: "section", label: "PARAMÈTRES" },
  { type: "row", label: "Revenus mensuels", fmt: "currency", value: d => d.salaire_net + d.bonus_net },
  { type: "row", label: "Dépenses mensuelles", fmt: "currency", value: d => Math.max(0, d.salaire_net + d.bonus_net - d.epargne_mensuelle) },
  { type: "row", label: "Épargne mensuelle", fmt: "currency", value: d => d.epargne_mensuelle },
  { type: "row", label: "Mois fonds sécurité (défaut par âge)", fmt: "number", value: d => defaultMois(d.age) },
  { type: "row", label: "Grosses dépenses prévues (5 ans)", fmt: "currency", value: d => d.grosses_depenses },
  { type: "section", label: "ACTUEL" },
  { type: "row", label: "Dettes — Actuel", fmt: "currency", value: d => base(d).detteCRD },
  { type: "row", label: "Fonds de sécurité — Actuel", fmt: "currency", value: d => d.av_fonds_euros },
  { type: "row", label: "Fonds moyen terme — Actuel", fmt: "currency", value: () => 0 },
  { type: "row", label: "Bourse — Actuel", fmt: "currency", value: d => base(d).bourse },
  { type: "row", label: "TOTAL Actuel", fmt: "currency", value: d => {
    const b = base(d);
    return b.detteCRD + d.av_fonds_euros + 0 + b.bourse;
  }},
  { type: "section", label: "CIBLE" },
  { type: "row", label: "Dettes — Cible", fmt: "currency", value: () => 0 },
  { type: "row", label: "Fonds de sécurité — Cible", fmt: "currency", value: d => {
    const depenses = Math.max(0, d.salaire_net + d.bonus_net - d.epargne_mensuelle);
    return depenses * defaultMois(d.age);
  }},
  { type: "row", label: "Fonds moyen terme — Cible", fmt: "currency", value: d => d.grosses_depenses },
  { type: "row", label: "Bourse — Cible", fmt: "currency", value: d => {
    const b = base(d);
    const total = b.detteCRD + d.av_fonds_euros + 0 + b.bourse;
    const depenses = Math.max(0, d.salaire_net + d.bonus_net - d.epargne_mensuelle);
    const cSecu = depenses * defaultMois(d.age);
    const cMt = d.grosses_depenses;
    return Math.max(0, total - cSecu - cMt);
  }},
  { type: "row", label: "TOTAL Cible", fmt: "currency", value: d => {
    const b = base(d);
    const total = b.detteCRD + d.av_fonds_euros + 0 + b.bourse;
    const depenses = Math.max(0, d.salaire_net + d.bonus_net - d.epargne_mensuelle);
    const cSecu = depenses * defaultMois(d.age);
    const cMt = d.grosses_depenses;
    const cBourse = Math.max(0, total - cSecu - cMt);
    return 0 + cSecu + cMt + cBourse;
  }},
  { type: "section", label: "MOUVEMENTS (Cible − Actuel)" },
  { type: "row", label: "Dettes — Mouvement", fmt: "currency", value: d => 0 - base(d).detteCRD },
  { type: "row", label: "Fonds de sécurité — Mouvement", fmt: "currency", value: d => {
    const depenses = Math.max(0, d.salaire_net + d.bonus_net - d.epargne_mensuelle);
    return depenses * defaultMois(d.age) - d.av_fonds_euros;
  }},
  { type: "row", label: "Fonds moyen terme — Mouvement", fmt: "currency", value: d => d.grosses_depenses - 0 },
  { type: "row", label: "Bourse — Mouvement", fmt: "currency", value: d => {
    const b = base(d);
    const total = b.detteCRD + d.av_fonds_euros + 0 + b.bourse;
    const depenses = Math.max(0, d.salaire_net + d.bonus_net - d.epargne_mensuelle);
    const cSecu = depenses * defaultMois(d.age);
    const cMt = d.grosses_depenses;
    const cBourse = Math.max(0, total - cSecu - cMt);
    return cBourse - b.bourse;
  }},
];

const LOC_ANNEES = 25;
const LOC_TAUX_PCT = 4;

const TABLE_PLAN_IMMO_LOC: RowDef[] = [
  { type: "note", label: `Hypothèses : ${LOC_ANNEES} ans · ${LOC_TAUX_PCT}% · loyer = 0` },
  { type: "row", label: "Revenus nets mensuels", fmt: "currency", value: d => d.salaire_net + d.bonus_net },
  { type: "row", label: "Épargne mensuelle", fmt: "currency", value: d => d.epargne_mensuelle },
  { type: "row", label: "Dépenses mensuelles", fmt: "currency", value: d => Math.max(0, d.salaire_net + d.bonus_net - d.epargne_mensuelle) },
  { type: "section", label: "CAS 1 — AVEC VOS FINANCES ACTUELLES" },
  { type: "row", label: "Capacité de remboursement (1/3 revenus)", fmt: "currency", value: d => (d.salaire_net + d.bonus_net) / 3 },
  { type: "row", label: "Saut de charge (cap. remb. − loyer 0 €)", fmt: "currency", value: d => (d.salaire_net + d.bonus_net) / 3 },
  { type: "row", label: "Capacité d'endettement", fmt: "currency", value: d => {
    const mcVal = mc(LOC_TAUX_PCT / 100, LOC_ANNEES);
    const capRemb = (d.salaire_net + d.bonus_net) / 3;
    return mcVal > 0 ? capRemb / mcVal : 0;
  }},
  { type: "row", label: "Apport actuel (cash + bourse)", fmt: "currency", value: d => {
    const b = base(d);
    return b.cashNet + b.bourse + d.av_fonds_euros;
  }},
  { type: "row", label: "Budget total", fmt: "currency", value: d => {
    const b = base(d);
    const apport = b.cashNet + b.bourse + d.av_fonds_euros;
    const mcVal = mc(LOC_TAUX_PCT / 100, LOC_ANNEES);
    const capEndet = mcVal > 0 ? ((d.salaire_net + d.bonus_net) / 3) / mcVal : 0;
    return capEndet + apport;
  }},
  { type: "row", label: "Budget résidence principale (hors frais 10%)", fmt: "currency", value: d => {
    const b = base(d);
    const apport = b.cashNet + b.bourse + d.av_fonds_euros;
    const mcVal = mc(LOC_TAUX_PCT / 100, LOC_ANNEES);
    const capEndet = mcVal > 0 ? ((d.salaire_net + d.bonus_net) / 3) / mcVal : 0;
    return (capEndet + apport) / 1.1;
  }},
];

const PROP_ANNEES = 25;
const PROP_TAUX_PCT = 3.15;
const PROP_ENDET_MAX = 0.33;

const TABLE_PLAN_IMMO_PROP: RowDef[] = [
  { type: "note", label: `Hypothèses ② : ${PROP_ANNEES} ans · ${PROP_TAUX_PCT}% · endettement ${PROP_ENDET_MAX * 100}%` },
  { type: "section", label: "① RÉSIDENCE PRINCIPALE ACTUELLE" },
  { type: "row", label: "Valeur RP", fmt: "currency", value: d => d.rp_valeur },
  { type: "row", label: "Capital restant dû", fmt: "currency", value: d => base(d).rpCRD },
  { type: "row", label: "Patrimoine immo net", fmt: "currency", value: d => base(d).rpNet },
  { type: "row", label: "Mensualités RP", fmt: "currency", value: d => base(d).rpMens },
  { type: "row", label: "Taux d'endettement actuel", fmt: "pct", value: d => {
    const s = d.salaire_net + d.bonus_net;
    return s > 0 ? base(d).rpMens / s : 0;
  }},
  { type: "section", label: "② NOUVELLE RP (vente RP actuelle)" },
  { type: "row", label: "Remboursements possibles (33% revenus)", fmt: "currency", value: d => PROP_ENDET_MAX * (d.salaire_net + d.bonus_net) },
  { type: "row", label: "Emprunt max", fmt: "currency", value: d => {
    const mcVal = mc(PROP_TAUX_PCT / 100, PROP_ANNEES);
    return mcVal > 0 ? PROP_ENDET_MAX * (d.salaire_net + d.bonus_net) / mcVal : 0;
  }},
  { type: "row", label: "Apport max (vente RP + cash + bourse)", fmt: "currency", value: d => {
    const b = base(d);
    const depenses = Math.max(0, d.salaire_net + d.bonus_net - d.epargne_mensuelle);
    return b.rpNet + b.cashNet + b.bourse + d.av_fonds_euros - (depenses * 6);
  }},
  { type: "row", label: "Valeur nouvelle RP (hors frais 10%)", fmt: "currency", value: d => {
    const b = base(d);
    const depenses = Math.max(0, d.salaire_net + d.bonus_net - d.epargne_mensuelle);
    const apport = b.rpNet + b.cashNet + b.bourse + d.av_fonds_euros - (depenses * 6);
    const mcVal = mc(PROP_TAUX_PCT / 100, PROP_ANNEES);
    const emprunt = mcVal > 0 ? PROP_ENDET_MAX * (d.salaire_net + d.bonus_net) / mcVal : 0;
    return (apport + emprunt) / 1.1;
  }},
  { type: "section", label: "③ LOCATIF (garde RP actuelle)" },
  { type: "row", label: "Apport disponible (cash + bourse)", fmt: "currency", value: d => {
    const b = base(d);
    return b.cashNet + b.bourse + d.av_fonds_euros;
  }},
  { type: "row", label: "Valeur investissement locatif", fmt: "currency", value: d => {
    const b = base(d);
    const apport = b.cashNet + b.bourse + d.av_fonds_euros;
    const ratio = 0.7;
    const rentFactor = 0.04 * ratio * 0.9 / 12;
    const mcVal = mc(0.035, 20);
    const E = Math.max(0,
      (PROP_ENDET_MAX * (d.salaire_net + d.bonus_net) - b.rpMens + PROP_ENDET_MAX * rentFactor * apport)
      / (mcVal - PROP_ENDET_MAX * rentFactor)
    );
    return 0.9 * (apport + E);
  }},
  { type: "row", label: "Taux d'endettement futur (estimé)", fmt: "pct", value: d => {
    const b = base(d);
    const apport = b.cashNet + b.bourse + d.av_fonds_euros;
    const ratio = 0.7;
    const rentFactor = 0.04 * ratio * 0.9 / 12;
    const mcVal = mc(0.035, 20);
    const E = Math.max(0,
      (PROP_ENDET_MAX * (d.salaire_net + d.bonus_net) - b.rpMens + PROP_ENDET_MAX * rentFactor * apport)
      / (mcVal - PROP_ENDET_MAX * rentFactor)
    );
    const V = 0.9 * (apport + E);
    const loyers = V * 0.04 / 12 * ratio;
    const totalRev = loyers + (d.salaire_net + d.bonus_net);
    const mensNouv = mcVal * E;
    return totalRev > 0 ? (b.rpMens + mensNouv) / totalRev : 0;
  }},
];

const TABLE_PLAN_BOURSE: RowDef[] = [
  { type: "section", label: "PORTEFEUILLE ACTUEL" },
  { type: "row", label: "CTO", fmt: "currency", value: d => d.cto },
  { type: "row", label: "PEA", fmt: "currency", value: d => d.pea },
  { type: "row", label: "PER", fmt: "currency", value: d => d.per },
  { type: "row", label: "PEE / Intéressement", fmt: "currency", value: d => d.pee },
  { type: "row", label: "AV fonds euros", fmt: "currency", value: d => d.av_fonds_euros },
  { type: "row", label: "AV unités de compte", fmt: "currency", value: d => d.av_uc },
  { type: "row", label: "Autres investissements", fmt: "currency", value: d => d.autres_invests },
  { type: "row", label: "TOTAL Bourse", fmt: "currency", value: d => d.cto + d.pea + d.per + d.pee + d.av_fonds_euros + d.av_uc + d.autres_invests },
  { type: "section", label: "ALLOCATION" },
  { type: "row", label: "% PEA (fiscalité privilégiée)", fmt: "pct", value: d => {
    const total = d.cto + d.pea + d.per + d.pee + d.av_fonds_euros + d.av_uc + d.autres_invests;
    return total > 0 ? d.pea / total : 0;
  }},
  { type: "row", label: "% AV (fonds euros + UC)", fmt: "pct", value: d => {
    const total = d.cto + d.pea + d.per + d.pee + d.av_fonds_euros + d.av_uc + d.autres_invests;
    return total > 0 ? (d.av_fonds_euros + d.av_uc) / total : 0;
  }},
  { type: "row", label: "% PER + PEE (retraite)", fmt: "pct", value: d => {
    const total = d.cto + d.pea + d.per + d.pee + d.av_fonds_euros + d.av_uc + d.autres_invests;
    return total > 0 ? (d.per + d.pee) / total : 0;
  }},
  { type: "section", label: "CAPACITÉ D'INVESTISSEMENT" },
  { type: "row", label: "Épargne mensuelle", fmt: "currency", value: d => d.epargne_mensuelle },
  { type: "row", label: "Projection 10 ans (7%/an, mensuel)", fmt: "currency", value: d => {
    const r = 0.07 / 12;
    const n = 10 * 12;
    const total = d.cto + d.pea + d.per + d.pee + d.av_fonds_euros + d.av_uc + d.autres_invests;
    return total * Math.pow(1 + r, n) + d.epargne_mensuelle * (Math.pow(1 + r, n) - 1) / r;
  }},
  { type: "row", label: "Projection 20 ans (7%/an, mensuel)", fmt: "currency", value: d => {
    const r = 0.07 / 12;
    const n = 20 * 12;
    const total = d.cto + d.pea + d.per + d.pee + d.av_fonds_euros + d.av_uc + d.autres_invests;
    return total * Math.pow(1 + r, n) + d.epargne_mensuelle * (Math.pow(1 + r, n) - 1) / r;
  }},
];

const TABLES = [
  { id: "donnees",       label: "Données",                  rows: TABLE_DONNEES },
  { id: "bilan",         label: "Bilan patrimonial",         rows: TABLE_BILAN },
  { id: "epargne",       label: "Plan Épargne",              rows: TABLE_PLAN_EPARGNE },
  { id: "immo-loc",      label: "Plan Immo — Locataire",     rows: TABLE_PLAN_IMMO_LOC },
  { id: "immo-prop",     label: "Plan Immo — Propriétaire",  rows: TABLE_PLAN_IMMO_PROP },
  { id: "bourse",        label: "Plan Bourse",               rows: TABLE_PLAN_BOURSE },
];

// ═══════════════════════════════════════════════════════════
// FORMATTING
// ═══════════════════════════════════════════════════════════

const fmtEUR = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
const fmtPct = new Intl.NumberFormat("fr-FR", { style: "percent", minimumFractionDigits: 1, maximumFractionDigits: 1 });

type FmtType = "currency" | "pct" | "text" | "years" | "number";
function formatValue(v: number | string, fmt: FmtType): string {
  if (v === null || v === undefined) return "—";
  if (typeof v === "string") return v || "—";
  if (fmt === "currency") return v === 0 ? "—" : fmtEUR.format(v);
  if (fmt === "pct") return v === 0 ? "—" : fmtPct.format(v);
  if (fmt === "years") return v === 0 ? "—" : `${v.toFixed(1)} ans`;
  return v === 0 ? "—" : String(Math.round(v * 100) / 100);
}

// ═══════════════════════════════════════════════════════════
// EXCEL EXPORT
// ═══════════════════════════════════════════════════════════

async function exportToExcel(clients: ClientData[]) {
  const X = await loadXLSX() as {
    utils: {
      book_new: () => unknown;
      aoa_to_sheet: (rows: unknown[][]) => Record<string, unknown>;
      book_append_sheet: (wb: unknown, ws: unknown, name: string) => void;
    };
    writeFile: (wb: unknown, name: string) => void;
  };

  const wb = X.utils.book_new();

  // Feuille synthèse
  const synthRows: (string | number)[][] = [
    ["", ...clients.map(c => c.nom)],
    ["Patrimoine actuel", ...clients.map(c => Math.round(patrimoineActuel(c)))],
    [`Patrimoine 65 ans (${RENDEMENT_BASE * 100}%/an)`, ...clients.map(c => Math.round(patrimoine65(c, RENDEMENT_BASE)))],
    [`Patrimoine optimisé 65 ans (${RENDEMENT_OPTI * 100}%/an)`, ...clients.map(c => Math.round(patrimoine65(c, RENDEMENT_OPTI)))],
  ];
  const wsSynth = X.utils.aoa_to_sheet(synthRows);
  wsSynth["!cols"] = [{ wch: 42 }, ...clients.map(() => ({ wch: 16 }))];
  X.utils.book_append_sheet(wb, wsSynth, "Synthèse");

  for (const table of TABLES) {
    const headers = ["Intitulé", ...clients.map(c => c.nom)];
    const rows: (string | number)[][] = [headers];

    for (const row of table.rows) {
      if (row.type === "section") {
        rows.push([row.label, ...clients.map(() => "")]);
      } else if (row.type === "note") {
        rows.push([`⚠ ${row.label}`, ...clients.map(() => "")]);
      } else {
        const values = clients.map(c => {
          const v = row.value(c);
          if (typeof v === "string") return v;
          return typeof v === "number" ? Math.round(v) : 0;
        });
        rows.push([row.label, ...values]);
      }
    }

    const ws = X.utils.aoa_to_sheet(rows);
    ws["!cols"] = [{ wch: 42 }, ...clients.map(() => ({ wch: 16 }))];
    X.utils.book_append_sheet(wb, ws, table.label.slice(0, 31));
  }

  X.writeFile(wb, "clients_coachdazet.xlsx");
}

// ═══════════════════════════════════════════════════════════
// COMPONENT — TABLEAU SYNTHÈSE
// ═══════════════════════════════════════════════════════════

function SyntheseTable({ clients }: { clients: ClientData[] }) {
  const rows = [
    {
      label: "Patrimoine actuel",
      values: clients.map(c => patrimoineActuel(c)),
      color: "text-[#1B2B4A]",
    },
    {
      label: `Patrimoine 65 ans · ${RENDEMENT_BASE * 100}%/an`,
      values: clients.map(c => patrimoine65(c, RENDEMENT_BASE)),
      color: "text-[#C0603A]",
    },
    {
      label: `Patrimoine optimisé 65 ans · ${RENDEMENT_OPTI * 100}%/an`,
      values: clients.map(c => patrimoine65(c, RENDEMENT_OPTI)),
      color: "text-emerald-700",
    },
  ];

  return (
    <div className="mb-8 rounded-xl overflow-hidden shadow-sm border border-gray-200 bg-white">
      <div className="px-5 py-3.5 bg-[#1B2B4A]">
        <span className="font-semibold font-display text-sm tracking-wide uppercase text-white">
          Synthèse patrimoine — {clients.length} clients
        </span>
        <span className="ml-3 text-white/50 text-xs">Immobilier stable · Cash en livrets · Bourse + épargne mensuelle projetée</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm" style={{ minWidth: `${220 + clients.length * 130}px` }}>
          <thead>
            <tr>
              <th className="sticky left-0 z-10 bg-[#F8F9FB] border-b border-gray-200 text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider" style={{ minWidth: 260 }}>
                Métrique
              </th>
              {clients.map(c => (
                <th key={c.nom} className="border-b border-gray-200 bg-[#F8F9FB] px-3 py-2.5 text-center text-xs font-semibold text-[#1B2B4A] uppercase tracking-wider" style={{ minWidth: 110 }}>
                  {c.nom}
                  <div className="text-gray-400 font-normal normal-case">{c.age} ans</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className={`border-b border-gray-100 ${i === 2 ? "bg-emerald-50/40" : ""}`}>
                <td className="sticky left-0 z-10 bg-white px-4 py-3 font-semibold text-xs text-gray-700" style={{ minWidth: 260, borderRight: "1px solid #e5e7eb" }}>
                  {row.label}
                </td>
                {row.values.map((v, j) => (
                  <td key={j} className={`px-3 py-3 text-right text-xs font-mono font-bold ${row.color} ${v < 0 ? "!text-red-500" : ""}`}>
                    {fmtEUR.format(Math.round(v))}
                  </td>
                ))}
              </tr>
            ))}
            {/* Ligne delta */}
            <tr className="bg-[#1B2B4A]/5">
              <td className="sticky left-0 z-10 px-4 py-2.5 text-xs font-semibold text-[#1B2B4A] italic" style={{ minWidth: 260, borderRight: "1px solid #e5e7eb", backgroundColor: "rgba(27,43,74,0.05)" }}>
                Gain optimisation (opti − base)
              </td>
              {clients.map((c, j) => {
                const delta = patrimoine65(c, RENDEMENT_OPTI) - patrimoine65(c, RENDEMENT_BASE);
                return (
                  <td key={j} className={`px-3 py-2.5 text-right text-xs font-mono font-semibold ${delta >= 0 ? "text-emerald-700" : "text-red-500"}`}>
                    +{fmtEUR.format(Math.round(delta))}
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// COMPONENT — TABLE DÉPLIABLE
// ═══════════════════════════════════════════════════════════

function TableSection({ table, clients }: { table: typeof TABLES[number]; clients: ClientData[] }) {
  const [open, setOpen] = useState(true);

  return (
    <div className="mb-8 rounded-xl overflow-hidden shadow-sm border border-gray-200 bg-white">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-3.5 bg-[#1B2B4A] text-white hover:bg-[#243657] transition-colors"
      >
        <span className="font-semibold font-display text-sm tracking-wide uppercase">{table.label}</span>
        {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
      </button>

      {open && (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm" style={{ minWidth: `${220 + clients.length * 130}px` }}>
            <thead>
              <tr>
                <th className="sticky left-0 z-10 bg-[#F8F9FB] border-b border-gray-200 text-left px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider" style={{ minWidth: 220 }}>
                  Intitulé
                </th>
                {clients.map(c => (
                  <th key={c.nom} className="border-b border-gray-200 bg-[#F8F9FB] px-3 py-2 text-center text-xs font-semibold text-[#1B2B4A] uppercase tracking-wider" style={{ minWidth: 120 }}>
                    {c.nom}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {table.rows.map((row, i) => {
                if (row.type === "section") {
                  return (
                    <tr key={i} className="bg-[#44546A]">
                      <td colSpan={clients.length + 1} className="sticky left-0 px-4 py-2 text-xs font-bold text-white uppercase tracking-wider">
                        {row.label}
                      </td>
                    </tr>
                  );
                }
                if (row.type === "note") {
                  return (
                    <tr key={i} className="bg-amber-50">
                      <td colSpan={clients.length + 1} className="px-4 py-1.5 text-xs text-amber-700 italic">
                        ⚠ {row.label}
                      </td>
                    </tr>
                  );
                }
                return (
                  <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="sticky left-0 z-10 bg-white px-4 py-2 text-gray-700 font-medium text-xs" style={{ minWidth: 220 }}>
                      {row.label}
                    </td>
                    {clients.map(c => {
                      const rawVal = row.value(c);
                      const isIrrelevant =
                        (table.id === "immo-loc" && c.rp_valeur > 0) ||
                        (table.id === "immo-prop" && c.rp_valeur === 0);
                      const display = isIrrelevant ? "—" : formatValue(rawVal, row.fmt);
                      const isNeg = typeof rawVal === "number" && rawVal < 0;
                      const isBig = typeof rawVal === "number" && rawVal > 0 &&
                        (row.label.includes("Budget résidence") || row.label.includes("Patrimoine net") || row.label.includes("TOTAL"));
                      return (
                        <td key={c.nom} className={`px-3 py-2 text-right text-xs font-mono ${isNeg ? "text-red-600" : isBig ? "text-[#C0603A] font-bold" : "text-gray-700"}`}>
                          {display}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// PAGE PRINCIPALE
// ═══════════════════════════════════════════════════════════

export default function ClientsTestPage() {
  const [clients, setClients] = useState<ClientData[]>([]);
  const [fileName, setFileName] = useState<string>("");
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const [bilanKey, setBilanKey] = useState<string>("");
  const [bilanToast, setBilanToast] = useState<string>("");

  function chargerDansBilan() {
    if (!bilanKey) return;
    const raw = { ...BILAN_CLIENTS[bilanKey] };
    const label = raw._label;
    const { _label: _unused, ...data } = raw;
    void _unused;
    localStorage.setItem("bilan_donnees", JSON.stringify(data));
    ["plan_immo_data","plan_bourse_data","plan_epargne_data",
     "plan_budget_data","plan_salaire_data"].forEach(k => localStorage.removeItem(k));
    setBilanToast(`${label} chargé${label.endsWith("e") ? "e" : ""} ✅ — `);
    setTimeout(() => setBilanToast(""), 4000);
  }

  const processFile = useCallback(async (file: File) => {
    setFileName(file.name);
    try {
      const X = await loadXLSX() as {
        read: (data: ArrayBuffer, opts: { type: string; cellDates: boolean }) => unknown;
      };
      const buf = await file.arrayBuffer();
      const wb = X.read(buf, { type: "array", cellDates: true });
      const parsed = parseExcel(wb);
      setClients(parsed);
    } catch (err) {
      console.error("Parsing error", err);
      alert("Erreur lors de la lecture du fichier Excel.");
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  return (
    <div className="p-6 max-w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-semibold text-[#1B2B4A]">Test clients</h1>
          <p className="text-sm text-gray-500 mt-0.5">Vérification des calculs bilan + plans sur données réelles</p>
        </div>
        {clients.length > 0 && (
          <button
            onClick={() => exportToExcel(clients)}
            className="flex items-center gap-2 px-4 py-2 bg-[#1B2B4A] text-white rounded-lg text-sm font-medium hover:bg-[#243657] transition-colors"
          >
            <Download size={16} />
            Exporter Excel
          </button>
        )}
      </div>

      {/* Sélecteur bilan client */}
      <div className="mb-6 flex items-center gap-3 bg-[#1B2B4A] text-white px-5 py-3.5 rounded-xl flex-wrap">
        <span className="text-sm opacity-70 whitespace-nowrap">🗂 Simuler le bilan de :</span>
        <select
          value={bilanKey}
          onChange={e => setBilanKey(e.target.value)}
          className="bg-white text-[#1B2B4A] px-3 py-1.5 rounded-lg text-sm border-0 cursor-pointer font-medium"
        >
          <option value="">— Sélectionner un client —</option>
          {Object.entries(BILAN_CLIENTS).map(([k, v]) => (
            <option key={k} value={k}>{v._label}</option>
          ))}
        </select>
        <button
          onClick={chargerDansBilan}
          disabled={!bilanKey}
          className="px-4 py-1.5 bg-[#C0603A] text-white rounded-lg text-sm font-semibold hover:bg-[#a85230] disabled:opacity-40 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
        >
          Charger dans le bilan
        </button>
        {bilanToast && (
          <>
            <span className="text-green-400 font-semibold text-sm">{bilanToast}</span>
            <a href="/bilan/donnees" className="text-green-300 underline text-sm hover:text-green-100">
              Ouvrir Vos données →
            </a>
          </>
        )}
      </div>

      {/* Upload zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`mb-8 border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
          dragging ? "border-[#C0603A] bg-orange-50" : "border-gray-300 hover:border-[#1B2B4A] hover:bg-gray-50"
        }`}
      >
        <Upload size={32} className="mx-auto mb-3 text-gray-400" />
        {fileName ? (
          <p className="text-sm font-medium text-[#1B2B4A]">✓ {fileName} · {clients.length} clients chargés</p>
        ) : (
          <>
            <p className="text-sm font-medium text-gray-600">Glissez le fichier Excel ici ou cliquez pour choisir</p>
            <p className="text-xs text-gray-400 mt-1">Format : feuille « Questionnaire » · noms ligne 7 · bourse lignes 66-72 · locatif 2 lignes 57-63</p>
          </>
        )}
        <input ref={inputRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) processFile(f); }} />
      </div>

      {clients.length > 0 && (
        <>
          <div className="mb-4 text-xs text-gray-500">
            <span className="font-medium">{clients.length} clients :</span> {clients.map(c => c.nom).join(" · ")}
            <s