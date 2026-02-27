/**
 * Master Tax & Compliance Logic for TaxFilingGuru
 * Refined per Section 6 (NRI) and Trader Audit Rules
 */

/**
 * 1. Income Tax Calculation (Old vs New Regimes)
 */
const calculateTax = (income, deductions = 0, regime = 'new_25_26') => {
    let taxableIncome = income;
    let standardDeduction = 0;

    if (regime === 'old') {
        standardDeduction = 50000;
        taxableIncome = Math.max(0, income - standardDeduction - deductions);
    } else {
        standardDeduction = 75000;
        taxableIncome = Math.max(0, income - standardDeduction);
    }

    let tax = 0;
    const slabs = getSlabs(regime);

    for (let i = 0; i < slabs.length; i++) {
        const slab = slabs[i];
        if (taxableIncome > slab.min) {
            const applicableAmount = Math.min(taxableIncome, slab.max) - slab.min;
            tax += (applicableAmount * slab.rate) / 100;
        } else {
            break;
        }
    }

    // Section 87A Rebate (Budget 2025 Updates)
    if (regime === 'old' && taxableIncome <= 500000) tax = 0;
    if (regime === 'new_24_25' && taxableIncome <= 700000) tax = 0;
    if (regime === 'new_25_26' && taxableIncome <= 1200000) tax = 0;

    const cess = tax * 0.04;
    
    return {
        grossIncome: income,
        taxableIncome,
        baseTax: tax,
        cess: cess,
        totalTax: tax + cess,
        standardDeduction
    };
};

function getSlabs(regime) {
    if (regime === 'new_25_26') {
        return [
            { min: 0, max: 400000, rate: 0 },
            { min: 400001, max: 800000, rate: 5 },
            { min: 800001, max: 1200000, rate: 10 },
            { min: 1200001, max: 1600000, rate: 15 },
            { min: 1600001, max: 2000000, rate: 20 },
            { min: 2000001, max: 2400000, rate: 25 },
            { min: 2400001, max: Infinity, rate: 30 }
        ];
    } else if (regime === 'new_24_25') {
        return [
            { min: 0, max: 300000, rate: 0 },
            { min: 300001, max: 700000, rate: 5 },
            { min: 700001, max: 1000000, rate: 10 },
            { min: 1000001, max: 1200000, rate: 15 },
            { min: 1200001, max: 1500000, rate: 20 },
            { min: 1500001, max: Infinity, rate: 30 }
        ];
    } else {
        return [
            { min: 0, max: 250000, rate: 0 },
            { min: 250001, max: 500000, rate: 5 },
            { min: 500001, max: 1000000, rate: 20 },
            { min: 1000001, max: Infinity, rate: 30 }
        ];
    }
}

/**
 * 2. NRI Residential Status (Section 6, IT Act)
 */
const calculateResidentialStatus = (daysInIndia, daysInIndiaPast4Years, isIndianCitizen = true, incomeInIndiaExceeds15L = false) => {
    // Condition A: 182 days or more
    if (daysInIndia >= 182) return 'Resident';
    
    // Condition B: 60 days + 365 days in 4 years
    let limitForConditionB = 60;
    
    // Extension: 182 days for Citizens/PIOs with Indian income < 15L
    if (isIndianCitizen && !incomeInIndiaExceeds15L) {
        limitForConditionB = 182;
    }
    
    // Special Case: 120 days for Citizens/PIOs with Indian income > 15L (Resident but RNOR)
    if (isIndianCitizen && incomeInIndiaExceeds15L && daysInIndia >= 120 && daysInIndiaPast4Years >= 365) {
        return 'Resident but Not Ordinarily Resident (RNOR)';
    }

    if (daysInIndia >= limitForConditionB && daysInIndiaPast4Years >= 365) {
        return 'Resident';
    }
    
    return 'Non-Resident Indian (NRI)';
};

/**
 * 3. Trader Turnover Calculator (ITR-3 Audit Rules)
 */
const calculateTraderTurnover = (trades) => {
    // trades = [{ profit: 100, loss: 50, premium: 200, type: 'futures'|'options' }, ...]
    let absoluteTurnover = 0;
    
    trades.forEach(t => {
        const absDiff = Math.abs(t.profit || 0) + Math.abs(t.loss || 0);
        if (t.type === 'options') {
            // Options: (Abs Profit + Abs Loss) + Premium Received
            absoluteTurnover += absDiff + (t.premium || 0);
        } else {
            // Futures: Abs Profit + Abs Loss
            absoluteTurnover += absDiff;
        }
    });
    
    const needsAudit = absoluteTurnover > 100000000; // 10 Crore for Digital Transactions
    
    return {
        absoluteTurnover,
        needsAudit
    };
};

/**
 * 4. Missed Opportunity Report
 */
const generateMissedOpportunityReport = (income, deductionsInOld, currentRegime = 'old') => {
    const oldTax = calculateTax(income, deductionsInOld, 'old');
    const newTax = calculateTax(income, 0, 'new_25_26');
    
    const diff = oldTax.totalTax - newTax.totalTax;
    const recommendedRegime = diff > 0 ? 'New Regime (FY 25-26)' : 'Old Regime';
    const missedSavings = Math.abs(diff);

    // 80C Opportunity Logic
    const is80CUnderUtilized = deductionsInOld < 150000;
    let potential80CSavings = 0;
    if (is80CUnderUtilized) {
        const full80CTax = calculateTax(income, 150000, 'old');
        potential80CSavings = oldTax.totalTax - full80CTax.totalTax;
    }

    return {
        oldTax: oldTax.totalTax,
        newTax: newTax.totalTax,
        recommendedRegime,
        missedSavings,
        isMissed: (currentRegime === 'old' && diff > 0) || (currentRegime === 'new' && diff < 0),
        is80CUnderUtilized,
        potential80CSavings
    };
};

module.exports = { 
    calculateTax, 
    calculateResidentialStatus,
    calculateTraderTurnover,
    generateMissedOpportunityReport
};
