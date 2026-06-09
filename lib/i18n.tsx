"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

// ─── Types ───────────────────────────────────────────────────────────
export type Lang = "en" | "hi";

interface LanguageContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
}

// ─── Context ─────────────────────────────────────────────────────────
const LanguageContext = createContext<LanguageContextValue>({
  lang: "en",
  setLang: () => {},
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const saved = localStorage.getItem("sps-lang") as Lang | null;
    if (saved === "en" || saved === "hi") setLangState(saved);
  }, []);

  function setLang(l: Lang) {
    setLangState(l);
    localStorage.setItem("sps-lang", l);
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

/** Returns the full translation object for the current language. */
export function useT() {
  const { lang } = useLanguage();
  return translations[lang];
}

// ─── Translations ────────────────────────────────────────────────────
const translations = {
  en: {
    // ── Navbar ──
    navBrand: "Smart Parking System",
    navBrandSub: "AI-Powered Parking",
    navHome: "Home",
    navEntry: "Register Vehicle",
    navLots: "Live Parking",
    navPass: "My Pass",
    navDashboard: "Dashboard",
    navHelp: "Help",
    langToggle: "हि",

    // ── Home page ──
    heroBadge: "AI-Powered · Real-time Monitoring",
    heroTitle: "Smart Parking System",
    heroSubtitle: "Smart Parking · Safe Mobility",
    heroDesc: "Intelligent parking management for large-scale venues. Scan, park, get guided to your destination — with automatic alerts when your vehicle causes congestion.",
    heroCta1: "Register Vehicle",
    heroCta2: "Admin Dashboard",
    heroCta3: "View Live Lots",

    howItWorks: "How It Works",
    howItWorksSub: "Three simple steps to get started",
    step1Title: "Scan & Register",
    step1Desc: "Camera reads your number plate. Enter your phone number and select a destination.",
    step2Title: "Park & Get Pass",
    step2Desc: "Get an assigned parking slot and a QR pass with shuttle and walking route.",
    step3Title: "Auto-Monitored",
    step3Desc: "Mis-parked? You get SMS, call, and marshal support automatically.",

    platformFeatures: "Platform Features",
    feat1Title: "ANPR Entry Gate",
    feat1Desc: "Scan vehicle plates at entry, register phone number, and get instant parking assignment.",
    feat2Title: "Mis-park Detection",
    feat2Desc: "AI monitors every slot. Blocked aisles and fire lanes trigger automatic owner alerts.",
    feat3Title: "Tiered Auto-Alerts",
    feat3Desc: "SMS → WhatsApp → Auto-call → Marshal dispatch. Multi-language support.",
    feat4Title: "Route Guide",
    feat4Desc: "After parking, visitors get walking time, shuttle stops, and least-congested routes.",
    feat5Title: "Multi-Zone Control",
    feat5Desc: "Live occupancy across all lots. Redirect traffic before zones hit capacity.",
    feat6Title: "Command Dashboard",
    feat6Desc: "Real-time heatmaps, violation feed, and analytics for traffic authorities.",

    ctaTitle: "Ready to enter the parking zone?",
    ctaSub: "Register your vehicle and get your smart parking pass",
    ctaButton: "Start Entry Registration",

    // ── Entry page ──
    entryTitle: "Vehicle Entry Gate",
    entrySub: "Capture plate photo, scan number, register phone, get parking slot",
    entryApproved: "Entry Approved",
    entryPassIssued: "Your parking pass has been issued",
    entrySmsSent: "SMS sent to",
    entrySmsNotSent: "SMS not sent — notifications are simulated until Twilio is configured. Alerts appear on the Dashboard.",
    entryViewPass: "View Parking Pass & Route",
    labelVehicle: "Vehicle Number",
    labelPhone: "Mobile Number",
    labelDestination: "Destination",
    labelSubmit: "Register & Get Parking Pass",

    // ── Lots page ──
    lotsTitle: "Live Parking Lots",
    lotsSub: "All parking zones · Real-time occupancy",
    lotsRefresh: "Refresh",
    lotsAutoRefresh: "Auto-refreshes every 10 seconds. Green = available, Red = nearly full.",
    lotsFull: "All lots full?",
    lotsFullDesc: "Follow digital signage to Arail Overflow Lot — free shuttle every 5 minutes.",
    lotsRegister: "Register at Nearest Gate",
    lotsNoZones: "No parking zones configured.",

    // ── My Pass page ──
    passTitle: "My Parking Pass",
    passSub: "Enter your pass code to view your parking details and route",
    passLoad: "Load Pass",
    passLoading: "Loading pass...",
    passVehicle: "Vehicle",
    passZone: "Parking Zone",
    passSlot: "Slot",
    passDestination: "Destination",
    passRegistered: "Registered",
    passRoute: "Route to Destination",
    passStep1: "Walk to",
    passStep1Suffix: "min",
    passStep2: "Shuttle to",
    passStep2Suffix: "every 8 min",
    passStep3: "Follow crowd marshals for safest pedestrian path",
    passMisparkWarn: "If your vehicle is mis-parked, you will receive SMS and auto-call at",
    passShuttleNote: "Shuttle stop:",
    passShuttleSuffix: "— show this QR at boarding.",

    // ── Dashboard ──
    dashTitle: "Command Dashboard",
    dashSub: "Control Center · Real-time monitoring",
    dashRefresh: "Refresh",
    dashMarshal: "Marshal View",
    dashVehicles: "Registered Vehicles",
    dashNoVehicles: "No vehicles registered yet. Register at",
    dashEntryGate: "Entry Gate",
    dashViolations: "Active Violations",
    dashViolationsSub: "Mis-park and fire-lane alerts",
    dashNoClear: "No active violations — all clear",
    dashNotifLog: "Notification Log",
    dashNotifSub: "SMS, WhatsApp, calls, marshal dispatch",
    dashZones: "Parking Zones",
    thVehicle: "Vehicle",
    thPhone: "Phone",
    thZoneSlot: "Zone / Slot",
    thPassCode: "Pass Code",
    thTime: "Time",

    // ── Marshal ──
    marshalTitle: "Marshal Dispatch",
    marshalSub: "Field operations · Urgent violations",
    marshalNone: "No marshal dispatches pending",
    marshalUrgent: "URGENT",
    marshalCall: "Call Owner:",
    marshalBack: "Dashboard",

    // ── Zone Detail ──
    zoneBack: "Back to dashboard",
    zoneLiveGrid: "Live parking grid",
    zoneSelected: "Selected:",
    zoneReport: "Report violation — triggers SMS alert to registered vehicle owner",
    zoneMisparked: "Mis-parked",
    zoneBlocking: "Blocking Aisle",
    zoneDouble: "Double Parking",
    zoneFireLane: "Fire Lane Block",
    zoneUsage: "Click any occupied (blue) slot to select it, then report a violation type. The vehicle owner will receive an SMS alert.",
    zoneUsageLabel: "Usage:",
    zoneLoading: "Loading zone...",
    zoneNotFound: "Zone not found.",

    // ── Zone Card ──
    zoneFree: "free",
    zoneWalk: "min walk",
    zoneShuttle: "Shuttle",
    zoneFull: "full",

    // ── Violations ──
    violSmsSent: "SMS + WhatsApp sent",
    violCallTriggered: "Auto-call triggered",
    violMarshalDispatched: "Marshal dispatched",
    violEscalate: "Escalate Alert",
    violResolve: "Mark Resolved",
    violResolved: "Resolved",
    violNoNotif: "No notifications sent yet.",
    violAlertDispatched: "Alert Dispatched",

    // ── Stats Cards ──
    statOccupancy: "Occupancy",
    statFreeSlots: "Free Slots",
    statFreeAvailable: "Available now",
    statMisparked: "Mis-parked",
    statMisparkedSub: "Needs attention",
    statActiveAlerts: "Active Alerts",
    statAlertsSub: "Unresolved violations",
    statSlots: "slots",

    // ── Help Modal ──
    helpTitle: "Help & Support",
    helpDesc: "Need assistance? We're here to help you with the Smart Parking System.",
    helpPhone: "Phone Support",
    helpPhoneNum: "+91 1800-XXX-XXXX",
    helpPhoneAvail: "Available 24/7",
    helpEmail: "Email Support",
    helpEmailAddr: "support@smartparking.com",
    helpEmailReply: "Response within 24 hours",
    helpFaqTitle: "Frequently Asked Questions",
    helpFaq1Q: "How do I register my vehicle?",
    helpFaq1A: "Go to 'Register Vehicle' from the navigation menu. Scan your number plate using the camera or enter it manually, then fill in your phone number and destination.",
    helpFaq2Q: "What happens if my vehicle is mis-parked?",
    helpFaq2A: "You will receive an automatic SMS and WhatsApp alert. If not moved, the system escalates to an auto-call and then dispatches a marshal to your location.",
    helpFaq3Q: "How do I find my parking pass?",
    helpFaq3A: "Go to 'My Pass' in the navigation. Enter your pass code (received during registration) to view your QR code, slot details, and route information.",
    helpFaq4Q: "What do I do if all parking lots are full?",
    helpFaq4A: "Follow the digital signage to the overflow lot. Free shuttle services run every 5 minutes to connect you to your destination.",
    helpClose: "Close",
  },

  hi: {
    // ── Navbar ──
    navBrand: "स्मार्ट पार्किंग सिस्टम",
    navBrandSub: "AI-संचालित पार्किंग",
    navHome: "होम",
    navEntry: "वाहन पंजीकरण",
    navLots: "लाइव पार्किंग",
    navPass: "मेरा पास",
    navDashboard: "डैशबोर्ड",
    navHelp: "सहायता",
    langToggle: "EN",

    // ── Home page ──
    heroBadge: "AI-संचालित · रियल-टाइम निगरानी",
    heroTitle: "स्मार्ट पार्किंग सिस्टम",
    heroSubtitle: "स्मार्ट पार्किंग · सुरक्षित आवागमन",
    heroDesc: "बड़े आयोजन स्थलों के लिए बुद्धिमान पार्किंग प्रबंधन। स्कैन करें, पार्क करें, अपने गंतव्य तक मार्गदर्शन प्राप्त करें — जब आपका वाहन भीड़ पैदा करता है तो स्वचालित अलर्ट।",
    heroCta1: "वाहन पंजीकरण",
    heroCta2: "एडमिन डैशबोर्ड",
    heroCta3: "लाइव पार्किंग देखें",

    howItWorks: "कैसे काम करता है",
    howItWorksSub: "शुरू करने के तीन आसान कदम",
    step1Title: "स्कैन और पंजीकरण",
    step1Desc: "कैमरा आपकी नंबर प्लेट पढ़ता है। अपना फोन नंबर दर्ज करें और गंतव्य चुनें।",
    step2Title: "पार्क करें और पास पाएं",
    step2Desc: "आपको एक पार्किंग स्लॉट और शटल व पैदल मार्ग के साथ QR पास मिलेगा।",
    step3Title: "स्वचालित निगरानी",
    step3Desc: "गलत पार्क? आपको स्वचालित SMS, कॉल और मार्शल सहायता मिलेगी।",

    platformFeatures: "प्लेटफॉर्म सुविधाएं",
    feat1Title: "ANPR एंट्री गेट",
    feat1Desc: "प्रवेश पर वाहन प्लेट स्कैन, फोन नंबर पंजीकरण और तुरंत पार्किंग आवंटन।",
    feat2Title: "गलत पार्किंग पहचान",
    feat2Desc: "AI हर स्लॉट की निगरानी करता है। अवरुद्ध गलियारे और फायर लेन पर स्वचालित मालिक अलर्ट।",
    feat3Title: "स्तरीय स्वचालित अलर्ट",
    feat3Desc: "SMS → WhatsApp → ऑटो-कॉल → मार्शल प्रेषण। बहुभाषी समर्थन।",
    feat4Title: "रूट गाइड",
    feat4Desc: "पार्किंग के बाद, आगंतुकों को पैदल समय, शटल स्टॉप और कम भीड़ वाले मार्ग मिलते हैं।",
    feat5Title: "बहु-क्षेत्र नियंत्रण",
    feat5Desc: "सभी लॉट में लाइव ऑक्यूपेंसी। क्षमता पूर्ण होने से पहले ट्रैफिक रीडायरेक्ट।",
    feat6Title: "कमांड डैशबोर्ड",
    feat6Desc: "रियल-टाइम हीटमैप, उल्लंघन फीड और ट्रैफिक अधिकारियों के लिए एनालिटिक्स।",

    ctaTitle: "पार्किंग ज़ोन में प्रवेश के लिए तैयार?",
    ctaSub: "अपना वाहन पंजीकृत करें और स्मार्ट पार्किंग पास प्राप्त करें",
    ctaButton: "पंजीकरण शुरू करें",

    // ── Entry page ──
    entryTitle: "वाहन प्रवेश गेट",
    entrySub: "प्लेट फोटो लें, नंबर स्कैन करें, फोन पंजीकृत करें, पार्किंग स्लॉट प्राप्त करें",
    entryApproved: "प्रवेश स्वीकृत",
    entryPassIssued: "आपका पार्किंग पास जारी किया गया है",
    entrySmsSent: "SMS भेजा गया",
    entrySmsNotSent: "SMS नहीं भेजा गया — Twilio कॉन्फ़िगर होने तक सूचनाएं सिम्युलेटेड हैं। अलर्ट डैशबोर्ड पर दिखाई देते हैं।",
    entryViewPass: "पार्किंग पास और रूट देखें",
    labelVehicle: "वाहन नंबर",
    labelPhone: "मोबाइल नंबर",
    labelDestination: "गंतव्य",
    labelSubmit: "पंजीकरण करें और पास प्राप्त करें",

    // ── Lots page ──
    lotsTitle: "लाइव पार्किंग लॉट",
    lotsSub: "सभी पार्किंग ज़ोन · रियल-टाइम ऑक्यूपेंसी",
    lotsRefresh: "रिफ्रेश",
    lotsAutoRefresh: "हर 10 सेकंड में ऑटो-रिफ्रेश। हरा = उपलब्ध, लाल = लगभग भरा।",
    lotsFull: "सभी लॉट भरे हैं?",
    lotsFullDesc: "अरैल ओवरफ्लो लॉट के लिए डिजिटल साइनेज का पालन करें — हर 5 मिनट में मुफ्त शटल।",
    lotsRegister: "निकटतम गेट पर पंजीकरण करें",
    lotsNoZones: "कोई पार्किंग ज़ोन कॉन्फ़िगर नहीं।",

    // ── My Pass page ──
    passTitle: "मेरा पार्किंग पास",
    passSub: "अपने पार्किंग विवरण और रूट देखने के लिए पास कोड दर्ज करें",
    passLoad: "पास लोड करें",
    passLoading: "पास लोड हो रहा है...",
    passVehicle: "वाहन",
    passZone: "पार्किंग ज़ोन",
    passSlot: "स्लॉट",
    passDestination: "गंतव्य",
    passRegistered: "पंजीकृत",
    passRoute: "गंतव्य तक का मार्ग",
    passStep1: "पैदल चलें",
    passStep1Suffix: "मिनट",
    passStep2: "शटल लें",
    passStep2Suffix: "हर 8 मिनट",
    passStep3: "सबसे सुरक्षित पैदल मार्ग के लिए मार्शल का अनुसरण करें",
    passMisparkWarn: "यदि आपका वाहन गलत पार्क होता है, तो आपको SMS और ऑटो-कॉल प्राप्त होगी",
    passShuttleNote: "शटल स्टॉप:",
    passShuttleSuffix: "— बोर्डिंग पर यह QR दिखाएं।",

    // ── Dashboard ──
    dashTitle: "कमांड डैशबोर्ड",
    dashSub: "नियंत्रण केंद्र · रियल-टाइम निगरानी",
    dashRefresh: "रिफ्रेश",
    dashMarshal: "मार्शल व्यू",
    dashVehicles: "पंजीकृत वाहन",
    dashNoVehicles: "अभी तक कोई वाहन पंजीकृत नहीं। यहां पंजीकरण करें",
    dashEntryGate: "एंट्री गेट",
    dashViolations: "सक्रिय उल्लंघन",
    dashViolationsSub: "गलत पार्किंग और फायर लेन अलर्ट",
    dashNoClear: "कोई सक्रिय उल्लंघन नहीं — सब ठीक",
    dashNotifLog: "सूचना लॉग",
    dashNotifSub: "SMS, WhatsApp, कॉल, मार्शल प्रेषण",
    dashZones: "पार्किंग ज़ोन",
    thVehicle: "वाहन",
    thPhone: "फोन",
    thZoneSlot: "ज़ोन / स्लॉट",
    thPassCode: "पास कोड",
    thTime: "समय",

    // ── Marshal ──
    marshalTitle: "मार्शल प्रेषण",
    marshalSub: "फील्ड ऑपरेशन · तत्काल उल्लंघन",
    marshalNone: "कोई मार्शल प्रेषण लंबित नहीं",
    marshalUrgent: "तत्काल",
    marshalCall: "मालिक को कॉल करें:",
    marshalBack: "डैशबोर्ड",

    // ── Zone Detail ──
    zoneBack: "डैशबोर्ड पर वापस",
    zoneLiveGrid: "लाइव पार्किंग ग्रिड",
    zoneSelected: "चयनित:",
    zoneReport: "उल्लंघन रिपोर्ट करें — पंजीकृत वाहन मालिक को SMS अलर्ट भेजता है",
    zoneMisparked: "गलत पार्क",
    zoneBlocking: "गलियारा अवरुद्ध",
    zoneDouble: "डबल पार्किंग",
    zoneFireLane: "फायर लेन ब्लॉक",
    zoneUsage: "किसी भी ऑक्यूपाइड (नीले) स्लॉट पर क्लिक करें, फिर उल्लंघन प्रकार रिपोर्ट करें। वाहन मालिक को SMS अलर्ट मिलेगा।",
    zoneUsageLabel: "उपयोग:",
    zoneLoading: "ज़ोन लोड हो रहा है...",
    zoneNotFound: "ज़ोन नहीं मिला।",

    // ── Zone Card ──
    zoneFree: "खाली",
    zoneWalk: "मिनट पैदल",
    zoneShuttle: "शटल",
    zoneFull: "भरा",

    // ── Violations ──
    violSmsSent: "SMS + WhatsApp भेजा",
    violCallTriggered: "ऑटो-कॉल शुरू",
    violMarshalDispatched: "मार्शल प्रेषित",
    violEscalate: "अलर्ट बढ़ाएं",
    violResolve: "हल किया",
    violResolved: "हल हो गया",
    violNoNotif: "अभी तक कोई सूचना नहीं भेजी गई।",
    violAlertDispatched: "अलर्ट प्रेषित",

    // ── Stats Cards ──
    statOccupancy: "ऑक्यूपेंसी",
    statFreeSlots: "खाली स्लॉट",
    statFreeAvailable: "अभी उपलब्ध",
    statMisparked: "गलत पार्क",
    statMisparkedSub: "ध्यान देने की जरूरत",
    statActiveAlerts: "सक्रिय अलर्ट",
    statAlertsSub: "अनसुलझे उल्लंघन",
    statSlots: "स्लॉट",

    // ── Help Modal ──
    helpTitle: "सहायता और समर्थन",
    helpDesc: "मदद चाहिए? हम स्मार्ट पार्किंग सिस्टम में आपकी सहायता के लिए यहां हैं।",
    helpPhone: "फोन सहायता",
    helpPhoneNum: "+91 1800-XXX-XXXX",
    helpPhoneAvail: "24/7 उपलब्ध",
    helpEmail: "ईमेल सहायता",
    helpEmailAddr: "support@smartparking.com",
    helpEmailReply: "24 घंटे में जवाब",
    helpFaqTitle: "अक्सर पूछे जाने वाले प्रश्न",
    helpFaq1Q: "मैं अपना वाहन कैसे पंजीकृत करूं?",
    helpFaq1A: "नेविगेशन मेनू से 'वाहन पंजीकरण' पर जाएं। कैमरे से अपनी नंबर प्लेट स्कैन करें या मैन्युअल रूप से दर्ज करें, फिर अपना फोन नंबर और गंतव्य भरें।",
    helpFaq2Q: "अगर मेरा वाहन गलत पार्क हो तो क्या होगा?",
    helpFaq2A: "आपको स्वचालित SMS और WhatsApp अलर्ट मिलेगा। अगर नहीं हटाया, तो सिस्टम ऑटो-कॉल और फिर आपके स्थान पर मार्शल भेजता है।",
    helpFaq3Q: "मैं अपना पार्किंग पास कैसे ढूंढूं?",
    helpFaq3A: "नेविगेशन में 'मेरा पास' पर जाएं। अपना पास कोड (पंजीकरण के दौरान प्राप्त) दर्ज करें और QR कोड, स्लॉट विवरण और रूट जानकारी देखें।",
    helpFaq4Q: "अगर सभी पार्किंग लॉट भरे हों तो क्या करें?",
    helpFaq4A: "ओवरफ्लो लॉट के लिए डिजिटल साइनेज का पालन करें। मुफ्त शटल सेवाएं हर 5 मिनट में आपको गंतव्य से जोड़ती हैं।",
    helpClose: "बंद करें",
  },
} as const;

export type Translations = typeof translations["en"];
