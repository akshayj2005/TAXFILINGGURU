const defaultConfig = {
  company_name: "Tax Filing Guru",
  tagline: "Resident & NRI ITR Filing",
  phone_number: "+91 98119 45176",
  hero_title: "Expert Tax Filing Services",
  hero_subtitle: "Professional tax solutions for residents and NRIs. Get maximum refunds with our expert guidance.",
  hero_cta: "Get Started Today",
  services_heading: "Our Services",
  service_1_title: "Individual ITR Filing",
  service_1_desc: "Complete tax filing services for salaried individuals and professionals.",
  service_2_title: "NRI Tax Services",
  service_2_desc: "Specialized tax solutions for Non-Resident Indians worldwide.",
  service_3_title: "Business Tax Filing",
  service_3_desc: "Comprehensive tax services for businesses and corporations.",
  service_4_title: "Tax Consultation",
  service_4_desc: "Expert tax planning and consultation services for all needs.",
  cta_heading: "Ready to File Your Taxes?",
  cta_button: "Contact Us Now",
  footer_text: "© 2024 Tax Filing Guru. All rights reserved.",
  background_color: "#0052D4",
  primary_color: "#0052D4",
  secondary_color: "#4364F7",
  text_color: "#111827",
  accent_color: "#ffffff",
  font_family: "Inter",
  font_size: 16
};

async function onConfigChange(config) {
  const primaryColor = config.primary_color || defaultConfig.primary_color;
  const secondaryColor = config.secondary_color || defaultConfig.secondary_color;
  const customFont = config.font_family || defaultConfig.font_family;
  const baseSize = config.font_size || defaultConfig.font_size;

  // Apply text content
  const updateText = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };

  const companyName = config.company_name || defaultConfig.company_name;
  const companyNameElement = document.getElementById('company-name');
  if (companyNameElement) {
    const nameParts = companyName.split(' ');
    const guruIndex = nameParts.findIndex(part => part.toLowerCase() === 'guru');
    if (guruIndex !== -1) {
      const beforeGuru = nameParts.slice(0, guruIndex).join(' ');
      const guru = nameParts[guruIndex];
      companyNameElement.innerHTML = beforeGuru ? `${beforeGuru} <span class="text-purple-600">${guru}</span>` : `<span class="text-purple-600">${guru}</span>`;
    } else {
      companyNameElement.textContent = companyName;
    }
  }

  updateText('tagline', config.tagline || defaultConfig.tagline);
  updateText('top-phone', config.phone_number || defaultConfig.phone_number);
  updateText('hero-title', config.hero_title || defaultConfig.hero_title);
  updateText('hero-subtitle', config.hero_subtitle || defaultConfig.hero_subtitle);
  updateText('hero-cta', config.hero_cta || defaultConfig.hero_cta);
  updateText('services-heading', config.services_heading || defaultConfig.services_heading);
  updateText('service-1-title', config.service_1_title || defaultConfig.service_1_title);
  updateText('service-1-desc', config.service_1_desc || defaultConfig.service_1_desc);
  updateText('service-2-title', config.service_2_title || defaultConfig.service_2_title);
  updateText('service-2-desc', config.service_2_desc || defaultConfig.service_2_desc);
  updateText('service-3-title', config.service_3_title || defaultConfig.service_3_title);
  updateText('service-3-desc', config.service_3_desc || defaultConfig.service_3_desc);
  updateText('service-4-title', config.service_4_title || defaultConfig.service_4_title);
  updateText('service-4-desc', config.service_4_desc || defaultConfig.service_4_desc);
  updateText('cta-heading', config.cta_heading || defaultConfig.cta_heading);
  updateText('cta-button', config.cta_button || defaultConfig.cta_button);
  updateText('footer-text', config.footer_text || defaultConfig.footer_text);

  // Apply colors
  const heroBg = document.querySelector('.hero-bg');
  if (heroBg) heroBg.style.background = `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 50%, ${secondaryColor}dd 100%)`;

  document.querySelectorAll('.service-icon, .primary-btn').forEach(el => {
    el.style.background = `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`;
  });

  // Apply fonts
  document.body.style.fontFamily = `${customFont}, sans-serif`;

  // Apply font sizes
  if (companyNameElement) companyNameElement.style.fontSize = `${baseSize * 1.5}px`;
  const ht = document.getElementById('hero-title'); if (ht) ht.style.fontSize = `${baseSize * 3.5}px`;
  const hs = document.getElementById('hero-subtitle'); if (hs) hs.style.fontSize = `${baseSize * 1.25}px`;
}

if (window.elementSdk) {
  window.elementSdk.init({
    defaultConfig,
    onConfigChange,
    mapToCapabilities: (config) => ({
      recolorables: [
        { get: () => config.primary_color || defaultConfig.primary_color, set: (v) => window.elementSdk.setConfig({ primary_color: v }) },
        { get: () => config.secondary_color || defaultConfig.secondary_color, set: (v) => window.elementSdk.setConfig({ secondary_color: v }) }
      ],
      fontEditable: { get: () => config.font_family || defaultConfig.font_family, set: (v) => window.elementSdk.setConfig({ font_family: v }) },
      fontSizeable: { get: () => config.font_size || defaultConfig.font_size, set: (v) => window.elementSdk.setConfig({ font_size: v }) }
    })
  });
}
