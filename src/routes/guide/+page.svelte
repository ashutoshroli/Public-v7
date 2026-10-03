<script lang="ts">import BottomNav from "$lib/components/BottomNav.svelte";
  import { portalLanguage, togglePortalLanguage, initPortalLanguage } from "$lib/stores/language";
  let language: "en" | "hi" = "en";
  const unsubLang = portalLanguage.subscribe(v => language = v); import NotifyButton from "$lib/components/NotifyButton.svelte";initPortalLanguage();
</script>
<svelte:head><title>User Guide — Chhath Puja</title><meta name="description" content="How to use the Chhath Puja public transparency portal." /></svelte:head>
<header class="topbar"><a class="brand" href="/"><span class="sun" aria-hidden="true">☼</span><span><strong>Chhath Puja</strong><small>Transparency Portal</small></span></a><div class="header-actions"><button class="language" type="button" onclick={togglePortalLanguage}>{language === "hi" ? "English" : "हिंदी"}</button><a class="language" href="/">{language === "hi" ? "← होम" : "← Home"}</a></div></header>
<main class="page">
  <p class="eyebrow">HELP CENTRE</p><h1>{language === 'hi' ? 'उपयोग गाइड' : 'User Guide'}<span>.</span></h1><p class="lede">{language === 'hi' ? 'समुदाय के रिकॉर्ड देखें और अपने फ़ोन पर इस पोर्टल का उपयोग करना सीखें।' : 'How to browse community records and use this portal on your phone.'}</p>
  <section class="records guide-records">
    <article class="record"><span class="menu-item-icon">⌂</span><div class="record-main"><strong>{language === 'hi' ? 'मुख्य डैशबोर्ड' : 'Home dashboard'}</strong><small>{language === 'hi' ? 'चुने गए वर्ष का बजट, योगदान, खर्च और सारांश देखें।' : 'View the selected year\'s budget, contributions, expenses and summary figures.'}</small></div></article>
    <article class="record"><span class="menu-item-icon">♙</span><div class="record-main"><strong>{language === 'hi' ? 'योगदानकर्ता' : 'Contributors'}</strong><small>{language === 'hi' ? 'नीचे के नेविगेशन में योगदानकर्ता खोलें। नाम खोजें, वर्ष चुनें और योगदान प्रकार से फ़िल्टर करें।' : 'Open Contributors in the bottom navigation. Search by name, choose a year and filter by contribution type.'}</small></div></article>
    <article class="record"><span class="menu-item-icon">▤</span><div class="record-main"><strong>{language === 'hi' ? 'खर्च' : 'Expenses'}</strong><small>{language === 'hi' ? 'दर्ज खर्च देखें, विवरण खोजें, श्रेणी से फ़िल्टर करें और वर्ष बदलें।' : 'Browse recorded spending, search descriptions, filter by category and change the selected year.'}</small></div></article>
    <article class="record"><span class="menu-item-icon">◷</span><div class="record-main"><strong>{language === 'hi' ? 'हमारी यात्रा' : 'Our Journey'}</strong><small>{language === 'hi' ? 'मेन्यू → हमारी यात्रा खोलकर वार्षिक रिकॉर्ड देखें।' : 'Open Menu → Our Journey to explore available annual records.'}</small></div></article>
    <article class="record"><span class="menu-item-icon">⇩</span><div class="record-main"><strong>{language === 'hi' ? 'डाउनलोड' : 'Downloads'}</strong><small>{language === 'hi' ? 'प्रकाशित सार्वजनिक रिकॉर्ड के लिंक पाने के लिए मेन्यू → डाउनलोड खोलें। फ़ाइल लिंक उपलब्ध होने पर ही डाउनलोड दिखेगा।' : 'Open Menu → Downloads to find links to published public records. Direct files appear only when links are provided.'}</small></div></article>
  </section>
  <section class="journey"><div><p class="eyebrow">NOTIFICATIONS</p><h2>{language === 'hi' ? 'समुदाय की जानकारी पाएँ।' : 'Get community updates.'}</h2><p>{language === 'hi' ? 'नए योगदान और समिति की सूचनाएँ पाने के लिए सदस्यता लें।' : 'Opt in to receive new contribution announcements and committee notifications when they are sent.'}</p><NotifyButton /></div></section>
  <section class="journey"><div><p class="eyebrow">INSTALL ON YOUR PHONE</p><h2>{language === 'hi' ? 'पोर्टल को आसानी से खोलें।' : 'Keep the portal handy.'}</h2><p>{language === 'hi' ? 'मेन्यू → ऐप इंस्टॉल करें चुनें। यदि विकल्प न दिखे, तो ब्राउज़र मेन्यू में “Add to Home screen” चुनें।' : 'Open Menu → Install app. If your browser does not offer an install prompt, use its menu and select “Add to Home screen” where available.'}</p></div></section>
  <a class="back-link" href="/">{language === 'hi' ? '← होम पर वापस' : '← Back to home'}</a>
</main>
<BottomNav />
