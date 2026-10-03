<script lang="ts">import BottomNav from "$lib/components/BottomNav.svelte"; import NotifyButton from "$lib/components/NotifyButton.svelte";</script>
<svelte:head><title>User Guide — Chhath Puja</title><meta name="description" content="How to use the Chhath Puja public transparency portal." /></svelte:head>

<main class="page">
  <p class="eyebrow">HELP CENTRE</p><h1>User Guide<span>.</span></h1><p class="lede">How to browse community records and use this portal on your phone.</p>
  <section class="records guide-records">
    <article class="record"><span class="menu-item-icon">⌂</span><div class="record-main"><strong>Home dashboard</strong><small>View the selected year's budget, contributions, expenses and summary figures.</small></div></article>
    <article class="record"><span class="menu-item-icon">♙</span><div class="record-main"><strong>Contributors</strong><small>Open Contributors in the bottom navigation. Search by name, choose a year and filter by contribution type.</small></div></article>
    <article class="record"><span class="menu-item-icon">▤</span><div class="record-main"><strong>Expenses</strong><small>Browse recorded spending, search descriptions, filter by category and change the selected year.</small></div></article>
    <article class="record"><span class="menu-item-icon">◷</span><div class="record-main"><strong>Our Journey</strong><small>Open Menu → Our Journey to explore available annual records.</small></div></article>
    <article class="record"><span class="menu-item-icon">⇩</span><div class="record-main"><strong>Downloads</strong><small>Open Menu → Downloads to find links to published public records. Direct files appear only when links are provided.</small></div></article>
  </section>
  <section class="journey"><div><p class="eyebrow">NOTIFICATIONS</p><h2>Get community updates.</h2><p>Opt in to receive new contribution announcements and committee notifications when they are sent.</p><NotifyButton /></div></section>
  <section class="journey"><div><p class="eyebrow">INSTALL ON YOUR PHONE</p><h2>Keep the portal handy.</h2><p>Open Menu → Install app. If your browser does not offer an install prompt, use its menu and select “Add to Home screen” where available.</p></div></section>
  <a class="back-link" href="/">← Back to home</a>
</main>
<BottomNav />
