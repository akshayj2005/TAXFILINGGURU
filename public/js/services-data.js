const servicesData = {
    "AdvanceTaxCalculation": {
        name: "Advance Tax Calculation",
        rate: "₹ 2,499",
        description: "Accurate calculation and timely planning of your advance tax liabilities to avoid interest under section 234B/C.",
        features: [
            "Quarterly Liability Estimation",
            "Challan Generation Support",
            "Interest Saving Strategies",
            "Detailed Report"
        ],
        icon: `<svg class="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`
    },
    "TaxConsultation": {
        name: "Tax Consultation",
        rate: "₹ 999",
        description: "One-on-one consultation with our tax experts to resolve your specific queries and optimize your tax planning.",
        features: [
            "30-Minute Video Call",
            "Personalized Tax Simplification",
            "Investment Proof Review",
            "Notice Discussion"
        ],
        icon: `<svg class="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>`
    },
    "GSTCompliance": {
        name: "GST Compliance",
        rate: "₹ 1,299 / Month",
        description: "End-to-end GST support for freelancers and small businesses including registration and monthly returns.",
        features: [
            "GST Registration",
            "GSTR-1 & GSTR-3B Filing",
            "Input Tax Credit Reconciliation",
            "LUT Filing for Exports"
        ],
        icon: `<svg class="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`
    },
    "TaxNotice": {
        name: "Tax Notice",
        rate: "₹ 1,499",
        description: "Expert assistance in drafting and filing responses to Income Tax Notices.",
        features: [
            "Notice Analysis",
            "Response Drafting",
            "Rectification Requests",
            "Expert Representation"
        ],
        icon: `<svg class="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 3v4a1 1 0 001 1h4"></path></svg>`
    }
};

const faqData = {
    // DEFAULT / RESIDENT
    "resident": [
        { q: "Is it mandatory to file ITR?", a: "It is mandatory if your income exceeds ₹2.5 Lakh (Old Regime) or ₹3 Lakh (New Regime). However, filing is recommended even for lower income to tackle future notices, claim refunds, and for loan/visa approvals." },
        { q: "What documents are required?", a: "Typically, you need your PAN, Aadhaar, Form 16 (from employer), and bank statements. For capital gains or business income, additional statements like P&L or broker reports are needed." },
        { q: "How long does it take to get a refund?", a: "Once filed and verified, refunds usually process within 15-45 days, depending on the Income Tax Department's processing speed." },
        { q: "Can I switch between Old and New Regime?", a: "Yes. Salaried individuals can choose the beneficial regime every year. Business owners (non-salaried) can switch once in a lifetime." }
    ],
    // NRI
    "nri": [
        { q: "Do NRIs need to file ITR in India?", a: "Yes, if your income accrued or received in India exceeds the basic exemption limit (₹2.5L). This includes rental income, interest, or capital gains." },
        { q: "What is DTAA benefit?", a: "Double Taxation Avoidance Agreement (DTAA) prevents you from paying tax on the same income in both India and your country of residence. We help you claim this relief." },
        { q: "Can I repatriate my funds abroad?", a: "Yes, NRIs can repatriate funds (NRO to NRE/Foreign Account) up to $1 Million USD per financial year by submitting Form 15CA/CB, which we assist with." },
        { q: "Is Aadhaar mandatory for NRIs?", a: "Aadhaar is not mandatory for NRIs, but PAN is essential for filing taxes." }
    ],
    // SERVICES
    "AdvanceTaxCalculation": [
        { q: "Who needs to pay Advance Tax?", a: "If your tax liability for the year exceeds ₹10,000, you are required to pay Advance Tax in quarterly installments (15%, 45%, 75%, 100%)." },
        { q: "What happens if I miss a deadline?", a: "Missing deadlines attracts interest under Section 234B and 234C of the Income Tax Act. Our service helps you calculate and pay on time to save this interest." },
        { q: "Can I pay all at once?", a: "Yes, but paying after the deadlines will still incur interest for the deferred period." }
    ],
    "TaxConsultation": [
        { q: "How does the consultation work?", a: "You can book a 30-minute video slot. Our expert will review your specific case, answer queries, and provide a written summary of the advice." },
        { q: "Can you help with tax planning?", a: "Absolutely. We analyze your investments and expenses to suggest legal ways to minimize your tax liability for the current and future years." }
    ],
    "GSTCompliance": [
        { q: "When is GST registration mandatory?", a: "If your turnover exceeds ₹20 Lakhs (Service) or ₹40 Lakhs (Goods), or if you sell across state lines (Inter-state), GST registration is mandatory." },
        { q: "Do I need to file nil returns?", a: "Yes, even if you have no business transaction in a month, filing a Nil GSTR-1 and GSTR-3B is mandatory to avoid late fees." },
        { q: "Can I claim Input Tax Credit (ITC)?", a: "Yes, you can claim ITC on business purchases if your vendor has filed their return. We reconcile this for you to ensure you don't lose money." }
    ],
    "TaxNotice": [
        { q: "Why did I get a tax notice?", a: "Notices can be for data mismatch (Section 143(1)), non-filing, or high-value transactions. Do not ignore it; most can be resolved with a simple online response." },
        { q: "Do I need to visit the tax office?", a: "No. The entire process is now 'Faceless'. We draft and file the response online on your behalf." },
        { q: "What if the demand is incorrect?", a: "We can file a rectification request or an appeal to correct the demand if the assessing officer has made an error." }
    ]
};
