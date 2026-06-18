// fb-app.jsx — composition + Tweaks wiring.
(() => {
const { Nav, Hero, AppsGallery, RFQFeatures, Proof, WorkflowTimeline, SchedulingSection, WorkflowsSection, Surfaces, SpecToJobPipeline, useReveal } = window.FB_SECTIONS_1;
const { Pricing, FinalCTA, Footer } = window.FB_SECTIONS_2;

const FONT_PAIRS = {
  'tight':  { display: "'Inter Tight', 'Inter', sans-serif", body: "'Inter', sans-serif", label: 'Inter Tight / Inter' },
  'inter':  { display: "'Inter', sans-serif",                body: "'Inter', sans-serif", label: 'Inter / Inter' },
  'serif':  { display: "'Source Serif 4', Georgia, serif",   body: "'Inter', sans-serif", label: 'Source Serif / Inter' },
};
const DENSITY = { compact: 0.78, regular: 1, comfy: 1.22 };

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#5189f3",
  "dark": false,
  "headline": "Upload your RFQ & Get a quotation in 30 seconds.",
  "sub": "Model your supply chain in plain English. Then orchestrate production scheduling — and build decision apps — with a single prompt.",
  "fontPair": "tight",
  "density": "regular"
}/*EDITMODE-END*/;

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const schedRef = React.useRef(null);
  useReveal();

  React.useEffect(() => {
    const l = document.getElementById('fb-loading');
    if (l) { l.style.transition = 'opacity .3s'; l.style.opacity = '0'; setTimeout(() => l.remove(), 320); }
  }, []);

  // apply theming tokens to :root
  React.useEffect(() => {
    const r = document.documentElement;
    r.setAttribute('data-theme', t.dark ? 'dark' : 'light');
    r.style.setProperty('--accent', t.accent);
    const fp = FONT_PAIRS[t.fontPair] || FONT_PAIRS.tight;
    r.style.setProperty('--font-display', fp.display);
    r.style.setProperty('--font-body', fp.body);
    r.style.setProperty('--dmul', String(DENSITY[t.density] ?? 1));
  }, [t.dark, t.accent, t.fontPair, t.density]);

  const onTry = React.useCallback(() => {
    const el = schedRef.current;
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - 90;
    window.scrollTo({ top: y, behavior: 'smooth' });
  }, []);

  return (
    <React.Fragment>
      <Nav onTry={onTry} />
      <main>
        <Hero headline={t.headline} sub={t.sub} schedRef={schedRef} onTry={onTry} />
        <SpecToJobPipeline />
        <WorkflowTimeline />
        <RFQFeatures />
        <AppsGallery />
        <Surfaces />
        <WorkflowsSection />
        <Proof />
        <FinalCTA onTry={onTry} />
      </main>
      <Footer />

      <TweaksPanel title="Tweaks">
        <TweakSection label="Theme" />
        <TweakColor label="Accent" value={t.accent}
          options={['#5189f3', '#6366f1', '#0ea5a4', '#7c5cff', '#e8590c']}
          onChange={(v) => setTweak('accent', v)} />
        <TweakToggle label="Dark mode" value={t.dark} onChange={(v) => setTweak('dark', v)} />

        <TweakSection label="Typography" />
        <TweakSelect label="Font pairing" value={t.fontPair}
          options={Object.entries(FONT_PAIRS).map(([k, v]) => ({ value: k, label: v.label }))}
          onChange={(v) => setTweak('fontPair', v)} />
        <TweakRadio label="Density" value={t.density}
          options={['compact', 'regular', 'comfy']} onChange={(v) => setTweak('density', v)} />

        <TweakSection label="Hero copy" />
        <TweakText label="Headline" value={t.headline} onChange={(v) => setTweak('headline', v)} />
        <TweakText label="Subhead" value={t.sub} onChange={(v) => setTweak('sub', v)} />
      </TweaksPanel>
    </React.Fragment>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
})();
