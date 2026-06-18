// fb-mockups.jsx — Factory Brain product mockups (icons, gantt, prompt scheduler,
// supply-chain graph, decision app). Exported to window for the sections file.

// ───────────────────────── Icons (lucide-style, 1.75 stroke) ────────────────
(() => {
const FB_ICONS = {
  spark: 'M12 3v4M12 17v4M3 12h4M17 12h4M6.3 6.3l2.8 2.8M14.9 14.9l2.8 2.8M17.7 6.3l-2.8 2.8M9.1 14.9l-2.8 2.8',
  arrowRight: 'M5 12h14M13 6l6 6-6 6',
  arrowUp: 'M12 19V5M6 11l6-6 6 6',
  check: 'M20 6L9 17l-5-5',
  zap: 'M13 2L4.5 13.2c-.3.4 0 .8.4.8H11l-1 8 8.5-11.2c.3-.4 0-.8-.4-.8H12z',
  layers: 'M12 2.5l9 4.7-9 4.7-9-4.7zM3.2 12l8.8 4.6L20.8 12M3.2 16.4l8.8 4.6 8.8-4.6',
  box: 'M21 7.8l-9-4.8-9 4.8v8.4l9 4.8 9-4.8zM3.3 7.9l8.7 4.7 8.7-4.7M12 12.6V22',
  wrench: 'M14.7 6.3a4 4 0 00-5.3 5.1L3 17.8 6.2 21l6.4-6.4a4 4 0 005.1-5.3l-2.6 2.6-2.3-.6-.6-2.3z',
  net: 'M12 9a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM5 20a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM19 20a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM12 9v3M9.5 16.5L7 13.5M14.5 16.5l2.5-3',
  gauge: 'M12 13l4-4M21 12a9 9 0 10-18 0M7 16a6 6 0 010-8',
  calendar: 'M3 9h18M7 3v3M17 3v3M5 5h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z',
  alert: 'M12 3l9.5 16.5H2.5zM12 10v4M12 17.5h.01',
  clock: 'M12 21a9 9 0 100-18 9 9 0 000 18zM12 7v5l3 2',
  trend: 'M3 17l6-6 4 4 8-8M15 7h6v6',
  factory: 'M3 21V10l5 3.2V10l5 3.2V10l5 3.2V6l4 2.5V21zM7 21v-3M12 21v-3M17 21v-3',
  plug: 'M9 3v5M15 3v5M7 8h10v3a5 5 0 01-10 0zM12 16v5',
  cube: 'M12 2.5l9 4.7-9 4.7-9-4.7zM3.2 12l8.8 4.6L20.8 12M3.2 16.4l8.8 4.6 8.8-4.6',
  shield: 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z',
  leaf: 'M11 20A7 7 0 014 13c0-5 5-9 16-10 1 7-2 16-9 17zM4 21c2-5 6-7 11-8',
  flask: 'M9 3h6M10 3v6l-5 9a2 2 0 002 3h10a2 2 0 002-3l-5-9V3M7.5 15h9',
  play: 'M7 4l13 8-13 8z',
  send: 'M22 2L11 13M22 2l-7 20-4-9-9-4z',
  filter: 'M3 5h18l-7 8v6l-4-2v-4z',
  user: 'M12 12a4 4 0 100-8 4 4 0 000 8zM4 21a8 8 0 0116 0',
  link: 'M9 15l6-6M10.5 6.5l1-1a4 4 0 016 6l-1 1M13.5 17.5l-1 1a4 4 0 01-6-6l1-1',
  dollar: 'M12 2v20M17 6.5a4 4 0 00-4-2.5h-1a3.5 3.5 0 000 7h2a3.5 3.5 0 010 7h-1a4 4 0 01-4-2.5',
  upload: 'M12 15V3M8 7l4-4 4 4M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2',
};
function Icon({ name, size = 20, stroke = 1.75, style, className }) {
  const d = FB_ICONS[name];
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={stroke} strokeLinecap="round"
      strokeLinejoin="round" style={style} className={className} aria-hidden="true">
      {d.split('M').filter(Boolean).map((seg, i) => <path key={i} d={'M' + seg} />)}
    </svg>
  );
}

// concentric-circle brand mark (from Factory Brain logo spec)
function BrandMark({ size = 26, color = 'currentColor' }) {
  return (
    <svg width={size} height={size * (54 / 53)} viewBox="0 0 53 54" fill="none" aria-hidden="true">
      <ellipse cx="26.32" cy="27.11" rx="20.11" ry="20.11" stroke={color} strokeWidth="2.55" />
      <ellipse cx="26.31" cy="33.19" rx="13.70" ry="13.70" stroke={color} strokeWidth="2.55" />
      <ellipse cx="26.31" cy="20.67" rx="13.70" ry="13.67" stroke={color} strokeWidth="2.55" />
      <ellipse cx="26.27" cy="26.92" rx="7.39" ry="7.42" stroke={color} strokeWidth="2.55" />
      <ellipse cx="26.28" cy="26.70" rx="2.61" ry="2.58" fill={color} />
    </svg>
  );
}

// ───────────────────────── Gantt ───────────────────────────────────────────
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
function Gantt({ rows, days = DAYS, labelW = 116 }) {
  return (
    <div className="fb-gantt" style={{ '--lblw': labelW + 'px', '--cols': days.length }}>
      <div className="fb-gantt__head">
        <span />
        <div className="fb-gantt__cols">
          {days.map((d) => <span key={d}>{d}</span>)}
        </div>
      </div>
      {rows.map((r, i) => (
        <div className="fb-gantt__row" key={i}>
          <div className="fb-gantt__label">{r.name}<small>{r.sub}</small></div>
          <div className="fb-gantt__track">
            {r.bars.map((b, j) => (
              <div key={j} className={'fb-bar fb-bar--' + (b.k || 'accent')}
                style={{ left: b.l + '%', width: b.w + '%' }}>{b.t}</div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ───────────────────────── Hero scenarios ──────────────────────────────────
const ROWS = [
  { name: 'Extrusion', sub: 'Line A' },
  { name: 'Printing', sub: 'Line B' },
  { name: 'Lamination', sub: 'Line C' },
  { name: 'Die-Cut', sub: 'Line D' },
  { name: 'Packing', sub: 'Line E' },
];
const mk = (rows, barsByRow) => rows.map((r, i) => ({ ...r, bars: barsByRow[i] }));

const SCENARIOS = [
  {
    id: 'plan',
    chip: 'Plan this week to hit every promised date',
    k: 'plan',
    prompt: 'Plan this week to hit every promised date without overtime.',
    summary: 'Feasible plan locked. 7 orders sequenced, every promise-date holds. Packing peaks at 88% — no overtime required.',
    kpis: [
      { label: 'On-time', val: '100%', delta: '+6 pts', dir: 'up' },
      { label: 'Overtime', val: '0h', delta: '−12h', dir: 'up' },
      { label: 'Capital freed', val: '₹2.4Cr', delta: '+₹40L', dir: 'up' },
      { label: 'Changeovers', val: '9', delta: 'on budget', dir: 'flat' },
    ],
    bars: mk(ROWS, [
      [{ l: 1, w: 37, t: 'WB-204', k: 'accent' }, { l: 41, w: 36, t: 'RX-118', k: 'ok' }],
      [{ l: 1, w: 18, t: 'Acme 8k', k: 'accent' }, { l: 21, w: 37, t: 'Vista', k: 'ok' }, { l: 81, w: 18, t: 'MX-2', k: 'accent' }],
      [{ l: 21, w: 37, t: 'Laminate', k: 'ok' }, { l: 61, w: 18, t: 'Coat', k: 'accent' }],
      [{ l: 41, w: 18, t: 'DC-7', k: 'accent' }, { l: 61, w: 37, t: 'Acme cut', k: 'ok' }],
      [{ l: 61, w: 18, t: 'Pack A', k: 'accent' }, { l: 81, w: 18, t: 'Ship', k: 'ok' }],
    ]),
  },
  {
    id: 'rush',
    chip: 'Absorb a 5,000-unit rush order for Tuesday',
    k: 'rush',
    prompt: 'Absorb a 5,000-unit rush order for Tuesday and tell me what it costs.',
    summary: 'Rush slotted on Line B, Tue AM. Acme nudges to Wed — still inside its window. Cost: +4h overtime on Packing, one changeover.',
    kpis: [
      { label: 'On-time', val: '97%', delta: 'still green', dir: 'flat' },
      { label: 'Rush ETA', val: 'Tue 6pm', delta: 'committed', dir: 'up' },
      { label: 'Overtime', val: '+4h', delta: 'Packing', dir: 'down' },
      { label: 'Rush margin', val: '₹3.1L', delta: 'net positive', dir: 'up' },
    ],
    bars: mk(ROWS, [
      [{ l: 1, w: 37, t: 'WB-204', k: 'accent' }, { l: 41, w: 36, t: 'RX-118', k: 'ok' }],
      [{ l: 1, w: 18, t: 'Acme', k: 'muted' }, { l: 21, w: 18, t: 'RUSH 5k', k: 'warn' }, { l: 41, w: 18, t: 'Acme 8k', k: 'accent' }, { l: 61, w: 18, t: 'Vista', k: 'ok' }],
      [{ l: 21, w: 37, t: 'Laminate', k: 'ok' }, { l: 61, w: 18, t: 'Coat', k: 'accent' }],
      [{ l: 41, w: 18, t: 'DC-7', k: 'accent' }, { l: 61, w: 37, t: 'Acme cut', k: 'ok' }],
      [{ l: 41, w: 18, t: 'Rush pk', k: 'warn' }, { l: 61, w: 18, t: 'Pack A', k: 'accent' }, { l: 81, w: 18, t: 'Ship', k: 'ok' }],
    ]),
  },
  {
    id: 'ot',
    chip: 'Cut next week’s overtime by 20%',
    k: 'ot',
    prompt: 'Cut next week’s overtime by 20% without missing any commitments.',
    summary: 'Re-sequenced to drop 2 changeovers and merge two short runs. Overtime down 22%; every promise-date still holds.',
    kpis: [
      { label: 'Overtime', val: '−22%', delta: 'target met', dir: 'up' },
      { label: 'On-time', val: '100%', delta: 'held', dir: 'flat' },
      { label: 'Changeovers', val: '7', delta: '−2', dir: 'up' },
      { label: 'Capital freed', val: '₹2.6Cr', delta: '+₹60L', dir: 'up' },
    ],
    bars: mk(ROWS, [
      [{ l: 1, w: 56, t: 'WB-204 · RX-118', k: 'ok' }],
      [{ l: 1, w: 18, t: 'Acme 8k', k: 'accent' }, { l: 21, w: 37, t: 'Vista', k: 'ok' }, { l: 61, w: 18, t: 'MX-2', k: 'accent' }],
      [{ l: 21, w: 37, t: 'Laminate', k: 'ok' }, { l: 61, w: 18, t: 'Coat', k: 'accent' }],
      [{ l: 41, w: 37, t: 'Acme cut', k: 'ok' }],
      [{ l: 61, w: 18, t: 'Pack A', k: 'accent' }, { l: 81, w: 14, t: 'Ship', k: 'ok' }],
    ]),
  },
  {
    id: 'maint',
    chip: 'Free up Lamination for maintenance Thursday',
    k: 'maint',
    prompt: 'Free up Lamination (Line C) for an 8h maintenance window on Thursday.',
    summary: 'Line C cleared Thursday. Work pulled forward to Tue–Wed; Friday buffer absorbs the rest. Maintenance window confirmed: 8h, no orders at risk.',
    kpis: [
      { label: 'On-time', val: '100%', delta: 'protected', dir: 'flat' },
      { label: 'Maint window', val: '8h', delta: 'Thu confirmed', dir: 'up' },
      { label: 'Overtime', val: '2h', delta: '+2h', dir: 'down' },
      { label: 'Capital freed', val: '₹2.3Cr', delta: '+₹20L', dir: 'up' },
    ],
    bars: mk(ROWS, [
      [{ l: 1, w: 37, t: 'WB-204', k: 'accent' }, { l: 41, w: 36, t: 'RX-118', k: 'ok' }],
      [{ l: 1, w: 18, t: 'Acme 8k', k: 'accent' }, { l: 21, w: 37, t: 'Vista', k: 'ok' }, { l: 81, w: 18, t: 'MX-2', k: 'accent' }],
      [{ l: 21, w: 38, t: 'Laminate', k: 'ok' }, { l: 60, w: 20, t: 'Maintenance', k: 'ghost' }],
      [{ l: 41, w: 18, t: 'DC-7', k: 'accent' }, { l: 61, w: 37, t: 'Acme cut', k: 'ok' }],
      [{ l: 61, w: 18, t: 'Pack A', k: 'accent' }, { l: 81, w: 18, t: 'Ship', k: 'ok' }],
    ]),
  },
];

// ───────────────────────── Prompt scheduler (hero centerpiece) ─────────────
function useTypewriter(text, active, speed = 26) {
  const [out, setOut] = React.useState('');
  React.useEffect(() => {
    if (!active) { setOut(text); return; }
    setOut('');
    let i = 0; let raf;
    const tick = () => {
      i += 1; setOut(text.slice(0, i));
      if (i < text.length) raf = setTimeout(tick, speed);
    };
    raf = setTimeout(tick, 120);
    return () => clearTimeout(raf);
  }, [text, active]);
  return out;
}

function PromptScheduler() {
  const [idx, setIdx] = React.useState(0);
  const [run, setRun] = React.useState(0); // bump to re-type
  const reduce = React.useRef(typeof window !== 'undefined' &&
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const sc = SCENARIOS[idx];
  const typed = useTypewriter(sc.prompt, !reduce.current, 24);
  const typing = !reduce.current && typed.length < sc.prompt.length;

  const pick = (i) => { setIdx(i); setRun((r) => r + 1); };

  return (
    <div className="fb-win" role="group" aria-label="Factory Brain scheduling demo">
      <div className="fb-win__bar">
        <div className="fb-win__dots"><i /><i /><i /></div>
        <div className="fb-win__title">
          <BrandMark size={14} /> Factory Brain
          <span className="fb-dot">·</span> Skyline Packaging — Plant 2
        </div>
        <div style={{ marginLeft: 'auto' }} className="fb-status fb-status--ok">
          <span className="fb-livedot" /> Live model
        </div>
      </div>

      <div style={{ padding: 'clamp(14px,2.2vw,22px)' }}>
        {/* prompt */}
        <div className={'fb-prompt ' + (typing ? 'fb-prompt--focus' : '')}>
          <Icon name="spark" size={20} className="fb-prompt__spark" />
          <div className="fb-prompt__text" key={run}>
            {typed}{typing && <span className="fb-caret" />}
          </div>
          <button className="fb-btn fb-btn--primary fb-btn--sm" style={{ height: 36, width: 36, padding: 0 }}
            aria-label="Run prompt" onClick={() => setRun((r) => r + 1)}>
            <Icon name="arrowUp" size={18} />
          </button>
        </div>

        {/* suggestion chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
          {SCENARIOS.map((s, i) => (
            <button key={s.id} className="fb-chip fb-btn--sm" data-on={i === idx ? '1' : '0'}
              style={{ fontSize: 12.5, padding: '7px 12px' }} onClick={() => pick(i)}>
              {s.chip}
            </button>
          ))}
        </div>

        {/* response */}
        <div style={{
          marginTop: 18, padding: '14px 16px', borderRadius: 12,
          background: 'var(--accent-tint)', border: '1px solid var(--accent-line)',
          display: 'flex', gap: 11, alignItems: 'flex-start',
        }}>
          <div style={{
            flexShrink: 0, width: 26, height: 26, borderRadius: 7, background: 'var(--accent)',
            color: '#fff', display: 'grid', placeItems: 'center', marginTop: 1,
          }}><Icon name="check" size={16} stroke={2.4} /></div>
          <div style={{ fontSize: 13.5, lineHeight: 1.5, color: 'var(--text-primary)' }}>
            <b style={{ fontWeight: 700 }}>Plan updated.</b>{' '}
            <span className="fb-sec">{sc.summary}</span>
          </div>
        </div>

        {/* KPI row */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10,
          margin: '16px 0', borderTop: '1px solid var(--hairline)',
          borderBottom: '1px solid var(--hairline)', padding: '14px 0',
        }}>
          {sc.kpis.map((k) => (
            <div className="fb-kpi" key={k.label}>
              <span className="fb-kpi__label">{k.label}</span>
              <span className="fb-kpi__val">{k.val}</span>
              <span className={'fb-kpi__delta fb-kpi__delta--' +
                (k.dir === 'up' ? 'up' : k.dir === 'down' ? 'down' : 'flat')}>
                {k.dir === 'up' ? '▲ ' : k.dir === 'down' ? '▼ ' : ''}{k.delta}
              </span>
            </div>
          ))}
        </div>

        {/* gantt */}
        <Gantt rows={sc.bars} />
      </div>
    </div>
  );
}

// ───────────────────────── Supply-chain graph ──────────────────────────────
function SupplyGraph() {
  // node graph: suppliers → materials → lines → orders
  const cols = [
    { x: 70, label: 'Suppliers', nodes: [
      { y: 70, t: 'Polymer Co', i: 'box' }, { y: 150, t: 'InkWorks', i: 'flask' }, { y: 230, t: 'BoardMill', i: 'layers' },
    ] },
    { x: 250, label: 'Materials', nodes: [
      { y: 60, t: 'BOPP film', i: 'cube' }, { y: 130, t: 'CMYK ink', i: 'flask' }, { y: 200, t: 'Adhesive', i: 'flask' }, { y: 268, t: 'Cartons', i: 'box' },
    ] },
    { x: 440, label: 'Lines', nodes: [
      { y: 80, t: 'Extrusion', i: 'factory' }, { y: 160, t: 'Printing', i: 'factory' }, { y: 240, t: 'Packing', i: 'factory' },
    ] },
    { x: 620, label: 'Orders', nodes: [
      { y: 90, t: 'Acme · 12k', i: 'check', s: 'ok' }, { y: 165, t: 'Vista · 8k', i: 'check', s: 'ok' }, { y: 240, t: 'MX · 5k', i: 'alert', s: 'warn' },
    ] },
  ];
  const edges = [
    [0, 0, 1, 0], [0, 1, 1, 1], [0, 2, 1, 3], [0, 2, 1, 2],
    [1, 0, 2, 0], [1, 1, 2, 1], [1, 2, 2, 1], [1, 3, 2, 2],
    [2, 0, 3, 0], [2, 1, 3, 0], [2, 1, 3, 1], [2, 2, 3, 1], [2, 2, 3, 2],
  ];
  const pos = (c, n) => ({ x: cols[c].x, y: cols[c].nodes[n].y });
  return (
    <div style={{ position: 'relative', width: '100%', overflow: 'hidden' }}>
      <svg viewBox="0 0 700 320" style={{ width: '100%', height: 'auto', display: 'block' }}>
        {cols.map((c, ci) => (
          <text key={'l' + ci} x={c.x} y={26} textAnchor="middle"
            fontSize="10.5" fontWeight="700" letterSpacing="1.4"
            fill="var(--text-muted)" style={{ textTransform: 'uppercase' }}>{c.label.toUpperCase()}</text>
        ))}
        {edges.map((e, i) => {
          const a = pos(e[0], e[1]); const b = pos(e[2], e[3]);
          const mx = (a.x + b.x) / 2;
          return <path key={i} d={`M${a.x + 58} ${a.y} C ${mx} ${a.y}, ${mx} ${b.y}, ${b.x - 58} ${b.y}`}
            fill="none" stroke="var(--accent-line)" strokeWidth="1.3" opacity="0.65" />;
        })}
        {cols.map((c, ci) => c.nodes.map((n, ni) => {
          const stat = n.s === 'ok' ? 'var(--success)' : n.s === 'warn' ? 'var(--warning)' : 'var(--accent)';
          return (
            <g key={ci + '-' + ni} transform={`translate(${c.x - 58}, ${n.y - 16})`}>
              <rect width="116" height="32" rx="8" fill="var(--bg-elev)" stroke="var(--border)" />
              <rect x="0" y="0" width="3" height="32" rx="1.5" fill={stat} />
              <circle cx="20" cy="16" r="9" fill="none" stroke={stat} strokeWidth="1.4" />
              <text x="38" y="20" fontSize="10.5" fontWeight="600" fill="var(--text-primary)"
                fontFamily="var(--font-body)">{n.t}</text>
            </g>
          );
        }))}
      </svg>
    </div>
  );
}

// ───────────────────────── Decision app (Rush Order Triage) ────────────────
function DecisionApp() {
  const rows = [
    { id: 'RQ-8841', cust: 'Acme Foods', qty: '5,000', due: 'Tue', feas: 92, verdict: 'Accept', k: 'ok', note: 'Slot Line B AM' },
    { id: 'RQ-8839', cust: 'Vista Retail', qty: '12,000', due: 'Wed', feas: 64, verdict: 'Accept w/ OT', k: 'warn', note: '+4h Packing' },
    { id: 'RQ-8836', cust: 'Northwind', qty: '9,500', due: 'Mon', feas: 28, verdict: 'Decline', k: 'late', note: 'No feasible path' },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--accent-soft)',
          color: 'var(--accent)', display: 'grid', placeItems: 'center' }}>
          <Icon name="zap" size={17} />
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14 }}>Rush Order Triage</div>
          <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>Built on the live model · 3 pending</div>
        </div>
        <div style={{ marginLeft: 'auto' }} className="fb-status fb-status--ok"><span className="fb-livedot" />Auto-checking</div>
      </div>
      <div style={{ border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.3fr .8fr .6fr 1.2fr 1fr',
          padding: '9px 14px', background: 'var(--bg-subtle)', fontSize: 10,
          fontWeight: 700, letterSpacing: '.05em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
          <span>Order</span><span>Qty</span><span>Due</span><span>Feasibility</span><span>Verdict</span>
        </div>
        {rows.map((r) => (
          <div key={r.id} style={{ display: 'grid', gridTemplateColumns: '1.3fr .8fr .6fr 1.2fr 1fr',
            alignItems: 'center', padding: '11px 14px', borderTop: '1px solid var(--hairline)', fontSize: 12.5 }}>
            <span><b style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5 }}>{r.id}</b>
              <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>{r.cust}</div></span>
            <span className="fb-mono">{r.qty}</span>
            <span>{r.due}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ flex: 1, height: 6, borderRadius: 3, background: 'var(--bg-muted)', overflow: 'hidden', maxWidth: 70 }}>
                <span style={{ display: 'block', height: '100%', width: r.feas + '%',
                  background: r.k === 'ok' ? 'var(--success)' : r.k === 'warn' ? 'var(--warning)' : 'var(--danger)' }} />
              </span>
              <span className="fb-mono" style={{ fontSize: 11 }}>{r.feas}%</span>
            </span>
            <span className={'fb-status fb-status--' + r.k} style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 2 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><i />{r.verdict}</span>
              <span style={{ fontSize: 10.5, color: 'var(--text-faint)', fontWeight: 500 }}>{r.note}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { Icon, BrandMark, Gantt, PromptScheduler, SupplyGraph, DecisionApp, FB_SCENARIOS: SCENARIOS });
})();
