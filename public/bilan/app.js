document.addEventListener('DOMContentLoaded', () => {
    // --- State & DOM Elements ---
    let currentStep = 1;
    const totalSteps = 9;

    const steps = document.querySelectorAll('.step');
    const btnNext = document.getElementById('btn-next');
    const btnPrev = document.getElementById('btn-prev');
    const btnSubmit = document.getElementById('btn-submit');
    const progressBar = document.getElementById('progress-bar');
    const currentStepDisplay = document.getElementById('current-step-display');
    const totalStepsDisplay = document.getElementById('total-steps-display');
    
    totalStepsDisplay.textContent = totalSteps;

    // Set default date to today
    const dateEvalInput = document.getElementById('date_evaluation');
    if (dateEvalInput && !dateEvalInput.value) {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        dateEvalInput.value = `${yyyy}-${mm}-${dd}`;
    }

    // --- Navigation Logic ---
    function updateUI() {
        // Show correct step
        steps.forEach((step, index) => {
            if (index + 1 === currentStep) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });

        // Update progress bar
        const progressPercentage = ((currentStep) / totalSteps) * 100;
        progressBar.style.width = `${progressPercentage}%`;
        currentStepDisplay.textContent = currentStep;

        // Button visibility
        if (currentStep === 1) {
            btnPrev.disabled = true;
        } else {
            btnPrev.disabled = false;
        }

        if (currentStep === 6) { // Last question step
            btnNext.classList.add('hidden');
            btnSubmit.classList.remove('hidden');
        } else if (currentStep >= 7) { // Result steps
            document.getElementById('form-actions').classList.add('hidden');
        } else {
            btnNext.classList.remove('hidden');
            btnSubmit.classList.add('hidden');
        }
    }

    btnNext.addEventListener('click', () => {
        if (currentStep < totalSteps - 1) {
            currentStep++;
            updateUI();
            window.scrollTo({ top: 0, behavior: 'instant' });
        }
    });

    btnPrev.addEventListener('click', () => {
        if (currentStep > 1) {
            currentStep--;
            updateUI();
        }
    });

    document.getElementById('btn-projection').addEventListener('click', () => {
        currentStep = 8;
        updateUI();
    });

    document.getElementById('btn-back-result').addEventListener('click', () => {
        currentStep = 7;
        updateUI();
    });

    // NEW NAV FOR STEP 9
    const btnVerifs = document.getElementById('btn-verifications');
    if (btnVerifs) {
        btnVerifs.addEventListener('click', () => {
            currentStep = 9;
            updateUI();
        });
    }

    const btnBackProj = document.getElementById('btn-back-projection');
    if (btnBackProj) {
        btnBackProj.addEventListener('click', () => {
            currentStep = 8;
            updateUI();
        });
    }
    const btnShortcutStep7 = document.getElementById('btn-shortcut-step7');
    if (btnShortcutStep7) {
        btnShortcutStep7.addEventListener('click', () => {
            const btnSubmit = document.getElementById('btn-submit');
            if (btnSubmit) {
                btnSubmit.click(); // Triggers calculations and navigation to Step 7
            }
        });
    }

    const btnShortcutStep8 = document.getElementById('btn-shortcut-step8');
    if (btnShortcutStep8) {
        btnShortcutStep8.addEventListener('click', () => {
            const btnSubmit = document.getElementById('btn-submit');
            if (btnSubmit) {
                btnSubmit.click(); // Calculate all
                currentStep = 8;
                updateUI();
            }
        });
    }

    // --- Core Calculation Logic ---
    function getNumberVal(inputName) {
        const val = document.querySelector(`input[name="${inputName}"]`)?.value;
        return parseFloat(val) || 0;
    }

    function sumClassValues(className) {
        let sum = 0;
        document.querySelectorAll(`.${className}`).forEach(input => {
            sum += parseFloat(input.value) || 0;
        });
        return sum;
    }

    /**
     * Calcule le capital restant dû d'un emprunt
     * @param {number} principal - Le montant emprunté initialement
     * @param {number} annualRate - Taux annuel en pourcentage (ex: 2.5)
     * @param {number} durationYears - Durée de l'emprunt en années
     * @param {string} startMonthYear - Date de début format "YYYY-MM"
     */
    function calculateRemainingPrincipal(principal, annualRate, durationYears, startMonthYear) {
        if (!principal || !durationYears || !startMonthYear) return 0;

        const startDate = new Date(startMonthYear);
        const evalDateValue = document.getElementById('date_evaluation').value;
        const now = evalDateValue ? new Date(evalDateValue) : new Date();
        
        let monthsPassed = (now.getFullYear() - startDate.getFullYear()) * 12 + (now.getMonth() - startDate.getMonth());
        if (now.getDate() < startDate.getDate()) {
            monthsPassed--;
        }
        monthsPassed = Math.max(0, monthsPassed);
        const totalMonths = durationYears * 12;

        if (monthsPassed >= totalMonths) return 0;

        const monthlyRate = (annualRate / 100) / 12;

        if (monthlyRate === 0) {
            // Prêt à taux zéro
            const monthlyPayment = principal / totalMonths;
            return principal - (monthlyPayment * monthsPassed);
        }

        // Formule itérative équivalente à CUMPRINC
        const pmt = principal * (monthlyRate / (1 - Math.pow(1 + monthlyRate, -totalMonths)));
        let balance = principal;
        
        for (let i = 1; i <= monthsPassed; i++) {
            let interest = balance * monthlyRate;
            let princPayment = pmt - interest;
            balance -= princPayment;
        }

        return Math.max(0, balance);
    }

    /**
     * Calcule la part de remboursement de principal du prêt immobilier pour le mois actuel.
     */
    function calculateMonthlyPrincipalRepayment(principal, annualRate, durationYears, startMonthYear) {
        if (!principal || !durationYears || !startMonthYear) return 0;
        
        const startDate = new Date(startMonthYear);
        const evalDateValue = document.getElementById('date_evaluation').value;
        const now = evalDateValue ? new Date(evalDateValue) : new Date();
        
        let monthsPassed = (now.getFullYear() - startDate.getFullYear()) * 12 + (now.getMonth() - startDate.getMonth());
        if (now.getDate() < startDate.getDate()) {
            monthsPassed--;
        }
        monthsPassed = Math.max(0, monthsPassed);
        const totalMonths = durationYears * 12;

        if (monthsPassed >= totalMonths) return 0;

        const monthlyRate = (annualRate / 100) / 12;
        if (monthlyRate === 0) return principal / totalMonths;

        // Formule de la mensualité pleine
        const term = Math.pow(1 + monthlyRate, totalMonths);
        const monthlyPayment = principal * (monthlyRate * term) / (term - 1);
        
        // Calcul des intérêts du mois actuel basés sur le capital restant
        const remainingPrincipal = calculateRemainingPrincipal(principal, annualRate, durationYears, startMonthYear);
        const interestPortion = remainingPrincipal * monthlyRate;
        
        // La portion de capital remboursée est la mensualité moins les intérêts
        return monthlyPayment - interestPortion;
    }

    let myChart = null; // Store chart instance to destroy/recreate if needed

    document.getElementById('btn-submit').addEventListener('click', (e) => {
        e.preventDefault();
        
        // --- EXTRACTION DES DETTES RESTANTES ---
        const rpPrincipal = getNumberVal('rp_emprunt_initial');
        const rpRate = getNumberVal('rp_taux');
        const rpYears = getNumberVal('rp_duree');
        const rpDate = document.querySelector('input[name="rp_debut"]').value;
        const rpRemaining = calculateRemainingPrincipal(rpPrincipal, rpRate, rpYears, rpDate);

        const locPrincipal = getNumberVal('loc_emprunt_initial');
        const locRate = getNumberVal('loc_taux');
        const locYears = getNumberVal('loc_duree');
        const locDate = document.querySelector('input[name="loc_debut"]').value;
        const locRemaining = calculateRemainingPrincipal(locPrincipal, locRate, locYears, locDate);

        const detteDirect = getNumberVal('dette_capital_du_direct');
        let autreRemaining = 0;
        if (detteDirect > 0) {
            autreRemaining = detteDirect;
        } else {
            const autrePrincipal = getNumberVal('dette_montant');
            const autreRate = getNumberVal('dette_taux');
            const autreYears = getNumberVal('dette_duree');
            const autreDate = document.querySelector('input[name="dette_debut"]').value;
            autreRemaining = calculateRemainingPrincipal(autrePrincipal, autreRate, autreYears, autreDate);
        }

        // --- 1. PATRIMOINE CASH ---
        const cashList = ['comptes_cheques', 'livret_a', 'ldd', 'lep', 'cel', 'pel', 'divers_liquidites'];
        let rawCash = 0;
        cashList.forEach(name => rawCash += getNumberVal(name));
        const patrimoineCash = rawCash - autreRemaining;

        // --- 2. PATRIMOINE IMMOBILIER ---
        const valeurRp = getNumberVal('rp_valeur');
        const valeurLoc = getNumberVal('loc_valeur');
        const valeurScpi = getNumberVal('scpi');
        const patrimoineImmo = (valeurRp + valeurLoc + valeurScpi) - (rpRemaining + locRemaining);

        // --- 3. PATRIMOINE BOURSE ---
        const bourseList = ['cto', 'pea', 'per', 'pee', 'av_fonds_euros', 'av_uc', 'autres_invests'];
        let patrimoineBourse = 0;
        bourseList.forEach(name => patrimoineBourse += getNumberVal(name));

        // --- 4. PATRIMOINE TOTAL ---
        const patrimoineTotal = patrimoineCash + patrimoineImmo + patrimoineBourse;

        // --- 5. DEPENSES MENSUELLES ---
        const salaireMensuel = getNumberVal('salaire_net') + getNumberVal('bonus_net');
        const epargneMensuelle = getNumberVal('epargne_mensuelle');
        const depensesMensuelles = salaireMensuel - epargneMensuelle;

        // --- 6. REMBOURSEMENT MENSUEL PRINCIPAL RP ---
        const rpPrincipalMensuel = calculateMonthlyPrincipalRepayment(rpPrincipal, rpRate, rpYears, rpDate);

        // --- 7. DEPENSES ANNUELLES ---
        const depensesAnnuelles = (depensesMensuelles - rpPrincipalMensuel) * 12;

        // --- 8. PATRIMOINE EN ANNEES DE DEPENSES ---
        let anneesDepensesText = "";
        if (depensesAnnuelles > 0) {
            const ratio = patrimoineTotal / depensesAnnuelles;
            anneesDepensesText = ratio.toFixed(1) + " ans";
        } else {
            anneesDepensesText = "Dépenses non définies ou inférieures au remboursement.";
        }

        const totalDebt = rpRemaining + locRemaining + autreRemaining;

        // --- Affichage ---
        const formatCurrency = (num) => {
            return Math.round(num).toLocaleString('fr-FR') + ' €';
        };

        document.getElementById('patrimoine-net').textContent = formatCurrency(patrimoineTotal);
        if (patrimoineTotal < 0) {
            document.getElementById('patrimoine-net').style.color = 'var(--danger)'; 
        } else {
            document.getElementById('patrimoine-net').style.color = '#fff';
        }

        document.getElementById('res-cash').textContent = formatCurrency(patrimoineCash);
        document.getElementById('res-immo').textContent = formatCurrency(patrimoineImmo);
        document.getElementById('res-bourse').textContent = formatCurrency(patrimoineBourse);
        if (document.getElementById('res-patrimoine-total')) {
            document.getElementById('res-patrimoine-total').textContent = formatCurrency(patrimoineTotal);
        }
        document.getElementById('res-depenses-annuelles').textContent = formatCurrency(depensesAnnuelles);
        document.getElementById('res-annees-depenses').textContent = anneesDepensesText;

        // --- NOUVEAU : POTENTIEL IMMOBILIER (Endettement) ---
        const loc_loyers = getNumberVal('loc_loyers');
        const locLoyersMensuels = loc_loyers;
        const revenusAnnuels = (salaireMensuel + locLoyersMensuels) * 12;

        let remboursementsAnnuels = 0;
        // On récupère les mensualités complètes globales
        const mRateRp = (rpRate / 100) / 12;
        const rpMensualite = (rpPrincipal > 0 && rpYears > 0 && mRateRp > 0) ? (rpPrincipal * mRateRp) / (1 - Math.pow(1 + mRateRp, -(rpYears * 12))) : 0;
        if (rpMensualite && rpRemaining > 0) remboursementsAnnuels += rpMensualite * 12;

        // Variables déjà déclarées plus haut : locRate, locPrincipal, locYears
        const mRateLoc = (locRate / 100) / 12;
        const locMensualite = (locPrincipal > 0 && locYears > 0 && mRateLoc > 0) ? (locPrincipal * mRateLoc) / (1 - Math.pow(1 + mRateLoc, -(locYears * 12))) : 0;
        if (locMensualite && locRemaining > 0) remboursementsAnnuels += locMensualite * 12;

        // Récupération locale pour contourner le scope de la condition "detteDirect" plus haut.
        const autreRateLocal = getNumberVal('dette_taux');
        const autrePrincipalLocal = getNumberVal('dette_montant');
        const autreYearsLocal = getNumberVal('dette_duree');
        const mRateAutre = (autreRateLocal / 100) / 12;
        const autreMensualite = (autrePrincipalLocal > 0 && autreYearsLocal > 0 && mRateAutre > 0) ? (autrePrincipalLocal * mRateAutre) / (1 - Math.pow(1 + mRateAutre, -(autreYearsLocal * 12))) : 0;
        // La dette conso (autreMensualite) n'est plus prise en compte dans les remboursements pour l'endettement immobilier

        let tauxEndettement = 0;
        if (revenusAnnuels > 0) {
            tauxEndettement = (remboursementsAnnuels / revenusAnnuels) * 100;
        }

        let tauxElem = document.getElementById('res-taux-endettement');
        if (tauxElem) {
            tauxElem.textContent = `${tauxEndettement.toFixed(1)} %`;
            if (tauxEndettement > 33) {
                tauxElem.style.color = "var(--danger)";
            } else {
                tauxElem.style.color = "var(--success)";
            }
        }

        if (document.getElementById('res-remboursements-immo')) {
            document.getElementById('res-remboursements-immo').textContent = formatCurrency(remboursementsAnnuels) + " / an";
            document.getElementById('res-salaire-annuel').textContent = formatCurrency(salaireMensuel * 12) + " / an";
            document.getElementById('res-revenus-locatifs').textContent = formatCurrency(locLoyersMensuels * 12) + " / an";
            document.getElementById('res-total-revenus').textContent = formatCurrency(revenusAnnuels) + " / an";
        }

        // --- NOUVEAU : BILAN ÉPARGNE SIMPLIFIÉ ---
        let rpPrincipalAnnuel = 0;
        let tempRpRemaining = rpRemaining;
        const mRateRpEpargne = (rpRate / 100) / 12;
        if (tempRpRemaining > 0 && mRateRpEpargne > 0) {
            let fullMensualite = (rpPrincipal * mRateRpEpargne * Math.pow(1 + mRateRpEpargne, rpYears * 12)) / (Math.pow(1 + mRateRpEpargne, rpYears * 12) - 1);
            for (let m = 0; m < 12; m++) {
                if (tempRpRemaining > 0) {
                    let interets = tempRpRemaining * mRateRpEpargne;
                    let cap = fullMensualite - interets;
                    tempRpRemaining -= cap;
                    rpPrincipalAnnuel += (cap > 0 ? cap : 0);
                }
            }
        } else if (tempRpRemaining > 0) {
            rpPrincipalAnnuel = (rpPrincipal / (rpYears * 12)) * 12;
            rpPrincipalAnnuel = Math.min(rpPrincipalAnnuel, tempRpRemaining);
        }

        const epargneAnnuelleDecla = epargneMensuelle * 12;
        const epargneTotaleAnnuelle = epargneAnnuelleDecla + rpPrincipalAnnuel;
        
        const salaireMensuelComplet = getNumberVal('salaire_net') + getNumberVal('bonus_net');
        let tauxEpargneActuel = 0;
        if (salaireMensuelComplet > 0) {
            // Taux calculé sur la base de l'épargne MENSUELLE totale vs salaire MENSUEL total
            tauxEpargneActuel = ((epargneTotaleAnnuelle / 12) / salaireMensuelComplet) * 100;
        }

        const salaireAnnuelComplet = salaireMensuelComplet * 12;
        let tauxIdeal = (salaireAnnuelComplet > 60000) ? 0.30 : 0.20;

        let economiesSupplementairesMensuelles = (salaireMensuelComplet * tauxIdeal) - (epargneTotaleAnnuelle / 12);
        if (economiesSupplementairesMensuelles < 0) {
            economiesSupplementairesMensuelles = 0;
        }

        if (document.getElementById('res-epargne-actuelle')) {
            document.getElementById('res-epargne-actuelle').textContent = formatCurrency(epargneAnnuelleDecla) + " / an";
            document.getElementById('res-epargne-principal').textContent = formatCurrency(rpPrincipalAnnuel) + " / an";
            document.getElementById('res-epargne-totale').textContent = formatCurrency(epargneTotaleAnnuelle) + " / an";
            document.getElementById('res-taux-epargne').textContent = tauxEpargneActuel.toFixed(1) + " %";
            document.getElementById('res-taux-ideal').textContent = (tauxIdeal * 100).toFixed(0) + " %";
            document.getElementById('res-economies-supp').textContent = formatCurrency(economiesSupplementairesMensuelles) + " / mois";
        }

        let capaciteRemboursementMensuelle = 0;
        if (tauxEndettement <= 33 && revenusAnnuels > 0) {
            capaciteRemboursementMensuelle = ((revenusAnnuels / 12) / 3) - (remboursementsAnnuels / 12);
            if (capaciteRemboursementMensuelle < 0) capaciteRemboursementMensuelle = 0;
        }
        if (document.getElementById('res-cr-mensuel')) {
            document.getElementById('res-cr-mensuel').textContent = formatCurrency(capaciteRemboursementMensuelle) + ' / mois';
        }

        let capaciteEndettement = 0;
        if (capaciteRemboursementMensuelle > 0) {
            const tauxMensuel = (3.0 / 100) / 12;
            const moisCapacite = 20 * 12; // 240 mois
            // Capacité d'endettement avec la formule à intérêts mensuels : PV = P * (1 - (1+r)^-n) / r
            capaciteEndettement = capaciteRemboursementMensuelle * (1 - Math.pow(1 + tauxMensuel, -moisCapacite)) / tauxMensuel;
        }
        if (document.getElementById('res-cape-endettement')) {
            document.getElementById('res-cape-endettement').textContent = formatCurrency(capaciteEndettement);
        }

        // --- POPULATE STEP 9 VERIFICATIONS ---
        if (document.getElementById('check-pat-cash')) {
            document.getElementById('check-pat-cash').textContent = formatCurrency(patrimoineCash);
            document.getElementById('check-pat-immo').textContent = formatCurrency(patrimoineImmo);
            document.getElementById('check-pat-bourse').textContent = formatCurrency(patrimoineBourse);
            document.getElementById('check-pat-total').textContent = formatCurrency(patrimoineTotal);
            
            document.getElementById('check-rp-remaining').textContent = formatCurrency(rpRemaining);
            document.getElementById('check-loc-remaining').textContent = formatCurrency(locRemaining);
            document.getElementById('check-autre-remaining').textContent = formatCurrency(autreRemaining);
            document.getElementById('check-total-debt').textContent = formatCurrency(totalDebt);

            document.getElementById('check-salaire-complet').textContent = formatCurrency(salaireMensuel);
            document.getElementById('check-rp-principal-mensuel').textContent = formatCurrency(rpPrincipalMensuel);
            document.getElementById('check-depenses-mensuelles').textContent = formatCurrency(depensesMensuelles);
            document.getElementById('check-depenses-annuelles').textContent = formatCurrency(depensesAnnuelles);
            document.getElementById('check-annees-depenses').textContent = anneesDepensesText;
            
            document.getElementById('check-revenus-annuels').textContent = formatCurrency(revenusAnnuels);
            document.getElementById('check-remboursements-annuels').textContent = formatCurrency(remboursementsAnnuels);
            document.getElementById('check-taux-endettement').textContent = tauxEndettement.toFixed(1) + ' %';
            document.getElementById('check-cr-mensuelle').textContent = formatCurrency(capaciteRemboursementMensuelle);
            document.getElementById('check-capacite-endettement').textContent = formatCurrency(capaciteEndettement);

            document.getElementById('check-epargne-actuelle').textContent = formatCurrency(epargneAnnuelleDecla);
            document.getElementById('check-rp-principal-annuel').textContent = formatCurrency(rpPrincipalAnnuel);
            document.getElementById('check-epargne-totale').textContent = formatCurrency(epargneTotaleAnnuelle);
            document.getElementById('check-taux-epargne').textContent = tauxEpargneActuel.toFixed(1) + ' %';
            document.getElementById('check-taux-ideal').textContent = (tauxIdeal * 100).toFixed(1) + ' %';
            document.getElementById('check-economies-supp').textContent = formatCurrency(economiesSupplementairesMensuelles);
        }

        // Aller à l'étape 7 (Bilan)
        currentStep = 7;
        updateUI();

        // Afficher le Chart (Camembert)
        const ctx = document.getElementById('patrimoineChart').getContext('2d');
        if (myChart) {
            myChart.destroy();
        }
        
        let pieData = [
            Math.max(0, patrimoineCash),
            Math.max(0, patrimoineImmo),
            Math.max(0, patrimoineBourse)
        ];

        myChart = new Chart(ctx, {
            type: 'doughnut', // doughnut is modern and premium, but 'pie' works too
            data: {
                labels: ['Cash', 'Immobilier', 'Bourse'],
                datasets: [{
                    data: pieData,
                    backgroundColor: [
                        '#6CA0DC', // Cash: Bleu clair
                        '#1F2A44', // Immo: Bleu foncé
                        '#FF8C42'  // Bourse: Orange
                    ],
                    borderColor: '#ffffff',
                    borderWidth: 2,
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { color: '#1F2A44', font: { family: 'Inter', size: 14 } }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let value = context.parsed;
                                return ' ' + Math.round(value).toLocaleString('fr-FR') + ' €';
                            }
                        }
                    }
                }
            }
        });

        // --- PROJECTION DU CASH, DE L'IMMO ET DE LA BOURSE (ETAPE 8) ---
        const ageActuel = getNumberVal('age');
        if (ageActuel > 0 && ageActuel <= 65) {
            let currentAge = ageActuel;

            // Calcul de l'année de départ
            const evalDateValue = document.getElementById('date_evaluation').value;
            let currentYear = evalDateValue ? new Date(evalDateValue).getFullYear() : new Date().getFullYear();
            
            // 1. Point de départ Cash
            let currentCash = rawCash;
            const annualSavings = epargneMensuelle * 12;
            
            // 2. Point de départ Immobilier Brut
            const valeurRp = getNumberVal('rp_valeur');
            const valeurLoc = getNumberVal('loc_valeur');
            const valeurScpi = getNumberVal('scpi');
            let currentImmoBrut = valeurRp + valeurLoc + valeurScpi;

            // 3. Point de départ Bourse (Divisée en deux paniers)
            let bourseSafe = getNumberVal('av_fonds_euros') + getNumberVal('autres_invests');
            let bourseDynamique = getNumberVal('cto') + getNumberVal('pea') + getNumberVal('per') + getNumberVal('pee') + getNumberVal('av_uc');

            // 4. Point de départ Cash Optimisé
            const salaireNet = getNumberVal('salaire_net');
            const bonusNet = getNumberVal('bonus_net');
            const depensesMensuelles = (salaireNet + bonusNet) - epargneMensuelle;
            const grossesDepenses = getNumberVal('grosses_depenses');
            
            let totalLiquid = patrimoineCash + (patrimoineBourse || 0);
            let cibleSecurite = (depensesMensuelles * 6) + grossesDepenses;
            let currentCashOptimise = Math.min(totalLiquid, cibleSecurite);
            
            let bourseOptimise = Math.max(0, totalLiquid - cibleSecurite);

            // --- OPTIMISE : Nouvel Investissement Locatif ---
            // L'investissement se fait à N+1, donc initialement 0
            let nouvelImmoBrut = 0;
            let nouvelImmoDebt = 0;
            let nouvelImmoEpargneCumulee = 0;
            let locatifInvested = false;
            const nouvelImmoRateMensuel = (3.0 / 100) / 12;
            const nouvelImmoDureeMois = 240;
            const nouvelImmoMensualite = (capaciteEndettement > 0 && nouvelImmoRateMensuel > 0) ? (capaciteEndettement * nouvelImmoRateMensuel) / (1 - Math.pow(1 + nouvelImmoRateMensuel, -nouvelImmoDureeMois)) : 0;

            // 5. Emprunts Initiaux pour simulation année par année
            let rpPrincipalInitial = getNumberVal('rp_emprunt_initial');
            let rpRateAnnual = getNumberVal('rp_taux');
            let rpYearsTotal = getNumberVal('rp_duree');
            let rpDateStart = document.querySelector('input[name="rp_debut"]').value;
            
            let locPrincipalInitial = getNumberVal('loc_emprunt_initial');
            let locRateAnnual = getNumberVal('loc_taux');
            let locYearsTotal = getNumberVal('loc_duree');
            let locDateStart = document.querySelector('input[name="loc_debut"]').value;

            // Fonction pour calculer la mensualité globale (Capital + Intérêt)
            function calcMonthlyPayment(p, r, y) {
                 if (!p || !y) return 0;
                 const mRate = (r / 100) / 12;
                 const tMonths = y * 12;
                 if (mRate === 0) return p / tMonths;
                 const term = Math.pow(1 + mRate, tMonths);
                 return p * (mRate * term) / (term - 1);
            }
            const rpMensualiteProj = calcMonthlyPayment(rpPrincipalInitial, rpRateAnnual, rpYearsTotal);
            const locMensualiteProj = calcMonthlyPayment(locPrincipalInitial, locRateAnnual, locYearsTotal);

            // Nombre de mois déjà passés à la "date du bilan"
            function getMonthsPassedFromDateLoop(startMonthYear) {
                 if(!startMonthYear) return 0;
                 const startDate = new Date(startMonthYear);
                 const evalDateValue = document.getElementById('date_evaluation').value;
                 const now = evalDateValue ? new Date(evalDateValue) : new Date();
                 let mPassed = (now.getFullYear() - startDate.getFullYear()) * 12 + (now.getMonth() - startDate.getMonth());
                 if (now.getDate() < startDate.getDate()) {
                     mPassed--;
                 }
                 return Math.max(0, mPassed);
            }

            let rpMonthsPassedLoop = getMonthsPassedFromDateLoop(rpDateStart);
            const rpTotalMonths = rpYearsTotal * 12;
            
            let locMonthsPassedLoop = getMonthsPassedFromDateLoop(locDateStart);
            const locTotalMonths = locYearsTotal * 12;

            let cumulativeEpargneImmo = 0; // Cumulative pour Immo Net
            let annualEpargneImmo = 0; // Annuel pour tableau détails
            let cumulativeNouvelImmoEpargne = 0; // Cumulative pour Immo Optimisé
            let annualNouvelImmoEpargne = 0; // Annuel pour Immo Optimisé
            
            const tableBodyMain = document.querySelector('#projection-table-main tbody');
            const tableBodyDetails = document.querySelector('#projection-table-details tbody');
            tableBodyMain.innerHTML = '';
            tableBodyDetails.innerHTML = '';
            
            let projLabels = [];
            let projDataTotal = [];
            let projDataOptimise = [];
            
            let currentRpLocBrut = valeurRp + valeurLoc;
            let currentScpi = valeurScpi;
            
            const autreDateStart = document.querySelector('input[name="dette_debut"]').value;
            let autreMonthsPassedLoop = getMonthsPassedFromDateLoop(autreDateStart);
            const autrePrincipalInitial = getNumberVal('dette_montant');
            const autreRateAnnual = getNumberVal('dette_taux');
            const autreTotalMonths = getNumberVal('dette_duree') * 12;

            while (currentAge <= 65) {
                // a) Calcul du reste à payer immobilier à CET ÂGE
                function remainingLoop(p, r, tMonths, currentPassed) {
                    if (currentPassed >= tMonths || !p) return 0;
                    const mRate = (r / 100) / 12;
                    if (mRate === 0) return p - ((p / tMonths) * currentPassed);
                    
                    const pmt = p * (mRate / (1 - Math.pow(1 + mRate, -tMonths)));
                    let balance = p;
                    for (let i = 1; i <= currentPassed; i++) {
                        let interest = balance * mRate;
                        let princPayment = pmt - interest;
                        balance -= princPayment;
                    }
                    return Math.max(0, balance);
                }

                let currentRpDebt = remainingLoop(rpPrincipalInitial, rpRateAnnual, rpTotalMonths, rpMonthsPassedLoop);
                let currentLocDebt = remainingLoop(locPrincipalInitial, locRateAnnual, locTotalMonths, locMonthsPassedLoop);
                let currentAutreDebt = remainingLoop(autrePrincipalInitial, autreRateAnnual, autreTotalMonths, autreMonthsPassedLoop);
                
                let currentTotalDebtImmo = currentRpDebt + currentLocDebt;
                let currentImmoNet = currentImmoBrut - currentTotalDebtImmo + cumulativeEpargneImmo;
                
                let valBien = currentRpLocBrut;
                let valNette = valBien - currentTotalDebtImmo;
                let valNetteNouvelInvest = nouvelImmoBrut - nouvelImmoDebt;
                let immoOptimise = valNette + valNetteNouvelInvest + currentScpi;

                // Calcul Bourse et Total
                let currentBourse = bourseSafe + bourseDynamique;
                let currentPatrimoineCash = currentCash - currentAutreDebt;
                let currentTotalNet = currentPatrimoineCash + currentImmoNet + currentBourse;
                let currentTotalOptimise = currentCashOptimise + immoOptimise + bourseOptimise;

                // Enregistrement pour le Graphique
                projLabels.push(currentAge + " ans");
                projDataTotal.push(currentTotalNet);
                projDataOptimise.push(currentTotalOptimise);

                // Bourse Optimisee & Epargne Metrics
                let anneeRendementR = (currentAge / 100) * 0.015 + (1 - currentAge / 100) * 0.066;
                let currentEconomiesSuppAnnuel = economiesSupplementairesMensuelles * 12;
                let surplusEmpruntActuel = annualEpargneImmo + annualNouvelImmoEpargne;
                
                let epargneActuelleAnnuelle = epargneMensuelle * 12;
                let epargneCibleeAnnuelle = (salaireMensuelComplet * tauxIdeal) * 12;
                let epargneFutureAnnuelle = 0;

                if (epargneTotaleAnnuelle >= epargneCibleeAnnuelle) {
                    epargneFutureAnnuelle = epargneActuelleAnnuelle * 1.1;
                } else {
                    epargneFutureAnnuelle = epargneCibleeAnnuelle;
                }

                let epargneTotaleProjection = epargneFutureAnnuelle + surplusEmpruntActuel;

                // Ajout de la ligne au tableau HTML Main
                const trMain = document.createElement('tr');
                trMain.style.borderBottom = '1px solid var(--border)';
                trMain.innerHTML = `
                    <td style="padding: 0.5rem 0; font-weight: bold;">${currentYear}</td>
                    <td style="padding: 0.5rem 0; font-weight: 500;">${currentAge}</td>
                    <td style="padding: 0.5rem 0; color: var(--text-main);">${formatCurrency(currentPatrimoineCash)}</td>
                    <td style="padding: 0.5rem 0; color: var(--text-main);">${formatCurrency(currentImmoNet)}</td>
                    <td style="padding: 0.5rem 0; color: var(--text-main);">${formatCurrency(currentBourse)}</td>
                    <td style="padding: 0.5rem 0.5rem; font-weight:bold; color: #1F2A44; white-space:nowrap;">${formatCurrency(currentTotalNet)}</td>
                    <td style="padding: 0.5rem 0.5rem; text-align:right; color: var(--primary); white-space:nowrap;">${formatCurrency(currentCashOptimise)}</td>
                    <td style="padding: 0.5rem 0.5rem; text-align:right; color: var(--coach-bleu-fonce); font-weight:bold; white-space:nowrap;">${formatCurrency(immoOptimise)}</td>
                    <td style="padding: 0.5rem 0.5rem; text-align:right; color: #FF8C42; font-weight:bold; white-space:nowrap;">${formatCurrency(bourseOptimise)}</td>
                    <td style="padding: 0.5rem 0.5rem; text-align:right; font-weight:bold; color: #1F2A44; white-space:nowrap;">${formatCurrency(currentTotalOptimise)}</td>
                `;
                tableBodyMain.appendChild(trMain);

                // Ajout de la ligne au tableau HTML Details
                const trDetails = document.createElement('tr');
                trDetails.style.borderBottom = '1px solid var(--border)';
                
                trDetails.innerHTML = `
                    <td style="padding: 0.5rem 0; font-weight: bold;">${currentYear}</td>
                    <td style="padding: 0.5rem 0; font-weight: 500;">${currentAge}</td>
                    <td style="padding: 0.5rem 0.5rem; text-align:right; color: var(--text-main); white-space:nowrap;">${formatCurrency(currentCash)}</td>
                    <td style="padding: 0.5rem 0.5rem; text-align:right; color: var(--danger); white-space:nowrap;">${formatCurrency(currentAutreDebt)}</td>
                    <td style="padding: 0.5rem 0.5rem; text-align:right; color: var(--primary); white-space:nowrap;">${formatCurrency(currentPatrimoineCash)}</td>
                    <td style="padding: 0.5rem 0.5rem; text-align:right; white-space:nowrap;">${formatCurrency(valBien)}</td>
                    <td style="padding: 0.5rem 0.5rem; text-align:right; color: var(--danger); white-space:nowrap;">${formatCurrency(currentTotalDebtImmo)}</td>
                    <td style="padding: 0.5rem 0.5rem; text-align:right; color: var(--text-main); white-space:nowrap;">${formatCurrency(valNette)}</td>
                    <td style="padding: 0.5rem 0.5rem; text-align:right; color: var(--success); white-space:nowrap;">${formatCurrency(annualEpargneImmo)}</td>
                    <td style="padding: 0.5rem 0.5rem; text-align:right; color: var(--text-main); white-space:nowrap;">${formatCurrency(currentScpi)}</td>
                    <td style="padding: 0.5rem 0.5rem; text-align:right; color: var(--text-main); white-space:nowrap;">${formatCurrency(nouvelImmoBrut)}</td>
                    <td style="padding: 0.5rem 0.5rem; text-align:right; color: var(--danger); white-space:nowrap;">${Math.round(nouvelImmoDebt) > 0 ? "- " + formatCurrency(nouvelImmoDebt) : "0 €"}</td>
                    <td style="padding: 0.5rem 0.5rem; text-align:right; color: var(--primary); white-space:nowrap;">${formatCurrency(valNetteNouvelInvest)}</td>
                    <td style="padding: 0.5rem 0.5rem; text-align:right; color: var(--coach-bleu-fonce); white-space:nowrap;">${formatCurrency(immoOptimise)}</td>
                    <td style="padding: 0.5rem 0.5rem; text-align:right; color: var(--text-main); white-space:nowrap;">${formatCurrency(epargneActuelleAnnuelle)}</td>
                    <td style="padding: 0.5rem 0.5rem; text-align:right; color: var(--coach-bleu-clair); white-space:nowrap;">${formatCurrency(currentEconomiesSuppAnnuel)}</td>
                    <td style="padding: 0.5rem 0.5rem; text-align:right; color: var(--primary); font-weight:bold; white-space:nowrap;">${formatCurrency(epargneFutureAnnuelle)}</td>
                    <td style="padding: 0.5rem 0.5rem; text-align:right; color: var(--success); white-space:nowrap;">${formatCurrency(surplusEmpruntActuel)}</td>
                    <td style="padding: 0.5rem 0.5rem; text-align:right; color: var(--success); font-weight:bold; white-space:nowrap;">${formatCurrency(epargneTotaleProjection)}</td>
                    <td style="padding: 0.5rem 0.5rem; text-align:right; color: #FF8C42; white-space:nowrap;">${(anneeRendementR * 100).toFixed(2)} %</td>
                `;
                tableBodyDetails.appendChild(trDetails);

                if (currentAge < 65) {
                    currentYear++;
                    
                    // On gonfle la Bourse Optimisée (Year N+1) = Bourse (N) * (1 + R) + Epargne Totale Annuelle
                    bourseOptimise = (bourseOptimise * (1 + anneeRendementR)) + epargneTotaleProjection;

                    annualNouvelImmoEpargne = 0;
                    if (!locatifInvested) {
                        // L'investissement se fait exactement 1 an après le bilan
                        nouvelImmoBrut = capaciteEndettement;
                        nouvelImmoDebt = capaciteEndettement;
                        locatifInvested = true;
                    } else {
                        // Amortissement du Nouvel Immo Optimisé sur l'année
                        for (let m = 0; m < 12; m++) {
                            if (nouvelImmoDebt > 0) {
                                let interets = nouvelImmoDebt * nouvelImmoRateMensuel;
                                let capitalRembourse = nouvelImmoMensualite - interets;
                                nouvelImmoDebt -= capitalRembourse;
                                if (nouvelImmoDebt <= 0) {
                                    // S'il reste un petit surplus le mois final
                                    let surplus = Math.abs(nouvelImmoDebt);
                                    annualNouvelImmoEpargne += surplus;
                                    cumulativeNouvelImmoEpargne += surplus;
                                    nouvelImmoDebt = 0;
                                }
                            } else {
                                // Le crédit est terminé (après 20 ans), la rente locative va dans l'épargne !
                                annualNouvelImmoEpargne += nouvelImmoMensualite;
                                cumulativeNouvelImmoEpargne += nouvelImmoMensualite;
                            }
                        }

                        // MÀJ Nouvel Immo Optimisé (3% brut par an)
                        nouvelImmoBrut = nouvelImmoBrut * 1.03;
                    }

                    // MÀJ Cash pour l'année suivante (1% d'intérêts + Épargne classique)
                    // Note: L'épargne va à 100% dans le cash, la Bourse évolue en vase clos.
                    currentCash = (currentCash * 1.01) + annualSavings;
                    
                    // --- Croissance des autres actifs pour l'année suivante ---
                    if (currentAge < 65) {
                        currentImmoBrut = currentImmoBrut * 1.03;
                        currentRpLocBrut = currentRpLocBrut * 1.03;
                        currentScpi = currentScpi * 1.03;

                        // MÀJ Bourse (1% pour le Safe, 2.035% pour le Dynamique)
                        bourseSafe = bourseSafe * 1.01;
                        bourseDynamique = bourseDynamique * 1.02035;
                    }

                    // MÀJ Cash Optimisé (1% d'intérêts purs)
                    currentCashOptimise = currentCashOptimise * 1.01;

                    // Simulation des mensualités de l'année (12 mois) classique
                    let yearlyEpargneSuppl = 0;
                    for (let m = 0; m < 12; m++) {
                        // RP
                        if (rpPrincipalInitial > 0 && rpTotalMonths > 0) {
                            rpMonthsPassedLoop++;
                            if (rpMonthsPassedLoop > rpTotalMonths) {
                                // Le crédit est payé ! La mensualité devient de l'épargne.
                                yearlyEpargneSuppl += rpMensualiteProj;
                            }
                        }
                        
                        // Locatif
                        if (locPrincipalInitial > 0 && locTotalMonths > 0) {
                            locMonthsPassedLoop++;
                            if (locMonthsPassedLoop > locTotalMonths) {
                                // Le crédit est payé !
                                yearlyEpargneSuppl += locMensualiteProj;
                            }
                        }
                        // Autre dette
                        if (autrePrincipalInitial > 0 && autreTotalMonths > 0) {
                            autreMonthsPassedLoop++;
                        }
                    }
                    annualEpargneImmo = yearlyEpargneSuppl;
                    cumulativeEpargneImmo += yearlyEpargneSuppl;
                }
                currentAge++;
            }

            // MÀJ du titre avec le Patrimoine Total Final
            let finalOptimiseValue = projDataOptimise[projDataOptimise.length-1];
            let roundedFinalValue = Math.round(finalOptimiseValue / 10000) * 10000;
            document.getElementById('projection-net').innerHTML = `
               <span style="font-size: 2.5rem; display:block; color:#fff;">${formatCurrency(roundedFinalValue)}</span>
            `;

            // Rendu Chart.js
            if (window.projChartInstance) {
                window.projChartInstance.destroy();
            }
            const ctxProj = document.getElementById('projectionChart').getContext('2d');
            window.projChartInstance = new Chart(ctxProj, {
                type: 'line',
                data: {
                    labels: projLabels,
                    datasets: [
                        {
                            label: 'Patrimoine total',
                            data: projDataTotal,
                            borderColor: '#161b22', // Noir/Gris
                            backgroundColor: 'rgba(108, 160, 220, 0.4)', // Bleu
                            borderWidth: 2,
                            borderDash: [],
                            tension: 0.4,
                            fill: true,
                            pointRadius: 0,
                            pointBackgroundColor: '#161b22'
                        },
                        {
                            label: 'Patrimoine optimisé',
                            data: projDataOptimise,
                            borderColor: '#FF8C42',  // Orange
                            backgroundColor: 'rgba(255, 140, 66, 0.4)', // Orange
                            borderWidth: 3,
                            tension: 0.4,
                            fill: '-1',
                            pointRadius: 0,
                            pointBackgroundColor: '#FF8C42'
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { 
                            display: true,
                            position: 'bottom',
                            labels: { color: '#1F2A44', font: { family: 'Inter', size: 14 } }
                        },
                        tooltip: {
                            mode: 'index',
                            intersect: false,
                            callbacks: {
                                label: function(context) {
                                    return context.dataset.label + ' : ' + Math.round(context.parsed.y).toLocaleString('fr-FR') + ' €';
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            ticks: {
                                callback: function(value) {
                                    return value.toLocaleString('fr-FR') + ' €';
                                }
                            }
                        }
                    }
                }
            });
        }
    });

    // Initialize UI on load    // Initialize UI on load
    updateUI();
});
