// fb-sections.jsx — Factory Brain marketing sections.
// Relies on window: Icon, BrandMark, PromptScheduler, SupplyGraph, DecisionApp, Gantt.

(() => {
const { Icon, BrandMark, PromptScheduler, SupplyGraph, DecisionApp, Gantt } = window;

// Scroll-reveal: adds .fb-revealed when each .fb-reveal element enters the viewport.
// Also watches for new elements via MutationObserver (handles tabbed / conditional content).
function useReveal() {
  React.useEffect(() => {
    if (!window.IntersectionObserver) {
      document.querySelectorAll('.fb-reveal').forEach(el => el.classList.add('fb-revealed'));
      return;
    }
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('fb-revealed'); io.unobserve(e.target); }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -24px 0px' });

    const observe = () =>
      document.querySelectorAll('.fb-reveal:not(.fb-revealed)').forEach(el => io.observe(el));
    observe();

    const mo = new MutationObserver(observe);
    mo.observe(document.body, { childList: true, subtree: true });
    return () => { io.disconnect(); mo.disconnect(); };
  }, []);
}

function Eyebrow({ children, live }) {
  return (
    <span className="fb-eyebrow">
      {live ? <span className="fb-livedot" /> : <span style={{ width: 16, height: 1.5, background: 'currentColor', display: 'inline-block' }} />}
      {children}
    </span>
  );
}

// ───────────────────────── Nav ─────────────────────────────────────────────
function Nav({ onTry }) {
  const [scrolled, setScrolled] = React.useState(false);
  const [isDark, setIsDark] = React.useState(document.documentElement.getAttribute('data-theme') === 'dark');
  React.useEffect(() => {
    const f = () => setScrolled(window.scrollY > 8);
    f(); window.addEventListener('scroll', f, { passive: true });
    return () => window.removeEventListener('scroll', f);
  }, []);
  React.useEffect(() => {
    const obs = new MutationObserver(() => {
      setIsDark(document.documentElement.getAttribute('data-theme') === 'dark');
    });
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => obs.disconnect();
  }, []);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const isHome = window.location.pathname === '/' || window.location.pathname === '/index.html';
  const links = [
    ['Features',       isHome ? '#how'   : '/#how'],
    ['Blogs',          '/blog.html'],
    ['Pricing',        '/pricing'],
    ['Contact Us',     '/contact'],
  ];
  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: scrolled ? 'color-mix(in srgb, var(--bg-page) 82%, transparent)' : 'transparent',
      backdropFilter: scrolled ? 'blur(14px)' : 'none', WebkitBackdropFilter: scrolled ? 'blur(14px)' : 'none',
      borderBottom: '1px solid ' + (scrolled ? 'var(--border)' : 'transparent'),
      transition: 'background .25s, border-color .25s',
    }}>
      <div className="fb-wrap" style={{ height: 64, display: 'flex', alignItems: 'center', gap: 28 }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
          <img
            src={isDark ? '/assets/logo_white.svg' : '/assets/logo_black.svg'}
            alt="PatternLab.ai"
            style={{ height: 32, width: 'auto', display: 'block' }}
          />
        </a>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
        <nav style={{ display: 'flex', gap: 4, marginRight: 8 }} className="fb-navlinks">
          {links.map(([t, h]) => (
            <a key={t} href={h} style={{
              textDecoration: 'none', color: 'var(--text-secondary)', fontSize: 14, fontWeight: 500,
              padding: '8px 12px', borderRadius: 7,
            }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}>{t}</a>
          ))}
        </nav>
          <a className="fb-btn fb-btn--secondary fb-btn--sm fb-hide-sm" href="#book">Get Started</a>
          <a className="fb-btn fb-btn--primary fb-btn--sm fb-hide-sm" href="https://rfq.patternlab.ai/rfq" target="_blank" rel="noopener noreferrer">Sign In</a>
          <button
            className={"fb-hamburger" + (menuOpen ? " fb-hamburger--open" : "")}
            onClick={() => setMenuOpen(o => !o)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            <span /><span /><span />
          </button>
        </div>
      </div>
      {menuOpen && (
        <nav className="fb-mobile-menu fb-mobile-menu--open">
          {links.map(([t, h]) => (
            <a key={t} href={h} onClick={() => setMenuOpen(false)}>{t}</a>
          ))}
          <div style={{ padding: '8px 16px 0' }}>
            <a className="fb-btn fb-btn--primary" style={{ width: '100%', justifyContent: 'center' }}
              href="https://rfq.patternlab.ai/rfq" target="_blank" rel="noopener noreferrer">Sign In</a>
          </div>
        </nav>
      )}
    </header>
  );
}

// ───────────────────────── Hero ────────────────────────────────────────────
function Hero({ headline, sub, schedRef, onTry }) {
  const SCENS     = window.FB_SCENARIOS || [];
  const GanttComp = window.Gantt;

  // scenIdx: which chip is active (pre-built mode). null = live AI mode.
  const [scenIdx,     setScenIdx]     = React.useState(null);
  const [input,       setInput]       = React.useState('');
  const [reply,       setReply]       = React.useState('');
  const [busy,        setBusy]        = React.useState(false);
  const [done,        setDone]        = React.useState(true);
  const [showMetrics, setShowMetrics] = React.useState(true);
  const [uploadFile,  setUploadFile]  = React.useState(null);
  const [showQuote,   setShowQuote]   = React.useState(false);
  const [quoteData,   setQuoteData]   = React.useState(null);
  const [parsing,       setParsing]       = React.useState(false);
  const [newTreatment,  setNewTreatment]  = React.useState('');
  const replyRef  = React.useRef(null);
  const fileRef   = React.useRef(null);

  // Chip click → instant pre-built scenario (no API call)
  function pickScenario(i) {
    setScenIdx(i);
    setInput(SCENS[i]?.prompt || '');
    setReply('');
    setBusy(false);
    setDone(true);
    setShowMetrics(true);
    setShowQuote(false);
    setUploadFile(null);
    if (fileRef.current) fileRef.current.value = '';
  }

  // Send button / Enter → if file attached show instant quote, else real AI
  async function send(msg) {
    if (busy) return;
    if (uploadFile) {
      setShowQuote(true);
      setParsing(true);
      setQuoteData(null);
      setScenIdx(null); setReply(''); setDone(true); setShowMetrics(false);
      try {
        const fd = new FormData();
        fd.append('file', uploadFile);
        const r = await fetch('/api/parse-rfq', { method: 'POST', body: fd });
        const data = await r.json();
        if (!data.error) setQuoteData(data);
      } catch(e) { console.error('RFQ parse error:', e); }
      setParsing(false);
      return;
    }
    if (!msg.trim()) return;
    setShowQuote(false);
    setScenIdx(null);
    setBusy(true); setDone(false); setShowMetrics(false); setReply('');
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ role: 'user', content: msg }] }),
      });
      if (!res.ok) throw new Error('Server error ' + res.status);
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = '', text = '';
      while (true) {
        const { done: rd, value } = await reader.read();
        if (rd) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split('\n'); buf = lines.pop();
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const raw = line.slice(6).trim();
          if (raw === '[DONE]') continue;
          try {
            const evt = JSON.parse(raw);
            if (evt.type === 'content_block_delta' && evt.delta?.type === 'text_delta') {
              text += evt.delta.text;
              setReply(text);
              if (replyRef.current) replyRef.current.scrollTop = replyRef.current.scrollHeight;
            }
          } catch {}
        }
      }
      setDone(true);
      setTimeout(() => setShowMetrics(true), 350);
    } catch (err) {
      setReply('Could not reach the AI — make sure the server is running with ANTHROPIC_API_KEY set.\n\n' + err.message);
      setDone(true);
    }
    setBusy(false);
  }

  function generateQuotePDF(type) {
    var jsPDF = window.jspdf.jsPDF;
    var doc = new jsPDF({ unit: 'mm', format: 'a4' });

    var q = quoteData || {};
    var productName = q.productName || 'Product';
    var customer = q.customer || 'Customer';
    var dims = q.dimensions || 'N/A';
    var material = q.material || 'N/A';
    var gsm = q.gsm || '';
    var printCols = q.printColours || 'N/A';
    var treatments = Array.isArray(q.treatments) && q.treatments.length ? q.treatments.join(', ') : 'N/A';
    var qty = Number(q.quantity) || 1000;
    var pricePerUnit = Number(q.pricePerUnit) || 0;
    var ratePerK = pricePerUnit * 1000;
    var subtotal = Number(q.total) || (qty * pricePerUnit);
    var gstAmt = subtotal * 0.05;
    var grandTotal = subtotal + gstAmt;
    var W = 210, L = 15, R = 195, CW = 180;
    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    var now = new Date();
    var validTill = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000);
    function fmtDate(d) { return d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear(); }
    function fmtRs(n) { return 'Rs. ' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
    var quoteNo = String(now.getFullYear()).slice(2) + String(now.getMonth()+1).padStart(2,'0') + String(now.getDate()).padStart(2,'0') + String(now.getHours()).padStart(2,'0') + String(now.getMinutes()).padStart(2,'0');
    var y = 16;

    // QUOTATION title
    doc.setFontSize(14); doc.setFont('helvetica', 'bold'); doc.setTextColor(0, 0, 0);
    doc.text('QUOTATION', W/2, y, { align: 'center' });
    y += 5;
    doc.setDrawColor(0); doc.setLineWidth(0.5); doc.line(L, y, R, y);
    y += 8;

    // Quote No / Date / Valid Till row
    doc.setFontSize(8.5); doc.setFont('helvetica', 'normal'); doc.setTextColor(0, 0, 0);
    doc.text('Quote No: ' + quoteNo, L, y);
    doc.text('Date: ' + fmtDate(now), W/2, y, { align: 'center' });
    doc.text('Valid Till: ' + fmtDate(validTill), R, y, { align: 'right' });
    y += 10;

    // TO / FOR box
    var boxH = 18;
    doc.setFillColor(235, 242, 255); doc.setDrawColor(195, 215, 245); doc.setLineWidth(0.3);
    doc.rect(L, y, CW, boxH, 'FD');
    doc.line(L + CW/2, y, L + CW/2, y + boxH);
    doc.setFontSize(7.5); doc.setFont('helvetica', 'normal'); doc.setTextColor(120, 120, 120);
    doc.text('TO', L + 4, y + 5);
    doc.text('FOR', L + CW/2 + 4, y + 5);
    doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(0, 0, 0);
    var custLines = doc.splitTextToSize(customer, CW/2 - 10);
    doc.text(custLines[0], L + 4, y + 12);
    doc.setFontSize(8.5); doc.setFont('helvetica', 'normal');
    var forLines = doc.splitTextToSize(productName, CW/2 - 10);
    doc.text(forLines[0], L + CW/2 + 4, y + 11);
    if (forLines[1]) doc.text(forLines[1], L + CW/2 + 4, y + 16);
    y += boxH + 7;

    // SPECIFICATIONS table
    doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(0, 0, 0);
    doc.text('SPECIFICATIONS', L, y);
    y += 5;
    var matWithGsm = material + (gsm ? ' - ' + gsm + ' GSM' : '');
    var specRows = [
      ['Box Style', q.boxStyle || 'Tuck-In Flap (RTF)'],
      ['Dimensions', dims],
      ['Material', matWithGsm],
      ['Print', printCols !== 'N/A' ? 'Offset, ' + printCols + ' color(s)' : 'Offset'],
      ['Joint Type', 'Glued'],
      ['Finishing', treatments],
      ['HSN Code', '48192020'],
    ];
    var c1 = 50;
    specRows.forEach(function(r, i) {
      var bg = i % 2 === 0 ? [255,255,255] : [247,250,255];
      doc.setFillColor(bg[0], bg[1], bg[2]);
      doc.setDrawColor(220, 225, 235); doc.setLineWidth(0.2);
      doc.rect(L, y, CW, 7, 'FD');
      doc.setFontSize(8.5); doc.setFont('helvetica', 'bold'); doc.setTextColor(50, 50, 50);
      doc.text(r[0], L + 3, y + 4.8);
      doc.setFont('helvetica', 'normal'); doc.setTextColor(0, 0, 0);
      var val = doc.splitTextToSize(r[1], CW - c1 - 6);
      doc.text(val[0], L + c1 + 3, y + 4.8);
      y += 7;
    });
    y += 8;

    // PRICING table
    doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(0, 0, 0);
    doc.text('PRICING', L, y);
    y += 5;
    var pc = [82, 28, 40, 30];
    var ph = ['Description', 'Order Qty', 'Rate / Unit', 'Amount (Rs.)'];
    doc.setFillColor(37, 99, 235); doc.rect(L, y, CW, 8, 'F');
    var hx = L;
    ph.forEach(function(h, i) {
      doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(255, 255, 255);
      if (i === 0) doc.text(h, hx + 3, y + 5.2);
      else doc.text(h, hx + pc[i]/2, y + 5.2, { align: 'center' });
      hx += pc[i];
    });
    y += 8;

    // Data row
    doc.setFillColor(255, 255, 255); doc.setDrawColor(220, 225, 235); doc.setLineWidth(0.2);
    doc.rect(L, y, CW, 12, 'FD');
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(0, 0, 0);
    var dl = doc.splitTextToSize(productName, pc[0] - 6);
    doc.text(dl.slice(0, 2), L + 3, y + 4);
    doc.text(qty.toLocaleString('en-IN'), L + pc[0] + pc[1]/2, y + 6.5, { align: 'center' });
    doc.text(fmtRs(pricePerUnit), L + pc[0] + pc[1] + pc[2]/2, y + 6.5, { align: 'center' });
    doc.text(fmtRs(subtotal), L + pc[0] + pc[1] + pc[2] + pc[3]/2, y + 6.5, { align: 'center' });
    y += 12;

    // Subtotal / GST / Grand Total
    var totRows = [
      ['Subtotal', fmtRs(subtotal), false],
      ['GST (5%)', fmtRs(gstAmt), false],
      ['GRAND TOTAL', fmtRs(grandTotal), true],
    ];
    totRows.forEach(function(tr) {
      var grand = tr[2];
      doc.setFillColor(grand ? 235 : 248, grand ? 242 : 250, grand ? 255 : 255);
      doc.setDrawColor(220, 225, 235); doc.setLineWidth(0.2);
      doc.rect(L, y, CW, 7, 'FD');
      doc.setFont('helvetica', grand ? 'bold' : 'normal'); doc.setFontSize(grand ? 9 : 8.5); doc.setTextColor(0, 0, 0);
      doc.text(tr[0], L + pc[0] + pc[1] - 3, y + 4.8, { align: 'right' });
      doc.text(tr[1], R - 3, y + 4.8, { align: 'right' });
      y += 7;
    });

    // Footer
    doc.setFillColor(37, 99, 235); doc.rect(0, 280, W, 17, 'F');
    doc.setTextColor(255, 255, 255); doc.setFontSize(8); doc.setFont('helvetica', 'normal');
    doc.text('Generated by PatternLab  |  patternlab.ai', W/2, 290, { align: 'center' });

    doc.save(type === 'quote' ? 'Quotation.pdf' : 'JobCard.pdf');
  }

  const sc = scenIdx !== null ? SCENS[scenIdx] : null;
  const isScenMode = sc && !reply && !busy;

  return (
    <section id="top" style={{ position: 'relative', overflow: 'hidden' }}>
      <div aria-hidden="true" style={{
        position: 'absolute', top: -120, left: '50%', transform: 'translateX(-50%)',
        width: 'min(1100px, 100vw)', height: 'clamp(200px, 50vh, 620px)', pointerEvents: 'none',
        background: 'radial-gradient(ellipse at center, var(--accent-soft), transparent 62%)', opacity: .9,
      }} />
      <div aria-hidden="true" className="fb-grid-bg" style={{
        position: 'absolute', inset: 0, opacity: .5, maskImage: 'linear-gradient(180deg, #000 0%, transparent 78%)',
        WebkitMaskImage: 'linear-gradient(180deg, #000 0%, transparent 78%)',
      }} />
      <div className="fb-wrap" style={{ position: 'relative', paddingTop: 'clamp(48px, 7vw, 96px)', paddingBottom: 'clamp(40px,5vw,64px)' }}>
        <div style={{ maxWidth: 880, margin: '0 auto', textAlign: 'center' }}>
          <div className="fb-reveal is-in" style={{ marginBottom: 22 }}>
            <span className="fb-badge"><BrandMark size={13} /> Prompt-native production orchestration</span>
          </div>
          <h1 className="fb-hero-h fb-reveal is-in" data-tweak="headline">{headline}</h1>
          <p className="fb-lead fb-reveal is-in" data-tweak="sub" style={{ maxWidth: 660, margin: '22px auto 0' }}>{sub}</p>
          <div className="fb-reveal is-in" style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginTop: 30 }}>
            <a className="fb-btn fb-btn--primary fb-btn--lg" href="https://rfq.patternlab.ai/login" target="_blank" rel="noopener noreferrer">
              <Icon name="spark" size={18} /> Try now for free
            </a>
            <a className="fb-btn fb-btn--secondary fb-btn--lg" href="/contact">Book a demo <Icon name="arrowRight" size={16} /></a>
          </div>
          <div className="fb-reveal is-in" style={{ marginTop: 18, fontSize: 13, color: 'var(--text-muted)' }}>
            No rip-and-replace. Models your real capacity in <b style={{ color: 'var(--text-secondary)' }}>days</b>, not ERP theory.
          </div>
        </div>

        {/* ── Chat window ── */}
        <div className="fb-reveal" ref={schedRef} style={{ maxWidth: 920, margin: 'clamp(36px,5vw,56px) auto 0' }}>
          <div style={{ background:'#fff', border:'1px solid rgba(0,0,0,.1)', borderRadius:12, overflow:'hidden', boxShadow:'0 24px 64px rgba(0,0,0,.13)' }}>

            {/* title bar */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'11px 16px', borderBottom:'1px solid rgba(0,0,0,.07)', background:'rgba(0,0,0,.018)' }}>
              <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                <div style={{ display:'flex', gap:6 }}>
                  {['#ff5f57','#febc2e','#28c840'].map(c => <div key={c} style={{ width:12, height:12, borderRadius:'50%', background:c }} />)}
                </div>
                <span style={{ fontSize:12, color:'#6b7280', fontWeight:500 }}>Factory Brain &middot; Skyline Packaging &mdash; Plant 2</span>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:11, color:'#16a34a', fontWeight:600 }}>
                <div style={{ width:6, height:6, borderRadius:'50%', background:'#22c55e', boxShadow:'0 0 5px #22c55e' }} />
                Live model
              </div>
            </div>

            {/* prompt input */}
            <div style={{ padding:'16px 20px 0' }}>
              {/* hidden file input */}
              <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.png,.jpg,.jpeg"
                style={{ display:'none' }}
                onChange={e => { const f = e.target.files[0]; if (f) setUploadFile(f); }} />

              <div style={{ display:'flex', flexDirection:'column', gap:0, border:'1.5px solid', borderRadius:10, borderColor:busy?'var(--accent)':uploadFile?'#5189f3':'rgba(0,0,0,.13)', background:'#fafafa', transition:'border-color .2s', overflow:'hidden' }}>
                {/* file badge */}
                {uploadFile && (
                  <div style={{ display:'flex', alignItems:'center', gap:7, padding:'7px 12px 0 12px' }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#5189f3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    <span style={{ fontSize:12, color:'#5189f3', fontWeight:500, flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{uploadFile.name}</span>
                    <button onClick={() => { setUploadFile(null); fileRef.current.value=''; }}
                      style={{ background:'none', border:'none', cursor:'pointer', color:'#9ca3af', padding:'0 2px', fontSize:14, lineHeight:1 }}>x</button>
                  </div>
                )}
                {/* input row */}
                <div style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 12px' }}>
                  <Icon name="spark" size={18} style={{ color:'var(--accent)', flexShrink:0 }} />
                  <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send(input)}
                    placeholder="Ask anything here / Upload your RFQ..."
                    style={{ flex:1, border:'none', outline:'none', fontSize:14, color:'#111827', background:'transparent', fontFamily:'var(--font-body)' }} />
                  {/* upload button */}
                  <button onClick={()=>fileRef.current.click()} title="Upload RFQ"
                    className="fb-rfq-btn-upload"
                    style={{ width:30, height:30, borderRadius:7, border:'1px solid rgba(0,0,0,.12)', cursor:'pointer', flexShrink:0, background:uploadFile?'rgba(81,137,243,.1)':'#fff', display:'flex', alignItems:'center', justifyContent:'center', color: uploadFile?'#5189f3':'#6b7280', transition:'all .15s' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/></svg>
                  </button>
                  {/* send button */}
                  <button onClick={()=>send(input)} disabled={busy}
                    className="fb-rfq-btn-send"
                    style={{ width:32, height:32, borderRadius:8, border:'none', cursor:busy?'wait':'pointer', flexShrink:0, background:busy?'#e5e7eb':'var(--accent)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', transition:'background .2s' }}>
                    {busy
                      ? <div style={{ width:13, height:13, border:'2px solid #aaa', borderTopColor:'transparent', borderRadius:'50%', animation:'fbspin .7s linear infinite' }} />
                      : <Icon name="arrowRight" size={15} style={{ transform:'rotate(-90deg)' }} />}
                  </button>
                </div>
              </div>

              {/* scenario chips */}
              <div style={{ display:'flex', flexWrap:'wrap', gap:7, marginTop:10, paddingBottom:16 }}>
                {SCENS.map((s,i) => {
                  const on = scenIdx === i && !reply;
                  return (
                    <button key={i} onClick={()=>pickScenario(i)}
                      style={{ fontSize:12, padding:'5px 12px', borderRadius:999, border:'1px solid', borderColor:on?'var(--accent)':'rgba(0,0,0,.12)', background:on?'rgba(81,137,243,.08)':'#fff', color:on?'var(--accent)':'#374151', cursor:'pointer', fontFamily:'var(--font-body)', transition:'all .15s' }}>
                      {s.chip}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── RFQ Quote result ── */}
            {showQuote && (() => {
              const q = quoteData || {};
              const cur = q.currency || '₹';
              const qty = q.quantity ? q.quantity.toLocaleString('en-IN') : (parsing ? '…' : '—');
              const ppu = q.pricePerUnit != null ? cur + q.pricePerUnit.toFixed(2) : (parsing ? '…' : '—');
              const tot = q.total != null ? cur + q.total.toLocaleString('en-IN') : (parsing ? '…' : '—');
              const productName = q.productName || (parsing ? 'Analyzing document…' : 'Unknown product');
              const customer = q.customer || (parsing ? '—' : '—');
              const category = q.category || 'Product';
              const dims = q.dimensions || '—';
              const material = q.material || '—';
              const gsm = q.gsm || '—';
              const colours = q.printColours || '—';
              const treatments = q.treatments || [];
              return (
              <div style={{ margin:'0 0 0', borderTop:'1px solid rgba(0,0,0,.07)', background:'#f9fafb' }}>
                {/* parsing indicator */}
                {parsing && (
                  <div style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 20px', background:'rgba(81,137,243,.06)', borderBottom:'1px solid rgba(81,137,243,.12)' }}>
                    <div style={{ width:12, height:12, border:'2px solid #5189f3', borderTopColor:'transparent', borderRadius:'50%', animation:'fbspin .7s linear infinite', flexShrink:0 }} />
                    <span style={{ fontSize:12, color:'#5189f3', fontWeight:500 }}>Analyzing your RFQ with AI — extracting product details…</span>
                  </div>
                )}
                {/* metric strip */}
                <div className="fb-rfq-metrics" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', borderBottom:'1px solid rgba(0,0,0,.08)' }}>
                  <div style={{ padding:'10px 20px', borderRight:'1px solid rgba(0,0,0,.08)', textAlign:'center' }}>
                    <div style={{ fontSize:9, fontWeight:700, letterSpacing:'.1em', color:'#9ca3af', marginBottom:6 }}>QUANTITY</div>
                    <input
                      type="number"
                      value={q.quantity != null ? q.quantity : ''}
                      onChange={e => {
                        const n = parseFloat(e.target.value) || 0;
                        setQuoteData(prev => ({ ...prev, quantity: n, total: n * (prev.pricePerUnit || 0) }));
                      }}
                      placeholder="0"
                      style={{ width:100, border:'1px solid #e5e7eb', borderRadius:6, padding:'5px 8px', fontSize:16, fontWeight:700, color:'#111827', textAlign:'center', outline:'none', background:'#f9fafb' }}
                    />
                  </div>
                  <div style={{ padding:'10px 20px', borderRight:'1px solid rgba(0,0,0,.08)', textAlign:'center' }}>
                    <div style={{ fontSize:9, fontWeight:700, letterSpacing:'.1em', color:'#9ca3af', marginBottom:6 }}>PRICE / UNIT</div>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:4 }}>
                      <span style={{ fontSize:13, color:'#6b7280', fontWeight:600 }}>{cur}</span>
                      <input
                        type="number"
                        value={q.pricePerUnit != null ? q.pricePerUnit : ''}
                        onChange={e => {
                          const p = parseFloat(e.target.value) || 0;
                          setQuoteData(prev => ({ ...prev, pricePerUnit: p, total: p * (prev.quantity || 0) }));
                        }}
                        placeholder="0.00"
                        style={{ width:90, border:'1px solid #e5e7eb', borderRadius:6, padding:'5px 8px', fontSize:16, fontWeight:700, color:'#111827', textAlign:'center', outline:'none', background:'#f9fafb' }}
                      />
                    </div>
                  </div>
                  <div style={{ padding:'10px 20px', textAlign:'center' }}>
                    <div style={{ fontSize:9, fontWeight:700, letterSpacing:'.1em', color:'#9ca3af', marginBottom:6 }}>TOTAL</div>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:4 }}>
                      <span style={{ fontSize:13, color:'#2563eb', fontWeight:600 }}>{cur}</span>
                      <input
                        type="number"
                        value={q.total != null ? q.total : ''}
                        onChange={e => {
                          const t = parseFloat(e.target.value) || 0;
                          setQuoteData(prev => ({ ...prev, total: t, pricePerUnit: (prev.quantity || 0) > 0 ? t / prev.quantity : prev.pricePerUnit }));
                        }}
                        placeholder="0.00"
                        style={{ width:100, border:'1px solid #dbeafe', borderRadius:6, padding:'5px 8px', fontSize:16, fontWeight:700, color:'#2563eb', textAlign:'center', outline:'none', background:'#eff6ff' }}
                      />
                    </div>
                  </div>
                </div>
                {/* blue header */}
                <div style={{ background:'#3b6be8', padding:'14px 20px' }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
                    <span style={{ background:'rgba(255,255,255,.2)', color:'#fff', fontSize:11, fontWeight:600, padding:'3px 10px', borderRadius:99, display:'inline-flex', alignItems:'center', gap:5 }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>
                      {category}
                    </span>
                    <button onClick={()=>generateQuotePDF('quote')} style={{ display:'inline-flex', alignItems:'center', gap:6, background:'#fff', border:'none', borderRadius:7, padding:'6px 14px', fontSize:12, fontWeight:600, color:'#1e40af', cursor:'pointer' }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                      Download Quote
                    </button>
                  </div>
                  <div style={{ color:'#fff', fontWeight:700, fontSize:14, letterSpacing:'.01em' }}>{productName}</div>
                  <div style={{ color:'rgba(255,255,255,.7)', fontSize:11, marginTop:3, letterSpacing:'.05em' }}>{customer}</div>
                </div>
                {/* order details */}
                <div style={{ padding:'12px 20px 0' }}>
                  <div style={{ fontSize:10, fontWeight:700, letterSpacing:'.1em', color:'#9ca3af', marginBottom:10 }}>ORDER DETAILS</div>
                  <div className="fb-rfq-order" style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10, marginBottom:12 }}>
                    <div>
                      <div style={{ fontSize:11, color:'#6b7280', marginBottom:4 }}>Customer</div>
                      <input type="text" value={q.customer || ''} onChange={e => setQuoteData(prev => ({...prev, customer: e.target.value}))}
                        style={{ width:'100%', boxSizing:'border-box', border:'1px solid #e5e7eb', borderRadius:7, padding:'7px 10px', fontSize:13, color:'#111827', background:'#fff', outline:'none' }} />
                    </div>
                    <div>
                      <div style={{ fontSize:11, color:'#6b7280', marginBottom:4 }}>Due date</div>
                      <input type="date" value={q.dueDate || ''} onChange={e => setQuoteData(prev => ({...prev, dueDate: e.target.value}))}
                        style={{ width:'100%', boxSizing:'border-box', border:'1px solid #e5e7eb', borderRadius:7, padding:'7px 10px', fontSize:13, color:'#111827', background:'#fff', outline:'none' }} />
                    </div>
                    <div>
                      <div style={{ fontSize:11, color:'#6b7280', marginBottom:4 }}>Working days</div>
                      <input type="number" value={q.workingDays != null ? q.workingDays : 7} onChange={e => setQuoteData(prev => ({...prev, workingDays: Number(e.target.value)}))}
                        style={{ width:'100%', boxSizing:'border-box', border:'1px solid #e5e7eb', borderRadius:7, padding:'7px 10px', fontSize:13, color:'#111827', background:'#fff', outline:'none' }} />
                    </div>
                  </div>
                </div>
                {/* specification */}
                <div style={{ padding:'0 20px 12px' }}>
                  <div style={{ fontSize:10, fontWeight:700, letterSpacing:'.1em', color:'#9ca3af', marginBottom:10 }}>SPECIFICATION</div>
                  <div className="fb-rfq-spec" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8, marginBottom:10 }}>
                    {[['DIMENSIONS','dimensions',dims],['MATERIAL','material',material],['GSM','gsm',gsm],['PRINT COLOURS','printColours',colours]].map(([l,k,v])=>(
                      <div key={l} style={{ border:'1px solid #e5e7eb', borderRadius:8, padding:'8px 10px', background:'#fff' }}>
                        <div style={{ fontSize:9, fontWeight:700, letterSpacing:'.08em', color:'#9ca3af', marginBottom:4 }}>{l}</div>
                        <input value={v === '—' ? '' : (v || '')} onChange={e => setQuoteData(prev => ({...prev, [k]: e.target.value}))}
                          placeholder="—"
                          style={{ width:'100%', border:'none', outline:'none', fontSize:12, color:'#111827', fontWeight:500, background:'transparent', padding:0 }} />
                      </div>
                    ))}
                  </div>
                  <div style={{ display:'flex', gap:7, flexWrap:'wrap', alignItems:'center' }}>
                    {treatments.map((t,i)=>(
                      <span key={i} style={{ display:'inline-flex', alignItems:'center', gap:5, background:'#f3f4f6', border:'1px solid #e5e7eb', borderRadius:99, fontSize:12, padding:'4px 10px', color:'#374151' }}>
                        {t}
                        <button onClick={()=>setQuoteData(prev=>({...prev, treatments: prev.treatments.filter((_,j)=>j!==i)}))}
                          style={{ background:'none', border:'none', cursor:'pointer', padding:0, lineHeight:1, color:'#9ca3af', fontSize:14, display:'flex' }}>x</button>
                      </span>
                    ))}
                    <form onSubmit={e=>{e.preventDefault(); const v=newTreatment.trim(); if(v){ setQuoteData(prev=>({...prev, treatments:[...(prev.treatments||[]),v]})); setNewTreatment(''); }}} style={{display:'flex',alignItems:'center',gap:4}}>
                      <input value={newTreatment} onChange={e=>setNewTreatment(e.target.value)} placeholder="+ Add finish"
                        style={{ border:'1px dashed #d1d5db', borderRadius:99, fontSize:12, padding:'4px 10px', color:'#6b7280', background:'#fff', outline:'none', width:100 }} />
                    </form>
                  </div>
                </div>
                {/* footer */}
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 20px', borderTop:'1px solid rgba(0,0,0,.07)' }}>
                  <button onClick={()=>{ setShowQuote(false); setQuoteData(null); setParsing(false); setUploadFile(null); setInput(''); if(fileRef.current) fileRef.current.value=''; }}
                    style={{ background:'none', border:'none', cursor:'pointer', fontSize:13, color:'#6b7280', display:'inline-flex', alignItems:'center', gap:6 }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></svg>
                    Start over
                  </button>
                  <a href="https://rfq.patternlab.ai/rfq" target="_blank" rel="noopener noreferrer" style={{ background:'none', border:'1px solid #e5e7eb', borderRadius:8, cursor:'pointer', fontSize:13, fontWeight:500, color:'#374151', padding:'6px 14px', display:'inline-flex', alignItems:'center', gap:6, textDecoration:'none' }}>
                    Open calculator
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </a>
                </div>
              </div>
              );
            })()}

            {/* ── Pre-built scenario response ── */}
            {!showQuote && isScenMode && (
              <div style={{ margin:'0 20px 14px', padding:'12px 15px', background:'rgba(81,137,243,.05)', border:'1px solid rgba(81,137,243,.16)', borderRadius:10 }}>
                <div style={{ display:'flex', alignItems:'flex-start', gap:10 }}>
                  <div style={{ width:24, height:24, borderRadius:6, flexShrink:0, marginTop:1, background:'var(--accent)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <Icon name="check" size={12} style={{ color:'#fff' }} />
                  </div>
                  <div style={{ fontSize:13.5, lineHeight:1.7, color:'#1f2937' }}>
                    <b style={{ color:'#111827' }}>Plan updated. </b>{sc.summary}
                  </div>
                </div>
              </div>
            )}

            {/* ── Live AI response ── */}
            {!showQuote && (reply||busy) && (
              <div style={{ margin:'0 20px 14px', padding:'12px 15px', background:'rgba(81,137,243,.05)', border:'1px solid rgba(81,137,243,.16)', borderRadius:10 }}>
                <div style={{ display:'flex', alignItems:'flex-start', gap:10 }}>
                  <div style={{ width:24, height:24, borderRadius:6, flexShrink:0, marginTop:1, background:done?'var(--accent)':'rgba(81,137,243,.12)', display:'flex', alignItems:'center', justifyContent:'center', transition:'background .3s' }}>
                    {done ? <Icon name="check" size={12} style={{ color:'#fff' }} />
                           : <div style={{ width:10, height:10, border:'1.5px solid var(--accent)', borderTopColor:'transparent', borderRadius:'50%', animation:'fbspin .7s linear infinite' }} />}
                  </div>
                  <div ref={replyRef} style={{ fontSize:13.5, lineHeight:1.7, color:'#1f2937', maxHeight:200, overflowY:'auto', whiteSpace:'pre-wrap' }}>
                    {done && <b style={{ color:'#111827' }}>Plan updated. </b>}
                    {reply||'…'}
                  </div>
                </div>
              </div>
            )}

            {/* ── KPI grid ── */}
            {!showQuote && <div className="fb-kpi-strip-4" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', borderTop:'1px solid rgba(0,0,0,.08)', opacity:showMetrics?1:0, transform:showMetrics?'translateY(0)':'translateY(10px)', transition:'opacity .45s ease, transform .45s ease' }}>
              {(isScenMode ? sc.kpis.map(k=>({ label:k.label, value:k.val, delta:(k.dir==='up'?'▲ ':k.dir==='down'?'▼ ':'')+k.delta, g:k.dir==='up' })) : [
                { label:'ON-TIME',       value:'100%',   delta:'▲ +6 pts', g:true  },
                { label:'OVERTIME',      value:'0h',     delta:'▲ −12h',   g:true  },
                { label:'CAPITAL FREED', value:'₹2.4Cr', delta:'▲ +₹40L', g:true  },
                { label:'CHANGEOVERS',   value:'9',      delta:'on budget', g:false },
              ]).map((m,i) => (
                <div key={i} style={{ padding:'14px 22px', borderRight:i<3?'1px solid rgba(0,0,0,.07)':'none' }}>
                  <div style={{ fontSize:9, fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase', color:'#9ca3af', marginBottom:4 }}>{m.label}</div>
                  <div style={{ fontSize:28, fontWeight:800, color:'#111827', letterSpacing:'-.03em', lineHeight:1.1 }}>{m.value}</div>
                  <div style={{ fontSize:11, color:m.g?'#16a34a':'#6b7280', marginTop:4, fontWeight:600 }}>{m.delta}</div>
                </div>
              ))}
            </div>}

            {/* ── Gantt (scenario mode only) ── */}
            {!showQuote && isScenMode && GanttComp && (
              <div style={{ padding:'14px 20px 18px', borderTop:'1px solid rgba(0,0,0,.05)' }}>
                <GanttComp rows={sc.bars} />
              </div>
            )}

          </div>
        </div>

        {/* proof strip */}
        <div className="fb-reveal" style={{ display:'flex', flexWrap:'wrap', justifyContent:'center', gap:'clamp(20px,4vw,52px)', marginTop:40, paddingTop:26, borderTop:'1px solid var(--hairline)', color:'var(--text-muted)' }}>
          {[['94–97%','on-time delivery'],['8–16 wks','to full build'],['15-min','drift audits'],['₹2.4Cr','capital freed / plant']].map(([n,l]) => (
            <div key={l} style={{ textAlign:'center' }}>
              <div style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:22, color:'var(--text-primary)', letterSpacing:'-.02em' }} className="fb-mono">{n}</div>
              <div style={{ fontSize:12.5, marginTop:2 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ───────────────────────── How it works (brain viz) ────────────────────────
function HowItWorks() {
  return (
    <section id="how" style={{ position: 'relative', overflow: 'hidden', lineHeight: 0 }}>
      <iframe
        src="/brain-3d.html"
        title="Factory Brain Knowledge Graph"
        style={{ width: '100%', height: '88vh', minHeight: 520, border: 'none', display: 'block' }}
        loading="lazy"
      />
    </section>
  );
}

// ───────────────────────── Before / After comparison ──────────────────────
function Surfaces() {
  const CX = 200, CY = 200;
  const [activeStep, setActiveStep] = React.useState(0);

  React.useEffect(() => {
    const id = setInterval(() => setActiveStep(s => (s + 1) % 6), 1100);
    return () => clearInterval(id);
  }, []);

  const chaos = [
    { x: 200, y: 14,  t: 'Spreadsheets'  },
    { x: 295, y: 52,  t: 'Email Chains'  },
    { x: 330, y: 185, t: 'ERP Lookup'    },
    { x: 310, y: 325, t: 'Manual Calc'   },
    { x: 200, y: 385, t: 'Rework Loop'   },
    { x: 90,  y: 325, t: 'Fire Drills'   },
    { x: 62,  y: 185, t: 'Whiteboard'    },
    { x: 105, y: 52,  t: 'Phone Calls'   },
  ];

  const cleanSteps = [
    { t: 'Prompt Input',    s: 'describe the outcome'     },
    { t: 'Capacity Model',  s: 'live plant constraints'   },
    { t: 'Auto Schedule',   s: 'feasible Gantt generated' },
    { t: 'Conflict Checks', s: 'late orders flagged'      },
    { t: 'Decision Apps',   s: 'rush, maintenance & more' },
    { t: 'Execute & Track', s: 'floor sync in real time'  },
  ];

  function lp(n) {
    if (n.x < 150) return { tx: n.x - 10, ty: n.y + 4,  a: 'end'    };
    if (n.x > 250) return { tx: n.x + 10, ty: n.y + 4,  a: 'start'  };
    if (n.y < 80)  return { tx: n.x,       ty: n.y - 12, a: 'middle' };
    return               { tx: n.x,       ty: n.y + 18, a: 'middle' };
  }

  const colHead = (bold, rest, accent) => (
    <div style={{
      fontSize: 13, fontWeight: 700, letterSpacing: '.11em', textTransform: 'uppercase',
      color: 'var(--text-muted)', marginBottom: 20, textAlign: 'center',
      paddingBottom: 12, borderBottom: accent ? '2px solid var(--accent)' : '1px solid var(--hairline)',
    }}>
      <b style={{ color: accent ? 'var(--accent)' : 'var(--text-primary)' }}>{bold}</b> {rest}
    </div>
  );

  return (
    <section id="product" className="fb-section" style={{ background: 'var(--bg-subtle)' }}>
      <div className="fb-wrap">

        {/* heading */}
        <div style={{ textAlign: 'center', maxWidth: 680, margin: '0 auto clamp(40px,5vw,60px)' }}>
          <div className="fb-reveal"><Eyebrow>The difference</Eyebrow></div>
          <h2 className="fb-h2 fb-reveal" style={{ marginTop: 14 }}>
            Scheduling software <b>that actually works.</b>
          </h2>
          <p className="fb-lead fb-reveal" style={{ marginTop: 14 }}>
            Replace the spreadsheet–ERP–whiteboard loop with a single prompt.
          </p>
        </div>

        {/* comparison grid */}
        <div className="fb-reveal fb-surfaces-grid" style={{
          display: 'grid',
          gridTemplateColumns: '172px 1fr 1fr 172px',
          columnGap: 20,
          alignItems: 'start',
        }}>

          {/* ── left stat cards (WITHOUT) ── */}
          <div className="fb-surfaces-stat" style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 96 }}>
            {[['Daily\nscheduling', '2–4 hours'], ['Absorb a\nrush order', '1–2 days']].map(([lbl, val]) => (
              <div key={lbl} className="fb-card" style={{ padding: '18px 20px' }}>
                <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.5, color: 'var(--text-secondary)', whiteSpace: 'pre-line', marginBottom: 10 }}>{lbl}</div>
                <div style={{ color: 'var(--danger)', fontWeight: 700, fontSize: 22 }}>{val}</div>
              </div>
            ))}
          </div>

          {/* ── WITHOUT column ── */}
          <div className="fb-surfaces-col-without">
            {colHead('WITHOUT', 'Factory Brain', false)}
            <svg viewBox="-60 -10 510 430" style={{ width: '100%', height: 'auto', display: 'block' }}>
              {/* spoke lines — drawn before ellipse so it occludes inner ends */}
              {chaos.map((n, i) => (
                <line key={'sp'+i} x1={n.x} y1={n.y} x2={CX} y2={CY}
                  stroke="var(--border-strong)" strokeWidth="1.4" opacity="0.6" />
              ))}
              {/* cross-links with marching dashes — conveys frantic back-and-forth */}
              {[[295,52,330,185],[200,14,330,185],[90,325,310,325],[62,185,105,52]].map(([x1,y1,x2,y2],i) => (
                <line key={'xl'+i} x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke="var(--border-strong)" strokeWidth="1.3" opacity="0.45"
                  strokeDasharray="5 4">
                  <animate attributeName="stroke-dashoffset" from="0" to="9"
                    dur="0.5s" repeatCount="indefinite" />
                </line>
              ))}
              {/* central ellipse — fixed, stays still */}
              <ellipse cx={CX} cy={CY} rx="66" ry="80"
                fill="var(--bg-elev)" stroke="var(--border-strong)" strokeWidth="1.5" />
              <text x={CX} y={CY - 22} textAnchor="middle"
                fontSize="9" fontWeight="800" letterSpacing="2" fill="var(--text-muted)">SCHEDULING</text>
              {/* file icon orbits the ellipse — "going in circles, never resolving" */}
              <defs>
                <path id="fbOrbitPath" d="M 200,120 A 66,80 0 0 1 266,200 A 66,80 0 0 1 200,280 A 66,80 0 0 1 134,200 A 66,80 0 0 1 200,120" />
              </defs>
              <g>
                <animateMotion dur="5s" repeatCount="indefinite" rotate="0">
                  <mpath href="#fbOrbitPath" />
                </animateMotion>
                <g transform="translate(-12, -12)">
                  <path fillRule="evenodd" clipRule="evenodd"
                    d="M14 22H10C6.22876 22 4.34315 22 3.17157 20.8284C2 19.6569 2 17.7712 2 14V10C2 6.22876 2 4.34315 3.17157 3.17157C4.34315 2 6.23869 2 10.0298 2C10.6358 2 11.1214 2 11.53 2.01666C11.5166 2.09659 11.5095 2.17813 11.5092 2.26057L11.5 5.09497C11.4999 6.19207 11.4998 7.16164 11.6049 7.94316C11.7188 8.79028 11.9803 9.63726 12.6716 10.3285C13.3628 11.0198 14.2098 11.2813 15.0569 11.3952C15.8385 11.5003 16.808 11.5002 17.9051 11.5001L18 11.5001H21.9574C22 12.0344 22 12.6901 22 13.5629V14C22 17.7712 22 19.6569 20.8284 20.8284C19.6569 22 17.7712 22 14 22Z"
                    fill="var(--text-secondary)" opacity="0.6" />
                  <path
                    d="M11.5092 2.2601L11.5 5.0945C11.4999 6.1916 11.4998 7.16117 11.6049 7.94269C11.7188 8.78981 11.9803 9.6368 12.6716 10.3281C13.3629 11.0193 14.2098 11.2808 15.057 11.3947C15.8385 11.4998 16.808 11.4997 17.9051 11.4996L21.9574 11.4996C21.9698 11.6552 21.9786 11.821 21.9848 11.9995H22C22 11.732 22 11.5983 21.9901 11.4408C21.9335 10.5463 21.5617 9.52125 21.0315 8.79853C20.9382 8.6713 20.8743 8.59493 20.7467 8.44218C19.9542 7.49359 18.911 6.31193 18 5.49953C17.1892 4.77645 16.0787 3.98536 15.1101 3.3385C14.2781 2.78275 13.862 2.50487 13.2915 2.29834C13.1403 2.24359 12.9408 2.18311 12.7846 2.14466C12.4006 2.05013 12.0268 2.01725 11.5 2.00586L11.5092 2.2601Z"
                    fill="var(--text-secondary)" />
                </g>
              </g>
              {/* node dots — each pulses at a different rate, nervously */}
              {chaos.map((n, i) => {
                const p   = lp(n);
                const dur = (1.6 + i * 0.18).toFixed(2) + 's';
                const beg = (i * 0.22).toFixed(2) + 's';
                return (
                  <g key={'nd'+i}>
                    <circle cx={n.x} cy={n.y} r="5.5" fill="var(--border-strong)">
                      <animate attributeName="r"
                        values="5.5;9;5.5" dur={dur} begin={beg} repeatCount="indefinite" />
                      <animate attributeName="fill-opacity"
                        values="1;0.45;1" dur={dur} begin={beg} repeatCount="indefinite" />
                    </circle>
                    <text x={p.tx} y={p.ty} textAnchor={p.a}
                      fontSize="17" fontWeight="500" fill="var(--text-secondary)">{n.t}</text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* ── WITH column ── */}
          <div className="fb-surfaces-col-with">
            {colHead('WITH', 'Patternlab', true)}
            <svg viewBox="0 0 510 430" style={{ width: '100%', height: 'auto', display: 'block' }}>
              {/* faint full spine */}
              <line x1="128" y1="22" x2="128" y2="382"
                stroke="var(--accent-line)" strokeWidth="3" />
              {/* accent progress spine — grows as steps complete */}
              {activeStep > 0 && (
                <line x1="128" y1="22" x2="128" y2={22 + activeStep * 72}
                  stroke="var(--accent)" strokeWidth="3" />
              )}
              {cleanSteps.map((s, i) => {
                const y       = 22 + i * 72;
                const active  = i === activeStep;
                const done    = i < activeStep;
                return (
                  <g key={s.t}>
                    {/* glow ring on the active step */}
                    {active && (
                      <circle cx="128" cy={y} r="20" fill="var(--accent)" opacity="0.2">
                        <animate attributeName="r"     values="14;28;14" dur="1.1s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.25;0;0.25" dur="1.1s" repeatCount="indefinite" />
                      </circle>
                    )}
                    {/* step dot */}
                    <circle cx="128" cy={y} r={active ? 11 : 9}
                      fill={active || done ? 'var(--accent)' : 'var(--bg-page)'}
                      stroke="var(--accent)" strokeWidth={active ? 3 : 2.5} />
                    {/* checkmark on completed steps */}
                    {done && (
                      <text x="128" y={y + 5} textAnchor="middle"
                        fontSize="11" fontWeight="900" fill="white">✓</text>
                    )}
                    {/* step label */}
                    <text x="152" y={y - 1} fontSize="22" fontWeight="700"
                      fill={active ? 'var(--text-primary)' : done ? 'var(--text-secondary)' : 'var(--text-faint)'}>
                      {s.t}
                    </text>
                    {/* step sub-description */}
                    <text x="152" y={y + 20} fontSize="16"
                      fill={active ? 'var(--accent)' : done ? 'var(--text-muted)' : 'var(--text-faint)'}>
                      {s.s}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* ── right stat cards (WITH) ── */}
          <div className="fb-surfaces-stat" style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 96 }}>
            {[['Daily\nscheduling', '15 minutes'], ['Absorb a\nrush order', '5 minutes']].map(([lbl, val]) => (
              <div key={lbl} className="fb-card" style={{ padding: '18px 20px' }}>
                <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.5, color: 'var(--text-secondary)', whiteSpace: 'pre-line', marginBottom: 10 }}>{lbl}</div>
                <div style={{ color: 'var(--success-d)', fontWeight: 700, fontSize: 22 }}>{val}</div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}

// ───────────────────────── Per-tab animated viz ────────────────────────────
function AppViz({ idx }) {
  const box = {
    background:'var(--bg-subtle)', border:'1px solid var(--border)',
    borderRadius:14, padding:'16px 15px', overflow:'hidden',
    fontFamily:'var(--font-body)', minHeight:280,
  };
  const lbl = { fontSize:9, fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase', color:'var(--text-muted)', marginBottom:12 };
  // helper: one-shot fade-in-up with a delay
  const inn = (d, extra) => ({ opacity:0, animation:`agIn .4s ${d}s both${extra?' , '+extra:''}` });

  /* ── 0: Rush Order Triage ── */
  if (idx === 0) return (
    <div style={box}>
      <div style={lbl}>Live triage</div>
      <div style={{ ...inn(0), background:'#fff', border:'1.5px solid #f59e0b', borderRadius:10, padding:'10px 12px', marginBottom:14, boxShadow:'0 2px 10px rgba(245,158,11,.12)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:5 }}>
          <span style={{ fontSize:9, fontWeight:800, letterSpacing:'.08em', background:'#f59e0b', color:'#fff', padding:'2px 8px', borderRadius:4, animation:'agPuls 1.5s infinite' }}>RUSH</span>
          <span style={{ fontSize:12, fontWeight:700, color:'#111' }}>ORD-4521</span>
        </div>
        <div style={{ fontSize:11.5, color:'#374151' }}>2,000 units PP-Bag · needed Tue</div>
      </div>
      {[
        { icon:'✓', c:'#22c55e', bg:'rgba(34,197,94,.07)',    bd:'rgba(34,197,94,.22)',   t:'ORD-4519 — fits, confirmed',  d:1.0 },
        { icon:'↓', c:'#3b82f6', bg:'rgba(59,130,246,.06)',   bd:'rgba(59,130,246,.18)',  t:'ORD-4412 — pushed 2 days',   d:1.6 },
        { icon:'○', c:'#9ca3af', bg:'rgba(156,163,175,.06)',  bd:'rgba(156,163,175,.18)', t:'ORD-4380 — held for now',    d:2.2 },
      ].map((r,i) => (
        <div key={i} style={{ ...inn(r.d), display:'flex', alignItems:'center', gap:8, padding:'7px 10px', borderRadius:8, background:r.bg, border:`1px solid ${r.bd}`, marginBottom:7 }}>
          <span style={{ fontSize:13, fontWeight:800, color:r.c, width:16, textAlign:'center', flexShrink:0 }}>{r.icon}</span>
          <span style={{ fontSize:12, color:'var(--text-secondary)' }}>{r.t}</span>
        </div>
      ))}
      <div style={{ ...inn(2.9), textAlign:'center', fontSize:11, color:'var(--text-muted)', marginTop:6 }}>
        Decision made in <b style={{ color:'#22c55e' }}>18 seconds</b>
      </div>
    </div>
  );

  /* ── 1: Capacity Planner ── */
  if (idx === 1) return (
    <div style={box}>
      <div style={lbl}>4-week load · all workcenters</div>
      {[
        { name:'Printing',   pct:72,  c:'#22c55e', d:0,  over:false },
        { name:'Lamination', pct:88,  c:'#f59e0b', d:.2, over:false },
        { name:'Die Cut',    pct:100, c:'#ef4444', d:.4, over:true  },
        { name:'Finishing',  pct:55,  c:'#22c55e', d:.6, over:false },
      ].map((w,i) => (
        <div key={i} style={{ ...inn(w.d), marginBottom:13 }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
            <span style={{ fontSize:11.5, color:'var(--text-secondary)', fontWeight:500 }}>{w.name}</span>
            <span style={{ fontSize:11, fontWeight:700, color:w.over?'#ef4444':'var(--text-muted)' }}>{w.over?'145%':w.pct+'%'}{w.over?' ⚠':''}</span>
          </div>
          <div style={{ height:8, background:'var(--bg-muted)', borderRadius:99, overflow:'hidden' }}>
            <div style={{ height:'100%', borderRadius:99, background:w.c, width:`${Math.min(w.pct,100)}%`,
              animation: w.over ? `agOver 3.2s 1s infinite` : `agFill .9s ${.5+w.d}s both` }} />
          </div>
        </div>
      ))}
      <div style={{ ...inn(1.6), fontSize:11, color:'#3b82f6', padding:'8px 10px', background:'rgba(59,130,246,.07)', borderRadius:8, border:'1px solid rgba(59,130,246,.15)' }}>
        ↻ Moving 3 orders from Die Cut → next week
      </div>
    </div>
  );

  /* ── 2: Material Shortage War Room ── */
  if (idx === 2) return (
    <div style={box}>
      <div style={lbl}>Shortage ripple analysis</div>
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:10 }}>
        <div style={{ ...inn(0), display:'flex', alignItems:'center', gap:10, alignSelf:'stretch', background:'rgba(239,68,68,.06)', border:'1px solid rgba(239,68,68,.2)', borderRadius:10, padding:'10px 12px' }}>
          <span style={{ fontSize:20, lineHeight:1 }}>🏭</span>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:12, fontWeight:700, color:'var(--text-primary)' }}>HDPE Supplier</div>
            <div style={{ fontSize:10.5, color:'#ef4444', fontWeight:600 }}>Shortage flagged</div>
          </div>
          <div style={{ position:'relative', width:20, height:20, flexShrink:0 }}>
            <div style={{ position:'absolute', inset:0, borderRadius:'50%', border:'2px solid #ef4444', animation:'agRipl 1.3s .5s infinite' }} />
            <div style={{ width:'100%', height:'100%', borderRadius:'50%', border:'2px solid #ef4444' }} />
          </div>
        </div>
        <div style={{ fontSize:18, color:'#ef4444', animation:'agIn .3s .5s both, agBlink 1s 1s infinite', opacity:0 }}>↓</div>
        <div style={{ ...inn(.8), alignSelf:'stretch' }}>
          <div style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'.08em', color:'var(--text-muted)', textAlign:'center', marginBottom:7 }}>5 orders at risk</div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:5, justifyContent:'center' }}>
            {['ORD-201','ORD-208','ORD-213','ORD-219','ORD-224'].map((o,i) => (
              <span key={i} style={{ ...inn(.9+i*.12), fontSize:10.5, padding:'3px 8px', borderRadius:6, background:'rgba(239,68,68,.08)', border:'1px solid rgba(239,68,68,.2)', color:'#b91c1c', fontWeight:600 }}>{o}</span>
            ))}
          </div>
        </div>
        <div style={{ ...inn(1.8), fontSize:18, color:'#22c55e' }}>↓</div>
        <div style={{ ...inn(2.1), alignSelf:'stretch', background:'rgba(34,197,94,.07)', border:'1px solid rgba(34,197,94,.22)', borderRadius:10, padding:'10px 14px', textAlign:'center' }}>
          <div style={{ fontSize:12, fontWeight:700, color:'#15803d' }}>✓ Substitute sourced</div>
          <div style={{ fontSize:10.5, color:'var(--text-muted)', marginTop:3 }}>HDPE-A2 · +₹1.2/kg · 2-day lead time</div>
        </div>
      </div>
    </div>
  );

  /* ── 3: Changeover Optimizer ── */
  if (idx === 3) {
    const JC = { A:'#5189f3', B:'#f59e0b', C:'#8b5cf6' };
    return (
      <div style={box}>
        <div style={lbl}>Run-sequence optimizer</div>
        <div style={{ ...inn(.1), marginBottom:14 }}>
          <div style={{ fontSize:10.5, color:'var(--text-muted)', marginBottom:7 }}>BEFORE · 5 changeovers</div>
          <div style={{ display:'flex', gap:4, marginBottom:6 }}>
            {['A','B','A','C','A','B'].map((b,i) => (
              <div key={i} style={{ width:33, height:27, borderRadius:7, background:JC[b], opacity:.5, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:800, color:'#fff' }}>{b}</div>
            ))}
          </div>
          <div style={{ fontSize:10.5, color:'#ef4444', fontWeight:600 }}>⏱ 240 min setup time</div>
        </div>
        <div style={{ ...inn(.75), textAlign:'center', fontSize:18, marginBottom:12 }}>↓</div>
        <div style={{ ...inn(1.05), marginBottom:14 }}>
          <div style={{ fontSize:10.5, color:'var(--text-muted)', marginBottom:7 }}>AFTER · 2 changeovers</div>
          <div style={{ display:'flex', gap:4, marginBottom:6 }}>
            {['A','A','A','B','B','C'].map((b,i) => (
              <div key={i} style={{ width:33, height:27, borderRadius:7, background:JC[b], display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:800, color:'#fff', animation:`agGlow 2.2s ${i*.15+1.3}s infinite` }}>{b}</div>
            ))}
          </div>
          <div style={{ fontSize:10.5, color:'#22c55e', fontWeight:600 }}>⏱ 96 min setup time (−60%)</div>
        </div>
        <div style={{ ...inn(2.1), textAlign:'center', padding:'11px 8px', background:'var(--accent-soft)', borderRadius:10 }}>
          <span style={{ fontSize:26, fontWeight:800, color:'var(--accent)', fontFamily:'var(--font-display)', letterSpacing:'-.03em' }}>−25%</span>
          <div style={{ fontSize:10.5, color:'var(--text-muted)', marginTop:2 }}>weekly changeover time</div>
        </div>
      </div>
    );
  }

  /* ── 4: Promise-Date Checker ── */
  if (idx === 4) return (
    <div style={box}>
      <div style={lbl}>Feasibility check</div>
      <div style={{ ...inn(0) }}>
        {[['Product','PP-Woven Bag · 12″'],['Quantity','8,000 units'],['Priority','High · Key account']].map(([l,v],i) => (
          <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', borderBottom:'1px solid var(--hairline)', fontSize:12 }}>
            <span style={{ color:'var(--text-muted)' }}>{l}</span>
            <span style={{ color:'var(--text-secondary)', fontWeight:500 }}>{v}</span>
          </div>
        ))}
      </div>
      <div style={{ ...inn(.9), textAlign:'center', padding:'12px 0 8px' }}>
        <div style={{ display:'flex', justifyContent:'center', gap:5, marginBottom:6 }}>
          {[0,.25,.5].map(d => (
            <div key={d} style={{ width:6, height:6, borderRadius:'50%', background:'var(--accent)', animation:`agBlink 1.1s ${d}s infinite` }} />
          ))}
        </div>
        <div style={{ fontSize:11, color:'var(--text-muted)' }}>Checking BOM · routing · queue…</div>
      </div>
      <div style={{ opacity:0, animation:'agPop 3.2s 0s infinite', background:'rgba(34,197,94,.07)', border:'1px solid rgba(34,197,94,.22)', borderRadius:12, padding:'14px', textAlign:'center' }}>
        <div style={{ fontSize:28, fontWeight:800, color:'#15803d', fontFamily:'var(--font-display)', letterSpacing:'-.03em' }}>Aug 14</div>
        <div style={{ fontSize:11, color:'var(--text-secondary)', marginTop:3 }}>Earliest feasible date</div>
        <div style={{ display:'flex', justifyContent:'center', gap:5, marginTop:10 }}>
          {['BOM ✓','Route ✓','Queue ✓'].map(t => (
            <span key={t} style={{ fontSize:10, padding:'2px 7px', borderRadius:5, background:'rgba(34,197,94,.15)', color:'#15803d', fontWeight:600 }}>{t}</span>
          ))}
        </div>
        <div style={{ marginTop:7, fontSize:11, fontWeight:700, color:'#15803d' }}>Confidence: 94%</div>
      </div>
    </div>
  );

  /* ── 5: Production Scheduler (Gantt) ── */
  const gantt = [
    {
      wc: 'Printing',
      b: [{id:'ORD-201',c:'#5189f3',f:2.2},{id:'ORD-208',c:'#8b5cf6',f:1.5},{gap:true,f:.9},{id:'ORD-215',c:'#f59e0b',f:2}],
      a: [{id:'ORD-201',c:'#5189f3',f:2.2},{id:'ORD-215',c:'#f59e0b',f:2},{id:'ORD-208',c:'#8b5cf6',f:1.5}],
    },
    {
      wc: 'Die Cut',
      b: [{id:'ORD-208',c:'#8b5cf6',f:1.5},{gap:true,f:1.1},{id:'ORD-201',c:'#5189f3',f:2.2},{id:'ORD-215',c:'#f59e0b',f:1.5}],
      a: [{id:'ORD-208',c:'#8b5cf6',f:1.5},{id:'ORD-201',c:'#5189f3',f:2.2},{id:'ORD-215',c:'#f59e0b',f:1.5}],
    },
    {
      wc: 'Finishing',
      b: [{id:'ORD-215',c:'#f59e0b',f:1.2},{id:'ORD-201',c:'#5189f3',f:2},{gap:true,f:.7},{id:'ORD-208',c:'#8b5cf6',f:2}],
      a: [{id:'ORD-215',c:'#f59e0b',f:1.2},{id:'ORD-208',c:'#8b5cf6',f:2},{id:'ORD-201',c:'#5189f3',f:2}],
    },
  ];
  const rowLbl = { fontSize:8.5, fontWeight:700, letterSpacing:'.06em', textTransform:'uppercase', color:'var(--text-faint)', marginBottom:3 };
  const blockBase = (c, bright) => ({
    borderRadius:5, display:'flex', alignItems:'center', justifyContent:'center',
    fontSize:7.5, fontWeight:700, color:c,
    background: c + (bright ? '2e' : '1a'),
    border: `1.5px solid ${c}${bright ? '88' : '44'}`,
    height:22,
  });
  return (
    <div style={box}>
      <div style={lbl}>Gantt · sequence optimiser</div>

      {/* BEFORE */}
      <div style={inn(.05)}>
        <div style={{ fontSize:10, fontWeight:700, color:'var(--text-muted)', marginBottom:7 }}>BEFORE · 3 idle gaps</div>
        {gantt.map((row,ri) => (
          <div key={ri} style={{ marginBottom:7 }}>
            <div style={rowLbl}>{row.wc}</div>
            <div style={{ display:'flex', gap:3 }}>
              {row.b.map((s,bi) => s.gap
                ? <div key={bi} style={{ flex:s.f, height:22, borderRadius:5, border:'1.5px dashed rgba(239,68,68,.4)', background:'rgba(239,68,68,.05)' }} />
                : <div key={bi} style={{ flex:s.f, ...blockBase(s.c,false) }}>{s.id}</div>
              )}
            </div>
          </div>
        ))}
        <div style={{ fontSize:10, color:'#ef4444', fontWeight:700, marginTop:2 }}>⏱ 108 min idle time</div>
      </div>

      {/* Transition indicator */}
      <div style={{ ...inn(.82), textAlign:'center', margin:'7px 0', fontSize:10.5, color:'var(--accent)', fontWeight:700, letterSpacing:'.04em' }}>
        ↓ AI resequences
      </div>

      {/* AFTER */}
      <div style={inn(1.05)}>
        <div style={{ fontSize:10, fontWeight:700, color:'var(--text-muted)', marginBottom:7 }}>AFTER · gaps closed</div>
        {gantt.map((row,ri) => (
          <div key={ri} style={{ marginBottom:7 }}>
            <div style={rowLbl}>{row.wc}</div>
            <div style={{ display:'flex', gap:3 }}>
              {row.a.map((s,bi) => (
                <div key={bi} style={{
                  flex:s.f, ...blockBase(s.c,true),
                  opacity:0,
                  animation:`agInL .38s ${1.1+ri*.1+bi*.09}s both`,
                }}>{s.id}</div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Result badge */}
      <div style={{ ...inn(2.05), display:'flex', alignItems:'center', justifyContent:'space-between',
        background:'rgba(34,197,94,.07)', border:'1px solid rgba(34,197,94,.2)', borderRadius:10, padding:'9px 13px', marginTop:5,
      }}>
        <span style={{ fontSize:11, fontWeight:700, color:'#15803d' }}>✓ Schedule tightened</span>
        <span style={{ fontSize:13, fontWeight:800, color:'#15803d', fontFamily:'var(--font-display)', letterSpacing:'-.02em' }}>−35% idle</span>
      </div>
    </div>
  );
}

// ───────────────────────── RFQ Features ─────────────────────────────────────
function RFQFeatures() {
  const features = [
    {
      icon: 'upload',
      title: 'Upload Any RFQ Format',
      desc: 'PDF, Excel, Word, or plain email — Factory Brain reads it all. No templates, no copy-paste, no manual data entry.',
      tag: 'Any format',
      color: '#5189f3',
    },
    {
      icon: 'zap',
      title: 'Quotation in 30 Seconds',
      desc: 'The moment your file lands, material costs, sheet nesting, wastage, and price breaks are calculated in real time.',
      tag: '30 sec',
      color: '#f59e0b',
    },
    {
      icon: 'layers',
      title: 'Multi-SKU & Variants',
      desc: 'Quote a single carton or an entire product range at once. Each SKU gets its own cost breakdown and job order.',
      tag: 'Batch ready',
      color: '#8b5cf6',
    },
    {
      icon: 'box',
      title: 'Substrate & Board Matching',
      desc: 'Grammage, caliper, coating, and finish are matched against your live stock. Substitutions flagged automatically.',
      tag: 'Live inventory',
      color: '#0d9488',
    },
    {
      icon: 'filter',
      title: 'Colour & Print Costing',
      desc: 'CMYK, spot, UV, foil, emboss — every finishing option priced accurately, not rounded up for comfort.',
      tag: 'Exact costing',
      color: '#ec4899',
    },
    {
      icon: 'send',
      title: 'One-Click Job Order',
      desc: 'Accept a quote and it becomes a job order instantly — routed to the floor with BOM, routing, and delivery date attached.',
      tag: 'Auto-routed',
      color: '#16a34a',
    },
  ];

  return (
    <section style={{
      background: 'var(--bg-page)',
      padding: 'clamp(96px,11vw,140px) var(--page-px) clamp(64px,9vw,108px)',
    }}>
      <div style={{ maxWidth: 1120, margin: '0 auto' }}>

        {/* header — centred, full grid width */}
        <div style={{ textAlign: 'center', marginBottom: 'clamp(36px,5vw,60px)', paddingTop: 20 }}>
          <div className="fb-reveal"><Eyebrow>RFQ & Quoting</Eyebrow></div>
          <h2 className="fb-h2 fb-reveal" style={{ marginTop: 14, maxWidth: 680, margin: '14px auto 0' }}>
            From inquiry to job order — without touching a spreadsheet.
          </h2>
          <p className="fb-lead fb-reveal" style={{ marginTop: 16, maxWidth: 560, margin: '16px auto 0' }}>
            Factory Brain reads your RFQ, calculates every cost live, and converts an accepted quote into a production-ready job order. The whole loop in under a minute.
          </p>
        </div>

        {/* feature grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 'clamp(12px,1.5vw,18px)',
        }}>
          {features.map((f, i) => (
            <div key={f.title} className="fb-reveal" style={{
              transitionDelay: `${i * 0.07}s`,
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderTop: `3px solid ${f.color}`,
              borderRadius: 14,
              padding: 'clamp(20px,2.2vw,28px)',
              display: 'flex', flexDirection: 'column', gap: 14,
              transition: 'box-shadow .22s, transform .22s',
              cursor: 'default',
            }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 8px 32px ${f.color}22`; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = ''; e.currentTarget.style.transform = ''; }}
            >
              {/* icon row */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{
                  width: 42, height: 42, borderRadius: 11,
                  background: `${f.color}18`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon name={f.icon} size={19} style={{ color: f.color }} />
                </div>
                <span style={{
                  fontSize: 10, fontWeight: 700, letterSpacing: '.08em',
                  textTransform: 'uppercase',
                  color: f.color,
                  background: `${f.color}14`,
                  borderRadius: 20, padding: '4px 10px',
                  whiteSpace: 'nowrap',
                  border: `1px solid ${f.color}30`,
                }}>{f.tag}</span>
              </div>
              {/* text */}
              <div>
                <div style={{ fontSize: 'clamp(13.5px,1.3vw,15px)', fontWeight: 700, color: 'var(--text-hi)', marginBottom: 7, lineHeight: 1.3 }}>{f.title}</div>
                <div style={{ fontSize: 'clamp(12px,1.05vw,13px)', color: 'var(--text-muted)', lineHeight: 1.65 }}>{f.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA strip */}
        <div className="fb-reveal" style={{
          marginTop: 'clamp(36px,4vw,52px)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16,
          background: 'linear-gradient(135deg, rgba(81,137,243,.07) 0%, rgba(81,137,243,.03) 100%)',
          border: '1px solid rgba(81,137,243,.2)',
          borderRadius: 16,
          padding: 'clamp(22px,2.5vw,32px) clamp(22px,3vw,40px)',
          marginBottom: 20,
        }}>
          <div>
            <div style={{ fontSize: 'clamp(14px,1.4vw,17px)', fontWeight: 700, color: 'var(--text-hi)', marginBottom: 5 }}>Ready to quote your first RFQ?</div>
            <div style={{ fontSize: 'clamp(12px,1.1vw,13.5px)', color: 'var(--text-muted)' }}>Upload a sample spec and see a quote in 30 seconds — no setup required.</div>
          </div>
          <a href="https://rfq.patternlab.ai/rfq" target="_blank" rel="noopener noreferrer"
            className="fb-btn fb-btn--primary" style={{ whiteSpace: 'nowrap' }}>
            Upload RFQ &rarr;
          </a>
        </div>

      </div>
    </section>
  );
}

// ───────────────────────── Decision apps — tabbed ─────────────────────────
function AppsGallery() {
  const [active, setActive] = React.useState(0);

  const apps = [
    {
      icon: 'zap', t: 'Rush Order Triage',
      d: 'Every rush that lands gets a real answer in seconds — not "let me check and come back to you." Factory Brain evaluates live capacity, shows exactly what gets delayed, and generates a counter-offer with the real cost attached.',
      steps: [
        'Rush arrives → Brain checks live capacity against the current queue instantly',
        'Conflict map shows which orders get bumped and by exactly how many hours',
        'Counter-offer generated: accept as-is, delay order #421 by 2 days, or expedite at ₹18k premium',
        'One-click decision updates the schedule and notifies the floor — no manual re-entry',
      ],
      outcome: '< 2 min', outcomeLabel: 'avg. time to make a confident rush decision',
    },
    {
      icon: 'gauge', t: 'Capacity Planner',
      d: "Stop discovering bottlenecks on the floor on Friday. See 4 weeks of load across every workcenter before it becomes a fire — and know exactly which orders caused the spike.",
      steps: [
        'Live load calculated across all workcenters from actual BOM, routing, and queue',
        'Overloaded slots flagged in advance with every contributing order listed',
        'Drill into any slot to see which commitments are at risk if you don\'t act',
        'Rebalance by moving orders or typing a goal — AI finds the new sequence',
      ],
      outcome: '3 wks', outcomeLabel: 'average early warning before a bottleneck hits',
    },
    {
      icon: 'box', t: 'Material Shortage War Room',
      d: "When a supplier fails, don't wait for the floor to tell you. Factory Brain traces the impact the moment a shortage is flagged — which orders are affected, the cheapest substitution, and who needs to know.",
      steps: [
        'Shortage detected via manual flag, PO alert, or connected sensor feed',
        'Ripple analysis: every affected order with its revised delivery date',
        'Substitution options ranked by cost, lead time, and quality compatibility',
        'Customer comms drafted and schedule patched — all in one action',
      ],
      outcome: '< 10 min', outcomeLabel: 'from shortage alert to a workable recovery plan',
    },
    {
      icon: 'wrench', t: 'Changeover Optimizer',
      d: 'Every minute of setup time is capacity wasted. This app re-sequences production runs to cut changeovers down — without breaking a single committed date or reopening a negotiation with sales.',
      steps: [
        'Current queue and changeover matrix loaded directly from your live model',
        'AI finds the optimal run sequence across all workcenters simultaneously',
        'Every resequencing option verified: no promise-date is broken before you commit',
        'Compare top-3 alternatives side-by-side, then apply with one click',
      ],
      outcome: '−25%', outcomeLabel: 'typical reduction in weekly setup and changeover time',
    },
    {
      icon: 'clock', t: 'Promise-Date Checker',
      d: 'Sales can finally quote dates they\'ll stand behind. Before committing to a customer, check the live schedule and get a delivery date grounded in real capacity — not optimistic guesswork.',
      steps: [
        'Input: product, quantity, customer priority, and any special constraints',
        'Brain checks BOM availability, routing, and current queue load end-to-end',
        'Earliest feasible date returned with a confidence breakdown by constraint',
        'What-if mode: "What if we expedite raw material?" runs instantly',
      ],
      outcome: '−22 pts', outcomeLabel: 'reduction in late-delivery rate within 90 days',
    },
    {
      icon: 'calendar', t: 'Production Scheduler',
      d: 'Stop sequencing orders in Excel and chasing the floor with updated printouts. The scheduler builds a live, constraint-aware plan across every workcenter — and keeps it current as orders land, materials shift, and capacity changes.',
      steps: [
        'Orders pulled from your queue; BOM, routing, and workcenter capacity loaded automatically',
        'AI sequences runs to minimise idle time, changeovers, and late deliveries simultaneously',
        'Drag to override any slot — the plan re-optimises around your decision in real time',
        'Floor receives the updated schedule instantly; no PDF, no WhatsApp, no re-entry',
      ],
      outcome: '−35%', outcomeLabel: 'reduction in schedule breaks within the first month',
    },
  ];

  const a = apps[active];

  return (
    <section id="apps" className="fb-section" style={{ background: 'var(--bg-subtle)' }}>
      <div className="fb-wrap">

        {/* Header */}
        <div style={{ marginBottom: 'clamp(28px,3.5vw,44px)', maxWidth: 640 }}>
          <div className="fb-reveal"><Eyebrow>Features & Applications</Eyebrow></div>
          <h2 className="fb-h2 fb-reveal" style={{ marginTop: 14 }}>Six purpose-built apps. Zero guesswork.</h2>
          <p className="fb-lead fb-reveal" style={{ marginTop: 14 }}>From rush orders to maintenance windows — every critical production decision gets its own app, backed by your live capacity model. No pivot tables, no back-and-forth.</p>
        </div>

        {/* Tab bar */}
        <div className="fb-reveal" style={{
          display: 'flex', flexWrap: 'nowrap', overflowX: 'auto', gap: 2,
          background: 'var(--bg-muted)', borderRadius: '12px 12px 0 0',
          padding: '6px 6px 0', borderBottom: '1px solid var(--border)',
          scrollbarWidth: 'none',
        }}>
          {apps.map((app, i) => (
            <button key={i} onClick={() => setActive(i)} style={{
              display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0,
              padding: '8px 13px', borderRadius: '8px 8px 0 0',
              border: '1px solid transparent', borderBottom: 'none',
              cursor: 'pointer', fontSize: 12.5, fontWeight: 600,
              fontFamily: 'var(--font-body)', transition: 'all .18s', whiteSpace: 'nowrap',
              background: active === i ? 'var(--bg-page)' : 'transparent',
              color: active === i ? 'var(--text-primary)' : 'var(--text-muted)',
              borderColor: active === i ? 'var(--border)' : 'transparent',
              marginBottom: active === i ? '-1px' : '0',
              position: 'relative', zIndex: active === i ? 2 : 1,
            }}>
              <Icon name={app.icon} size={13} style={{ color: active === i ? 'var(--accent)' : 'var(--text-faint)' }} />
              {app.t}
            </button>
          ))}
        </div>

        {/* Tab panel */}
        <div className="fb-reveal fb-card" style={{
          borderRadius: '0 0 12px 12px', padding: 'clamp(24px,3.5vw,40px)',
          borderTop: 'none', position: 'relative',
        }}>
          <div className="fb-apps-panel" style={{ display: 'grid', gridTemplateColumns: '1fr minmax(260px,290px)', gap: 40, alignItems: 'start' }}>

            {/* Left — description + steps */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                <div style={{ width: 48, height: 48, borderRadius: 13, background: 'var(--accent-soft)', color: 'var(--accent)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                  <Icon name={a.icon} size={24} />
                </div>
                <h3 style={{ fontSize: 22, fontWeight: 800, fontFamily: 'var(--font-display)', margin: 0, letterSpacing: '-.02em' }}>{a.t}</h3>
              </div>

              <p style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--text-secondary)', margin: '0 0 28px', maxWidth: 580 }}>{a.d}</p>

              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 14 }}>How it works</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {a.steps.map((s, i) => (
                  <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div style={{
                      width: 24, height: 24, borderRadius: '50%', flexShrink: 0, marginTop: 1,
                      background: 'var(--accent-soft)', color: 'var(--accent)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, fontWeight: 800, fontFamily: 'var(--font-display)',
                    }}>{i + 1}</div>
                    <span style={{ fontSize: 14, lineHeight: 1.65, color: 'var(--text-secondary)' }}>{s}</span>
                  </div>
                ))}
              </div>

              <a href="https://rfq.patternlab.ai/login" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, marginTop: 32, fontSize: 13, fontWeight: 600, color: 'var(--accent)', textDecoration: 'none' }}>
                Try it for free <Icon name="arrowRight" size={14} />
              </a>
            </div>

            {/* Right — animated viz */}
            <AppViz key={active} idx={active} />

          </div>
        </div>

      </div>
    </section>
  );
}

// ───────────────────────── Proof band ──────────────────────────────────────
function Proof() {
  const stats = [
    ['+11pp', 'on-time delivery rate', '63% → 74%'],
    ['5h → 0', 'weekly planning time', 'fully automated'],
    ['−60%', 'changeover time', '45 min → 18 min'],
    ['3 plants', '9 lines · 100+ SKUs', 'single system'],
  ];
  return (
    <section className="fb-section--tight" style={{ background: 'var(--navy)', color: '#fff', padding: 'clamp(64px,9vw,100px) 0' }}>
      <div className="fb-wrap">
        {/* eyebrow + logo */}
        <div className="fb-reveal" style={{ marginBottom: 'clamp(24px,3vw,36px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(81,137,243,.18)', border: '1px solid rgba(81,137,243,.35)', color: '#7ba9f7', fontSize: 11, fontWeight: 700, letterSpacing: '.09em', textTransform: 'uppercase', padding: '5px 13px', borderRadius: 99 }}>
            Case Study · Avanti Frozen Foods
          </span>
          <img src="/assets/Avanti_Frozen_foods.png" alt="Avanti Frozen Foods" style={{ height: 48, objectFit: 'contain', background: '#fff', borderRadius: 8, padding: '6px 12px' }} />
        </div>

        {/* stats */}
        <div className="fb-grid fb-cols-4" style={{ gap: 8 }}>
          {stats.map(([n, l, sub]) => (
            <div key={l} className="fb-reveal" style={{ padding: '8px 0' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'clamp(28px,3.2vw,42px)', letterSpacing: '-.03em', color: '#fff', lineHeight: 1 }}>{n}</div>
              <div style={{ fontSize: 13.5, color: 'rgba(255,255,255,.75)', marginTop: 5 }}>{l}</div>
              <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,.38)', marginTop: 2 }}>{sub}</div>
            </div>
          ))}
        </div>

        {/* quote + read more */}
        <div className="fb-reveal" style={{ marginTop: 'clamp(32px,4vw,52px)', paddingTop: 'clamp(28px,3vw,40px)', borderTop: '1px solid rgba(255,255,255,.14)', display: 'flex', gap: 32, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 280 }}>
            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'clamp(18px,2vw,26px)', lineHeight: 1.35, letterSpacing: '-.02em', margin: 0, textWrap: 'balance' }}>
              "The planner isn't late because they're slow. They're late because the spreadsheet gives them no way to be on time."
            </p>
            <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 11 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,.12)', display: 'grid', placeItems: 'center', color: '#fff', flexShrink: 0 }}><Icon name="user" size={17} /></div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13.5 }}>PatternLab Implementation Assessment</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,.5)', marginTop: 2 }}>Avanti Frozen Foods · Frozen Food Manufacturing · 3 plants</div>
              </div>
            </div>
          </div>
          <a href="/blog.html#article" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, flexShrink: 0,
            background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.2)',
            color: '#fff', textDecoration: 'none', fontWeight: 600, fontSize: 14,
            padding: '11px 22px', borderRadius: 8, transition: 'background .15s, border-color .15s',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,.15)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,.4)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,.08)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,.2)'; }}
          >
            Read full case study
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </a>
        </div>
      </div>
    </section>
  );
}

function Contact() {
  const [source, setSource] = React.useState('');
  const [submitted, setSubmitted] = React.useState(false);
  const [formRef] = React.useState(() => ({ current: null }));

  const iStyle = {
    width:'100%', boxSizing:'border-box',
    border:'1px solid var(--border)', borderRadius:8,
    padding:'11px 14px', fontSize:14,
    color:'var(--text-primary)', background:'var(--bg-page)',
    outline:'none', fontFamily:'inherit',
    transition:'border-color .15s',
  };
  const lStyle = { fontSize:12, fontWeight:600, letterSpacing:'.04em', textTransform:'uppercase', color:'var(--text-muted)', display:'block', marginBottom:6 };

  function handleSubmit(e) {
    e.preventDefault();
    var fd = new FormData(e.target);
    var data = {};
    fd.forEach(function(v, k) { data[k] = v; });
    data.source = source;
    fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    setSubmitted(true);
  }

  return (
    <section id="contact" className="fb-section">
      <div className="fb-wrap">
        <div className="fb-contact-layout" style={{ display:'grid', gridTemplateColumns:'1fr 1.35fr', gap:'clamp(32px,5vw,72px)', alignItems:'center', maxWidth:1100, margin:'0 auto' }}>

          {/* left */}
          <div>
            <span className="fb-eyebrow fb-reveal" style={{ marginBottom:16 }}>Get in touch</span>
            <h2 className="fb-h2 fb-reveal" style={{ marginTop:12 }}>
              See your real capacity.<br/>In 5 days.
            </h2>
            <p className="fb-lead fb-reveal" style={{ marginTop:14, marginBottom:28 }}>
              Stop guessing. Start committing with confidence. PatternLab deploys sensors in a day, measures your real capacity in a week, and gives you the tools to never miss a delivery again.
            </p>
            {['No disruption to production', 'Works with any machine type', 'Results in 5 days, not 5 months'].map(pt => (
              <div key={pt} className="fb-reveal" style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
                <Icon name="check" size={16} stroke={2.5} style={{ color:'var(--accent)', flexShrink:0 }} />
                <span style={{ fontSize:15, color:'var(--text-secondary)' }}>{pt}</span>
              </div>
            ))}
          </div>

          {/* right — form card */}
          <div className="fb-card fb-reveal" style={{ padding:'clamp(24px,4vw,36px)' }}>
            {submitted ? (
              <div style={{ textAlign:'center', padding:'40px 0' }}>
                <div style={{ width:52, height:52, borderRadius:'50%', background:'var(--accent-soft)', display:'grid', placeItems:'center', margin:'0 auto 16px' }}>
                  <Icon name="check" size={24} stroke={2.5} style={{ color:'var(--accent)' }} />
                </div>
                <h3 className="fb-h3" style={{ margin:'0 0 8px' }}>Request received!</h3>
                <p style={{ fontSize:14, color:'var(--text-muted)' }}>We'll reach out within 1 business day.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <h3 style={{ fontSize:17, fontWeight:700, color:'var(--text-primary)', margin:'0 0 20px', fontFamily:'var(--font-display)' }}>Request a Capacity Assessment</h3>
                <div className="fb-contact-form-cols" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14 }}>
                  <div><label style={lStyle}>Full Name</label><input name="name" required placeholder="Your name" style={iStyle} /></div>
                  <div><label style={lStyle}>Work Email</label><input name="email" required type="email" placeholder="you@company.com" style={iStyle} /></div>
                  <div><label style={lStyle}>Company</label><input name="company" required placeholder="Company name" style={iStyle} /></div>
                  <div><label style={lStyle}>Job Title</label><input name="jobTitle" placeholder="e.g. Plant Manager, VP Operations" style={iStyle} /></div>
                </div>
                <div style={{ marginBottom:14 }}>
                  <label style={lStyle}>Phone Number</label>
                  <input name="phone" type="tel" placeholder="+91 98765 43210" style={iStyle} />
                </div>
                <div style={{ marginBottom:14 }}>
                  <label style={lStyle}>What problem are you trying to solve?</label>
                  <textarea name="message" placeholder="e.g. Frequent late deliveries, capacity bottlenecks, poor visibility..." rows="3"
                    style={{ ...iStyle, resize:'vertical' }} />
                </div>
                <div style={{ marginBottom:20 }}>
                  <label style={{ ...lStyle, marginBottom:10 }}>Where did you hear about PatternLab.ai?</label>
                  <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                    {['LinkedIn','Google','Other'].map(s => (
                      <button type="button" key={s} onClick={() => setSource(s)}
                        style={{ padding:'7px 16px', borderRadius:8, fontSize:13, fontWeight:500, cursor:'pointer', fontFamily:'inherit',
                          border: '1px solid', borderColor: source===s ? 'var(--accent)' : 'var(--border)',
                          background: source===s ? 'var(--accent-soft)' : 'var(--bg-page)',
                          color: source===s ? 'var(--accent)' : 'var(--text-secondary)',
                          transition:'all .15s' }}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <button type="submit" className="fb-btn fb-btn--primary" style={{ width:'100%', justifyContent:'center', padding:'13px' }}>
                  Get My Capacity Assessment
                </button>
                <p style={{ textAlign:'center', fontSize:12, color:'var(--text-muted)', margin:'10px 0 0' }}>Free assessment. No commitment required.</p>
              </form>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}

// ─────────────────────── SchedulingSection ─────────────────────────────────
function SchedulingSection() {
  const [on, setOn] = React.useState(false);
  const secRef = React.useRef(null);

  React.useEffect(() => {
    const el = secRef.current;
    if (!el || !window.IntersectionObserver) { setOn(true); return; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setOn(true); io.disconnect(); } }, { threshold: 0.12 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const toRad = d => (d - 90) * Math.PI / 180;
  const cx = 120, cy = 108, r = 78;
  const spiderNodes = [
    'Spreadsheets', 'Email Chains', 'ERP Lookup', 'Manual Calc',
    'Rework Loop', 'Fire Drills', 'Whiteboard', 'Phone Calls',
  ].map((label, i) => {
    const a = toRad(i * 45);
    return { label, x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  });

  const steps = [
    { t: 'Prompt Input',    s: 'describe the outcome',      done: true   },
    { t: 'Capacity Model',  s: 'live plant constraints',    done: true   },
    { t: 'Auto Schedule',   s: 'feasible Gantt generated',  done: true   },
    { t: 'Conflict Checks', s: 'late orders flagged',       done: true   },
    { t: 'Decision Apps',   s: 'rush, maintenance & more',  active: true },
    { t: 'Execute & Track', s: 'floor sync in real time',   done: false  },
  ];

  const StatCard = ({ label, value, good, delay }) => (
    <div style={{
      background: 'var(--bg-card)', borderRadius: 14, padding: '16px 20px',
      boxShadow: '0 2px 12px rgba(0,0,0,.07)', marginBottom: 12,
      border: '1px solid var(--border)',
      opacity: on ? 1 : 0,
      transform: on ? 'translateY(0)' : 'translateY(14px)',
      transition: `opacity .45s ease ${delay}s, transform .45s ease ${delay}s`,
    }}>
      <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 5 }}>{label}</div>
      <div style={{ fontSize: 21, fontWeight: 800, color: good ? '#16a34a' : '#dc2626', fontFamily: 'var(--font-display)', letterSpacing: '-.02em' }}>{value}</div>
    </div>
  );

  return (
    <section ref={secRef} style={{ background: 'var(--bg-subtle)', padding: 'clamp(64px,9vw,108px) var(--page-px)' }}>
      <div style={{ maxWidth: 1180, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 'clamp(40px,5vw,64px)' }}>
          <div className="fb-reveal"><Eyebrow>The Difference</Eyebrow></div>
          <h2 className="fb-h2 fb-reveal" style={{ marginTop: 14 }}>Scheduling software that actually works.</h2>
          <p className="fb-lead fb-reveal" style={{ marginTop: 14, maxWidth: 520, margin: '14px auto 0' }}>
            Replace the spreadsheet–ERP–whiteboard loop with a single prompt.
          </p>
        </div>

        {/* Comparison grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'clamp(140px,15vw,196px) 1fr 1fr clamp(140px,15vw,196px)',
          gap: 'clamp(12px,2vw,28px)',
          alignItems: 'center',
          marginBottom: 20,
        }}>

          {/* Left stat cards */}
          <div>
            <StatCard label="Daily scheduling"   value="2–4 hours" good={false} delay={0.1} />
            <StatCard label="Absorb a rush order" value="1–2 days"  good={false} delay={0.22} />
          </div>

          {/* WITHOUT column — animated spider */}
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: 11, fontWeight: 800, letterSpacing: '.1em', color: '#9ca3af', marginBottom: 20,
              opacity: on ? 1 : 0, transition: 'opacity .4s ease .05s',
            }}>
              <span style={{ color: 'var(--text-primary)' }}>WITHOUT</span> FACTORY BRAIN
            </div>
            <svg width="240" height="216" viewBox="0 0 240 216" style={{ maxWidth: '100%', overflow: 'visible' }}>
              {/* Spokes — draw in one by one */}
              {spiderNodes.map((p, i) => (
                <line key={i}
                  x1={cx} y1={cy} x2={p.x} y2={p.y}
                  stroke="#d1d5db" strokeWidth="1.5"
                  strokeDasharray={r}
                  strokeDashoffset={on ? 0 : r}
                  style={{ transition: `stroke-dashoffset .55s ease ${0.15 + i * 0.08}s` }}
                />
              ))}
              {/* Center circle */}
              <circle cx={cx} cy={cy} r="37"
                fill="white" stroke="#e5e7eb" strokeWidth="1.5"
                style={{ opacity: on ? 1 : 0, transition: 'opacity .4s ease .1s' }}
              />
              <text x={cx} y={cy - 3} textAnchor="middle" fontSize="7" fontWeight="700" letterSpacing="1.5" fill="#9ca3af"
                style={{ opacity: on ? 1 : 0, transition: 'opacity .4s ease .2s' }}>SCHEDULING</text>
              {/* Nodes — pop in after their spoke */}
              {spiderNodes.map((p, i) => {
                const isLeft  = p.x < cx - 12, isRight  = p.x > cx + 12;
                const isTop   = p.y < cy - 12, isBottom = p.y > cy + 12;
                let anchor = 'middle', lx = p.x, ly = p.y;
                if (isLeft)  { anchor = 'end';   lx -= 10; }
                else if (isRight) { anchor = 'start'; lx += 10; }
                if (isTop)    ly -= 10;
                else if (isBottom) ly += 15;
                else ly += 4;
                const nodeDelay = 0.7 + i * 0.07;
                return (
                  <g key={i} style={{ opacity: on ? 1 : 0, transition: `opacity .35s ease ${nodeDelay}s` }}>
                    <circle cx={p.x} cy={p.y} r="4.5" fill="#e5e7eb" stroke="#d1d5db" strokeWidth="1" />
                    <text x={lx} y={ly} textAnchor={anchor} fontSize="9.5" fill="#9ca3af" fontWeight="500">{p.label}</text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* WITH column — animated timeline */}
          <div style={{ borderLeft: '2px solid var(--accent)', paddingLeft: 'clamp(16px,2vw,28px)' }}>
            <div style={{
              fontSize: 11, fontWeight: 800, letterSpacing: '.1em', color: '#9ca3af', marginBottom: 20,
              opacity: on ? 1 : 0, transition: 'opacity .4s ease .3s',
            }}>
              <span style={{ color: 'var(--accent)' }}>WITH</span> PATTERNLAB
            </div>
            {steps.map((step, i) => {
              const d = 0.35 + i * 0.13;
              return (
                <div key={i} style={{ display: 'flex', gap: 11, alignItems: 'flex-start' }}>
                  {/* Dot + connector */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                    <div style={{ position: 'relative', width: 20, height: 20, flexShrink: 0 }}>
                      <div style={{
                        width: 20, height: 20, borderRadius: '50%',
                        background: (step.done || step.active) ? 'var(--accent)' : 'transparent',
                        border: `2px solid ${(step.done || step.active) ? 'var(--accent)' : '#d1d5db'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transform: on ? 'scale(1)' : 'scale(0)',
                        transition: `transform .35s cubic-bezier(.34,1.56,.64,1) ${d}s`,
                      }}>
                        {(step.done || step.active) && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff' }} />}
                      </div>
                      {/* Pulse ring for active step */}
                      {step.active && on && (
                        <div style={{
                          position: 'absolute', inset: -5, borderRadius: '50%',
                          border: '2px solid var(--accent)',
                          animation: 'agRipl 1.6s 1s infinite',
                        }} />
                      )}
                    </div>
                    {i < steps.length - 1 && (
                      <div style={{
                        width: 2, borderRadius: 1, margin: '2px 0',
                        background: step.done ? 'var(--accent)' : '#e5e7eb',
                        height: on ? 26 : 0,
                        transition: `height .3s ease ${d + 0.15}s`,
                        overflow: 'hidden',
                      }} />
                    )}
                  </div>
                  {/* Text */}
                  <div style={{
                    paddingTop: 1,
                    opacity: on ? 1 : 0,
                    transform: on ? 'translateX(0)' : 'translateX(-10px)',
                    transition: `opacity .4s ease ${d + 0.05}s, transform .4s ease ${d + 0.05}s`,
                  }}>
                    <div style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.3, color: step.active ? 'var(--accent)' : 'var(--text-primary)' }}>{step.t}</div>
                    <div style={{ fontSize: 12, color: step.active ? 'var(--accent)' : 'var(--text-muted)', marginBottom: i < steps.length - 1 ? 14 : 0 }}>{step.s}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right stat cards */}
          <div>
            <StatCard label="Daily scheduling"   value="15 minutes" good={true} delay={0.5} />
            <StatCard label="Absorb a rush order" value="5 minutes"  good={true} delay={0.62} />
          </div>

        </div>
      </div>
    </section>
  );
}

// ─────────────────────── WorkflowTimeline ──────────────────────────────────
function WorkflowTimeline() {
  var STEPS = [
    {
      title: 'Upload your RFQ', sub: 'PDF or email thread', tag: 'You', tagClr: '#6b7280', tagBg: 'rgba(0,0,0,.06)',
      detail: 'Drop a PDF or paste an email. PatternLab reads the full RFQ and extracts every field automatically.',
      pills: ['PDF upload', 'Email paste', 'Plain text'],
      auto: 'Specs, quantities, materials, and delivery terms — all extracted',
      iconPaths: ['M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z','M14 2v6h6','M12 12v6','M9 15l3 3 3-3'],
      accent: '#5189f3', accentBg: 'rgba(81,137,243,.08)',
    },
    {
      title: 'Estimate Auto-Created', sub: 'Code, specs, BOM — instant', tag: 'Auto', tagClr: '#5189f3', tagBg: 'rgba(81,137,243,.1)',
      detail: 'A unique EST code is assigned instantly with specs, quantities, full BOM, and cost breakdown — no manual entry.',
      pills: ['EST code assigned', 'BOM extracted', 'Cost calculated'],
      auto: 'Quote ready in seconds, stored in Estimates & History',
      iconPaths: ['M9 11l3 3L22 4','M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11'],
      accent: '#7c5cff', accentBg: 'rgba(124,92,255,.08)',
    },
    {
      title: 'Customer Matched', sub: 'From your master records', tag: 'Auto', tagClr: '#5189f3', tagBg: 'rgba(81,137,243,.1)',
      detail: 'PatternLab matches the customer from your master database — contacts, dispatch days, and pricing tiers pre-filled.',
      pills: ['Contact auto-filled', 'Dispatch days set', 'Pricing tier applied'],
      auto: 'All your clients, ready',
      iconPaths: ['M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2','M23 21v-2a4 4 0 0 0-3-3.87','M16 3.13a4 4 0 0 1 0 7.75','M9 7m-4 0a4 4 0 1 0 8 0a4 4 0 1 0-8 0'],
      accent: '#0ea5a4', accentBg: 'rgba(14,165,164,.08)',
    },
    {
      title: 'Send & Track Status', sub: 'Created → Sent → Confirmed', tag: 'You', tagClr: '#6b7280', tagBg: 'rgba(0,0,0,.06)',
      detail: 'Send the quote in one click. Track every stage on the live kanban board — Created, Sent, In Negotiation, Confirmed.',
      pills: ['One-click send', 'Live kanban board', 'Stage tracking'],
      auto: 'Status updates automatically as quotes progress through stages',
      iconPaths: ['M9 17H5a2 2 0 0 0-2 2v0a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v0a2 2 0 0 0-2-2h-4','M12 3v14','M8 7l4-4 4 4'],
      accent: '#f59e0b', accentBg: 'rgba(245,158,11,.08)',
    },
    {
      title: 'Order in Production', sub: 'Confirmed → Live on floor', tag: 'Live', tagClr: '#16a34a', tagBg: 'rgba(34,197,94,.12)',
      detail: 'Once confirmed, the order goes live on the floor. Track every stage from raw material intake to final dispatch in real time.',
      pills: ['Floor tracking', 'Stage visibility', 'Dispatch confirmed'],
      auto: 'Order lifecycle closed — audit trail archived for 7 years',
      iconPaths: ['M22 11.08V12a10 10 0 1 1-5.93-9.14','M22 4L12 14.01l-3-3'],
      accent: '#22c55e', accentBg: 'rgba(34,197,94,.08)',
    },
  ];

  var activeArr = React.useState(0);
  var active = activeArr[0], setActive = activeArr[1];
  var pausedArr = React.useState(false);
  var paused = pausedArr[0], setPaused = pausedArr[1];
  var opArr = React.useState(1);
  var op = opArr[0], setOp = opArr[1];

  function goTo(i) {
    if (i === active) return;
    setOp(0);
    setTimeout(function() { setActive(i); setOp(1); }, 160);
  }

  React.useEffect(function() {
    if (paused) return;
    var t = setInterval(function() {
      setOp(0);
      setTimeout(function() { setActive(function(p) { return (p + 1) % STEPS.length; }); setOp(1); }, 160);
    }, 2800);
    return function() { clearInterval(t); };
  }, [paused]);

  var s = STEPS[active];

  return (
    <section className="fb-section" style={{ overflow: 'hidden' }}>
      <div className="fb-wrap">
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <Eyebrow className="fb-reveal">HOW PATTERNLAB WORKS</Eyebrow>
          <h2 className="fb-h2 fb-reveal" style={{ margin: '12px 0 12px' }}>RFQ to production.</h2>
          <p className="fb-lead fb-reveal" style={{ maxWidth: 440, margin: '0 auto' }}>
            From a raw quote request to a live floor order — handled end to end.
          </p>
        </div>

        <div className="fb-timeline-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56, alignItems: 'center', maxWidth: 960, margin: '0 auto' }}
          onMouseEnter={function() { setPaused(true); }}
          onMouseLeave={function() { setPaused(false); }}>

          {/* Left: step list */}
          <div>
            {STEPS.map(function(step, i) {
              var isActive = i === active;
              var isDone = i < active;
              return (
                <div key={i} style={{ display: 'flex', gap: 16, cursor: 'pointer' }}
                  onClick={function() { goTo(i); setPaused(true); setTimeout(function() { setPaused(false); }, 7000); }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, width: 32 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: isActive ? 'var(--accent)' : isDone ? 'rgba(81,137,243,.12)' : 'var(--surface)',
                      border: '2px solid ' + (isActive || isDone ? 'var(--accent)' : 'var(--border)'),
                      transition: 'all .35s', flexShrink: 0,
                      boxShadow: isActive ? '0 0 0 6px rgba(81,137,243,.1)' : 'none',
                    }}>
                      {isDone
                        ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                        : <span style={{ fontSize: 11, fontWeight: 700, color: isActive ? '#fff' : 'var(--text-muted)', transition: 'color .3s' }}>{i + 1}</span>}
                    </div>
                    {i < STEPS.length - 1 && (
                      <div style={{ width: 2, flex: 1, minHeight: 20, margin: '4px 0', borderRadius: 1,
                        background: isDone ? 'var(--accent)' : 'var(--border)', transition: 'background .4s' }} />
                    )}
                  </div>
                  <div style={{ paddingBottom: i < STEPS.length - 1 ? 26 : 0, flex: 1, paddingTop: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                      <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-.02em', transition: 'color .3s',
                        color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{step.title}</span>
                      <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 99,
                        background: step.tagBg, color: step.tagClr }}>{step.tag}</span>
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>{step.sub}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: feature card */}
          <div className="fb-timeline-card" style={{ opacity: op, transition: 'opacity .16s ease' }}>
            <div style={{ borderRadius: 20, border: '1px solid var(--border)', overflow: 'hidden', boxShadow: '0 2px 24px rgba(0,0,0,.06)' }}>
              {/* card header */}
              <div style={{ padding: '32px 32px 28px', background: s.accentBg }}>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: s.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    {s.iconPaths.map(function(p, pi) { return <path key={pi} d={p} />; })}
                  </svg>
                </div>
                <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-.03em', marginBottom: 10, lineHeight: 1.2 }}>{s.title}</div>
                <p style={{ margin: 0, fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{s.detail}</p>
              </div>
              {/* card body */}
              <div style={{ padding: '22px 32px', background: 'var(--surface)' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
                  {s.pills.map(function(p) {
                    return (
                      <span key={p} style={{ fontSize: 12, fontWeight: 600, padding: '5px 12px', borderRadius: 99,
                        background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>{p}</span>
                    );
                  })}
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 14px', borderRadius: 10, background: s.accentBg, border: '1px solid ' + s.accent + '22' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={s.accent} strokeWidth="2.5" strokeLinecap="round" style={{ marginTop: 2, flexShrink: 0 }}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{s.auto}</span>
                </div>
              </div>
            </div>

            {/* step dots */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 20 }}>
              {STEPS.map(function(_, i) {
                return (
                  <div key={i} onClick={function() { goTo(i); }}
                    style={{ width: i === active ? 20 : 6, height: 6, borderRadius: 3, cursor: 'pointer',
                      background: i === active ? s.accent : 'var(--border)', transition: 'all .3s' }} />
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Pipeline connector (shared between both sides) ─────────────────────────
function PipelineConnector({ active, delay }) {
  return (
    <div className="fb-pipeline-conn-wrap" style={{ width: 72, flexShrink: 0 }}>
      <div style={{ position: 'relative', height: 2, background: 'var(--border)', borderRadius: 1 }}>
        {active && [0, 1, 2].map((i) => (
          <span key={i} className="fb-pipeline-dot"
            style={{ animationDelay: `${delay + i * 0.53}s` }} />
        ))}
      </div>
    </div>
  );
}

// ─── Spec → Factory Brain 3D → Job Order ────────────────────────────────────
function SpecToJobPipeline() {
  const [active, setActive] = React.useState(false);
  const sectionRef = React.useRef(null);

  React.useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    if (!window.IntersectionObserver) { setActive(true); return; }
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setActive(true); },
      { threshold: 0.05 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Price count-up to ₹6.75
  const [price, setPrice] = React.useState(0);
  React.useEffect(() => {
    if (!active) return;
    const target = 6.75, dur = 1200;
    let raf;
    const t0 = performance.now();
    function tick(now) {
      const p = Math.min((now - t0) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setPrice(Math.round(target * eased * 100) / 100);
      if (p < 1) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active]);

  const specFields = [
    { label: 'Carton Dimension',    value: 'L × W × H  mm',    icon: 'box'    },
    { label: 'Board Grammage',      value: '300 GSM',           icon: 'layers' },
    { label: 'Description of Board',value: 'Folding Box Board', icon: 'cube'   },
    { label: 'Colour Shade',        value: 'CMYK + Spot',       icon: 'filter' },
    { label: 'Printed Text Matter', value: 'Offset, 4 colours', icon: 'send'   },
  ];

  const qBreaks = [['500','13.20',false],['1,000','6.75',true],['5,000','3.40',false],['10,000','2.80',false]];

  const card = {
    background: 'rgba(13,17,23,0.82)',
    backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
    border: '1px solid rgba(81,137,243,0.18)',
    borderRadius: 12,
    boxShadow: '0 2px 20px rgba(0,0,0,.55)',
  };

  return (
    <div className="fb-spec-pipeline-wrap">
      {/* ── Heading (light bg above the dark brain section) */}
      <div style={{ padding: 'clamp(56px,8vw,96px) 0 clamp(32px,4vw,52px)', textAlign: 'center', background: 'var(--bg-page)' }}>
        <div className="fb-wrap">
          <Eyebrow>The Engine</Eyebrow>
          <h2 style={{
            fontFamily: 'var(--font-display)', fontSize: 'clamp(26px,4vw,46px)',
            fontWeight: 800, letterSpacing: '-.03em', color: 'var(--text-primary)',
            margin: '10px 0 14px', lineHeight: 1.12,
          }}>
            Your spec sheet becomes a job order<br />before you finish your coffee.
          </h2>
          <p style={{ fontSize: 'clamp(14px,1.6vw,16px)', color: 'var(--text-secondary)', maxWidth: 580, margin: '0 auto', lineHeight: 1.65 }}>
            Paste carton dimensions, board grade, and colour. Factory Brain calculates optimal sheet nesting,
            prices every material and machine step, and hands you a costed quote with quantity price breaks —
            in seconds. One click turns it into a live job order.
          </p>
        </div>
      </div>

      {/* ── Brain iframe + overlaid cards */}
      <section ref={sectionRef} id="how" className="fb-spec-section" style={{ position: 'relative', height: '88vh', minHeight: 560, overflow: 'hidden' }}>

        {/* Full-bleed brain-3d iframe */}
        <iframe
          src="/brain-3d.html"
          title="Factory Brain Knowledge Graph"
          className="fb-spec-iframe"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none', display: 'block' }}
          loading="lazy"
        />

        {/* LEFT overlay — spec input cards */}
        <div className="fb-spec-left" style={{
          position: 'absolute', left: 'clamp(16px,3vw,40px)', top: '50%',
          transform: 'translateY(-50%)',
          display: 'flex', flexDirection: 'column', gap: 8,
          width: 'clamp(220px,22vw,290px)', zIndex: 2,
          background: 'rgba(13,17,23,0.45)',
          backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
          borderRadius: 18, padding: 8,
        }}>
          {specFields.map((f, i) => (
            <div key={f.label} style={{
              ...card,
              display: 'flex', alignItems: 'center', gap: 10, padding: '9px 13px',
              opacity: active ? 1 : 0,
              transform: active ? 'translateX(0)' : 'translateX(-32px)',
              transition: `opacity .45s ease ${i * 0.09}s, transform .45s ease ${i * 0.09}s`,
            }}>
              <div style={{ width: 28, height: 28, borderRadius: 7, background: 'rgba(81,137,243,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon name={f.icon} size={13} style={{ color: '#5189f3' }} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: '#6b7280', marginBottom: 2 }}>{f.label}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#f9fafb' }}>{f.value}</div>
              </div>
            </div>
          ))}
          <div style={{ opacity: active ? 1 : 0, transition: 'opacity .4s ease .5s', textAlign: 'center', marginTop: 4, fontSize: 10, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,.4)' }}>
            Spec in
          </div>
        </div>

        {/* RIGHT overlay — output cards */}
        <div className="fb-spec-right" style={{
          position: 'absolute', right: 'clamp(16px,3vw,40px)', top: '50%',
          transform: 'translateY(-50%)',
          display: 'flex', flexDirection: 'column', gap: 10,
          background: 'rgba(13,17,23,0.45)',
          backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
          borderRadius: 18, padding: 8,
          width: 'clamp(220px,22vw,290px)', zIndex: 2,
        }}>

          {/* price card */}
          <div style={{
            background: '#5189f3', borderRadius: 12, padding: '14px 18px',
            boxShadow: '0 4px 24px rgba(81,137,243,.45)',
            opacity: active ? 1 : 0, transform: active ? 'translateX(0)' : 'translateX(32px)',
            transition: 'opacity .45s ease .42s, transform .45s ease .42s',
          }}>
            <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,.65)', marginBottom: 4 }}>Price / unit</div>
            <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-.03em', color: '#fff', lineHeight: 1 }}>₹{price.toFixed(2)}</div>
            <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,.65)', marginTop: 4 }}>1,000 units · ₹6,750 total</div>
          </div>

          {/* nesting card */}
          <div style={{ ...card, padding: '12px 16px', opacity: active ? 1 : 0, transform: active ? 'translateX(0)' : 'translateX(32px)', transition: 'opacity .45s ease .54s, transform .45s ease .54s' }}>
            <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: '#9ca3af', marginBottom: 4 }}>Sheet nesting</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <span style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-.03em', color: '#f9fafb' }}>27 ups</span>
              <span style={{ fontSize: 11, color: '#16a34a', fontWeight: 700 }}>96% utilisation</span>
            </div>
            <div style={{ fontSize: 10.5, color: '#9ca3af', marginTop: 2 }}>9×3 interlocked · rotated</div>
          </div>

          {/* qty breaks card */}
          <div style={{ ...card, padding: '12px 16px', opacity: active ? 1 : 0, transform: active ? 'translateX(0)' : 'translateX(32px)', transition: 'opacity .45s ease .66s, transform .45s ease .66s' }}>
            <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: '#9ca3af', marginBottom: 8 }}>Qty price breaks</div>
            {qBreaks.map(([q, p, hl], idx) => (
              <div key={q} style={{
                display: 'flex', justifyContent: 'space-between',
                fontSize: 11.5, padding: hl ? '3px 5px' : '3px 2px',
                borderBottom: idx < qBreaks.length - 1 ? '1px solid rgba(255,255,255,.08)' : 'none',
                fontWeight: hl ? 700 : 400,
                color: hl ? '#7aabff' : 'rgba(156,163,175,0.9)',
                background: hl ? 'rgba(81,137,243,.08)' : 'transparent',
                borderRadius: hl ? 4 : 0,
                marginBottom: 2,
              }}>
                <span>{q} units</span><span>₹{p}</span>
              </div>
            ))}
          </div>

          {/* action buttons */}
          <div style={{ display: 'flex', gap: 8, opacity: active ? 1 : 0, transform: active ? 'translateX(0)' : 'translateX(32px)', transition: 'opacity .45s ease .78s, transform .45s ease .78s' }}>
            <a href="https://rfq.patternlab.ai/rfq" target="_blank" rel="noopener noreferrer"
              className="fb-btn fb-btn--primary fb-btn--sm" style={{ flex: 1, justifyContent: 'center' }}>
              Create Job →
            </a>
            <a href="https://rfq.patternlab.ai/rfq" target="_blank" rel="noopener noreferrer"
              className="fb-btn fb-btn--secondary fb-btn--sm" style={{ flex: 1, justifyContent: 'center', background: 'rgba(255,255,255,.1)', color: '#f9fafb', borderColor: 'rgba(255,255,255,.18)' }}>
              View Quote
            </a>
          </div>

          <div style={{ opacity: active ? 1 : 0, transition: 'opacity .4s ease .92s', textAlign: 'center', marginTop: 2, fontSize: 10, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,.55)' }}>
            Job order out
          </div>
        </div>

      </section>
    </div>
  );
}

// ─────────────────────── WorkflowsSection ──────────────────────────────────
function WorkflowsSection() {
  const [active, setActive] = React.useState(0);
  const [animKey, setAnimKey] = React.useState(0);
  const [nodesOn, setNodesOn] = React.useState(false);
  const secRef = React.useRef(null);

  React.useEffect(() => {
    const el = secRef.current;
    if (!el || !window.IntersectionObserver) { setNodesOn(true); return; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setNodesOn(true); io.disconnect(); } }, { threshold: 0.1 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  function switchFlow(i) {
    if (i === active) return;
    setNodesOn(false);
    setTimeout(() => { setActive(i); setAnimKey(k => k + 1); setNodesOn(true); }, 120);
  }

  const tagStyle = {
    Trigger:   { bg: 'rgba(245,158,11,.12)',  c: '#b45309' },
    AI:        { bg: 'rgba(81,137,243,.12)',   c: '#2563eb' },
    Action:    { bg: 'rgba(139,92,246,.12)',   c: '#7c3aed' },
    Condition: { bg: 'rgba(20,184,166,.12)',   c: '#0d9488' },
    Output:    { bg: 'rgba(34,197,94,.12)',    c: '#15803d' },
  };

  const flows = [
    {
      eyebrow: 'Core Pipeline', title: 'RFQ to floor in minutes.',
      desc: 'From a raw quote request to a live job order on the floor — parsed, priced, and scheduled end to end.',
      cta: 'Try the pipeline',
      nodes: [
        { icon:'upload',   title:'RFQ Received',        tag:'Trigger',   status:'Triggered', desc:'PDF, email, or plain text' },
        { icon:'zap',      title:'Parse Specs',          tag:'AI',        status:'Completed', desc:'Dimensions, material, colour extracted' },
        { icon:'dollar',   title:'Generate Quote',       tag:'Action',    status:'Completed', desc:'Sheet nesting + price breaks calculated' },
        { icon:'check',    title:'Customer Approves',    tag:'Condition', status:null,        desc:'Approved → next  ·  Rejected → revise' },
        { icon:'send',     title:'Job Order Created',    tag:'Action',    status:'Completed', desc:'BOM + routing auto-assigned' },
        { icon:'factory',  title:'Scheduled on Floor',   tag:'Output',    status:null,        desc:'Gantt updated · floor notified' },
      ],
    },
    {
      eyebrow: 'Rush Handling', title: 'Rush answered in 2 minutes.',
      desc: 'Capacity checked, conflict map built, counter-offer ready — before you finish reading the email.',
      cta: 'Try rush flow',
      nodes: [
        { icon:'alert',    title:'Rush Arrives',         tag:'Trigger',   status:'Triggered', desc:'Flagged by sales or customer portal' },
        { icon:'gauge',    title:'Capacity Check',       tag:'AI',        status:'Completed', desc:'Live load across all workcenters' },
        { icon:'net',      title:'Conflict Map',         tag:'AI',        status:'Completed', desc:'Orders bumped + hours impact shown' },
        { icon:'dollar',   title:'Counter-Offer',        tag:'Action',    status:'Completed', desc:'Accept / delay #421 / expedite at ₹18k' },
        { icon:'check',    title:'Customer Confirms',    tag:'Condition', status:null,        desc:'Confirmed → floor updated instantly' },
        { icon:'factory',  title:'Floor Updated',        tag:'Output',    status:null,        desc:'Schedule patched · no manual re-entry' },
      ],
    },
    {
      eyebrow: 'Supply Chain', title: 'Shortage to recovery in 10 min.',
      desc: 'The moment a supplier fails, Factory Brain traces the ripple — and patches the plan before the floor notices.',
      cta: 'Try shortage flow',
      nodes: [
        { icon:'alert',    title:'Shortage Flagged',       tag:'Trigger',   status:'Triggered', desc:'Manual flag, PO alert, or sensor feed' },
        { icon:'net',      title:'Orders at Risk',          tag:'AI',        status:'Completed', desc:'Ripple traced across all affected jobs' },
        { icon:'layers',   title:'Substitution Found',      tag:'AI',        status:'Completed', desc:'Ranked by cost, lead time, quality' },
        { icon:'send',     title:'Customer Comms Drafted',  tag:'Action',    status:'Completed', desc:'Revised dates, tone-matched draft' },
        { icon:'calendar', title:'Schedule Patched',        tag:'Output',    status:null,        desc:'Floor plan updated automatically' },
      ],
    },
    {
      eyebrow: 'Daily Ops', title: 'Schedule built before the briefing.',
      desc: 'Every morning, Factory Brain pulls orders, checks BOM, and sends a conflict-free Gantt to the floor.',
      cta: 'Try daily flow',
      nodes: [
        { icon:'clock',    title:'Morning Trigger',      tag:'Trigger',   status:'Triggered', desc:'Fires at configured time each day' },
        { icon:'box',      title:'Orders Pulled',         tag:'Action',    status:'Completed', desc:'All confirmed orders loaded' },
        { icon:'layers',   title:'BOM Checked',           tag:'AI',        status:'Completed', desc:'Material availability verified live' },
        { icon:'wrench',   title:'Sequence Optimised',    tag:'AI',        status:'Completed', desc:'Changeovers minimised, dates protected' },
        { icon:'send',     title:'Gantt Sent to Floor',   tag:'Output',    status:null,        desc:'Supervisors notified · no re-entry' },
      ],
    },
    {
      eyebrow: 'Repeat Business', title: 'Reorder quoted in one click.',
      desc: "Customer comes back? Last spec loaded, price updated, quote sent — before they finish their sentence.",
      cta: 'Try reorder flow',
      nodes: [
        { icon:'user',     title:'Customer Reorder',          tag:'Trigger',   status:'Triggered', desc:'Via portal, email, or phone call' },
        { icon:'layers',   title:'Last Spec Loaded',           tag:'Action',    status:'Completed', desc:'Previous job specs pre-filled instantly' },
        { icon:'dollar',   title:'Price Recalculated',         tag:'AI',        status:'Completed', desc:'Current material costs applied live' },
        { icon:'send',     title:'Quote Sent in 1 Click',      tag:'Action',    status:'Completed', desc:'PDF generated and emailed instantly' },
        { icon:'factory',  title:'Job Order Auto-Created',     tag:'Output',    status:null,        desc:'Confirmed → straight to production' },
      ],
    },
  ];

  const f = flows[active];

  return (
    <section style={{ background: 'var(--bg-page)', padding: 'clamp(64px,9vw,108px) var(--page-px)' }}>
      <div style={{ maxWidth: 1180, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: 'clamp(32px,4vw,52px)', textAlign: 'center' }}>
          <div className="fb-reveal"><Eyebrow>Workflows</Eyebrow></div>
          <h2 className="fb-h2 fb-reveal" style={{ marginTop: 14, maxWidth: 640, margin: '14px auto 0' }}>Build your own workflows with AI.</h2>
          <p className="fb-lead fb-reveal" style={{ marginTop: 14, maxWidth: 560, margin: '14px auto 0' }}>Every operation is different. These flows come ready — and every step can be customised to match exactly how your plant works.</p>
        </div>

        {/* 3-col bento */}
        <div ref={secRef} className="fb-reveal fb-workflows-bento" style={{
          display: 'grid', gridTemplateColumns: '260px 1fr 210px', gap: 0,
          border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden',
          background: 'var(--bg-card)',
          boxShadow: '0 4px 32px rgba(0,0,0,.06)',
        }}>

          {/* LEFT — copy */}
          <div className="fb-workflows-left" style={{ padding: 'clamp(22px,2.5vw,36px)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 520 }}>
            <div>
              <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 14,
                opacity: nodesOn ? 1 : 0, transition: 'opacity .3s ease',
              }}>{f.eyebrow}</div>
              <h3 style={{ fontSize: 'clamp(17px,1.8vw,22px)', fontWeight: 800, fontFamily: 'var(--font-display)', letterSpacing: '-.02em', lineHeight: 1.25, marginBottom: 14, color: 'var(--text-hi)',
                opacity: nodesOn ? 1 : 0, transform: nodesOn ? 'none' : 'translateY(8px)', transition: 'opacity .35s ease .05s, transform .35s ease .05s',
              }}>{f.title}</h3>
              <p style={{ fontSize: 13.5, color: 'var(--text-muted)', lineHeight: 1.7,
                opacity: nodesOn ? 1 : 0, transition: 'opacity .35s ease .1s',
              }}>{f.desc}</p>
            </div>
            <a href="https://rfq.patternlab.ai/rfq" target="_blank" rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 28,
                fontSize: 13, fontWeight: 600, color: 'var(--accent)', textDecoration: 'none',
                opacity: nodesOn ? 1 : 0, transition: 'opacity .35s ease .15s',
              }}>
              {f.cta} <Icon name="arrowRight" size={13} />
            </a>
          </div>

          {/* CENTER — node diagram */}
          <div className="fb-workflows-center" style={{
            padding: 'clamp(20px,2.5vw,32px)',
            borderRight: '1px solid var(--border)',
            background: 'var(--bg-subtle)',
            backgroundImage: 'radial-gradient(circle, var(--border) 1px, transparent 1px)',
            backgroundSize: '22px 22px',
            position: 'relative', overflow: 'hidden',
          }}>
            <div key={animKey} style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', maxWidth: 400, margin: '0 auto' }}>
              {f.nodes.map((node, ni) => {
                const tc = tagStyle[node.tag];
                const d = `${ni * 0.09}s`;
                const isLast = ni === f.nodes.length - 1;
                return (
                  <div key={ni} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    {/* Status row */}
                    <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4, padding: '0 2px',
                      opacity: nodesOn ? 1 : 0, transition: `opacity .3s ease ${d}`,
                    }}>
                      <span style={{ fontSize: 10, color: 'var(--text-faint)', fontWeight: 600 }}>
                        {ni === 0 ? '◎ Trigger' : node.tag === 'Condition' ? '⊙ Condition' : node.tag === 'Output' ? '◉ Output' : `◌ Step ${ni + 1}`}
                      </span>
                      {node.status && (
                        <span style={{ fontSize: 9, fontWeight: 700, color: '#15803d', background: 'rgba(34,197,94,.12)', borderRadius: 4, padding: '2px 7px' }}>
                          ✓ {node.status}
                        </span>
                      )}
                    </div>
                    {/* Node card */}
                    <div style={{
                      width: '100%', background: 'var(--bg-card)',
                      border: `1px solid ${node.status ? 'rgba(34,197,94,.25)' : 'var(--border)'}`,
                      borderRadius: 10, padding: '11px 13px',
                      boxShadow: '0 1px 6px rgba(0,0,0,.06)',
                      opacity: nodesOn ? 1 : 0,
                      transform: nodesOn ? 'translateY(0)' : 'translateY(10px)',
                      transition: `opacity .38s ease ${d}, transform .38s ease ${d}`,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 26, height: 26, borderRadius: 7, background: tc.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Icon name={node.icon} size={13} style={{ color: tc.c }} />
                          </div>
                          <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-hi)' }}>{node.title}</span>
                        </div>
                        <span style={{ fontSize: 9, fontWeight: 700, color: tc.c, background: tc.bg, borderRadius: 4, padding: '2px 7px', whiteSpace: 'nowrap' }}>{node.tag}</span>
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', paddingLeft: 34, lineHeight: 1.5 }}>{node.desc}</div>
                    </div>
                    {/* Connector */}
                    {!isLast && (
                      <div style={{ display: 'flex', justifyContent: 'center', margin: '0px 0',
                        opacity: nodesOn ? 1 : 0,
                        transition: `opacity .3s ease ${parseFloat(d) + 0.15}s`,
                      }}>
                        <svg width="16" height="36" viewBox="0 0 16 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <line x1="8" y1="0" x2="8" y2="28" stroke="var(--border)" strokeWidth="1.5" />
                          <circle cx="8" cy="14" r="3.5" fill="var(--bg-card)" stroke="var(--accent)" strokeWidth="1.5" opacity=".55" />
                          <polyline points="4.5,24 8,30 11.5,24" stroke="var(--accent)" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity=".7" />
                        </svg>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT — flow list */}
          <div className="fb-workflows-right" style={{ padding: 'clamp(16px,1.8vw,24px)' }}>
            <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--text-faint)', marginBottom: 12 }}>All Flows</div>
            {flows.map((fl, fi) => (
              <button key={fi} onClick={() => switchFlow(fi)} style={{
                display: 'flex', alignItems: 'flex-start', gap: 9, width: '100%',
                padding: '9px 10px', borderRadius: 8, border: 'none', cursor: 'pointer',
                background: fi === active ? 'rgba(81,137,243,.1)' : 'transparent',
                textAlign: 'left', marginBottom: 2, fontFamily: 'var(--font-body)',
                transition: 'background .15s',
              }}>
                <div style={{ width: 26, height: 26, borderRadius: 7, background: fi === active ? 'rgba(81,137,243,.15)' : 'var(--bg-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                  <Icon name={fl.nodes[0].icon} size={12} style={{ color: fi === active ? 'var(--accent)' : 'var(--text-faint)' }} />
                </div>
                <div>
                  <div style={{ fontSize: 11.5, fontWeight: fi === active ? 700 : 500, color: fi === active ? 'var(--accent)' : 'var(--text-secondary)', lineHeight: 1.3, marginBottom: 2 }}>{fl.eyebrow}</div>
                  <div style={{ fontSize: 10.5, color: 'var(--text-faint)', lineHeight: 1.4 }}>{fl.nodes.length} steps</div>
                </div>
              </button>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}

window.FB_SECTIONS_1 = { Nav, Hero, HowItWorks, Surfaces, AppsGallery, RFQFeatures, Proof, Contact, WorkflowTimeline, SchedulingSection, WorkflowsSection, SpecToJobPipeline, useReveal, Eyebrow };
})();
