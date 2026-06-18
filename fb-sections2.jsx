// fb-sections2.jsx — Pricing, Final CTA, Footer.
(() => {
const { Icon: FBIcon, BrandMark: FBMark } = window;

// ───────────────────────── Pricing ─────────────────────────────────────────
function Pricing() {
  const [ccy, setCcy] = React.useState('INR');
  const tiers = [
    {
      name: 'Spark', tag: 'Single line', icon: 'spark',
      price: { INR: '₹49k', USD: '$590' }, per: '/mo',
      lead: 'Model one line and start orchestrating today.',
      feats: ['1 production line', 'Hourly drift audits', '5 planner seats', 'Prompt scheduling', 'Email support'],
      cta: 'Start free pilot', primary: false,
    },
    {
      name: 'Synapse', tag: 'Most common', icon: 'net',
      price: { INR: '₹1.4L', USD: '$1,650' }, per: '/mo',
      lead: 'A whole plant, synced to the floor and re-planning live.',
      feats: ['Up to 6 lines', '15-minute drift audits', '15 planner seats', 'Unlimited decision apps', 'Sensor sync · PatternClip', 'Priority support · 15-min SLA'],
      cta: 'Book a 5-day pilot', primary: true,
    },
    {
      name: 'Cortex', tag: 'Multi-plant', icon: 'layers',
      price: { INR: 'Custom', USD: 'Custom' }, per: '',
      lead: 'Every plant, real-time, with the controls enterprise needs.',
      feats: ['Unlimited lines & plants', 'Real-time drift audits', 'Unlimited seats', 'SSO · roles · audit log', 'API & custom models', 'Dedicated success team'],
      cta: 'Talk to us', primary: false,
    },
  ];
  return (
    <section id="pricing" className="fb-section">
      <div className="fb-wrap">
        <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto clamp(30px,3.6vw,48px)' }}>
          <div className="fb-reveal"><span className="fb-eyebrow" style={{ justifyContent: 'center' }}>Pricing</span></div>
          <h2 className="fb-h2 fb-reveal" style={{ marginTop: 14 }}>Two things to buy. Foundation, then Features.</h2>
          <p className="fb-lead fb-reveal" style={{ marginTop: 14 }}>Buy the Foundation that fits your plant. Add Features as you grow. Bundle and save up to <b style={{ color: 'var(--text-primary)' }}>−20%</b>.</p>
          <div className="fb-reveal" style={{ display: 'inline-flex', marginTop: 22, padding: 3, background: 'var(--bg-muted)', borderRadius: 999 }}>
            {[['INR', '₹ INR'], ['USD', '$ USD']].map(([c, l]) => (
              <button key={c} onClick={() => setCcy(c)} style={{
                border: 'none', cursor: 'pointer', padding: '7px 18px', borderRadius: 999, fontSize: 13, fontWeight: 600,
                fontFamily: 'var(--font-body)', background: ccy === c ? 'var(--bg-elev)' : 'transparent',
                color: ccy === c ? 'var(--text-primary)' : 'var(--text-muted)', boxShadow: ccy === c ? 'var(--sh-xs)' : 'none',
              }}>{l}</button>
            ))}
          </div>
        </div>

        <div className="fb-grid fb-cols-3" style={{ alignItems: 'stretch' }}>
          {tiers.map((tier) => (
            <div key={tier.name} className="fb-reveal fb-card" style={{
              padding: 28, display: 'flex', flexDirection: 'column', gap: 16,
              border: tier.primary ? '1.5px solid var(--accent)' : '1px solid var(--border)',
              boxShadow: tier.primary ? 'var(--sh-lg)' : 'var(--sh-sm)',
              position: 'relative',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--accent-soft)', color: 'var(--accent)', display: 'grid', placeItems: 'center' }}><FBIcon name={tier.icon} size={17} /></div>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 19 }}>{tier.name}</span>
                </div>
                <span style={{
                  fontSize: 10.5, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase',
                  padding: '4px 9px', borderRadius: 999,
                  background: tier.primary ? 'var(--accent)' : 'var(--bg-muted)',
                  color: tier.primary ? '#fff' : 'var(--text-secondary)',
                }}>{tier.tag}</span>
              </div>
              <div>
                <span className="fb-mono" style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 34, letterSpacing: '-.02em' }}>{tier.price[ccy]}</span>
                <span style={{ color: 'var(--text-muted)', fontSize: 15, marginLeft: 4 }}>{tier.per}</span>
              </div>
              <p className="fb-body" style={{ fontSize: 13.5, margin: 0, minHeight: 38 }}>{tier.lead}</p>
              <a className={'fb-btn ' + (tier.primary ? 'fb-btn--primary' : 'fb-btn--secondary')} href="#book" style={{ width: '100%' }}>{tier.cta}</a>
              <div style={{ borderTop: '1px solid var(--hairline)', paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {tier.feats.map((f) => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 13.5, color: 'var(--text-secondary)' }}>
                    <FBIcon name="check" size={15} stroke={2.4} style={{ color: 'var(--accent)', flexShrink: 0 }} /> {f}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* features roadmap */}
        <div className="fb-reveal fb-card" style={{ marginTop: 22, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <FBIcon name="layers" size={18} style={{ color: 'var(--accent)' }} />
            <b style={{ fontSize: 14 }}>Features, on the roadmap</b>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {[['Cost-to-Serve', 'Q3 2026'], ['Supplier Risk', 'Q4 2026'], ['Carbon Accounting', 'Q1 2027']].map(([t, q]) => (
              <span key={t} className="fb-chip" style={{ cursor: 'default', padding: '7px 13px', fontSize: 12.5, whiteSpace: 'nowrap' }}>
                {t} <span className="k">{q}</span>
              </span>
            ))}
          </div>
          <span style={{ marginLeft: 'auto', fontSize: 12.5, color: 'var(--text-muted)' }}>3-year term · up to −18%</span>
        </div>
      </div>
    </section>
  );
}

// ───────────────────────── Final CTA ───────────────────────────────────────
function FinalCTA({ onTry }) {
  return (
    <section id="book" className="fb-section" style={{ background: 'var(--navy)', color: '#fff', position: 'relative', overflow: 'hidden' }}>
      <div aria-hidden="true" style={{ position: 'absolute', top: '-40%', left: '50%', transform: 'translateX(-50%)', width: 900, height: 600, background: 'radial-gradient(ellipse at center, color-mix(in srgb, var(--accent) 36%, transparent), transparent 64%)', opacity: .5 }} />
      <div className="fb-wrap" style={{ position: 'relative', textAlign: 'center', maxWidth: 760 }}>
        <h2 className="fb-h2 fb-reveal" style={{ color: '#fff' }}>Stop guessing. Start committing.</h2>
        <p className="fb-reveal" style={{ fontSize: 'clamp(16px,1.4vw,19px)', color: 'rgba(255,255,255,.7)', marginTop: 16, textWrap: 'pretty' }}>
          Give us a week. We’ll model one line, hand you a feasible plan, and show you the capital sitting inside your schedule.
        </p>
        <div className="fb-reveal" style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginTop: 28 }}>
          <a className="fb-btn fb-btn--primary fb-btn--lg fb-btn--onnavy" href="https://rfq.patternlab.ai/login" target="_blank" rel="noopener noreferrer"><FBIcon name="spark" size={18} /> Try now for free</a>
          <a className="fb-btn fb-btn--secondary fb-btn--lg fb-btn--onnavy" href="/contact">Book a demo <FBIcon name="arrowRight" size={16} /></a>
        </div>
        <div className="fb-reveal" style={{ marginTop: 16, fontSize: 13, color: 'rgba(255,255,255,.5)' }}>Free assessment. No commitment. No disruption to production.</div>
      </div>
    </section>
  );
}

// ───────────────────────── Footer ──────────────────────────────────────────
function Footer() {
  const cols = [
    ['Product', ['How it works', 'Live schedule', 'Decision apps', 'Pricing']],
    ['Platform', ['Supply-chain model', 'PatternClip sensors', 'Adaptive planning', 'API']],
    ['Company', ['About', 'Careers', 'Contact', 'Security']],
  ];
  return (
    <footer style={{ background: 'var(--bg-subtle)', borderTop: '1px solid var(--border)' }}>
      <div className="fb-wrap" style={{ paddingTop: 56, paddingBottom: 40 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(220px, 1.4fr) repeat(3, 1fr)', gap: 32, marginBottom: 40 }} className="fb-footer-grid">
          <div>
            <a href="#top" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: 'var(--text-primary)' }}>
              <FBMark size={24} />
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, letterSpacing: '-.02em', whiteSpace: 'nowrap' }}>Factory Brain</span>
            </a>
            <p className="fb-body" style={{ fontSize: 13.5, marginTop: 14, maxWidth: 280 }}>
              Prompt-native production orchestration. Model your supply chain, hit your dates, free your working capital.
            </p>
            <div style={{ marginTop: 16, fontSize: 12.5, color: 'var(--text-muted)' }}>Patternlab · Jubilee Hills, Hyderabad</div>
          </div>
          {cols.map(([h, items]) => (
            <div key={h}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 14 }}>{h}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {items.map((it) => (
                  <a key={it} href="#" style={{ fontSize: 13.5, color: 'var(--text-secondary)', textDecoration: 'none' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}>{it}</a>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 22, display: 'flex', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap', fontSize: 12.5, color: 'var(--text-muted)' }}>
          <span>© 2026 Patternlab. All rights reserved.</span>
          <span style={{ display: 'flex', gap: 18 }}>
            <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Privacy</a>
            <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Terms</a>
            <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>patternlab.ai</a>
          </span>
        </div>
      </div>
    </footer>
  );
}

window.FB_SECTIONS_2 = { Pricing, FinalCTA, Footer };
})();
