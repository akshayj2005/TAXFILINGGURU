/**
 * Shared utility for formatting plan titles from URL slugs
 */
exports.formatPlanTitle = (plan, type) => {
    const formattedPlan = plan.split('-').map(w => {
        if (w === 'nri') return 'NRI';
        if (w === 'gst') return 'GST';
        if (w === 'tds') return 'TDS';
        if (w === 'hni') return 'HNI';
        return w.charAt(0).toUpperCase() + w.slice(1);
    }).join(' ');

    const typeLabel = type === 'nri' ? 'NRI Registration' : 'Resident Registration';
    return `${formattedPlan} - ${typeLabel} - Tax Filing Guru`;
};
