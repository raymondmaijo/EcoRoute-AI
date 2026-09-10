import { createContext, type FormEvent, type ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  ArrowRight,
  Bike,
  BookOpen,
  BusFront,
  CarFront,
  Check,
  ChevronRight,
  CircleAlert,
  CircleHelp,
  Cloud,
  Clock3,
  ExternalLink,
  Fuel,
  Gauge,
  Info,
  Leaf,
  Lightbulb,
  Map,
  MapPin,
  Menu,
  Navigation,
  PersonStanding,
  Route as RouteIcon,
  School,
  TrainFront,
  TrendingDown,
  Users,
  Wind,
  X,
  type LucideIcon,
} from 'lucide-react';
import { CircleMarker, MapContainer, Polyline, Popup, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Link, Route, Switch, useLocation, Router as WouterRouter } from 'wouter';

const queryClient = new QueryClient();

type VehicleCategory = 'Car' | 'Bike';
type RouteKind = 'fastest' | 'greenest' | 'average';
type PlaceId = 'aluva' | 'kalamassery' | 'thripunitara' | 'kakkanad' | 'rajagiri';

type Place = {
  id: PlaceId;
  label: string;
  shortLabel: string;
  x: number;
  y: number;
  coordinates: [number, number];
};

const places: Place[] = [
  { id: 'aluva', label: 'Aluva Railway Station', shortLabel: 'Aluva', x: 13, y: 19, coordinates: [10.1076, 76.3516] },
  { id: 'kalamassery', label: 'Kalamassery', shortLabel: 'Kalamassery', x: 33, y: 30, coordinates: [10.052, 76.3264] },
  { id: 'kakkanad', label: 'Kakkanad', shortLabel: 'Kakkanad', x: 57, y: 28, coordinates: [10.0159, 76.3419] },
  { id: 'thripunitara', label: 'Thripunitara', shortLabel: 'Thripunitara', x: 68, y: 57, coordinates: [9.9499, 76.3499] },
  { id: 'rajagiri', label: 'Rajagiri School of Engineering', shortLabel: 'Rajagiri School', x: 83, y: 22, coordinates: [9.9932, 76.3584] },
];

type Vehicle = {
  id: string;
  name: string;
  category: VehicleCategory;
  fuel: string;
  co2Factor: number;
  no2Factor: number;
  speedKph: number;
  fuelCost: number;
};

const vehicles: Vehicle[] = [
  { id: 'swift', name: 'Maruti Suzuki Swift', category: 'Car', fuel: 'Petrol', co2Factor: 0.142, no2Factor: 0.05, speedKph: 35, fuelCost: 7.4 },
  { id: 'dzire', name: 'Maruti Suzuki Dzire', category: 'Car', fuel: 'Petrol', co2Factor: 0.136, no2Factor: 0.05, speedKph: 35, fuelCost: 7.1 },
  { id: 'wagonr', name: 'Maruti Suzuki WagonR', category: 'Car', fuel: 'Petrol', co2Factor: 0.131, no2Factor: 0.045, speedKph: 34, fuelCost: 6.9 },
  { id: 'innova', name: 'Toyota Innova', category: 'Car', fuel: 'Diesel', co2Factor: 0.205, no2Factor: 0.11, speedKph: 34, fuelCost: 10.8 },
  { id: 'bolero', name: 'Mahindra Bolero', category: 'Car', fuel: 'Diesel', co2Factor: 0.214, no2Factor: 0.12, speedKph: 33, fuelCost: 11.2 },
  { id: 'bmw-m1', name: 'BMW M1', category: 'Car', fuel: 'Petrol', co2Factor: 0.235, no2Factor: 0.08, speedKph: 38, fuelCost: 14.5 },
  { id: 'bmw-m2', name: 'BMW M2', category: 'Car', fuel: 'Petrol', co2Factor: 0.245, no2Factor: 0.08, speedKph: 38, fuelCost: 15.1 },
  { id: 'bmw-m3', name: 'BMW M3', category: 'Car', fuel: 'Petrol', co2Factor: 0.258, no2Factor: 0.09, speedKph: 39, fuelCost: 16.2 },
  { id: 'bmw-m4', name: 'BMW M4', category: 'Car', fuel: 'Petrol', co2Factor: 0.265, no2Factor: 0.09, speedKph: 39, fuelCost: 16.7 },
  { id: 'bmw-m5', name: 'BMW M5', category: 'Car', fuel: 'Petrol', co2Factor: 0.29, no2Factor: 0.1, speedKph: 39, fuelCost: 18.2 },
  { id: 'brezza', name: 'Maruti Suzuki Brezza', category: 'Car', fuel: 'Petrol', co2Factor: 0.15, no2Factor: 0.05, speedKph: 35, fuelCost: 7.8 },
  { id: 'thar', name: 'Mahindra Thar', category: 'Car', fuel: 'Diesel', co2Factor: 0.22, no2Factor: 0.12, speedKph: 33, fuelCost: 11.8 },
  { id: 'xuv500', name: 'Mahindra XUV 500', category: 'Car', fuel: 'Diesel', co2Factor: 0.21, no2Factor: 0.11, speedKph: 34, fuelCost: 11.1 },
  { id: 'xuv600', name: 'Mahindra XUV 600', category: 'Car', fuel: 'Diesel', co2Factor: 0.19, no2Factor: 0.1, speedKph: 35, fuelCost: 10.2 },
  { id: 'xuv700', name: 'Mahindra XUV 700', category: 'Car', fuel: 'Diesel', co2Factor: 0.2, no2Factor: 0.1, speedKph: 35, fuelCost: 10.5 },
  { id: 'innova-crysta', name: 'Toyota Innova Crysta', category: 'Car', fuel: 'Diesel', co2Factor: 0.21, no2Factor: 0.11, speedKph: 34, fuelCost: 11.1 },
  { id: 'i20', name: 'Hyundai i20', category: 'Car', fuel: 'Petrol', co2Factor: 0.145, no2Factor: 0.05, speedKph: 35, fuelCost: 7.6 },
  { id: 'creta', name: 'Hyundai Creta', category: 'Car', fuel: 'Petrol', co2Factor: 0.17, no2Factor: 0.06, speedKph: 35, fuelCost: 8.8 },
  { id: 'nexon', name: 'Tata Nexon', category: 'Car', fuel: 'Petrol', co2Factor: 0.16, no2Factor: 0.055, speedKph: 35, fuelCost: 8.4 },
  { id: 'punch', name: 'Tata Punch', category: 'Car', fuel: 'Petrol', co2Factor: 0.15, no2Factor: 0.05, speedKph: 34, fuelCost: 7.9 },
  { id: 'passion-pro', name: 'Hero Passion Pro', category: 'Bike', fuel: 'Petrol', co2Factor: 0.062, no2Factor: 0.028, speedKph: 28, fuelCost: 2.2 },
  { id: 'splendor', name: 'Hero Splendor', category: 'Bike', fuel: 'Petrol', co2Factor: 0.058, no2Factor: 0.026, speedKph: 28, fuelCost: 2 },
  { id: 'duke-125', name: 'KTM Duke 125', category: 'Bike', fuel: 'Petrol', co2Factor: 0.073, no2Factor: 0.032, speedKph: 31, fuelCost: 2.7 },
  { id: 'duke-200', name: 'KTM Duke 200', category: 'Bike', fuel: 'Petrol', co2Factor: 0.08, no2Factor: 0.035, speedKph: 31, fuelCost: 3 },
  { id: 'duke-250', name: 'KTM Duke 250', category: 'Bike', fuel: 'Petrol', co2Factor: 0.086, no2Factor: 0.038, speedKph: 32, fuelCost: 3.2 },
  { id: 'duke-390', name: 'KTM Duke 390', category: 'Bike', fuel: 'Petrol', co2Factor: 0.098, no2Factor: 0.042, speedKph: 32, fuelCost: 3.6 },
  { id: 'classic-350', name: 'Royal Enfield Classic 350', category: 'Bike', fuel: 'Petrol', co2Factor: 0.091, no2Factor: 0.04, speedKph: 29, fuelCost: 3.4 },
  { id: 'activa-6g', name: 'Honda Activa 6G', category: 'Bike', fuel: 'Petrol', co2Factor: 0.067, no2Factor: 0.029, speedKph: 27, fuelCost: 2.4 },
  { id: 'shine', name: 'Honda Shine', category: 'Bike', fuel: 'Petrol', co2Factor: 0.061, no2Factor: 0.027, speedKph: 28, fuelCost: 2.1 },
  { id: 'unicorn', name: 'Honda Unicorn', category: 'Bike', fuel: 'Petrol', co2Factor: 0.066, no2Factor: 0.029, speedKph: 29, fuelCost: 2.4 },
  { id: 'pulsar-150', name: 'Bajaj Pulsar 150', category: 'Bike', fuel: 'Petrol', co2Factor: 0.07, no2Factor: 0.03, speedKph: 29, fuelCost: 2.6 },
  { id: 'apache-160', name: 'TVS Apache RTR 160', category: 'Bike', fuel: 'Petrol', co2Factor: 0.074, no2Factor: 0.032, speedKph: 30, fuelCost: 2.8 },
  { id: 'fz-fi', name: 'Yamaha FZ-FI', category: 'Bike', fuel: 'Petrol', co2Factor: 0.069, no2Factor: 0.03, speedKph: 29, fuelCost: 2.5 },
  { id: 'r15', name: 'Yamaha R15', category: 'Bike', fuel: 'Petrol', co2Factor: 0.078, no2Factor: 0.034, speedKph: 31, fuelCost: 2.9 },
  { id: 'jupiter', name: 'TVS Jupiter', category: 'Bike', fuel: 'Petrol', co2Factor: 0.068, no2Factor: 0.029, speedKph: 27, fuelCost: 2.4 },
  { id: 'sp125', name: 'Honda SP 125', category: 'Bike', fuel: 'Petrol', co2Factor: 0.06, no2Factor: 0.027, speedKph: 28, fuelCost: 2.1 },
  { id: 'avenger-160', name: 'Bajaj Avenger 160', category: 'Bike', fuel: 'Petrol', co2Factor: 0.078, no2Factor: 0.034, speedKph: 28, fuelCost: 2.9 },
  { id: 'hunter-350', name: 'Royal Enfield Hunter 350', category: 'Bike', fuel: 'Petrol', co2Factor: 0.088, no2Factor: 0.039, speedKph: 29, fuelCost: 3.3 },
  { id: 'raider-125', name: 'TVS Raider 125', category: 'Bike', fuel: 'Petrol', co2Factor: 0.059, no2Factor: 0.026, speedKph: 29, fuelCost: 2.1 },
  { id: 'access-125', name: 'Suzuki Access 125', category: 'Bike', fuel: 'Petrol', co2Factor: 0.067, no2Factor: 0.029, speedKph: 27, fuelCost: 2.4 },
];

const routeDefinitions: Array<{ kind: RouteKind; label: string; helper: string; distanceFactor: number; timeFactor: number; color: string }> = [
  { kind: 'fastest', label: 'Fastest route', helper: 'Best for the shortest travel time', distanceFactor: 1, timeFactor: 1, color: '#df705f' },
  { kind: 'greenest', label: 'Cleanest / greenest route', helper: 'Lower fuel burn and emissions', distanceFactor: 1.13, timeFactor: 1.11, color: '#23957f' },
  { kind: 'average', label: 'Average route', helper: 'Balanced distance and travel time', distanceFactor: 1.06, timeFactor: 1.05, color: '#d7a945' },
];

type RouteResult = {
  kind: RouteKind;
  label: string;
  helper: string;
  color: string;
  distance: number;
  time: number;
  cost: number;
  co2: number;
  no2: number;
  score: number;
  path: string;
  geometry: [number, number][];
};

type RouteDataStatus = 'loading' | 'live' | 'unavailable';
type TrafficDataStatus = 'loading' | 'live' | 'unavailable';

type TrafficSnapshot = {
  status: TrafficDataStatus;
  currentSpeedKph?: number;
  freeFlowSpeedKph?: number;
  congestion?: number;
  label?: string;
  road?: string;
  updatedAt?: string;
  message?: string;
};

type LiveRoute = {
  distanceKm: number;
  durationMin: number;
  geometry: [number, number][];
};

type TransitMode = {
  id: string;
  label: string;
  helper: string;
  co2PerPassengerKm: number;
  no2PerPassengerKm: number;
  timeFactor: number;
  costPerKm: number;
  color: string;
  icon: LucideIcon;
};

const transitModes: TransitMode[] = [
  { id: 'bus', label: 'City bus', helper: 'Shared road transport', co2PerPassengerKm: 0.089, no2PerPassengerKm: 0.00042, timeFactor: 1.34, costPerKm: 1.5, color: '#23957f', icon: BusFront },
  { id: 'metro', label: 'Metro / rail', helper: 'Lower-carbon electric transit', co2PerPassengerKm: 0.035, no2PerPassengerKm: 0.00008, timeFactor: 1.18, costPerKm: 1.2, color: '#d7a945', icon: TrainFront },
  { id: 'auto', label: 'Auto-rickshaw', helper: 'Short-distance shared ride', co2PerPassengerKm: 0.12, no2PerPassengerKm: 0.00062, timeFactor: 1.18, costPerKm: 3.8, color: '#df705f', icon: CarFront },
  { id: 'walk', label: 'Walk / cycle', helper: 'Zero tailpipe emissions', co2PerPassengerKm: 0, no2PerPassengerKm: 0, timeFactor: 3.4, costPerKm: 0, color: '#6d8d55', icon: PersonStanding },
];

type EcoContextValue = {
  from: PlaceId;
  to: PlaceId;
  setFrom: (value: PlaceId) => void;
  setTo: (value: PlaceId) => void;
  trafficSnapshot: TrafficSnapshot;
  routeStatus: RouteDataStatus;
  priority: number;
  setPriority: (value: number) => void;
  vehicleCategory: VehicleCategory;
  setVehicleCategory: (value: VehicleCategory) => void;
  vehicleId: string;
  setVehicleId: (value: string) => void;
  modelYear: number;
  setModelYear: (value: number) => void;
  selectedVehicle: Vehicle;
  fromPlace: Place;
  toPlace: Place;
  hasCalculated: boolean;
  calculateRoute: () => void;
  results: RouteResult[];
  recommended: RouteResult;
};

const EcoContext = createContext<EcoContextValue | null>(null);

function useEcoRoute() {
  const value = useContext(EcoContext);
  if (!value) throw new Error('EcoRoute context is missing');
  return value;
}

function getPlace(id: PlaceId) {
  return places.find((place) => place.id === id) ?? places[0];
}

function getVehicle(id: string) {
  return vehicles.find((vehicle) => vehicle.id === id) ?? vehicles[0];
}

function routePath(kind: RouteKind, start: Place, end: Place) {
  const midX = (start.x + end.x) / 2;
  const midY = (start.y + end.y) / 2;
  const bend = kind === 'fastest' ? -5 : kind === 'greenest' ? 8 : 2;
  const side = kind === 'greenest' ? 4 : kind === 'fastest' ? -2 : 1;
  return `${start.x},${start.y} ${midX + side},${midY + bend} ${end.x},${end.y}`;
}

function baseRouteDistance(start: Place, end: Place) {
  return Math.max(3.2, Number((Math.hypot(end.x - start.x, end.y - start.y) * 0.17 + 2.6).toFixed(1)));
}

function fallbackGeometry(start: Place, end: Place): [number, number][] {
  return [start.coordinates, end.coordinates];
}

function trafficLabel(congestion: number) {
  if (congestion < 0.18) return 'Light';
  if (congestion < 0.38) return 'Moderate';
  if (congestion < 0.62) return 'Heavy';
  return 'Severe';
}

function trafficFactors(snapshot: TrafficSnapshot) {
  const congestion = snapshot.status === 'live' ? snapshot.congestion ?? 0 : 0;
  return {
    time: 1 + congestion * 0.82,
    emissions: 1 + congestion * 0.45,
    no2: 1 + congestion * 0.68,
  };
}

function transitResults(distance: number, vehicleSpeedKph: number, snapshot: TrafficSnapshot) {
  const traffic = trafficFactors(snapshot);
  return transitModes.map((mode) => ({
    ...mode,
    distance,
    time: Math.max(1, Math.round((distance / (vehicleSpeedKph || 30)) * 60 * mode.timeFactor * (mode.id === 'metro' || mode.id === 'walk' ? 1 : traffic.time))),
    co2: distance * mode.co2PerPassengerKm * (mode.id === 'metro' || mode.id === 'walk' ? 1 : traffic.emissions),
    no2: distance * mode.no2PerPassengerKm * (mode.id === 'metro' || mode.id === 'walk' ? 1 : traffic.no2),
    cost: Math.round(distance * mode.costPerKm),
  }));
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
      <NavItem href="/compare" icon={Map} onNavigate={onNavigate}>Route choices</NavItem>
      <NavItem href="/impact" icon={TrendingDown} onNavigate={onNavigate}>Emissions</NavItem>
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
        <div className="sidebar-kicker">Motor vehicle route intelligence</div>
        <NavigationLinks />
        <div className="sidebar-footer">
          <strong>Live map · Kochi corridor</strong>
          <p>OpenStreetMap road data with live traffic status when the provider is connected.</p>
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
  const { recommended, priority, selectedVehicle, fromPlace, toPlace } = useEcoRoute();
  return (
    <div className="page-wrap">
      <section className="home-hero">
        <div className="reveal">
          <div className="eyebrow">Kochi corridor / motor vehicle planner</div>
          <h1 className="hero-title">Move with<br /><em>less impact.</em></h1>
          <p className="hero-copy">EcoRoute AI compares the fastest, cleanest, and average driving routes, then estimates how your chosen car or bike affects CO₂ and NO₂ emissions.</p>
          <div className="hero-actions">
            <Link href="/plan" className="btn btn-primary" data-testid="link-hero-plan">Plan a route <ArrowRight size={16} /></Link>
            <Link href="/compare" className="btn btn-ghost" data-testid="link-hero-compare">See route choices</Link>
          </div>
        </div>
        <div className="hero-art grid-noise reveal reveal-delay-2" data-testid="visual-route-preview">
          <div className="art-label">Kochi corridor / climate readout</div>
          <div className="route-line" />
          <div className="route-dot top" />
          <div className="route-dot bottom" />
          <div className="route-stop top">{fromPlace.label}</div>
          <div className="route-stop bottom">{toPlace.label}</div>
          <div className="art-chip"><span>{recommended.label.replace(' route', '')}</span><small>{selectedVehicle.name} · {priority}% green priority</small></div>
          <div style={{ position: 'absolute', right: 30, top: 115, textAlign: 'right' }}>
            <div style={{ font: '700 51px "Space Grotesk", sans-serif', letterSpacing: '-.08em' }}>{recommended.distance}</div>
            <div className="art-label">km · estimated</div>
          </div>
        </div>
      </section>

      <div className="stat-strip reveal reveal-delay-1">
        <div><div className="stat-number">{places.length} places</div><div className="stat-label">Kochi corridor nodes</div></div>
        <div><div className="stat-number">3 routes</div><div className="stat-label">fastest, cleanest, average</div></div>
        <div><div className="stat-number">2 gases</div><div className="stat-label">CO₂ and NO₂ estimates</div></div>
      </div>

      <section className="home-section two-col">
        <div>
          <div className="eyebrow">The problem</div>
          <h2 className="section-heading">A drive is more than minutes.</h2>
          <p className="section-copy">Two routes can reach the same destination while creating different fuel use and exhaust emissions. EcoRoute makes that tradeoff visible without pretending a classroom model is live navigation.</p>
          <div className="problem-list">
            <div className="problem-item"><CircleAlert size={18} /><div><strong>Route choice changes the footprint</strong><p>Distance, traffic, and stop-start driving affect what your vehicle emits.</p></div></div>
            <div className="problem-item"><Users size={18} /><div><strong>Vehicle choice matters too</strong><p>Compare a compact car, SUV, premium car, commuter bike, or performance bike.</p></div></div>
            <div className="problem-item"><Navigation size={18} /><div><strong>Local places keep the demo concrete</strong><p>Explore Aluva, Kalamassery, Thripunitara, Kakkanad, and Rajagiri.</p></div></div>
          </div>
        </div>
        <div>
          <div className="eyebrow">The EcoRoute approach</div>
          <h2 className="section-heading">Make the driving tradeoff legible.</h2>
          <div className="feature-grid">
            <div className="surface feature-card shadow-card"><div className="feature-icon"><Map size={17} /></div><h3>See three routes</h3><p>Fastest, cleanest, and average route choices on one schematic map.</p></div>
            <div className="surface feature-card shadow-card"><div className="feature-icon"><Fuel size={17} /></div><h3>Choose your vehicle</h3><p>Use a realistic Indian car or bike model to personalize the estimate.</p></div>
            <div className="surface feature-card shadow-card"><div className="feature-icon"><Cloud size={17} /></div><h3>Understand CO₂</h3><p>View estimated kilograms of CO₂ for each route and vehicle.</p></div>
            <div className="surface feature-card shadow-card"><div className="feature-icon"><Wind size={17} /></div><h3>Track NO₂ too</h3><p>See an indicative tailpipe NO₂ estimate in grams alongside CO₂.</p></div>
          </div>
        </div>
      </section>

      <section className="home-cta">
        <div><div className="eyebrow" style={{ color: 'hsl(168 63% 55%)' }}>Start with one trip</div><h2 className="section-heading">Pick a Kochi route and see what your vehicle leaves behind.</h2><p className="section-copy">Choose your locations, traffic condition, and vehicle model to create a tailored route readout.</p></div>
        <Link href="/plan" className="btn btn-secondary" data-testid="link-cta-plan">Open route planner <ArrowRight size={15} /></Link>
      </section>
      <div className="footer-note"><span>EcoRoute AI · Engineering / IT project demo</span><span>Estimates are educational, not live navigation guidance.</span></div>
    </div>
  );
}

function RouteMap({ results, fromPlace, toPlace, recommended, routeStatus, trafficSnapshot }: { results: RouteResult[]; fromPlace: Place; toPlace: Place; recommended: RouteKind; routeStatus: RouteDataStatus; trafficSnapshot: TrafficSnapshot }) {
  const center: [number, number] = [(fromPlace.coordinates[0] + toPlace.coordinates[0]) / 2, (fromPlace.coordinates[1] + toPlace.coordinates[1]) / 2];
  return (
    <div className="surface map-card shadow-card" data-testid="map-route-visualization">
      <div className="map-card-header">
        <div><div className="eyebrow">Interactive live map</div><h2><Map size={19} /> Kochi corridor</h2><p>Pan and zoom the OpenStreetMap view. Route lines use public OSRM road geometry when available.</p></div>
        <span className={`data-status ${routeStatus === 'live' ? 'is-live' : ''}`}>{routeStatus === 'live' ? 'ROUTES UPDATED' : routeStatus === 'loading' ? 'UPDATING ROUTES' : 'ROUTE FALLBACK'}</span>
      </div>
      <div className="route-map interactive-map">
        <MapContainer center={center} zoom={11} scrollWheelZoom className="leaflet-map" aria-label="Interactive Kochi route map">
          <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {results.map((route) => (
            <Polyline
              key={route.kind}
              positions={route.geometry.length > 1 ? route.geometry : fallbackGeometry(fromPlace, toPlace)}
              pathOptions={{ color: route.color, weight: route.kind === recommended ? 7 : 4, opacity: route.kind === recommended ? 0.95 : 0.46, dashArray: route.kind === recommended ? undefined : '8 8' }}
            />
          ))}
          {places.map((place) => {
            const selected = place.id === fromPlace.id || place.id === toPlace.id;
            return (
              <CircleMarker key={place.id} center={place.coordinates} radius={selected ? 9 : 6} pathOptions={{ color: selected ? '#23957f' : '#1d2b3d', fillColor: selected ? '#23957f' : '#1d2b3d', fillOpacity: 1, weight: selected ? 4 : 2 }}>
                <Popup><strong>{place.label}</strong><br />Kochi corridor location</Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>
      </div>
      <div className="map-legend">
        {routeDefinitions.map((route) => <span key={route.kind} className={route.kind === recommended ? 'active' : ''}><i style={{ background: route.color }} />{route.label.replace(' route', '')}</span>)}
      </div>
      <div className={`traffic-map-readout ${trafficSnapshot.status === 'live' ? 'is-live' : ''}`}><Gauge size={14} /><span>{trafficSnapshot.status === 'live' ? `Current corridor traffic: ${trafficSnapshot.label} · ${trafficSnapshot.currentSpeedKph} km/h vs ${trafficSnapshot.freeFlowSpeedKph} free-flow` : trafficSnapshot.status === 'loading' ? 'Checking current corridor traffic…' : 'Current traffic is unavailable until a live provider key is connected.'}</span></div>
    </div>
  );
}

function VehicleIcon({ category }: { category: VehicleCategory }) {
  return category === 'Bike' ? <Bike size={17} /> : <CarFront size={18} />;
}

function RouteOptionCard({ result, recommended }: { result: RouteResult; recommended: boolean }) {
  const { selectedVehicle } = useEcoRoute();
  return (
    <div className={`route-option surface${recommended ? ' selected' : ''}`} data-testid={`card-route-${result.kind}`}>
      <div className="route-option-title"><span className="route-option-icon" style={{ background: result.color }}><RouteIcon size={15} /></span><div><strong>{result.label}</strong><small>{result.helper}</small></div>{recommended && <span className="rec-pill"><Check size={11} /> Best fit</span>}</div>
      <div className="route-option-stats"><span><Clock3 size={13} />{result.time} min</span><span><MapPin size={13} />{result.distance} km</span><span><Cloud size={13} />{result.co2.toFixed(2)} kg CO₂</span><span><Wind size={13} />{result.no2.toFixed(2)} g NO₂</span></div>
      <div className="route-option-foot"><span>{selectedVehicle.name}</span><b>{result.score}/100 fit</b></div>
    </div>
  );
}

function TransitPanel({ distance, vehicleSpeedKph, trafficSnapshot }: { distance: number; vehicleSpeedKph: number; trafficSnapshot: TrafficSnapshot }) {
  const modes = transitResults(distance, vehicleSpeedKph, trafficSnapshot);
  return (
    <section className="transit-panel surface" data-testid="panel-public-transport">
      <div className="transit-panel-heading"><div><div className="small-label">Other ways to travel</div><h2>Compare shared and low-impact routes</h2><p>Illustrative one-passenger estimates across the same corridor distance.</p></div><span className="data-status">PER PASSENGER</span></div>
      <div className="transit-list">
        {modes.map((mode) => {
          const Icon = mode.icon;
          return <div className="transit-row" key={mode.id}><span className="transit-icon" style={{ color: mode.color }}><Icon size={17} /></span><div className="transit-name"><strong>{mode.label}</strong><small>{mode.helper}</small></div><span className="transit-metric">{mode.time} min</span><span className="transit-metric">{mode.co2.toFixed(2)} kg CO₂</span><span className="transit-metric">{mode.no2.toFixed(3)} g NO₂</span><span className="transit-cost">₹{mode.cost}</span></div>;
        })}
      </div>
      <p className="transit-note"><Info size={14} />Bus and auto values assume one passenger and average occupancy factors; metro/rail values are corridor estimates, not a live transit timetable. Walking and cycling have zero tailpipe emissions.</p>
    </section>
  );
}

function PlanPage() {
  const { from, to, setFrom, setTo, trafficSnapshot, routeStatus, priority, setPriority, calculateRoute, recommended, results, hasCalculated, vehicleCategory, setVehicleCategory, vehicleId, setVehicleId, modelYear, setModelYear, selectedVehicle, fromPlace, toPlace } = useEcoRoute();
  const [, setLocation] = useLocation();
  const priorityLabel = priority < 34 ? 'Fastest first' : priority < 67 ? 'Balanced choice' : 'Greenest first';
  const availableVehicles = vehicles.filter((vehicle) => vehicle.category === vehicleCategory);
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    calculateRoute();
  };
  return (
    <div className="page-wrap">
      <div className="eyebrow">Route planner / vehicle emissions calculator</div>
      <h1 className="page-title">See the road before you take it.</h1>
      <p className="page-subtitle">Pick two places in the Kochi corridor, choose the exact model year you are using, and compare road routes with live map data plus estimated CO₂ and NO₂.</p>
      <div className="plan-layout planner-layout">
        <form className="surface form-card shadow-card reveal" onSubmit={submit} data-testid="form-route-planner">
          <h2>Build your trip</h2>
          <p>Choose a corridor location and the exact vehicle model year you want to model.</p>
          <div className="field">
            <label htmlFor="from-location">From</label>
            <div className="input-wrap"><MapPin size={17} /><select id="from-location" className="text-input select-input" value={from} onChange={(event) => setFrom(event.target.value as PlaceId)} data-testid="select-from-location">{places.map((place) => <option value={place.id} key={place.id}>{place.label}</option>)}</select></div>
          </div>
          <div className="field">
            <label htmlFor="to-location">To</label>
            <div className="input-wrap"><Navigation size={17} /><select id="to-location" className="text-input select-input" value={to} onChange={(event) => setTo(event.target.value as PlaceId)} data-testid="select-to-location">{places.map((place) => <option value={place.id} key={place.id}>{place.label}</option>)}</select></div>
          </div>
          <div className="field">
            <label>Vehicle type</label>
            <div className="category-toggle">
              {(['Car', 'Bike'] as VehicleCategory[]).map((category) => <button type="button" className={`category-btn${vehicleCategory === category ? ' active' : ''}`} onClick={() => setVehicleCategory(category)} key={category} data-testid={`button-vehicle-category-${category.toLowerCase()}`}><VehicleIcon category={category} />{category}</button>)}
            </div>
          </div>
          <div className="field">
            <label htmlFor="vehicle-model">Vehicle model</label>
            <div className="input-wrap"><Fuel size={17} /><select id="vehicle-model" className="text-input select-input" value={vehicleId} onChange={(event) => setVehicleId(event.target.value)} data-testid="select-vehicle-model">{availableVehicles.map((vehicle) => <option value={vehicle.id} key={vehicle.id}>{vehicle.name} · {vehicle.fuel}</option>)}</select></div>
            <div className="field-help">{selectedVehicle.co2Factor.toFixed(3)} kg CO₂/km base factor · {selectedVehicle.no2Factor.toFixed(3)} g NO₂/km base factor</div>
          </div>
          <div className="field">
            <label htmlFor="model-year">Model year</label>
            <div className="input-wrap"><CarFront size={17} /><select id="model-year" className="text-input select-input" value={modelYear} onChange={(event) => setModelYear(Number(event.target.value))} data-testid="select-model-year">{[2026, 2025, 2024, 2023, 2022, 2021, 2020].map((year) => <option value={year} key={year}>{year} model year</option>)}</select></div>
            <div className="field-help">Older model years receive a small age-adjustment in the classroom estimate.</div>
          </div>
          <div className={`traffic-status-card ${trafficSnapshot.status === 'live' ? 'is-live' : ''}`} data-testid="traffic-status">
            <div className="traffic-status-top"><span><Gauge size={15} /> Current traffic</span><b>{trafficSnapshot.status === 'live' ? trafficSnapshot.label : trafficSnapshot.status === 'loading' ? 'Checking…' : 'Unavailable'}</b></div>
            <p>{trafficSnapshot.status === 'live' ? `${trafficSnapshot.currentSpeedKph} km/h current speed · ${trafficSnapshot.freeFlowSpeedKph} km/h free-flow${trafficSnapshot.road ? ` · ${trafficSnapshot.road}` : ''}` : trafficSnapshot.status === 'loading' ? 'Reading a live traffic-flow segment for this corridor.' : trafficSnapshot.message ?? 'Connect a free traffic provider key to replace the demo selector with current conditions.'}</p>
            {trafficSnapshot.updatedAt && <small>Updated {new Date(trafficSnapshot.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small>}
          </div>
          <div className="priority-box">
            <div className="priority-row"><span>Recommendation bias</span><span data-testid="text-priority-label">{priorityLabel}</span></div>
            <input className="priority-range" type="range" min="0" max="100" value={priority} onChange={(event) => setPriority(Number(event.target.value))} aria-label="Fastest to greenest priority" data-testid="input-priority" />
            <div className="range-labels"><span>Fastest</span><span>Greenest</span></div>
          </div>
          <div className="demo-note"><Info size={14} /><span>Roads, distance, and speed come from public map/routing services. Emission factors remain educational estimates; current traffic is only used when the live flow service responds.</span></div>
          <button className="btn btn-primary" type="submit" style={{ width: '100%', marginTop: 22 }} data-testid="button-calculate-route">{hasCalculated ? 'Recalculate route choices' : 'Calculate route choices'} <ArrowRight size={16} /></button>
        </form>

        <div className="planner-results reveal reveal-delay-1">
          <RouteMap results={results} fromPlace={fromPlace} toPlace={toPlace} recommended={recommended.kind} routeStatus={routeStatus} trafficSnapshot={trafficSnapshot} />
          <div className="route-summary"><div><div className="small-label">Current recommendation</div><h2 data-testid="text-recommended-route">{recommended.label}</h2><p>{fromPlace.label} → {toPlace.label} · {selectedVehicle.name} · {modelYear}</p></div><span className="data-status is-live">LIVE MAP / ESTIMATES</span></div>
          <div className="route-option-list">{results.map((result) => <RouteOptionCard result={result} recommended={result.kind === recommended.kind} key={result.kind} />)}</div>
          <TransitPanel distance={recommended.distance} vehicleSpeedKph={selectedVehicle.speedKph} trafficSnapshot={trafficSnapshot} />
          <button className="btn btn-secondary btn-small" style={{ marginTop: 18 }} onClick={() => setLocation('/compare')} data-testid="button-view-comparison">View full route comparison <ChevronRight size={14} /></button>
        </div>
      </div>
    </div>
  );
}

function ComparePage() {
  const { results, recommended, priority, trafficSnapshot, fromPlace, toPlace, selectedVehicle, modelYear, routeStatus } = useEcoRoute();
  const fastest = results.find((result) => result.kind === 'fastest') ?? results[0];
  return (
    <div className="page-wrap">
      <div className="page-toolbar">
        <div><div className="eyebrow">Decision board / route comparison</div><h1 className="page-title" style={{ marginBottom: 10 }}>Same destination.<br />Three ways to get there.</h1><p className="page-subtitle">The recommendation is tuned to {trafficSnapshot.status === 'live' ? `current ${trafficSnapshot.label?.toLowerCase()} traffic` : 'the available live map data'}, your {selectedVehicle.name} ({modelYear}), and {priority}% green priority.</p></div>
        <div className="toolbar-actions"><Link href="/plan" className="btn btn-ghost btn-small" data-testid="link-edit-route">Edit trip</Link><Link href="/impact" className="btn btn-primary btn-small" data-testid="link-view-impact">See emissions <ArrowRight size={14} /></Link></div>
      </div>
      <RouteMap results={results} fromPlace={fromPlace} toPlace={toPlace} recommended={recommended.kind} routeStatus={routeStatus} trafficSnapshot={trafficSnapshot} />
      <div className="compare-list route-compare-list" data-testid="list-route-comparison">
        <div className="compare-row compare-header"><div>Route choice</div><div>Time</div><div>Distance</div><div>CO₂</div><div>NO₂</div><div>Fit</div></div>
        {results.map((route) => (
          <div className={`compare-row${route.kind === recommended.kind ? ' recommended' : ''}`} key={route.kind} data-testid={`row-route-${route.kind}`}>
            <div className="mode-cell"><span className="mode-icon route-icon-color" style={{ color: route.color }}><RouteIcon size={18} /></span><div><span className="mode-name">{route.label}</span><span className="mode-sub">{route.helper}</span></div></div>
            <div className="table-value"><strong>{route.time}</strong> min</div>
            <div className="table-value">{route.distance} km</div>
            <div className="table-value"><strong>{route.co2.toFixed(2)}</strong> kg</div>
            <div className="table-value"><strong>{route.no2.toFixed(2)}</strong> g</div>
            <div>{route.kind === recommended.kind ? <span className="rec-pill"><Check size={11} /> Recommended</span> : <span className="score"><i className="score-dot" />{route.score}</span>}</div>
          </div>
        ))}
      </div>
      <div className="compare-footnote"><CircleHelp size={15} /><span>Estimates use {selectedVehicle.name} ({selectedVehicle.fuel}) on the selected corridor. CO₂ and NO₂ factors are illustrative classroom values, not certified vehicle testing.</span></div>
      <div className="insight-banner"><Lightbulb size={20} /><div><strong>{recommended.label} is your current best fit.</strong><p>{fastest.label} takes {fastest.time} minutes. Your priority slider decides how much extra time is worth trading for lower estimated emissions.</p></div></div>
    </div>
  );
}

function ImpactPage() {
  const { results, recommended, trafficSnapshot, selectedVehicle, fromPlace, toPlace, modelYear } = useEcoRoute();
  const fastest = results.find((result) => result.kind === 'fastest') ?? results[0];
  const co2Saving = Math.max(0, fastest.co2 - recommended.co2);
  const no2Saving = Math.max(0, fastest.no2 - recommended.no2);
  const maxCo2 = Math.max(...results.map((route) => route.co2), 0.01);
  const maxNo2 = Math.max(...results.map((route) => route.no2), 0.01);
  return (
    <div className="page-wrap">
      <div className="eyebrow">Impact readout / one trip at a time</div>
      <h1 className="page-title">Measure what your<br /><span style={{ color: 'hsl(var(--primary))' }}>vehicle leaves behind.</span></h1>
      <p className="page-subtitle">{selectedVehicle.name} ({modelYear}) on {fromPlace.label} → {toPlace.label}, with {trafficSnapshot.status === 'live' ? `current ${trafficSnapshot.label?.toLowerCase()} traffic` : 'live traffic unavailable'}. These values are estimated for the selected trip.</p>
      <div className="impact-hero">
        <div className="surface impact-summary shadow-card"><div className="eyebrow" style={{ color: 'hsl(48 31% 95% / .72)' }}>If you choose {recommended.label}</div><h2>One trip, measured honestly.</h2><p>Compared with the fastest route for this vehicle, your current recommendation avoids an estimated amount of tailpipe CO₂ and NO₂.</p><div className="big-saving" data-testid="text-co2-saving">{co2Saving.toFixed(2)} <small>kg CO₂ saved</small></div><div className="impact-mini-stat"><span><Wind size={15} /> {no2Saving.toFixed(2)} g NO₂ avoided</span><span><VehicleIcon category={selectedVehicle.category} /> {selectedVehicle.name}</span></div></div>
        <div className="impact-stat-stack">
          <div className="surface impact-stat"><div><div className="stat-label">Fastest baseline</div><div className="stat-number">{fastest.co2.toFixed(2)} kg</div><div className="impact-substat">{fastest.no2.toFixed(2)} g NO₂</div></div><Clock3 size={24} /></div>
          <div className="surface impact-stat"><div><div className="stat-label">Recommended route</div><div className="stat-number">{recommended.co2.toFixed(2)} kg</div><div className="impact-substat">{recommended.no2.toFixed(2)} g NO₂</div></div><Leaf size={24} /></div>
          <div className="surface impact-stat"><div><div className="stat-label">CO₂ reduction</div><div className="stat-number">{fastest.co2 ? Math.round((co2Saving / fastest.co2) * 100) : 0}%</div><div className="impact-substat">relative to fastest route</div></div><TrendingDown size={24} /></div>
        </div>
      </div>
      <section className="surface chart-section shadow-card">
        <div className="chart-title"><h2>CO₂ by route choice</h2><p>kg CO₂ per one-way trip</p></div>
        <div className="bar-chart" data-testid="chart-co2-by-route">{results.map((route) => <div className="bar-row" key={route.kind}><div className="bar-label"><RouteIcon size={14} />{route.label.replace(' route', '')}</div><div className="bar-track"><div className="bar-fill" style={{ width: `${Math.max(4, (route.co2 / maxCo2) * 100)}%`, background: route.color }} /></div><div className="bar-value">{route.co2.toFixed(2)} kg</div></div>)}</div>
         <p className="chart-caption">CO₂ uses route distance × vehicle factor × model-year adjustment × live traffic factor when available. Road geometry comes from public routing data.</p>
      </section>
      <section className="surface chart-section shadow-card pollutant-chart">
        <div className="chart-title"><h2>NO₂ by route choice</h2><p>grams NO₂ per one-way trip</p></div>
        <div className="bar-chart" data-testid="chart-no2-by-route">{results.map((route) => <div className="bar-row" key={route.kind}><div className="bar-label"><Wind size={14} />{route.label.replace(' route', '')}</div><div className="bar-track"><div className="bar-fill" style={{ width: `${Math.max(4, (route.no2 / maxNo2) * 100)}%`, background: route.color }} /></div><div className="bar-value">{route.no2.toFixed(2)} g</div></div>)}</div>
        <p className="chart-caption">NO₂ values are indicative tailpipe estimates. Real emissions vary with engine condition, fuel quality, temperature, maintenance, and driving behaviour.</p>
      </section>
      <div className="impact-callout">
        <div className="surface impact-callout-card"><h3>Why show the vehicle?</h3><p>A Maruti Suzuki Swift, Toyota Innova, BMW M5, Hero Splendor, and KTM Duke do not emit the same amount per kilometre. The selected model keeps that distinction visible.</p></div>
        <div className="surface impact-callout-card"><h3>Keep the context.</h3><p>These are transparent estimates for a college project demo, not verified carbon accounting, a pollution certificate, or live navigation data.</p></div>
      </div>
    </div>
  );
}

function AboutPage() {
  return (
    <div className="page-wrap">
      <div className="eyebrow">About the project / documentation</div>
      <h1 className="page-title">A route planner with<br /><span style={{ color: 'hsl(var(--accent))' }}>a point of view.</span></h1>
      <p className="page-subtitle">EcoRoute AI is a student-built Engineering / IT project exploring how route choice, vehicle choice, and exhaust pollution can be explained in one approachable interface.</p>
      <div className="about-grid">
        <div className="about-main">
          <section className="surface about-card shadow-card"><h2>What we are testing</h2><p>Can a route planner move beyond “fastest” and help people understand the cost of convenience? EcoRoute compares three schematic route choices around the Kochi corridor and adapts the emissions estimate to a selected car or bike model.</p><div className="limitation"><p><strong>Design principle:</strong> clarity before persuasion. The app should make a cleaner option understandable without pretending every decision is simple.</p></div></section>
          <section className="surface about-card"><h2>How the demo works</h2><ul><li>Choose from Aluva Railway Station, Kalamassery, Thripunitara, Kakkanad, and Rajagiri School of Engineering.</li><li>Choose a car or bike model from the included Indian vehicle catalog.</li><li>Compare fastest, cleanest / greenest, and average route choices on the schematic map.</li><li>CO₂ follows <strong>distance × vehicle factor × traffic factor</strong>; NO₂ uses a separate indicative vehicle factor.</li><li>Traffic levels are illustrative scenarios, not real-time traffic.</li></ul></section>
          <section className="surface about-card"><h2>Limitations & responsible use</h2><p>This prototype does not connect to a live maps provider, routing API, vehicle telemetry, pollution registry, or real-time traffic. Emission factors are illustrative averages and do not account for occupancy, vehicle age, road grade, maintenance, fuel blend, cold starts, or life-cycle emissions. Use the readouts to understand the shape of a decision, not as certified environmental data.</p></section>
          <section className="surface about-card"><h2>Future scope</h2><p>Next steps could include OpenStreetMap or Google Maps route geometry, live traffic, elevation-aware fuel burn, vehicle registration lookups, route GPS traces, weather conditions, and a confidence interval around each estimate.</p></section>
        </div>
        <aside className="about-sidebar">
          <section className="surface about-card"><h2>Built with</h2><p>A focused browser prototype with a readable calculation model and a local Kochi corridor map.</p><div className="tech-list"><span className="tech-tag">React + Vite</span><span className="tech-tag">TypeScript</span><span className="tech-tag">Wouter</span><span className="tech-tag">Lucide icons</span><span className="tech-tag">SVG map</span></div></section>
          <section className="surface about-card"><h2>Reference shelf</h2><div className="reference-list"><div className="reference"><ExternalLink size={14} /><span>IPCC, <em>Climate Change 2022: Mitigation of Climate Change</em>.</span></div><div className="reference"><ExternalLink size={14} /><span>EPA, <em>Greenhouse Gas Emissions for Transportation</em>.</span></div><div className="reference"><ExternalLink size={14} /><span>Our World in Data, <em>CO₂ emissions from transport</em>.</span></div><div className="reference"><ExternalLink size={14} /><span>GHG Protocol, <em>Scope 3 Calculation Guidance</em>.</span></div></div></section>
          <section className="surface about-card" style={{ background: 'hsl(var(--secondary))' }}><School size={23} style={{ marginBottom: 18 }} /><h2>A presentation-ready starting point.</h2><p>Swap the schematic routes for a verified map provider and measured vehicle data when the next iteration has an API or field-study source.</p></section>
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
  const [from, setFrom] = useState<PlaceId>('aluva');
  const [to, setTo] = useState<PlaceId>('rajagiri');
  const [priority, setPriority] = useState(62);
  const [vehicleCategory, setVehicleCategoryState] = useState<VehicleCategory>('Car');
  const [vehicleId, setVehicleId] = useState('swift');
  const [modelYear, setModelYear] = useState(2022);
  const [hasCalculated, setHasCalculated] = useState(false);
  const [routeStatus, setRouteStatus] = useState<RouteDataStatus>('loading');
  const [liveRoutes, setLiveRoutes] = useState<LiveRoute[]>([]);
  const [trafficSnapshot, setTrafficSnapshot] = useState<TrafficSnapshot>({ status: 'loading' });
  const fromPlace = getPlace(from);
  const toPlace = getPlace(to);
  const selectedVehicle = getVehicle(vehicleId);
  const setVehicleCategory = (category: VehicleCategory) => {
    setVehicleCategoryState(category);
    const firstMatch = vehicles.find((vehicle) => vehicle.category === category);
    if (firstMatch) setVehicleId(firstMatch.id);
  };
  useEffect(() => {
    let cancelled = false;
    const loadLiveData = async () => {
      setRouteStatus('loading');
      setTrafficSnapshot({ status: 'loading' });
      const routeUrl = `https://router.project-osrm.org/route/v1/driving/${fromPlace.coordinates[1]},${fromPlace.coordinates[0]};${toPlace.coordinates[1]},${toPlace.coordinates[0]}?overview=full&geometries=geojson&alternatives=true&steps=false`;
      const midpoint = [(fromPlace.coordinates[0] + toPlace.coordinates[0]) / 2, (fromPlace.coordinates[1] + toPlace.coordinates[1]) / 2];
      const trafficUrl = `/api/traffic?lat=${midpoint[0].toFixed(5)}&lon=${midpoint[1].toFixed(5)}`;
      const [routeResponse, trafficResponse] = await Promise.allSettled([fetch(routeUrl), fetch(trafficUrl)]);
      if (cancelled) return;

      if (routeResponse.status === 'fulfilled' && routeResponse.value.ok) {
        try {
          const routeJson = await routeResponse.value.json() as { routes?: Array<{ distance: number; duration: number; geometry?: { coordinates?: Array<[number, number]> } }> };
          const routes = (routeJson.routes ?? []).map((route) => ({
            distanceKm: Number((route.distance / 1000).toFixed(1)),
            durationMin: Math.max(1, Math.round(route.duration / 60)),
            geometry: (route.geometry?.coordinates ?? []).map(([lon, lat]) => [lat, lon] as [number, number]),
          }));
          setLiveRoutes(routes);
          setRouteStatus(routes.length ? 'live' : 'unavailable');
        } catch {
          setLiveRoutes([]);
          setRouteStatus('unavailable');
        }
      } else {
        setLiveRoutes([]);
        setRouteStatus('unavailable');
      }

      if (trafficResponse.status === 'fulfilled' && trafficResponse.value.ok) {
        try {
          const trafficJson = await trafficResponse.value.json() as TrafficSnapshot;
          setTrafficSnapshot(trafficJson.status === 'live' ? trafficJson : { status: 'unavailable', message: trafficJson.message ?? 'Live traffic data is unavailable.' });
        } catch {
          setTrafficSnapshot({ status: 'unavailable', message: 'The live traffic response could not be read.' });
        }
      } else {
        setTrafficSnapshot({ status: 'unavailable', message: 'Connect a free traffic provider key to replace the demo selector with current conditions.' });
      }
    };
    void loadLiveData();
    const refresh = window.setInterval(() => void loadLiveData(), 5 * 60 * 1000);
    return () => {
      cancelled = true;
      window.clearInterval(refresh);
    };
  }, [fromPlace, toPlace]);

  const results = useMemo<RouteResult[]>(() => {
    const baseDistance = liveRoutes[0]?.distanceKm ?? baseRouteDistance(fromPlace, toPlace);
    const traffic = trafficFactors(trafficSnapshot);
    const ageAdjustment = 1 + Math.max(0, 2026 - modelYear - 3) * 0.02;
    const raw = routeDefinitions.map((definition) => {
      const liveRoute = liveRoutes[routeDefinitions.findIndex((item) => item.kind === definition.kind)];
      const distance = liveRoute?.distanceKm ?? Number((baseDistance * definition.distanceFactor).toFixed(1));
      const baselineTime = liveRoute?.durationMin ?? Math.max(1, Math.round((distance / selectedVehicle.speedKph) * 60 * definition.timeFactor));
      const time = Math.max(1, Math.round(baselineTime * traffic.time));
      const co2 = distance * selectedVehicle.co2Factor * ageAdjustment * traffic.emissions;
      const no2 = distance * selectedVehicle.no2Factor * ageAdjustment * traffic.no2;
      const cost = Math.round(distance * selectedVehicle.fuelCost);
      return { ...definition, distance, time, cost, co2, no2, path: routePath(definition.kind, fromPlace, toPlace), geometry: liveRoute?.geometry ?? fallbackGeometry(fromPlace, toPlace) };
    });
    const minTime = Math.min(...raw.map((route) => route.time));
    const maxTime = Math.max(...raw.map((route) => route.time));
    const minCo2 = Math.min(...raw.map((route) => route.co2));
    const maxCo2 = Math.max(...raw.map((route) => route.co2));
    return raw.map((route) => {
      const speedScore = 100 - ((route.time - minTime) / Math.max(maxTime - minTime, 1)) * 100;
      const greenScore = 100 - ((route.co2 - minCo2) / Math.max(maxCo2 - minCo2, 0.01)) * 100;
      return { ...route, score: Math.round(speedScore * (1 - priority / 100) + greenScore * (priority / 100)) };
    });
  }, [fromPlace, liveRoutes, modelYear, priority, selectedVehicle, toPlace, trafficSnapshot]);
  const recommended = useMemo(() => results.reduce((best, current) => current.score > best.score ? current : best, results[0]), [results]);
  const value: EcoContextValue = {
    from, to, setFrom, setTo, trafficSnapshot, routeStatus, priority, setPriority, vehicleCategory, setVehicleCategory, vehicleId, setVehicleId, modelYear, setModelYear,
    selectedVehicle, fromPlace, toPlace, hasCalculated, calculateRoute: () => setHasCalculated(true), results, recommended,
  };
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