import { createContext, type FormEvent, type ReactNode, useContext, useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  ArrowRight,
  Bike,
  BookOpen,
  Bus,
  Car,
  Check,
  ChevronRight,
  CircleAlert,
  CircleHelp,
  Cloud,
  ExternalLink,
  Footprints,
  Gauge,
  Info,
  Leaf,
  Lightbulb,
  MapPin,
  Menu,
  Navigation,
  Play,
  Route as RouteIcon,
  School,
  ShieldCheck,
  Sparkles,
  TrainFront,
  TrendingDown,
  Users,
  X,
  type LucideIcon,
} from 'lucide-react';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Link, Route, Switch, useLocation, Router as WouterRouter } from 'wouter';

const queryClient = new QueryClient();

type Traffic = 'Low' | 'Moderate' | 'Heavy' | 'Severe';

const trafficFactors: Record<Traffic, number> = {
  Low: 0.95,
  Moderate: 1.08,
  Heavy: 1.25,
  Severe: 1.5,
};

const trafficTimeFactors: Record<Traffic, number> = {
  Low: 0.92,
  Moderate: 1,
  Heavy: 1.22,
  Severe: 1.48,
};

type ModeKey = 'Car' | 'Bus' | 'Bicycle' | 'Walking' | 'Public transport';

type ModeResult = {
  key: ModeKey;
  icon: LucideIcon;
  descriptor: string;
  time: number;
  cost: number;
  co2: number;
  score: number;
};

type EcoContextValue = {
  from: string;
  to: string;
  setFrom: (value: string) => void;
  setTo: (value: string) => void;
  traffic: Traffic;
  setTraffic: (value: Traffic) => void;
  priority: number;
  setPriority: (value: number) => void;
  hasCalculated: boolean;
  calculateRoute: () => void;
  results: ModeResult[];
  recommended: ModeResult;
  distance: number;
};

const EcoContext = createContext<EcoContextValue | null>(null);

function useEcoRoute() {
  const value = useContext(EcoContext);
  if (!value) throw new Error('EcoRoute context is missing');
  return value;
}

function NavItem({ href, icon: Icon, children, onNavigate }: { href: string; icon: LucideIcon; children: ReactNode; onNavigate?: () => void }) {
  const [location] = useLocation();
  const active = location === href;
  return (
    <Link href={href} onClick={onNavigate} className={`nav-link${active ? ' active' : ''}`} data-testid={`link-nav-${href.replace('/', '') || 'home'}`}>
      <Icon size={17} strokeWidth={active ? 2.4 : 1.8} />
      <span>{children}</span>
    </Link>
  );
}

function Brand() {
  return (
    <Link href="/" className="brand-mark" data-testid="link-brand">
      <span className="brand-symbol"><Leaf size={19} strokeWidth={2.5} /></span>
      <span className="brand-name">EcoRoute <span>AI</span></span>
    </Link>
  );
}

function NavigationLinks({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="nav-list">
      <NavItem href="/" icon={Gauge} onNavigate={onNavigate}>Overview</NavItem>
      <NavItem href="/plan" icon={RouteIcon} onNavigate={onNavigate}>Plan a route</NavItem>
      <NavItem href="/compare" icon={ArrowRight} onNavigate={onNavigate}>Compare routes</NavItem>
      <NavItem href="/impact" icon={TrendingDown} onNavigate={onNavigate}>Your impact</NavItem>
      <NavItem href="/about" icon={BookOpen} onNavigate={onNavigate}>About & references</NavItem>
    </div>
  );
}

function AppShell({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Brand />
        <div className="sidebar-kicker">Your climate-aware commute</div>
        <NavigationLinks />
        <div className="sidebar-footer">
          <strong>Demo mode · Thrissur</strong>
          <p>Local calculations only. No live traffic or maps connected.</p>
        </div>
      </aside>
      <header className="mobile-header">
        <Brand />
        <button className="menu-button" onClick={() => setMenuOpen((open) => !open)} aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} data-testid="button-mobile-menu">
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
        {menuOpen && <div className="mobile-menu"><NavigationLinks onNavigate={() => setMenuOpen(false)} /></div>}
      </header>
      <main className="main-content">{children}</main>
    </div>
  );
}

function HomePage() {
  const { recommended, priority } = useEcoRoute();
  return (
    <div className="page-wrap">
      <section className="home-hero">
        <div className="reveal">
          <div className="eyebrow">A clearer way to get there</div>
          <h1 className="hero-title">Move with<br /><em>less impact.</em></h1>
          <p className="hero-copy">EcoRoute AI makes the climate cost of your everyday commute visible — then helps you choose a route that feels right for your time, budget, and planet.</p>
          <div className="hero-actions">
            <Link href="/plan" className="btn btn-primary" data-testid="link-hero-plan">Plan a route <ArrowRight size={16} /></Link>
            <Link href="/compare" className="btn btn-ghost" data-testid="link-hero-compare">See the tradeoffs</Link>
          </div>
        </div>
        <div className="hero-art grid-noise reveal reveal-delay-2" data-testid="visual-route-preview">
          <div className="art-label">Demo route / climate readout</div>
          <div className="route-line" />
          <div className="route-dot top" />
          <div className="route-dot bottom" />
          <div className="route-stop top">Thrissur Railway Station</div>
          <div className="route-stop bottom">Government Engineering College</div>
          <div className="art-chip"><span>{recommended.key}</span><small>recommended at {priority}% green priority</small></div>
          <div style={{ position: 'absolute', right: 30, top: 115, textAlign: 'right' }}>
            <div style={{ font: '700 51px "Space Grotesk", sans-serif', letterSpacing: '-.08em' }}>5.8</div>
            <div className="art-label">km · estimated</div>
          </div>
        </div>
      </section>

      <div className="stat-strip reveal reveal-delay-1">
        <div><div className="stat-number">5.8 km</div><div className="stat-label">example commute mapped</div></div>
        <div><div className="stat-number">5 modes</div><div className="stat-label">one transparent comparison</div></div>
        <div><div className="stat-number">1 choice</div><div className="stat-label">that fits your priorities</div></div>
      </div>

      <section className="home-section two-col">
        <div>
          <div className="eyebrow">The problem</div>
          <h2 className="section-heading">A commute is more than minutes.</h2>
          <p className="section-copy">Most route planners optimise for arrival time. That makes the biggest part of a daily decision invisible: the emissions attached to getting there.</p>
          <div className="problem-list">
            <div className="problem-item"><CircleAlert size={18} /><div><strong>Carbon is hard to picture</strong><p>Numbers without context do not help anyone choose differently.</p></div></div>
            <div className="problem-item"><Users size={18} /><div><strong>Every traveller has a different constraint</strong><p>Students, commuters, and families trade time, cost, comfort, and impact.</p></div></div>
            <div className="problem-item"><Navigation size={18} /><div><strong>Traffic changes the equation</strong><p>A fast route is not always the lightest route, especially on a crowded day.</p></div></div>
          </div>
        </div>
        <div>
          <div className="eyebrow">The EcoRoute approach</div>
          <h2 className="section-heading">Make the tradeoff legible.</h2>
          <div className="feature-grid">
            <div className="surface feature-card shadow-card"><div className="feature-icon"><RouteIcon size={17} /></div><h3>See every option</h3><p>Car, bus, bicycle, walking, and public transport in one honest view.</p></div>
            <div className="surface feature-card shadow-card"><div className="feature-icon"><Sparkles size={17} /></div><h3>Choose your bias</h3><p>Slide from “I am late” to “I can take the greener path.”</p></div>
            <div className="surface feature-card shadow-card"><div className="feature-icon"><Cloud size={17} /></div><h3>Understand CO2</h3><p>Simple estimates show what each decision means, without hidden scoring.</p></div>
            <div className="surface feature-card shadow-card"><div className="feature-icon"><ShieldCheck size={17} /></div><h3>Trust the limits</h3><p>Every result is labelled as a demo estimate — never disguised as live data.</p></div>
          </div>
        </div>
      </section>

      <section className="home-cta">
        <div><div className="eyebrow" style={{ color: 'hsl(168 63% 55%)' }}>Start with one trip</div><h2 className="section-heading">Your next commute can be a small, informed experiment.</h2><p className="section-copy">Try the sample Thrissur route, then tune the recommendation to match your day.</p></div>
        <Link href="/plan" className="btn btn-secondary" data-testid="link-cta-plan">Open route planner <Play size={15} /></Link>
      </section>
      <div className="footer-note"><span>EcoRoute AI · Engineering / IT project demo</span><span>Estimates are educational, not live navigation guidance.</span></div>
    </div>
  );
}

function PlanPage() {
  const { from, to, setFrom, setTo, traffic, setTraffic, priority, setPriority, calculateRoute, recommended, hasCalculated } = useEcoRoute();
  const [, setLocation] = useLocation();
  const priorityLabel = priority < 34 ? 'Fastest first' : priority < 67 ? 'Balanced choice' : 'Greenest first';
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    calculateRoute();
  };
  return (
    <div className="page-wrap">
      <div className="eyebrow">Route planner / demo calculator</div>
      <h1 className="page-title">Turn a commute into a confident call.</h1>
      <p className="page-subtitle">Set your trip, tell us what the roads feel like, and choose how much weight to give the planet. The recommendation updates in your browser.</p>
      <div className="plan-layout">
        <form className="surface form-card shadow-card reveal" onSubmit={submit} data-testid="form-route-planner">
          <h2>Build your trip</h2>
          <p>Start with the example route or type your own places.</p>
          <div className="field">
            <label htmlFor="from-location">From</label>
            <div className="input-wrap"><MapPin size={17} /><input id="from-location" className="text-input" value={from} onChange={(event) => setFrom(event.target.value)} data-testid="input-from" /></div>
          </div>
          <div className="field">
            <label htmlFor="to-location">To</label>
            <div className="input-wrap"><Navigation size={17} /><input id="to-location" className="text-input" value={to} onChange={(event) => setTo(event.target.value)} data-testid="input-to" /></div>
          </div>
          <div className="field">
            <label>Demo traffic condition</label>
            <div className="traffic-grid">
              {(Object.keys(trafficFactors) as Traffic[]).map((option) => <button type="button" className={`traffic-btn${traffic === option ? ' active' : ''}`} onClick={() => setTraffic(option)} key={option} data-testid={`button-traffic-${option.toLowerCase()}`}>{option}</button>)}
            </div>
          </div>
          <div className="priority-box">
            <div className="priority-row"><span>Recommendation bias</span><span data-testid="text-priority-label">{priorityLabel}</span></div>
            <input className="priority-range" type="range" min="0" max="100" value={priority} onChange={(event) => setPriority(Number(event.target.value))} aria-label="Fastest to greenest priority" data-testid="input-priority" />
            <div className="range-labels"><span>Fastest</span><span>Greenest</span></div>
          </div>
          <div className="demo-note"><Info size={14} /><span>Traffic is a scenario selector, not live traffic. Calculations use the displayed demo formula and a 5.8 km example distance.</span></div>
          <button className="btn btn-primary" type="submit" style={{ width: '100%', marginTop: 22 }} data-testid="button-calculate-route">{hasCalculated ? 'Recalculate this route' : 'Calculate route'} <ArrowRight size={16} /></button>
        </form>

        <div className="surface result-card shadow-card reveal reveal-delay-1" data-testid="card-route-result">
          <div className="result-top"><div><h2>Your climate-aware readout</h2><p>{from} → {to}</p></div><span className="recommendation-tag">ESTIMATED / DEMO</span></div>
          <div className="recommended-mode"><div className="small-label">Best fit for your slider</div><h3 data-testid="text-recommended-mode">{recommended.key}</h3><p>Based on {traffic.toLowerCase()} traffic and a {priority}% green priority.</p></div>
          <div className="metric-grid">
            <div><div className="metric-label">Travel time</div><div className="metric-value" data-testid="text-recommended-time">{recommended.time} min</div></div>
            <div><div className="metric-label">Estimated CO2</div><div className="metric-value" data-testid="text-recommended-co2">{recommended.co2.toFixed(2)} kg</div></div>
            <div><div className="metric-label">Trip cost</div><div className="metric-value" data-testid="text-recommended-cost">₹{recommended.cost}</div></div>
            <div><div className="metric-label">Route score</div><div className="metric-value" data-testid="text-recommended-score">{recommended.score}/100</div></div>
            <div><div className="metric-label">Distance</div><div className="metric-value">5.8 km</div></div>
            <div><div className="metric-label">Traffic</div><div className="metric-value">{traffic}</div></div>
          </div>
          <div className="result-foot">The score blends travel time and CO2 according to your slider. It is a decision aid, not a universal ranking.</div>
          <button className="btn btn-secondary btn-small" style={{ marginTop: 22 }} onClick={() => setLocation('/compare')} data-testid="button-view-comparison">View full comparison <ChevronRight size={14} /></button>
        </div>
      </div>
    </div>
  );
}

function ModeIcon({ mode }: { mode: ModeKey }) {
  const icons: Record<ModeKey, LucideIcon> = { Car, Bus, Bicycle: Bike, Walking: Footprints, 'Public transport': TrainFront };
  const Icon = icons[mode];
  return <Icon size={18} />;
}

function ComparePage() {
  const { results, recommended, priority, traffic } = useEcoRoute();
  const fastest = results.reduce((a, b) => a.time < b.time ? a : b);
  return (
    <div className="page-wrap">
      <div className="page-toolbar">
        <div><div className="eyebrow">Decision board / route comparison</div><h1 className="page-title" style={{ marginBottom: 10 }}>Same destination.<br />Different footprint.</h1><p className="page-subtitle">The recommendation is tuned to your current {traffic.toLowerCase()} traffic scenario and {priority}% green priority.</p></div>
        <div className="toolbar-actions"><Link href="/plan" className="btn btn-ghost btn-small" data-testid="link-edit-route">Edit route</Link><Link href="/impact" className="btn btn-primary btn-small" data-testid="link-view-impact">See impact <ArrowRight size={14} /></Link></div>
      </div>
      <div className="compare-list" data-testid="list-route-comparison">
        <div className="compare-row compare-header"><div>Mode</div><div>Time</div><div>Cost</div><div>Distance</div><div>CO2</div><div>Fit</div></div>
        {results.map((mode) => (
          <div className={`compare-row${mode.key === recommended.key ? ' recommended' : ''}`} key={mode.key} data-testid={`row-mode-${mode.key.toLowerCase().replace(' ', '-')}`}>
            <div className="mode-cell"><span className="mode-icon"><ModeIcon mode={mode.key} /></span><div><span className="mode-name">{mode.key}</span><span className="mode-sub">{mode.descriptor}</span></div></div>
            <div className="table-value"><strong>{mode.time}</strong> min</div>
            <div className="table-value">₹{mode.cost}</div>
            <div className="table-value">{mode.key === 'Walking' ? '5.4' : '5.8'} km</div>
            <div className="table-value"><strong>{mode.co2.toFixed(2)}</strong> kg</div>
            <div>{mode.key === recommended.key ? <span className="rec-pill"><Check size={11} /> Recommended</span> : <span className="score"><i className="score-dot" />{mode.score}</span>}</div>
          </div>
        ))}
      </div>
      <div className="compare-footnote"><CircleHelp size={15} /><span>Cost, time, and emissions are demo estimates. Car CO2 follows <strong>distance × 0.192 kg/km × traffic factor</strong>; other modes use illustrative factors.</span></div>
      <div className="insight-banner"><Lightbulb size={20} /><div><strong>{recommended.key} is your current best fit.</strong><p>{fastest.key} is fastest at {fastest.time} minutes. Your slider decides how much time you are willing to trade for a lower-emission trip.</p></div></div>
    </div>
  );
}

function ImpactPage() {
  const { results, recommended, traffic } = useEcoRoute();
  const car = results.find((mode) => mode.key === 'Car') ?? results[0];
  const saving = Math.max(0, car.co2 - recommended.co2);
  const maxCo2 = Math.max(...results.map((mode) => mode.co2), 1);
  const trees = Math.max(1, Math.round(saving * 0.11 * 10) / 10);
  return (
    <div className="page-wrap">
      <div className="eyebrow">Impact readout / one trip at a time</div>
      <h1 className="page-title">Make the invisible<br /><span style={{ color: 'hsl(var(--primary))' }}>visible.</span></h1>
      <p className="page-subtitle">A small route choice is not a climate solution on its own. But understanding the tradeoff is how better habits become easier to repeat.</p>
      <div className="impact-hero">
        <div className="surface impact-summary shadow-card"><div className="eyebrow" style={{ color: 'hsl(48 31% 95% / .72)' }}>If you choose {recommended.key}</div><h2>One trip, measured honestly.</h2><p>Compared with driving alone on this {traffic.toLowerCase()} traffic scenario, your current recommendation avoids an estimated amount of tailpipe CO2.</p><div className="big-saving" data-testid="text-co2-saving">{saving.toFixed(2)} <small>kg CO2 saved</small></div><div style={{ color: 'hsl(48 31% 95% / .72)', fontSize: 12 }}>That is roughly {trees} kg of the carbon a growing tree absorbs over a year.</div></div>
        <div className="impact-stat-stack">
          <div className="surface impact-stat"><div><div className="stat-label">Car baseline</div><div className="stat-number">{car.co2.toFixed(2)} kg</div></div><Cloud size={24} /></div>
          <div className="surface impact-stat"><div><div className="stat-label">Your recommendation</div><div className="stat-number">{recommended.co2.toFixed(2)} kg</div></div><Leaf size={24} /></div>
          <div className="surface impact-stat"><div><div className="stat-label">Reduction</div><div className="stat-number">{car.co2 ? Math.round((saving / car.co2) * 100) : 0}%</div></div><TrendingDown size={24} /></div>
        </div>
      </div>
      <section className="surface chart-section shadow-card">
        <div className="chart-title"><h2>Emissions by mode</h2><p>kg CO2 per one-way trip</p></div>
        <div className="bar-chart" data-testid="chart-co2-by-mode">
          {results.map((mode) => <div className="bar-row" key={mode.key}><div className="bar-label"><ModeIcon mode={mode.key} />{mode.key}</div><div className="bar-track"><div className={`bar-fill ${mode.key.toLowerCase()}`} style={{ width: `${Math.max(mode.co2 === 0 ? 2 : 4, (mode.co2 / maxCo2) * 100)}%` }} /></div><div className="bar-value">{mode.co2.toFixed(2)} kg</div></div>)}
        </div>
        <p className="chart-caption">The “zero” bars for cycling and walking represent no direct vehicle emissions in this simplified classroom model. Real-world impact still depends on vehicle manufacture, food, infrastructure, and the full life cycle.</p>
      </section>
      <div className="impact-callout">
        <div className="surface impact-callout-card"><h3>Why show the baseline?</h3><p>Impact only has meaning when it has a reference point. We compare your choice with a solo car trip — not to shame it, but to make the difference legible.</p></div>
        <div className="surface impact-callout-card"><h3>Keep the context.</h3><p>These are transparent estimates for a college project demo, not verified carbon accounting or live navigation data.</p></div>
      </div>
    </div>
  );
}

function AboutPage() {
  return (
    <div className="page-wrap">
      <div className="eyebrow">About the project / documentation</div>
      <h1 className="page-title">A route planner with<br /><span style={{ color: 'hsl(var(--accent))' }}>a point of view.</span></h1>
      <p className="page-subtitle">EcoRoute AI is a student-built Engineering / IT project exploring how a familiar interface can make environmental tradeoffs part of an everyday travel decision.</p>
      <div className="about-grid">
        <div className="about-main">
          <section className="surface about-card shadow-card"><h2>What we are testing</h2><p>Can a route planner move beyond “fastest” and help people understand the cost of convenience? EcoRoute turns route attributes — time, cost, distance, and estimated CO2 — into a single visual conversation. Instead of hiding the model behind a score, it lets the traveller adjust the balance.</p><div className="limitation"><p><strong>Design principle:</strong> clarity before persuasion. The app should make a greener option understandable without pretending every decision is simple.</p></div></section>
          <section className="surface about-card"><h2>How the demo works</h2><ul><li>Distance is fixed at 5.8 km for the example Thrissur commute.</li><li>Car CO2 follows <strong>distance × 0.192 kg/km × traffic factor</strong>.</li><li>Low, Moderate, Heavy, and Severe are illustrative scenarios — not live traffic.</li><li>A priority slider blends normalised time and CO2 scores to pick a recommendation.</li></ul></section>
          <section className="surface about-card"><h2>Limitations & responsible use</h2><p>This prototype does not connect to maps, a routing API, a carbon registry, or real-time traffic. Emission factors are illustrative averages and do not account for occupancy, vehicle age, road grade, fuel source, or life-cycle emissions. Use the readouts to understand the shape of a decision, not as audited environmental data.</p></section>
          <section className="surface about-card"><h2>Future scope</h2><p>Next steps could include live multimodal routing, occupancy-aware carpool estimates, accessible route preferences, local transit feeds, saved commute patterns, and a clearer confidence interval around each estimate.</p></section>
        </div>
        <aside className="about-sidebar">
          <section className="surface about-card"><h2>Built with</h2><p>A focused browser prototype with a small, readable calculation model.</p><div className="tech-list"><span className="tech-tag">React + Vite</span><span className="tech-tag">TypeScript</span><span className="tech-tag">Wouter</span><span className="tech-tag">Lucide icons</span><span className="tech-tag">CSS variables</span></div></section>
          <section className="surface about-card"><h2>Reference shelf</h2><div className="reference-list"><div className="reference"><ExternalLink size={14} /><span>IPCC, <em>Climate Change 2022: Mitigation of Climate Change</em>.</span></div><div className="reference"><ExternalLink size={14} /><span>EPA, <em>Greenhouse Gas Emissions for Transportation</em>.</span></div><div className="reference"><ExternalLink size={14} /><span>Our World in Data, <em>CO2 emissions from transport</em>.</span></div><div className="reference"><ExternalLink size={14} /><span>GHG Protocol, <em>Scope 3 Calculation Guidance</em>.</span></div></div></section>
          <section className="surface about-card" style={{ background: 'hsl(var(--secondary))' }}><School size={23} style={{ marginBottom: 18 }} /><h2>A presentation-ready starting point.</h2><p>Swap the demo inputs for measured local data when the next iteration has a routing or transit data source.</p></section>
        </aside>
      </div>
    </div>
  );
}

function Router() {
  return (
    <AppShell>
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/plan" component={PlanPage} />
        <Route path="/compare" component={ComparePage} />
        <Route path="/impact" component={ImpactPage} />
        <Route path="/about" component={AboutPage} />
        <Route component={NotFound} />
      </Switch>
    </AppShell>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function EcoRouteProvider({ children }: { children: ReactNode }) {
  const [from, setFrom] = useState('Thrissur Railway Station');
  const [to, setTo] = useState('Government Engineering College Thrissur');
  const [traffic, setTraffic] = useState<Traffic>('Moderate');
  const [priority, setPriority] = useState(62);
  const [hasCalculated, setHasCalculated] = useState(false);
  const distance = 5.8;
  const results = useMemo<ModeResult[]>(() => {
    const trafficFactor = trafficFactors[traffic];
    const timeFactor = trafficTimeFactors[traffic];
    const baseRows: Array<{ key: ModeKey; icon: LucideIcon; descriptor: string; time: number; cost: number; emissionFactor: number }> = [
      { key: 'Car', icon: Car, descriptor: 'Solo drive', time: 12, cost: 78, emissionFactor: .192 },
      { key: 'Bus', icon: Bus, descriptor: 'Scheduled bus', time: 27, cost: 18, emissionFactor: .089 },
      { key: 'Bicycle', icon: Bike, descriptor: 'Active travel', time: 24, cost: 0, emissionFactor: 0 },
      { key: 'Walking', icon: Footprints, descriptor: 'Zero tailpipe', time: 72, cost: 0, emissionFactor: 0 },
      { key: 'Public transport', icon: TrainFront, descriptor: 'Mixed transit', time: 34, cost: 25, emissionFactor: .054 },
    ];
    const raw = baseRows.map((row) => ({
      ...row,
      time: Math.round((row.key === 'Car' ? row.time * timeFactor : row.key === 'Bus' ? row.time * (0.94 + timeFactor * .06) : row.time)),
      co2: distance * row.emissionFactor * (row.key === 'Car' ? trafficFactor : 1),
    }));
    const minTime = Math.min(...raw.map((row) => row.time));
    const maxTime = Math.max(...raw.map((row) => row.time));
    const maxCo2 = Math.max(...raw.map((row) => row.co2));
    const minCo2 = Math.min(...raw.map((row) => row.co2));
    return raw.map((row) => {
      const speedScore = 100 - ((row.time - minTime) / Math.max(maxTime - minTime, 1)) * 100;
      const greenScore = 100 - ((row.co2 - minCo2) / Math.max(maxCo2 - minCo2, 1)) * 100;
      return { key: row.key, icon: row.icon, descriptor: row.descriptor, time: row.time, cost: row.cost, co2: row.co2, score: Math.round(speedScore * (1 - priority / 100) + greenScore * (priority / 100)) };
    });
  }, [priority, traffic]);
  const recommended = useMemo(() => results.reduce((best, current) => current.score > best.score ? current : best, results[0]), [results]);
  const value: EcoContextValue = { from, to, setFrom, setTo, traffic, setTraffic, priority, setPriority, hasCalculated, calculateRoute: () => setHasCalculated(true), results, recommended, distance };
  return <EcoContext.Provider value={value}>{children}</EcoContext.Provider>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <RoutedErrorBoundary>
            <EcoRouteProvider><Router /></EcoRouteProvider>
          </RoutedErrorBoundary>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;