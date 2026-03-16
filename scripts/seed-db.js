const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Package = require('../models/Package');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/taxfilingguru';

async function seed() {
    try {
        console.log('📡 Attempting to connect to MongoDB...');
        await mongoose.connect(MONGODB_URI, {
            serverSelectionTimeoutMS: 5000,
            connectTimeoutMS: 10000
        });
        console.log('✅ Connected to MongoDB. Seeding all packages with complete FAQs...');

        await Package.deleteMany({});
        console.log('🗑️  Existing packages cleared.');

        const packages = [

            // =========================================================
            // RESIDENT: Individual Packages
            // =========================================================
            {
                slug: 'standard-tax-filing', name: 'Standard Tax Filing', type: 'resident',
                heading: 'Individual Packages', subheading: 'Designed exclusively for Resident Indians',
                shortDescription: 'For Salary Returns & Professionals', price: '499', originalPrice: '999', priceSuffix: '/ Filing',
                discountBadge: '50% OFF',
                features: ['Salary + Other income', 'Form 16 Review', 'Interest & basic gains', 'Deduction Optimization', 'Basic notice support', 'ITR Filing & Confirmation'],
                bestFor: 'Early to mid-career professionals',
                position: 1,
                faqs: [
                    { question: "Who should choose the Standard Tax Filing plan?", answer: "This plan is ideal for salaried individuals with a single employer, earning up to ₹10 Lakh, with simple income sources like FD interest or savings account interest." },
                    { question: "Is Form 16 mandatory for filing?", answer: "Form 16 is not mandatory, but it greatly simplifies the process. We can also file using your salary slips, AIS (Annual Information Statement), and bank statements." },
                    { question: "What deductions can I claim under this plan?", answer: "You can claim 80C (PPF, ELSS, LIC), 80D (health insurance), 80TTA (savings interest), standard deduction, and HRA if applicable." },
                    { question: "How do I submit my documents?", answer: "After booking, you'll receive a secure link to upload documents digitally. Our team will handle the rest — no physical visits needed." },
                    { question: "Will I get an ITR acknowledgement?", answer: "Yes. Once your return is e-filed and e-verified, we share the ITR-V acknowledgement PDF directly with you." }
                ]
            },
            {
                slug: 'business-professional', name: 'Business Professional', type: 'resident',
                heading: 'Individual Packages', subheading: 'Designed exclusively for Resident Indians',
                badge: 'Recommended', badgeClass: 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white',
                shortDescription: 'Multiple income sources', price: '999', originalPrice: '1,999', priceSuffix: '/ Filing',
                discountBadge: '50% OFF',
                features: ['Freelancers & small business', 'Profit & Loss Review', 'Expense & Tax Advisory', 'Advance Tax Calc'],
                bestFor: 'Freelancers',
                position: 2,
                faqs: [
                    { question: "I am a freelancer with multiple clients. Which ITR form should I file?", answer: "Typically ITR-3 or ITR-4 (Presumptive Scheme under 44ADA). Our expert will assess your income and suggest the most beneficial form and scheme." },
                    { question: "Can I deduct business expenses to reduce tax?", answer: "Absolutely. Internet bills, software subscriptions, travel, home office costs, and professional fees are all deductible. We help you identify and optimize every legitimate deduction." },
                    { question: "What is the Presumptive Tax Scheme (44ADA)?", answer: "Under Section 44ADA, professionals with gross receipts up to ₹50 Lakhs can declare 50% of receipts as income, without maintaining detailed books of accounts. This significantly reduces tax burden." },
                    { question: "Do I need to pay advance tax?", answer: "Yes. If your total tax liability exceeds ₹10,000 in a year, you are required to pay Advance Tax in four installments. We calculate and remind you of these deadlines." },
                    { question: "What if my income includes both salary and freelance earnings?", answer: "This plan covers multiple income sources. We file ITR-3, club both income streams, and optimize the overall tax liability using all applicable deductions." }
                ]
            },
            {
                slug: 'premium-tax-package', name: 'Premium Tax Package', type: 'resident',
                heading: 'Individual Packages', subheading: 'Designed exclusively for Resident Indians',
                shortDescription: 'Complex & Foreign', price: '2,499', originalPrice: '4,999', priceSuffix: '/ Filing',
                discountBadge: '50% OFF',
                features: ['Multiple Income Sources', 'Shares, funds & property', 'Tax planning', 'Notice handling'],
                bestFor: 'Complex profiles',
                position: 3,
                faqs: [
                    { question: "What makes this 'Premium' compared to other plans?", answer: "This plan is for complex profiles involving capital gains (shares, mutual funds, property), foreign income, ESOPs, or multiple houses. It includes dedicated CA review and notice handling support." },
                    { question: "Does this cover equity share and mutual fund gains?", answer: "Yes. We compute both Short Term (STCG, taxed at 15%) and Long Term Capital Gains (LTCG, taxed at 10% above ₹1L), including indexation for debt funds and property." },
                    { question: "What happens if I sold a property during the year?", answer: "Property sale triggers capital gains tax. We calculate the gain after indexation, advise on Section 54/54F exemptions, and file ITR-2 or ITR-3 as applicable." },
                    { question: "Is foreign income (like foreign salary or interest) covered?", answer: "Yes. We handle income received abroad, apply DTAA provisions to avoid double taxation, and claim Foreign Tax Credit (Section 90/91) wherever applicable." },
                    { question: "How is notice handling included in this plan?", answer: "If you receive an income tax notice during the filing year, we analyze it, draft an appropriate response, and file it on your behalf at no extra charge within this plan." }
                ]
            },

            // =========================================================
            // RESIDENT: Salary Specialized Plans
            // =========================================================
            {
                slug: 'salary-essential', name: 'Salary Essential', type: 'resident',
                heading: 'Salary Specialized Plans', subheading: 'Expert-led tax filing designed for every career stage.',
                shortDescription: 'Income up to ₹12 Lakh', price: '2,500', priceSuffix: '+ GST', highlight: 'Simple Structure',
                features: ['One or Multiple Employers', 'Form 16, AIS & TIS Review', 'Savings & FD Interest', 'Old vs New Regime Comparison'],
                bestFor: 'Early to mid-career professionals',
                position: 4,
                faqs: [
                    { question: "Is it mandatory to file ITR?", answer: "It is mandatory if your income exceeds ₹2.5 Lakh (Old Regime) or ₹3 Lakh (New Regime). However, filing is recommended even for lower income to tackle future notices, claim refunds, and for loan/visa approvals." },
                    { question: "What documents are required?", answer: "Typically, you need your PAN, Aadhaar, Form 16 (from employer), and bank statements. For capital gains or business income, additional statements like P&L or broker reports are needed." },
                    { question: "How long does it take to get a refund?", answer: "Once filed and verified, refunds usually process within 15-45 days, depending on the Income Tax Department's processing speed." },
                    { question: "Can I switch between Old and New Regime?", answer: "Yes. Salaried individuals can choose the beneficial regime every year. Business owners (non-salaried) can switch once in a lifetime." },
                    { question: "What if I changed jobs during the year?", answer: "We consolidate Form 16 from all employers, correctly report the combined income, and ensure TDS is accurately credited to avoid any excess tax demand." }
                ]
            },
            {
                slug: 'salary-advanced', name: 'Salary Advanced', type: 'resident',
                heading: 'Salary Specialized Plans', subheading: 'Expert-led tax filing designed for every career stage.',
                shortDescription: '₹12 Lakh to ₹25 Lakh', price: '5,000', priceSuffix: '+ GST', highlight: 'Tax Optimisation',
                features: ['One House Property', 'HRA, LTA & 80C/D Optimization', 'Perquisites & Allowances Review', 'ITR Revision Support'],
                bestFor: 'Managers & Job Switchers',
                position: 5,
                faqs: [
                    { question: "Can I claim both HRA and home loan deduction?", answer: "Yes, subject to conditions. If you pay rent in one city and have a home loan on a property in another city (or if the property is under construction), you can claim both HRA exemption and home loan deductions simultaneously." },
                    { question: "What is Leave Travel Allowance (LTA) and how is it claimed?", answer: "LTA covers domestic travel expenses for you and your family during leave. It can be claimed for 2 journeys in a block of 4 years. Only actual travel (train/air fare) is exempt — hotel and food are not covered." },
                    { question: "My employer gave me a car — is it taxable?", answer: "Yes. Company-provided cars are taxable 'perquisites'. The taxable value depends on the car's cubic capacity and whether running expenses are paid by the company or you. We compute this correctly based on your salary slip." },
                    { question: "What is ITR Revision and when can I revise my return?", answer: "If you notice an error after filing, you can revise the return any time before the end of the assessment year (typically March 31st of the following year). Revision support is included in this plan." },
                    { question: "How is income above ₹10 Lakh taxed differently?", answer: "Income above ₹10 Lakh attracts 30% tax slab. However, with 80C, 80D, HRA, home loan interest (Section 24) and NPS (80CCD), effective tax can be substantially reduced. Our experts model the best scenario for you." }
                ]
            },
            {
                slug: 'salary-professional', name: 'Salary Professional', type: 'resident',
                heading: 'Salary Specialized Plans', subheading: 'Expert-led tax filing designed for every career stage.',
                badge: 'POPULAR', badgeClass: 'bg-blue-100 text-blue-700',
                shortDescription: '₹25 Lakh to ₹50 Lakh', price: '10,000', priceSuffix: '+ GST', highlight: 'Complex Structures',
                features: ['ESOPs / RSUs Basic Taxation', 'Capital Gains (Basic)', 'Multiple House Properties', 'Priority Expert Support'],
                bestFor: 'Senior Executives & Directors',
                position: 6,
                faqs: [
                    { question: "How are ESOPs (Employee Stock Options) taxed?", answer: "ESOPs are taxed at two stages: (1) On exercise — the difference between Fair Market Value (FMV) and exercise price is taxed as perquisite/salary income. (2) On sale — capital gains tax applies based on the holding period after exercise." },
                    { question: "I have two houses — which one is self-occupied?", answer: "If you own two houses, you can designate only one as self-occupied (tax-free notional rent). The other becomes 'deemed-to-be-let-out', and you must pay tax on notional annual rent. However, you can claim full interest deduction on both home loans." },
                    { question: "What is the surcharge on high income?", answer: "A surcharge is levied on income above ₹50 Lakh: 10% for ₹50L-1Cr, 15% for ₹1Cr-2Cr, and 25%/37% for higher slabs. Marginal relief provisions apply to avoid cliff-edge taxation, which we handle carefully." },
                    { question: "What is Priority Expert Support?", answer: "You get a dedicated tax expert who can be reached via WhatsApp and email with faster response times (within 4 hours on working days), ensuring senior-level attention to your complex case." },
                    { question: "Can I claim deduction on principal repayment of home loan for two homes?", answer: "Section 80C allows deduction on principal repayment for all self-occupied and let-out properties, but the total 80C limit is capped at ₹1.5 Lakh across all investments." }
                ]
            },
            {
                slug: 'salary-elite-hni', name: 'Salary Elite (HNI)', type: 'resident',
                heading: 'Salary Specialized Plans', subheading: 'Expert-led tax filing designed for every career stage.',
                shortDescription: 'Above ₹50 Lakh', price: '20,000 – ₹30,000', priceSuffix: '+ GST', highlight: 'HNI Concierge',
                features: ['Complex ESOPs & Stock Comp', 'Scrutiny-ready Computation', 'Dedicated CA Handling', 'Foreign Income Basic Review'],
                bestFor: 'CXOs & Top Executives',
                position: 7,
                faqs: [
                    { question: "What does 'Scrutiny-ready' computation mean?", answer: "We prepare detailed workings, reconciliations, and supporting schedules that can be presented to the Income Tax Department if your return is picked up for scrutiny (Section 143(2)). It means your numbers are defensible and documented." },
                    { question: "How are Complex ESOPs and RSUs handled?", answer: "For listed Indian companies, we handle perquisite valuation, TDS tracking, Form 12BA reconciliation, and subsequent capital gains computation on vesting and sale. For US listed stocks (RSUs from MNCs), we also handle the foreign asset reporting in Schedule FA." },
                    { question: "What is Schedule FA (Foreign Assets)?", answer: "If you hold foreign stocks, bank balances, or other assets, the Income Tax Act requires mandatory disclosure in Schedule FA. Non-disclosure attracts penalties up to ₹10 Lakh under Black Money Act." },
                    { question: "What does my Dedicated CA do?", answer: "Your assigned Chartered Accountant personally reviews all income sources, conducts a pre-filing review call, finalizes the computation, files the return, and remains available for queries throughout the year." },
                    { question: "Do I need tax planning beyond filing?", answer: "At this income level, proactive tax planning (advance tax, investment decisions, salary restructuring, NPS contributions) can save lakhs. This plan includes a pre-filing advisory session to optimize your tax position for the coming year too." }
                ]
            },

            // =========================================================
            // RESIDENT: Specialized & Business Services
            // =========================================================
            {
                slug: 'capital-gains', name: 'Capital Gains', type: 'resident',
                heading: 'Specialized & Business Services', subheading: 'Comprehensive tax solutions for investors and entrepreneurs.',
                shortDescription: 'Shares, Funds & Property', price: 'Custom', priceSuffix: '+ GST', highlight: 'Asset Analysis',
                features: ['STCG & LTCG Calculation', 'Broker Statement & AIS Review', 'Loss Set-off & Carry-forward', 'Tax Optimization Advisory'],
                bestFor: 'Active Investors',
                position: 8,
                faqs: [
                    { question: "What is the difference between STCG and LTCG?", answer: "Short Term Capital Gains (STCG): assets held for less than 12 months for equities (or 24-36 months for others). STCG on equities is taxed at 15%. Long Term Capital Gains (LTCG) on equities above ₹1 Lakh per year is taxed at 10% (without indexation)." },
                    { question: "Can I set off capital losses?", answer: "Yes. Short-term capital losses can be set off against both STCG and LTCG. Long-term capital losses can only be set off against LTCG. Unadjusted losses can be carried forward for 8 years." },
                    { question: "My broker gives a P&L statement — is that enough?", answer: "It's a good starting point, but it may not reflect AIS data or demat transfers correctly. We reconcile your broker P&L with the AIS to ensure 100% accuracy and avoid any mismatch notices." },
                    { question: "How is property (house/land) sale taxed?", answer: "Gain on property held for more than 24 months is LTCG, taxed at 20% with indexation benefit. Exemptions under Section 54 (buy another house) or 54EC (invest in bonds) can significantly reduce or eliminate this tax." },
                    { question: "What about F&O (Futures & Options) trading losses?", answer: "F&O is treated as 'Business Income', not capital gains. Losses from F&O can be set off against other business income and carried forward for 8 years, but a tax audit may be required if turnover exceeds specified limits." }
                ]
            },
            {
                slug: 'freelancer-gig', name: 'Freelancer / Gig', type: 'resident',
                heading: 'Specialized & Business Services', subheading: 'Comprehensive tax solutions for investors and entrepreneurs.',
                shortDescription: 'Professionals & Consultants', price: 'Custom', priceSuffix: '+ GST', highlight: 'Presumptive Taxation',
                features: ['44ADA / 44AD Filing', 'Expense Optimization', 'Advance Tax Guidance', 'Compliance Check'],
                bestFor: 'Self-employed Pros',
                position: 9,
                faqs: [
                    { question: "I receive payments from international clients (Upwork, Fiverr). How is that taxed?", answer: "Foreign client payments (in USD/EUR/GBP) received in India are taxable as business income. They may qualify for export-of-services benefits and GST zero-rating. We handle the full income declaration and foreign exchange reporting." },
                    { question: "Should I register for GST as a freelancer?", answer: "If your yearly receipts exceed ₹20 Lakhs (₹10 Lakhs for special category states), GST registration is mandatory. For export of services, you can file with zero-rated GST and claim refunds of input tax credit." },
                    { question: "What expenses can I deduct as a freelancer?", answer: "Laptop, software subscriptions (Adobe, GitHub, etc.), internet bills, home office rent (proportionate), travel for client meetings, professional development courses, and even phone bills (proportionate) are deductible." },
                    { question: "Do I need to maintain books of accounts?", answer: "Under Section 44ADA (Presumptive scheme for professionals), if gross receipts are below ₹50 Lakh, you declare 50% as income and don't need to maintain detailed books. We assess which route — actual vs presumptive — is more beneficial." },
                    { question: "What is the deadline for a gig worker to pay advance tax?", answer: "Advance tax must be paid in installments: 15% by June 15, 45% by Sept 15, 75% by Dec 15, and 100% by March 15. Missing these attracts 1% per month interest under Sections 234B and 234C." }
                ]
            },
            {
                slug: 'business-owner', name: 'Business Owner', type: 'resident',
                heading: 'Specialized & Business Services', subheading: 'Comprehensive tax solutions for investors and entrepreneurs.',
                shortDescription: 'Proprietors & Small Biz', price: 'Custom', priceSuffix: '+ GST', highlight: 'Full Compliance',
                features: ['P&L and Balance Sheet', 'Depreciation Treatment', 'Audit Applicability Check', 'CA Review & Filing'],
                bestFor: 'Traders & Shop Owners',
                position: 10,
                faqs: [
                    { question: "Is a tax audit mandatory for my business?", answer: "A tax audit (Section 44AB) is mandatory if your business turnover exceeds ₹1 Crore (₹10 Crore if cash transactions are below 5%). For professionals, the limit is ₹50 Lakh. We check applicability and manage the audit if required." },
                    { question: "What is depreciation and how does it reduce tax?", answer: "Depreciation allows you to deduct the cost of business assets (machinery, computers, vehicles) over their useful life. This reduces your taxable profit and hence your tax liability. We apply the correct WDV (Written Down Value) method as per IT Act." },
                    { question: "Can I include my home loan interest as a business expense?", answer: "If you work from home, a proportionate part of home loan interest and rent can be claimed as business expenses. We ensure this is done correctly with proper documentation to withstand scrutiny." },
                    { question: "What is ITR-3 vs ITR-4?", answer: "ITR-4 (Sugam) is for presumptive income businesses (Section 44AD). ITR-3 is for businesses with actual income/expense accounting. We assess which is more tax-efficient and file accordingly." },
                    { question: "I have losses in my business this year. Should I still file?", answer: "Absolutely. Filing a return is essential to carry forward business losses. These losses can be set off against future profits for up to 8 years, saving significant tax in profitable years." }
                ]
            },
            {
                slug: 'nri-tax-package', name: 'NRI Tax Package', type: 'resident',
                heading: 'Specialized & Business Services', subheading: 'Comprehensive tax solutions for investors and entrepreneurs.',
                shortDescription: 'Global & Indian Income', price: 'Custom', priceSuffix: '+ GST', highlight: 'Cross-Border Support',
                features: ['DTAA & Foreign Tax Credit', 'Residential Status Determination', 'NRE/NRO Interest Treatment', 'Repatriation Advisory'],
                bestFor: 'NRIs & Returning Indians',
                position: 11,
                faqs: [
                    { question: "How is residential status determined for tax purposes?", answer: "Residential status (Resident / NRI / RNOR) depends on the number of days you spend in India in a financial year. This is critical because Residents are taxed on global income, while NRIs are only taxed on India-sourced income." },
                    { question: "Is NRE account interest taxable in India?", answer: "No. Interest earned on NRE (Non-Resident External) accounts is fully exempt from Indian income tax as long as you maintain NRI status. However, NRO account interest IS taxable and subject to 30% TDS." },
                    { question: "What is a Permanent Establishment (PE) risk?", answer: "If an NRI is working from India for extended periods for a foreign employer, it can create a Permanent Establishment risk for the employer and tax implications for the individual. We assess and advise on PE exposure." },
                    { question: "Can I transfer money from NRO to NRE account?", answer: "Yes. Under the Liberalised Remittance Scheme (LRS), you can repatriate up to USD 1 Million per year from NRO to NRE/foreign accounts after obtaining Form 15CA/CB from us (CA certification required)." },
                    { question: "I am returning to India permanently. What changes?", answer: "On return, your status changes from NRI to Resident (and possibly RNOR for 2-3 years). Global income becomes taxable in India from the Resident year. We plan the transition to minimize tax impact of this status change." }
                ]
            },

            // =========================================================
            // NRI: NRI Tax Filing Packages
            // =========================================================
            {
                slug: 'basic-nri-filing', name: 'Basic NRI Filing', type: 'nri',
                heading: 'NRI Tax Filing Packages', subheading: 'Designed exclusively for Non-Resident Indians',
                shortDescription: 'Simple Indian income only', price: '1,999 – ₹3,499', priceSuffix: 'per filing',
                features: ['Indian income tax calculation', 'Guided online document upload', 'Auto-fill ITR generation', 'Basic DTAA checklist'],
                position: 1,
                faqs: [
                    { question: "Do NRIs need to file ITR in India?", answer: "Yes, if your income accrued or received in India exceeds the basic exemption limit (₹2.5L). This includes rental income, interest from NRO accounts, or capital gains from Indian assets." },
                    { question: "What is DTAA benefit?", answer: "Double Taxation Avoidance Agreement (DTAA) prevents you from paying tax on the same income in both India and your country of residence. We help you claim this relief by applying treaty provisions correctly." },
                    { question: "Can I repatriate funds abroad?", answer: "Yes, NRIs can repatriate funds from NRO to NRE/Foreign accounts up to USD 1 Million per financial year by submitting Form 15CA/CB, which we assist with as part of our NRI services." },
                    { question: "Is Aadhaar mandatory for NRIs?", answer: "Aadhaar is not mandatory for NRIs for tax filing. PAN is essential, and an Aadhaar (if available) can be linked, but the absence of Aadhaar does not prevent you from filing your ITR." },
                    { question: "Can I e-verify my return from abroad?", answer: "Yes. NRIs can e-verify using their Indian bank account (Net Banking EVC), Aadhaar OTP (if Indian mobile linked), or by sending a signed ITR-V to CPC, Bengaluru via ordinary post within 120 days." }
                ]
            },
            {
                slug: 'standard-nri-filing', name: 'Standard NRI Filing', type: 'nri',
                heading: 'NRI Tax Filing Packages', subheading: 'Designed exclusively for Non-Resident Indians',
                badge: 'Popular', badgeClass: 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white',
                shortDescription: 'Indian + simple foreign income', price: '4,499 – ₹6,499', priceSuffix: 'per filing',
                features: ['All Basic NRI features', 'Expert CA review & filing', 'Foreign income reporting with DTAA', 'E-verification support from abroad', 'Email & WhatsApp support'],
                position: 2,
                faqs: [
                    { question: "What foreign income needs to be disclosed in India?", answer: "If you are taxed as a Resident in India (not NRI), you must disclose worldwide income. As an NRI, you disclose India-source income only. However, foreign assets must be reported in Schedule FA if you are a Resident." },
                    { question: "How does DTAA work for my salary earned abroad?", answer: "Your salary earned and taxed abroad is generally not re-taxable in India if you are an NRI. However, we verify your residential status calculation (days in India) first to ensure you are correctly classified as NRI before proceeding." },
                    { question: "I have rental income from a house in India. How is it taxed?", answer: "Rental income from Indian property is taxable in India for NRIs. The tenant is required to deduct 30% TDS. You can claim standard deduction of 30% on net rent, property tax, and home loan interest against this income." },
                    { question: "What is 'E-verification support from abroad' in this plan?", answer: "Our team guides you step-by-step through the e-verification process using your bank's Net Banking EVC or Aadhaar OTP, even if you are based overseas — so you don't need to rely on posting the ITR-V to India." },
                    { question: "Can I claim deduction on home loan for an Indian property?", answer: "Yes. NRIs can claim Section 24(b) deduction on home loan interest (up to ₹2 Lakh for self-occupied property). The principal repayment under 80C is also deductible, subject to the ₹1.5 Lakh cap." }
                ]
            },
            {
                slug: 'advanced-nri-tax-solution', name: 'Advanced NRI Tax Solution', type: 'nri',
                heading: 'NRI Tax Filing Packages', subheading: 'Designed exclusively for Non-Resident Indians',
                shortDescription: 'Capital gains & multiple incomes', price: '7,499 – ₹9,999', priceSuffix: 'per filing',
                features: ['Capital gains (shares & property)', 'Detailed tax optimization', 'DTAA benefit maximization', 'Dedicated CA manager', 'Priority chat & call support'],
                position: 3,
                faqs: [
                    { question: "How are capital gains from Indian property taxed for NRIs?", answer: "capital gains on Indian property for NRIs are taxed at 20% (LTCG, after indexation, for property held > 24 months). The buyer must deduct 20% TDS before paying you. Exemptions under Section 54/54EC apply if you reinvest in another property or capital gain bonds." },
                    { question: "I sold Indian mutual funds. How is the tax calculated?", answer: "Equity mutual fund LTCG (> 12 months holding) above ₹1 Lakh is taxed at 10%. STCG is taxed at 15%. Debt mutual funds (post-March 2023) are taxed at slab rates. TDS is deducted at source for NRIs at 20% / 30% on gains." },
                    { question: "What is DTAA benefit maximization?", answer: "Beyond basic treaty application, we analyze which country's tax credit mechanism (exemption vs credit method) gives you the best overall tax outcome across both India and your country of residence, and structure the claim accordingly." },
                    { question: "How does my Dedicated CA Manager help?", answer: "Your CA manager is a named expert assigned to your case who reviews all documents, conducts a video call to understand your full financial picture, and files the return. They remain contactable via WhatsApp and email throughout the year." },
                    { question: "I have losses in Indian stocks. Can I set them off?", answer: "Yes. Short-term capital losses from Indian stocks can offset STCG and LTCG. Long-term losses can only be offset against LTCG. These losses can also be carried forward for 8 years if the return is filed on time." }
                ]
            },

            // =========================================================
            // GLOBAL/SHARED: Exclusive Packages
            // =========================================================
            {
                slug: 'nri-resident-combo', name: 'NRI + Resident Combo', type: 'global',
                heading: 'Exclusive Packages', subheading: 'Tailored solutions for families and global citizens',
                badge: 'Most Popular', badgeClass: 'bg-yellow-400 text-yellow-900',
                shortDescription: 'Comprehensive solution for mixed-residency families.', price: '12,000', priceSuffix: '+ GST', highlight: 'Combined Fee',
                features: ['NRI + Two Resident Filing', 'Dedicated CA Connection', 'DTAA & Foreign Income Expertise'],
                position: 1,
                faqs: [
                    { question: "Who is this combo pack ideal for?", answer: "This is perfect for families where one or two members live abroad (NRI status) and other family members are resident Indians. You get one team handling all filings cohesively." },
                    { question: "How do DTAA provisions help the NRI in the family?", answer: "We apply treaty provisions between India and the country where the NRI resides to prevent double taxation on India-source income like rent, interest, or dividends." },
                    { question: "Is the pricing fixed or variable for NRI in this plan?", answer: "The combo pricing covers one NRI filing (Standard level complexity) and up to two Resident filings (salary or basic business). Complex NRI cases with multiple properties or large capital gains may attract a small add-on." },
                    { question: "Can we coordinate documents from two different countries?", answer: "Absolutely. We have a streamlined digital document collection process. Each family member gets a personal secure upload link, and our team coordinates across all submissions seamlessly." },
                    { question: "Do we need to file jointly or separately?", answer: "India does not have joint filing like the US. Each person files a separate ITR. However, having one CA team handle all ensures optimal intra-family tax planning (e.g., shifting income to lower-taxed family members where legally permissible)." }
                ]
            },
            {
                slug: 'complete-family-pack', name: 'Complete Family Pack', type: 'global',
                heading: 'Exclusive Packages', subheading: 'Tailored solutions for families and global citizens',
                badge: 'Best Value', badgeClass: 'bg-indigo-100 text-indigo-800',
                shortDescription: "Secure your entire family's finances. Covers up to 5 members.", price: '15,000', priceSuffix: '+ GST', highlight: 'Family Fee',
                features: ["Filing for upto 5 Family Members", 'Video Conference Support', 'Capital Gains & Tax Planning'],
                position: 2,
                faqs: [
                    { question: "Who counts as a 'family member' in this plan?", answer: "Spouse, children, parents, and siblings can be included — up to 5 PAN holders. Each person's ITR is filed separately by our team as part of the combined family plan." },
                    { question: "What if one family member has complex income?", answer: "The family pack covers standard complexity for each member (salary, interest, basic capital gains). If one member has very complex income (like large property sales, ESOPs, or foreign income), a small top-up fee may apply for that specific member." },
                    { question: "What is Video Conference Support?", answer: "We schedule a family video call (30-45 mins) with your dedicated CA before filing begins. This helps us understand all members' financial situations holistically and advise on income/investment splitting strategies." },
                    { question: "Can I add tax planning for the next year as part of this?", answer: "We include a brief post-filing advisory session as part of the video call where we highlight tax-saving opportunities for the upcoming year — like investments needed, advance tax planning, and family income structuring." },
                    { question: "How much does the family pack save compared to individual filings?", answer: "Filing individually, 5 members could cost ₹2,500–5,000 each = ₹12,500–25,000. The Family Pack at ₹15,000 provides better value, a dedicated CA for coordination, and the added benefit of holistic family tax planning." }
                ]
            },

            // =========================================================
            // GLOBAL/SHARED: Additional Services
            // =========================================================
            {
                slug: 'gst-registration', name: 'GST Registration', type: 'global',
                heading: 'Additional Services', subheading: 'Everything you need for full tax compliance',
                shortDescription: 'New business setup', price: '1,999', priceSuffix: '+ GST', highlight: 'New business setup',
                features: ['GST Registration Application', 'Expert consultation', 'Document verification'],
                position: 1,
                faqs: [
                    { question: "When is GST registration mandatory?", answer: "Mandatory if your aggregate annual turnover exceeds ₹40 Lakh (for goods) or ₹20 Lakh (for services). Special category states have a lower threshold of ₹10 Lakh. Inter-state supply or e-commerce selling also triggers mandatory registration regardless of turnover." },
                    { question: "What documents are needed for GST registration?", answer: "PAN of the business/owner, Aadhaar of proprietor/partners/directors, proof of business address (electricity bill/rent agreement), bank account details, and a photograph of the owner/directors." },
                    { question: "How long does GST registration take?", answer: "The GST portal typically processes applications within 3-7 working days if all documents are correct and no additional queries are raised. We ensure the first-time submission is complete to avoid delays." },
                    { question: "Can I voluntarily register for GST below the threshold?", answer: "Yes, voluntary registration is allowed and sometimes beneficial — it makes your business look more professional to B2B clients and lets you claim Input Tax Credit on your purchases." },
                    { question: "What is the GSTIN and what can I do with it?", answer: "GSTIN is your 15-digit unique GST Identification Number. With it, you can issue GST-compliant invoices, file monthly/quarterly returns, claim ITC on business purchases, and participate in government tenders that require GST registration." }
                ]
            },
            {
                slug: 'gst-return-filing', name: 'GST Return Filing', type: 'global',
                heading: 'Additional Services', subheading: 'Everything you need for full tax compliance',
                shortDescription: 'Monthly compliance', price: '999', priceSuffix: '+ GST / month', highlight: 'Monthly compliance',
                features: ['GST Return preparation', 'GSTR-1 & GSTR-3B filing', 'ITC Reconciliation'],
                position: 2,
                faqs: [
                    { question: "What is the difference between GSTR-1 and GSTR-3B?", answer: "GSTR-1 is the outward supply return (your sales invoices) filed monthly/quarterly. GSTR-3B is the summary return with net tax liability where you pay the balance GST after adjusting ITC. Both must be filed, even if there are zero transactions." },
                    { question: "What is the penalty for late GST return filing?", answer: "A late fee of ₹50/day (₹25 CGST + ₹25 SGST) applies for late GSTR-3B, capped at ₹5,000. For nil returns, the late fee is ₹20/day. Interest at 18% per annum applies on outstanding tax liability." },
                    { question: "Can I claim Input Tax Credit (ITC) on all business purchases?", answer: "ITC is claimable on business-related purchases where the supplier has filed their return and the invoice appears in your GSTR-2B. Purchases for personal use, exempt supplies, or blocked credits (like motor vehicles for non-transport businesses) are not eligible." },
                    { question: "What is ITC Reconciliation?", answer: "We match your purchase invoices against the supplier-reported data in GSTR-2B to identify mismatches, missing credits, or unclaimed ITC. This prevents money from being left on the table and avoids notices from the GST department." },
                    { question: "I have a seasonal business with zero sales some months. Do I still need to file?", answer: "Yes. Filing Nil returns is mandatory for every period you are registered, even if you have no transactions. Missing nil returns still attracts late fees." }
                ]
            },
            {
                slug: 'tds-return-filing', name: 'TDS Return Filing', type: 'global',
                heading: 'Additional Services', subheading: 'Everything you need for full tax compliance',
                shortDescription: 'Quarterly filing', price: '1,499', priceSuffix: '+ GST', highlight: 'Quarterly filing',
                features: ['TDS computation', 'Quarterly return filing', 'Form 16/16A generation'],
                position: 3,
                faqs: [
                    { question: "Who is required to deduct TDS?", answer: "Any business (company, firm, proprietorship eligible for tax audit) making payments like salary, rent (above ₹50,000/month), professional fees, contractor payments, etc. must deduct TDS before making the payment." },
                    { question: "What are the TDS return deadlines?", answer: "TDS returns (Form 24Q for salary, 26Q for non-salary) are due quarterly: Q1 July 31, Q2 October 31, Q3 January 31, Q4 May 31. Late filing attracts fees of ₹200/day under Section 234E." },
                    { question: "What is Form 16 and who receives it?", answer: "Form 16 is the TDS certificate issued by an employer to employees after year-end. Part A shows TDS deposited, Part B shows salary details and deductions. We generate both parts after the annual return is filed." },
                    { question: "What is Form 16A?", answer: "Form 16A is the TDS certificate for non-salary payments (professional fees, rent, interest). It is generated quarterly and must be issued to the payee within 15 days of the quarterly filing due date." },
                    { question: "What happens if I don't deposit TDS on time?", answer: "Non-deduction: 100% penalty. Late deduction: 1% per month interest. Late deposit after deduction: 1.5% per month interest. Additionally, disallowance of the related expense when computing your business income." }
                ]
            },
            {
                slug: 'notice-handling', name: 'Notice Handling', type: 'global',
                heading: 'Additional Services', subheading: 'Everything you need for full tax compliance',
                shortDescription: 'Expert reply to tax notices', price: '2,999', priceSuffix: '+ GST', highlight: 'Expert Reply',
                features: ['Notice Analysis', 'Response Drafting', 'Expert Representation', 'Rectification Requests'],
                position: 4,
                faqs: [
                    { question: "Why did I get a tax notice?", answer: "Common reasons include: mismatch between your ITR and Form 26AS/AIS (e.g., interest income not reported), non-filing of ITR, high-value transactions flagged by the department, or a random scrutiny selection. Most notices are resolved online." },
                    { question: "Do I need to visit the Income Tax office?", answer: "No. The entire process under 'Faceless Assessment' is handled online. We draft the response, upload supporting documents on the e-filing portal, and submit it — all without you needing to visit any office." },
                    { question: "What if there is an incorrect demand in the notice?", answer: "We file a Rectification Request under Section 154 to correct arithmetical mistakes or errors apparent from record. If the demand is disputed, we file a formal Appeal before the Commissioner of Income Tax (Appeals)." },
                    { question: "How quickly must I respond to a notice?", answer: "The notice will specify a deadline (usually 30 days from issue). Ignoring it can lead to ex-parte assessment (the department decides without your input), penalties, and coercive recovery. Always respond promptly." },
                    { question: "What types of notices do you handle?", answer: "We handle notices under Section 142(1) (inquiry), 143(1) (intimation / demand), 143(2) (scrutiny), 148 (income escaping assessment), 156 (demand notice), 245 (refund adjustment), and many more." }
                ]
            },

            // =========================================================
            // GLOBAL-SERVICES (Specialized / Consultation)
            // =========================================================
            {
                slug: 'TaxNotice', name: 'Tax Notice', type: 'global-services',
                heading: 'Specialized Services', subheading: 'Expert Handling of Tax Notices',
                shortDescription: 'Expert assistance in drafting and filing responses to Income Tax Notices.', price: '1,499', position: 1,
                features: ['Notice Analysis', 'Response Drafting', 'Rectification Requests', 'Expert Representation'],
                icon: '<svg class="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 3v4a1 1 0 001 1h4"></path></svg>',
                faqs: [
                    { question: "Why did I get a tax notice?", answer: "Notices can be for data mismatch (Section 143(1)), non-filing, or high-value transactions. Do not ignore it; most can be resolved with a simple online response." },
                    { question: "Do I need to visit the tax office?", answer: "No. The entire process is now 'Faceless'. We draft and file the response online on your behalf." },
                    { question: "What if the demand is incorrect?", answer: "We can file a rectification request or an appeal to correct the demand if the assessing officer has made an error." }
                ]
            },
            {
                slug: 'AdvanceTaxCalculation', name: 'Advance Tax Calculation', type: 'global-services',
                heading: 'Specialized Services', subheading: 'Timely Tax Planning',
                shortDescription: 'Accurate calculation and timely planning of your advance tax liabilities to avoid interest under section 234B/C.', price: '2,499', position: 2,
                features: ['Quarterly Liability Estimation', 'Challan Generation Support', 'Interest Saving Strategies', 'Detailed Report'],
                icon: '<svg class="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>',
                faqs: [
                    { question: "Who needs to pay Advance Tax?", answer: "If your tax liability for the year exceeds ₹10,000, you are required to pay Advance Tax in quarterly installments (15%, 45%, 75%, 100%)." },
                    { question: "What happens if I miss a deadline?", answer: "Missing deadlines attracts interest under Section 234B and 234C of the Income Tax Act. Our service helps you calculate and pay on time to save this interest." },
                    { question: "Can I pay all at once?", answer: "Yes, but paying after the deadlines will still incur interest for the deferred period." }
                ]
            },
            {
                slug: 'GSTCompliance', name: 'GST Compliance', type: 'global-services',
                heading: 'Specialized Services', subheading: 'Full Business Compliance',
                shortDescription: 'End-to-end GST support for freelancers and small businesses including registration and monthly returns.', price: '1,299', priceSuffix: '/ Month', position: 3,
                features: ['GST Registration', 'GSTR-1 & GSTR-3B Filing', 'Input Tax Credit Reconciliation', 'LUT Filing for Exports'],
                icon: '<svg class="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>',
                faqs: [
                    { question: "When is GST registration mandatory?", answer: "If your turnover exceeds ₹20 Lakhs (Service) or ₹40 Lakhs (Goods), or if you sell across state lines (Inter-state), GST registration is mandatory." },
                    { question: "Do I need to file nil returns?", answer: "Yes, even if you have no business transaction in a month, filing a Nil GSTR-1 and GSTR-3B is mandatory to avoid late fees." },
                    { question: "Can I claim Input Tax Credit (ITC)?", answer: "Yes, you can claim ITC on business purchases if your vendor has filed their return. We reconcile this for you to ensure you don't lose money." }
                ]
            },
            {
                slug: 'TaxConsultation', name: 'Tax Consultation', type: 'global-services',
                heading: 'Specialized Services', subheading: 'Expert Advice',
                shortDescription: 'Book a one-on-one session with our experts for complex tax planning and advice.', price: '1,499', position: 4,
                features: ['30 Mins Expert Call', '1:1 Video Session', 'Case Analysis', 'Actionable Advice'],
                icon: '<svg class="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>',
                faqs: [
                    { question: "What can I discuss in the 30-minute session?", answer: "You can ask about tax planning, notice responses, NRI obligations, capital gains, business income, advance tax, or any specific tax query troubling you." },
                    { question: "How do I prepare for the consultation?", answer: "Share your rough income details, any pending notices, or specific questions beforehand so our expert can do preliminary research and make the 30 minutes highly actionable." },
                    { question: "Will I get a written summary of the advice?", answer: "Yes. After the session, our expert sends you a concise email summary of the key points discussed and the recommended action steps." }
                ]
            },
            {
                slug: 'video-consultation-45', name: '45 Mins Video Consultation', type: 'global-services',
                heading: 'Specialized Services', subheading: 'Expert Video Session',
                shortDescription: 'Expert one-on-one session via video call for 45 minutes.', price: '499', position: 5,
                features: ['45 Mins Expert Video Call', 'Case Analysis', 'DTAA Basics', 'Email Summary'],
                icon: '<svg class="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>',
                faqs: [
                    { question: "Is this consultation enough for my DTAA query?", answer: "For most DTAA questions (claiming relief, understanding which country to pay tax in, NRE/NRO treatment), 45 minutes is sufficient to get clear, actionable answers." },
                    { question: "Can I reschedule the call?", answer: "Yes. You can reschedule up to 2 hours before the appointment. Cancellations with less than 2 hours notice are not refundable." },
                    { question: "What platform is the call on?", answer: "We use Google Meet or Zoom (your preference). A calendar invite with the link is sent to your email after booking." }
                ]
            },
            {
                slug: 'video-consultation-90', name: '90 Mins Video Consultation', type: 'global-services',
                heading: 'Specialized Services', subheading: 'Expert Video Session',
                shortDescription: 'In-depth tax planning and complex case analysis for 90 minutes.', price: '699', position: 6,
                features: ['90 Mins Expert Video Call', 'Detailed Case Review', 'Full Report', 'Follow-up Email'],
                icon: '<svg class="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>',
                faqs: [
                    { question: "When should I book the 90-minute session instead of 45 minutes?", answer: "Choose 90 minutes if you have a complex case: NRI returning to India, ESOPs & RSUs, property sale, business restructuring, large capital gains, or a combination of multiple complex issues." },
                    { question: "What is included in the 'Full Report'?", answer: "After the session, we prepare a detailed PDF report covering your case summary, tax computation illustration, recommended action plan, and key compliance deadlines — sent within 2-3 working days." },
                    { question: "Can I bring a family member to the call?", answer: "Yes, you can include a spouse or parent in the call, especially for family tax planning discussions. The session is for one case/family unit." }
                ]
            },
            {
                slug: 'FreeConsultation', name: 'Free Consultation', type: 'global-services',
                heading: 'Specialized Services', subheading: '15 Mins Expert Call',
                shortDescription: 'Free 15-minute consultation to understand your tax requirements.', price: '0', priceSuffix: 'Free', position: 7,
                features: ['15 Mins Expert Call', 'Basic Assessment', 'Next Steps Guidance', 'Zero Cost'],
                icon: '<svg class="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>',
                faqs: [
                    { question: "What can I expect in 15 minutes?", answer: "Our expert will understand your profile (salaried/NRI/business), confirm which service is right for you, and tell you exactly what documents to keep ready. It's a quick, no-obligation assessment call." },
                    { question: "Is the free consultation really free?", answer: "Yes, completely free. No credit card required, no obligation to purchase. Book a slot, join the call, and decide if you'd like to proceed — only on your terms." },
                    { question: "How do I book a free consultation?", answer: "Click 'Get Started', fill in your name, email, and preferred time. Our team will confirm the slot via WhatsApp or email within a few hours." }
                ]
            }
        ];

        await Package.insertMany(packages);
        console.log(`✅ Successfully seeded ALL ${packages.length} packages with complete FAQs.`);

        process.exit();
    } catch (err) {
        console.error('❌ Seeding Error:', err);
        process.exit(1);
    }
}

seed();
