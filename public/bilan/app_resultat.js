// app_resultat.js — Calcule automatiquement au chargement depuis les données en localStorage
// Basé sur app.js (Coach Dazet Bilan) — logique de calcul identique

document.addEventListener('DOMContentLoaded', () => {
    const saved = localStorage.getItem('bilan_donnees');
    if (!saved) return;

    // --- Navigation steps 7/8/9 ---
    const isAdmin = new URLSearchParams(window.location.search).get('admin') === '1';
    let currentStep = 7;

    const stepTitles = {
        7: '<span class="accent-text">Bilan patrimonial</span>',
        8: '<span class="accent-text">Projections de patrimoine à 65 ans</span>',
        9: '<span class="accent-text">Vérifications</span>'
    };

    function showStep(n) {
        currentStep = n;
        document.querySelectorAll('.result-step').forEach(s => {
            s.classList.toggle('active', s.id === `step-${n}`);
        });
        const titleEl = document.getElementById('page-title');
        if (titleEl && stepTitles[n]) titleEl.innerHTML = stepTitles[n];
    }

    // Masquer le bouton Vérifications pour les non-admins
    const btnVerif = document.getElementById('btn-verifications');
    if (btnVerif && !isAdmin) btnVerif.style.display = 'none';

    document.getElementById('btn-projection')?.addEventListener('click', () => showStep(8));
    document.getElementById('btn-back-result')?.addEventListener('click', () => showStep(7));
    if (isAdmin) document.getElementById('btn-verifications')?.addEventListener('click', () => showStep(9));
    document.getElementById('btn-back-projection')?.addEventListener('click', () => showStep(8));

    // --- Helpers ---
    function getVal(name) {
        const el = document.querySelector(`[name="${name}"]`);
        return parseFloat(el?.value) || 0;
    }

    function getDateVal(name) {
        return document.querySelector(`[name="${name}"]`)?.value || '';
    }

    function formatCurrency(num) {
        return Math.round(num).toLocaleString('fr-FR') + ' €';
    }

    function calculateRemainingPrincipal(principal, annualRate, durationYears, startDate) {
        if (!principal || !durationYears || !startDate) return 0;
        const start = new Date(startDate);
        const evalVal = getDateVal('date_evaluation');
        const now = evalVal ? new Date(evalVal) : new Date();
        let monthsPassed = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
        if (now.getDate() < start.getDate()) monthsPassed--;
        monthsPassed = Math.max(0, monthsPassed);
        const totalMonths = durationYears * 12;
        if (monthsPassed >= totalMonths) return 0;
        const monthlyRate = (annualRate / 100) / 12;
        if (monthlyRate === 0) return principal - (principal / totalMonths) * monthsPassed;
        const pmt = principal * (monthlyRate / (1 - Math.pow(1 + monthlyRate, -totalMonths)));
        let balance = principal;
        for (let i = 1; i <= monthsPassed; i++) {
            balance -= pmt - balance * monthlyRate;
        }
        return Math.max(0, balance);
    }

    function calculateMonthlyPrincipalRepayment(principal, annualRate, durationYears, startDate) {
        if (!principal || !durationYears || !startDate) return 0;
        const start = new Date(startDate);
        const evalVal = getDateVal('date_evaluation');
        const now = evalVal ? new Date(evalVal) : new Date();
        let monthsPassed = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
        if (now.getDate() < start.getDate()) monthsPassed--;
        monthsPassed = Math.max(0, monthsPassed);
        const totalMonths = durationYears * 12;
        if (monthsPassed >= totalMonths) return 0;
        const monthlyRate = (annualRate / 100) / 12;
        if (monthlyRate === 0) return principal / totalMonths;
        const term = Math.pow(1 + monthlyRate, totalMonths);
        const monthlyPayment = principal * (monthlyRate * term) / (term - 1);
        const remaining = calculateRemainingPrincipal(principal, annualRate, durationYears, startDate);
        return monthlyPayment - remaining * monthlyRate;
    }

    // --- CALCULS ---
    const rpPrincipal = getVal('rp_emprunt_initial');
    const rpRate = getVal('rp_taux');
    const rpYears = getVal('rp_duree');
    const rpDate = getDateVal('rp_debut');
    const rpRemaining = calculateRemainingPrincipal(rpPrincipal, rpRate, rpYears, rpDate);

    const locPrincipal = getVal('loc_emprunt_initial');
    const locRate = getVal('loc_taux');
    const locYears = getVal('loc_duree');
    const locDate = getDateVal('loc_debut');
    const locRemaining = calculateRemainingPrincipal(locPrincipal, locRate, locYears, locDate);

    const detteDirect = getVal('dette_capital_du_direct');
    let autreRemaining = detteDirect > 0 ? detteDirect :
        calculateRemainingPrincipal(getVal('dette_montant'), getVal('dette_taux'), getVal('dette_duree'), getDateVal('dette_debut'));

    const cashNames = ['comptes_cheques','livret_a','ldd','lep','cel','pel','divers_liquidites'];
    let rawCash = 0;
    cashNames.forEach(n => rawCash += getVal(n));
    const patrimoineCash = rawCash - autreRemaining;

    const valeurRp = getVal('rp_valeur');
    const valeurLoc = getVal('loc_valeur');
    const valeurScpi = getVal('scpi');
    const patrimoineImmo = (valeurRp + valeurLoc + valeurScpi) - (rpRemaining + locRemaining);

    const bourseNames = ['cto','pea','per','pee','av_fonds_euros','av_uc','autres_invests'];
    let patrimoineBourse = 0;
    bourseNames.forEach(n => patrimoineBourse += getVal(n));

    const patrimoineTotal = patrimoineCash + patrimoineImmo + patrimoineBourse;
    const totalDebt = rpRemaining + locRemaining + autreRemaining;

    const salaireMensuel = getVal('salaire_net') + getVal('bonus_net');
    const epargneMensuelle = getVal('epargne_mensuelle');
    const depensesMensuelles = salaireMensuel - epargneMensuelle;
    const rpPrincipalMensuel = calculateMonthlyPrincipalRepayment(rpPrincipal, rpRate, rpYears, rpDate);
    const depensesAnnuelles = (depensesMensuelles - rpPrincipalMensuel) * 12;

    let anneesDepensesText = depensesAnnuelles > 0
        ? (patrimoineTotal / depensesAnnuelles).toFixed(1) + " ans"
        : "Dépenses non définies.";

    // Endettement
    const locLoyers = getVal('loc_loyers');
    const revenusAnnuels = (salaireMensuel + locLoyers) * 12;

    function calcMonthlyPayment(p, r, y) {
        if (!p || !y) return 0;
        const mRate = (r / 100) / 12;
        const tMonths = y * 12;
        if (mRate === 0) return p / tMonths;
        const term = Math.pow(1 + mRate, tMonths);
        return p * (mRate * term) / (term - 1);
    }

    let remboursementsAnnuels = 0;
    const rpMensualite = calcMonthlyPayment(rpPrincipal, rpRate, rpYears);
    if (rpMensualite && rpRemaining > 0) remboursementsAnnuels += rpMensualite * 12;
    const locMensualite = calcMonthlyPayment(locPrincipal, locRate, locYears);
    if (locMensualite && locRemaining > 0) remboursementsAnnuels += locMensualite * 12;

    let tauxEndettement = revenusAnnuels > 0 ? (remboursementsAnnuels / revenusAnnuels) * 100 : 0;

    let capaciteRemboursementMensuelle = 0;
    if (tauxEndettement <= 33 && revenusAnnuels > 0) {
        capaciteRemboursementMensuelle = Math.max(0, (revenusAnnuels / 12) / 3 - remboursementsAnnuels / 12);
    }
    const tauxMensuel = (3.0 / 100) / 12;
    const capaciteEndettement = capaciteRemboursementMensuelle > 0
        ? capaciteRemboursementMensuelle * (1 - Math.pow(1 + tauxMensuel, -240)) / tauxMensuel : 0;

    // Épargne
    let rpPrincipalAnnuel = 0;
    let tempRp = rpRemaining;
    const mRateRp = (rpRate / 100) / 12;
    if (tempRp > 0 && mRateRp > 0) {
        let fullM = (rpPrincipal * mRateRp * Math.pow(1 + mRateRp, rpYears * 12)) / (Math.pow(1 + mRateRp, rpYears * 12) - 1);
        for (let m = 0; m < 12; m++) {
            if (tempRp > 0) {
                let cap = fullM - tempRp * mRateRp;
                tempRp -= cap;
                rpPrincipalAnnuel += Math.max(0, cap);
            }
        }
    } else if (tempRp > 0) {
        rpPrincipalAnnuel = Math.min((rpPrincipal / (rpYears * 12)) * 12, tempRp);
    }

    const epargneAnnuelleDecla = epargneMensuelle * 12;
    const epargneTotaleAnnuelle = epargneAnnuelleDecla + rpPrincipalAnnuel;
    const tauxEpargneActuel = salaireMensuel > 0 ? ((epargneTotaleAnnuelle / 12) / salaireMensuel) * 100 : 0;
    const salaireAnnuelComplet = salaireMensuel * 12;
    const tauxIdeal = salaireAnnuelComplet > 60000 ? 0.30 : 0.20;
    const economiesSupplementairesMensuelles = Math.max(0, salaireMensuel * tauxIdeal - epargneTotaleAnnuelle / 12);

    // --- AFFICHAGE ---
    const pn = document.getElementById('patrimoine-net');
    if (pn) { pn.textContent = formatCurrency(patrimoineTotal); pn.style.color = patrimoineTotal < 0 ? 'var(--danger)' : '#fff'; }

    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    set('res-cash', formatCurrency(patrimoineCash));
    set('res-immo', formatCurrency(patrimoineImmo));
    set('res-bourse', formatCurrency(patrimoineBourse));
    set('res-patrimoine-total', formatCurrency(patrimoineTotal));
    set('res-depenses-annuelles', formatCurrency(depensesAnnuelles));
    set('res-annees-depenses', anneesDepensesText);
    set('res-remboursements-immo', formatCurrency(remboursementsAnnuels) + " / an");
    set('res-salaire-annuel', formatCurrency(salaireMensuel * 12) + " / an");
    set('res-revenus-locatifs', formatCurrency(locLoyers * 12) + " / an");
    set('res-total-revenus', formatCurrency(revenusAnnuels) + " / an");
    set('res-cr-mensuel', formatCurrency(capaciteRemboursementMensuelle) + ' / mois');
    set('res-cape-endettement', formatCurrency(capaciteEndettement));
    set('res-epargne-actuelle', formatCurrency(epargneAnnuelleDecla) + " / an");
    set('res-epargne-principal', formatCurrency(rpPrincipalAnnuel) + " / an");
    set('res-epargne-totale', formatCurrency(epargneTotaleAnnuelle) + " / an");
    set('res-taux-epargne', tauxEpargneActuel.toFixed(1) + " %");
    set('res-taux-ideal', (tauxIdeal * 100).toFixed(0) + " %");
    set('res-economies-supp', formatCurrency(economiesSupplementairesMensuelles) + " / mois");

    const tauxEl = document.getElementById('res-taux-endettement');
    if (tauxEl) { tauxEl.textContent = tauxEndettement.toFixed(1) + ' %'; tauxEl.style.color = tauxEndettement > 33 ? 'var(--danger)' : 'var(--success)'; }

    // Vérifications step 9
    set('check-pat-cash', formatCurrency(patrimoineCash));
    set('check-pat-immo', formatCurrency(patrimoineImmo));
    set('check-pat-bourse', formatCurrency(patrimoineBourse));
    set('check-pat-total', formatCurrency(patrimoineTotal));
    set('check-rp-remaining', formatCurrency(rpRemaining));
    set('check-loc-remaining', formatCurrency(locRemaining));
    set('check-autre-remaining', formatCurrency(autreRemaining));
    set('check-total-debt', formatCurrency(totalDebt));
    set('check-salaire-complet', formatCurrency(salaireMensuel));
    set('check-rp-principal-mensuel', formatCurrency(rpPrincipalMensuel));
    set('check-depenses-mensuelles', formatCurrency(depensesMensuelles));
    set('check-depenses-annuelles', formatCurrency(depensesAnnuelles));
    set('check-annees-depenses', anneesDepensesText);
    set('check-revenus-annuels', formatCurrency(revenusAnnuels));
    set('check-remboursements-annuels', formatCurrency(remboursementsAnnuels));
    set('check-taux-endettement', tauxEndettement.toFixed(1) + ' %');
    set('check-cr-mensuelle', formatCurrency(capaciteRemboursementMensuelle));
    set('check-capacite-endettement', formatCurrency(capaciteEndettement));
    set('check-epargne-actuelle', formatCurrency(epargneAnnuelleDecla));
    set('check-rp-principal-annuel', formatCurrency(rpPrincipalAnnuel));
    set('check-epargne-totale', formatCurrency(epargneTotaleAnnuelle));
    set('check-taux-epargne', tauxEpargneActuel.toFixed(1) + ' %');
    set('check-taux-ideal', (tauxIdeal * 100).toFixed(1) + ' %');
    set('check-economies-supp', formatCurrency(economiesSupplementairesMensuelles));

    // --- CHART CAMEMBERT ---
    const ctx = document.getElementById('patrimoineChart')?.getContext('2d');
    if (ctx) {
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Cash', 'Immobilier', 'Bourse'],
                datasets: [{ data: [Math.max(0,patrimoineCash), Math.max(0,patrimoineImmo), Math.max(0,patrimoineBourse)],
                    backgroundColor: ['#6CA0DC','#1F2A44','#FF8C42'], borderColor: '#fff', borderWidth: 2 }]
            },
            options: { responsive: true, maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom', labels: { color: '#1F2A44', font: { family: 'Inter', size: 14 } } },
                    tooltip: { callbacks: { label: c => ' ' + Math.round(c.parsed).toLocaleString('fr-FR') + ' €' } } } }
        });
    }

    // --- PROJECTION (step 8) ---
    const ageActuel = getVal('age');
    if (ageActuel > 0 && ageActuel <= 65) {
        const evalDateValue = getDateVal('date_evaluation');
        let currentYear = evalDateValue ? new Date(evalDateValue).getFullYear() : new Date().getFullYear();
        let currentAge = ageActuel;
        let currentCash = rawCash;
        const annualSavings = epargneMensuelle * 12;
        let currentImmoBrut = valeurRp + valeurLoc + valeurScpi;
        let bourseSafe = getVal('av_fonds_euros') + getVal('autres_invests');
        let bourseDynamique = getVal('cto') + getVal('pea') + getVal('per') + getVal('pee') + getVal('av_uc');
        let totalLiquid = patrimoineCash + patrimoineBourse;
        let cibleSecurite = (depensesMensuelles * 6) + getVal('grosses_depenses');
        let currentCashOptimise = Math.min(totalLiquid, cibleSecurite);
        let bourseOptimise = Math.max(0, totalLiquid - cibleSecurite);
        let nouvelImmoBrut = 0, nouvelImmoDebt = 0;
        let locatifInvested = false;
        const nouvelImmoRateMensuel = (3.0/100)/12;
        const nouvelImmoDureeMois = 240;
        const nouvelImmoMensualite = capaciteEndettement > 0 ? (capaciteEndettement * nouvelImmoRateMensuel) / (1 - Math.pow(1 + nouvelImmoRateMensuel, -nouvelImmoDureeMois)) : 0;

        const rpMensualiteProj = calcMonthlyPayment(rpPrincipal, rpRate, rpYears);
        const locMensualiteProj = calcMonthlyPayment(locPrincipal, locRate, locYears);

        function getMonthsPassed(startDate) {
            if (!startDate) return 0;
            const s = new Date(startDate);
            const now = evalDateValue ? new Date(evalDateValue) : new Date();
            let m = (now.getFullYear() - s.getFullYear()) * 12 + (now.getMonth() - s.getMonth());
            if (now.getDate() < s.getDate()) m--;
            return Math.max(0, m);
        }

        let rpMonthsLoop = getMonthsPassed(rpDate);
        const rpTotalMonths = rpYears * 12;
        let locMonthsLoop = getMonthsPassed(locDate);
        const locTotalMonths = locYears * 12;
        const autreDate = getDateVal('dette_debut');
        let autreMonthsLoop = getMonthsPassed(autreDate);
        const autrePrincipalInit = getVal('dette_montant');
        const autreRateAnnual = getVal('dette_taux');
        const autreTotalMonths = getVal('dette_duree') * 12;

        let cumulativeEpargneImmo = 0;
        let annualEpargneImmo = 0;
        let cumulativeNouvelImmoEpargne = 0;
        let annualNouvelImmoEpargne = 0;
        let currentRpLocBrut = valeurRp + valeurLoc;
        let currentScpi = valeurScpi;

        const tableBodyMain = document.querySelector('#projection-table-main tbody');
        const tableBodyDetails = document.querySelector('#projection-table-details tbody');
        if (tableBodyMain) tableBodyMain.innerHTML = '';
        if (tableBodyDetails) tableBodyDetails.innerHTML = '';

        let projLabels = [], projDataTotal = [], projDataOptimise = [];

        function remainingLoop(p, r, tMonths, passed) {
            if (passed >= tMonths || !p) return 0;
            const mRate = (r/100)/12;
            if (mRate === 0) return p - (p/tMonths)*passed;
            const pmt = p * (mRate/(1 - Math.pow(1+mRate, -tMonths)));
            let bal = p;
            for (let i = 1; i <= passed; i++) bal -= pmt - bal * mRate;
            return Math.max(0, bal);
        }

        const epargneCibleeAnnuelle = (salaireMensuel * tauxIdeal) * 12;
        let epargneFutureAnnuelle = epargneTotaleAnnuelle >= epargneCibleeAnnuelle
            ? epargneAnnuelleDecla * 1.1 : epargneCibleeAnnuelle;

        while (currentAge <= 65) {
            let currentRpDebt = remainingLoop(rpPrincipal, rpRate, rpTotalMonths, rpMonthsLoop);
            let currentLocDebt = remainingLoop(locPrincipal, locRate, locTotalMonths, locMonthsLoop);
            let currentAutreDebt = remainingLoop(autrePrincipalInit, autreRateAnnual, autreTotalMonths, autreMonthsLoop);
            let currentTotalDebtImmo = currentRpDebt + currentLocDebt;
            let currentImmoNet = currentImmoBrut - currentTotalDebtImmo + cumulativeEpargneImmo;
            let valBien = currentRpLocBrut;
            let valNette = valBien - currentTotalDebtImmo;
            let valNetteNouvelInvest = nouvelImmoBrut - nouvelImmoDebt;
            let immoOptimise = valNette + valNetteNouvelInvest + currentScpi;
            let currentBourse = bourseSafe + bourseDynamique;
            let currentPatrimoineCash = currentCash - currentAutreDebt;
            let currentTotalNet = currentPatrimoineCash + currentImmoNet + currentBourse;
            let currentTotalOptimise = currentCashOptimise + immoOptimise + bourseOptimise;

            projLabels.push(currentAge + " ans");
            projDataTotal.push(currentTotalNet);
            projDataOptimise.push(currentTotalOptimise);

            let anneeRendementR = (currentAge/100)*0.015 + (1-currentAge/100)*0.066;
            let currentEconomiesSuppAnnuel = economiesSupplementairesMensuelles * 12;
            let surplusEmpruntActuel = annualEpargneImmo + annualNouvelImmoEpargne;
            let epargneTotaleProjection = epargneFutureAnnuelle + surplusEmpruntActuel;

            if (tableBodyMain) {
                const tr = document.createElement('tr');
                tr.style.borderBottom = '1px solid var(--border)';
                tr.innerHTML = `<td style="padding:0.5rem 0;font-weight:bold;">${currentYear}</td><td style="padding:0.5rem 0;">${currentAge}</td>
                    <td style="padding:0.5rem;">${formatCurrency(currentPatrimoineCash)}</td><td style="padding:0.5rem;">${formatCurrency(currentImmoNet)}</td>
                    <td style="padding:0.5rem;">${formatCurrency(currentBourse)}</td><td style="padding:0.5rem;font-weight:bold;">${formatCurrency(currentTotalNet)}</td>
                    <td style="padding:0.5rem;text-align:right;color:var(--primary);">${formatCurrency(currentCashOptimise)}</td>
                    <td style="padding:0.5rem;text-align:right;font-weight:bold;">${formatCurrency(immoOptimise)}</td>
                    <td style="padding:0.5rem;text-align:right;color:#FF8C42;font-weight:bold;">${formatCurrency(bourseOptimise)}</td>
                    <td style="padding:0.5rem;text-align:right;font-weight:bold;">${formatCurrency(currentTotalOptimise)}</td>`;
                tableBodyMain.appendChild(tr);
            }

            if (tableBodyDetails) {
                const tr2 = document.createElement('tr');
                tr2.style.borderBottom = '1px solid var(--border)';
                tr2.innerHTML = `<td style="padding:0.5rem;font-weight:bold;">${currentYear}</td><td style="padding:0.5rem;">${currentAge}</td>
                    <td style="padding:0.5rem;text-align:right;">${formatCurrency(currentCash)}</td>
                    <td style="padding:0.5rem;text-align:right;color:var(--danger);">${formatCurrency(currentAutreDebt)}</td>
                    <td style="padding:0.5rem;text-align:right;color:var(--primary);">${formatCurrency(currentPatrimoineCash)}</td>
                    <td style="padding:0.5rem;text-align:right;">${formatCurrency(valBien)}</td>
                    <td style="padding:0.5rem;text-align:right;color:var(--danger);">${formatCurrency(currentTotalDebtImmo)}</td>
                    <td style="padding:0.5rem;text-align:right;">${formatCurrency(valNette)}</td>
                    <td style="padding:0.5rem;text-align:right;color:var(--success);">${formatCurrency(annualEpargneImmo)}</td>
                    <td style="padding:0.5rem;text-align:right;">${formatCurrency(currentScpi)}</td>
                    <td style="padding:0.5rem;text-align:right;">${formatCurrency(nouvelImmoBrut)}</td>
                    <td style="padding:0.5rem;text-align:right;color:var(--danger);">${nouvelImmoDebt > 0 ? "- "+formatCurrency(nouvelImmoDebt) : "0 €"}</td>
                    <td style="padding:0.5rem;text-align:right;color:var(--primary);">${formatCurrency(valNetteNouvelInvest)}</td>
                    <td style="padding:0.5rem;text-align:right;">${formatCurrency(immoOptimise)}</td>
                    <td style="padding:0.5rem;text-align:right;">${formatCurrency(epargneAnnuelleDecla)}</td>
                    <td style="padding:0.5rem;text-align:right;color:var(--coach-bleu-clair);">${formatCurrency(currentEconomiesSuppAnnuel)}</td>
                    <td style="padding:0.5rem;text-align:right;font-weight:bold;">${formatCurrency(epargneFutureAnnuelle)}</td>
                    <td style="padding:0.5rem;text-align:right;color:var(--success);">${formatCurrency(surplusEmpruntActuel)}</td>
                    <td style="padding:0.5rem;text-align:right;font-weight:bold;color:var(--success);">${formatCurrency(epargneTotaleProjection)}</td>
                    <td style="padding:0.5rem;text-align:right;color:#FF8C42;">${(anneeRendementR*100).toFixed(2)} %</td>`;
                tableBodyDetails.appendChild(tr2);
            }

            if (currentAge < 65) {
                currentYear++;
                bourseOptimise = (bourseOptimise * (1 + anneeRendementR)) + epargneTotaleProjection;
                annualNouvelImmoEpargne = 0;
                if (!locatifInvested) {
                    nouvelImmoBrut = capaciteEndettement;
                    nouvelImmoDebt = capaciteEndettement;
                    locatifInvested = true;
                } else {
                    for (let m = 0; m < 12; m++) {
                        if (nouvelImmoDebt > 0) {
                            let cap = nouvelImmoMensualite - nouvelImmoDebt * nouvelImmoRateMensuel;
                            nouvelImmoDebt -= cap;
                            if (nouvelImmoDebt <= 0) { annualNouvelImmoEpargne += Math.abs(nouvelImmoDebt); cumulativeNouvelImmoEpargne += Math.abs(nouvelImmoDebt); nouvelImmoDebt = 0; }
                        } else { annualNouvelImmoEpargne += nouvelImmoMensualite; cumulativeNouvelImmoEpargne += nouvelImmoMensualite; }
                    }
                    nouvelImmoBrut *= 1.03;
                }
                currentCash = (currentCash * 1.01) + annualSavings;
                currentImmoBrut *= 1.03;
                currentRpLocBrut *= 1.03;
                currentScpi *= 1.03;
                bourseSafe *= 1.01;
                bourseDynamique *= 1.02035;
                currentCashOptimise *= 1.01;
                let yearlyEpargneSuppl = 0;
                for (let m = 0; m < 12; m++) {
                    if (rpPrincipal > 0 && rpTotalMonths > 0) { rpMonthsLoop++; if (rpMonthsLoop > rpTotalMonths) yearlyEpargneSuppl += rpMensualiteProj; }
                    if (locPrincipal > 0 && locTotalMonths > 0) { locMonthsLoop++; if (locMonthsLoop > locTotalMonths) yearlyEpargneSuppl += locMensualiteProj; }
                    if (autrePrincipalInit > 0 && autreTotalMonths > 0) autreMonthsLoop++;
                }
                annualEpargneImmo = yearlyEpargneSuppl;
                cumulativeEpargneImmo += yearlyEpargneSuppl;
            }
            currentAge++;
        }

        // Projection chart
        const finalVal = Math.round(projDataOptimise[projDataOptimise.length-1] / 10000) * 10000;
        set('projection-net', formatCurrency(finalVal));
        const finalValToday = Math.round(projDataTotal[projDataTotal.length-1] / 10000) * 10000;
        set('projection-net-today', formatCurrency(finalValToday));

        const ctxProj = document.getElementById('projectionChart')?.getContext('2d');
        if (ctxProj) {
            const showY2 = depensesAnnuelles > 0;
            const anneeData = showY2 ? projDataOptimise.map(v => parseFloat((v / depensesAnnuelles).toFixed(2))) : [];
            const datasets = [
                { label: 'Patrimoine total', data: projDataTotal, yAxisID: 'y', borderColor: '#161b22', backgroundColor: 'rgba(108,160,220,0.4)', borderWidth: 2, tension: 0.4, fill: true, pointRadius: 0 },
                { label: 'Patrimoine optimisé', data: projDataOptimise, yAxisID: 'y', borderColor: '#FF8C42', backgroundColor: 'rgba(255,140,66,0.4)', borderWidth: 3, tension: 0.4, fill: '-1', pointRadius: 0 }
            ];
            if (showY2) {
                datasets.push({ label: '_ans', data: anneeData, yAxisID: 'y2', borderColor: 'transparent', backgroundColor: 'transparent', borderWidth: 0, pointRadius: 0, fill: false });
            }
            new Chart(ctxProj, {
                type: 'line',
                data: { labels: projLabels, datasets },
                options: { responsive: true, maintainAspectRatio: false,
                    plugins: {
                        legend: { display: true, position: 'bottom', labels: { color: '#1F2A44', font: { family: 'Inter', size: 14 }, filter: item => item.text !== '_ans' } },
                        tooltip: { mode: 'index', intersect: false,
                            filter: item => item.dataset.label !== '_ans',
                            callbacks: { label: c => c.dataset.label + ' : ' + Math.round(c.parsed.y).toLocaleString('fr-FR') + ' €' } }
                    },
                    scales: {
                        y: { position: 'left', ticks: { callback: v => v.toLocaleString('fr-FR') + ' €' } },
                        y2: { position: 'right', display: showY2, grid: { drawOnChartArea: false },
                              ticks: { callback: v => v.toFixed(0) + ' ans' } }
                    }
                }
            });
        }
    }
});
