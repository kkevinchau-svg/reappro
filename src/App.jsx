/*
  RÉAPPRO v2 — Application React complète
  ========================================
  Stack : React + Tailwind + Supabase
  
  INSTALLATION :
  1. npm create vite@latest reappro -- --template react
  2. cd reappro
  3. npm install @supabase/supabase-js
  4. npm install -D tailwindcss postcss autoprefixer
  5. npx tailwindcss init -p
  6. Créer src/supabase.js avec tes clés Supabase
  7. Remplacer src/App.jsx par ce fichier
  
  src/supabase.js :
  -----------------
  import { createClient } from '@supabase/supabase-js'
  export const supabase = createClient(
    'https://TON_PROJECT.supabase.co',
    'TA_ANON_KEY'
  )
*/

import { useState, useEffect, createContext, useContext } from "react";
import { supabase } from './supabase';
// ============================================================
// SUPABASE MOCK (remplace par ton vrai client)
// ============================================================


// Données mock pour la démo
const MOCK_DATA = {
  profiles: [{ id: '1', full_name: 'Kevin Admin', role: 'admin', company_id: null }],
  orders: [
    { id: '1', reference: 'CMD-20260403-0001', status: 'confirmed', order_date: '2026-04-01', expected_date: '2026-04-10', companies: { name: 'BTP Dupont' }, suppliers: { name: 'MetalPro SAS' }, notes: 'Livraison matin' },
    { id: '2', reference: 'CMD-20260403-0002', status: 'in_transit', order_date: '2026-04-02', expected_date: '2026-04-08', companies: { name: 'Elec Martin' }, suppliers: { name: 'CuivreNet' }, notes: '' },
    { id: '3', reference: 'CMD-20260403-0003', status: 'delivered', order_date: '2026-03-28', expected_date: '2026-04-01', delivered_date: '2026-04-01', companies: { name: 'Démolition Sud' }, suppliers: { name: 'MetalPro SAS' }, notes: 'RAS' },
    { id: '4', reference: 'CMD-20260403-0004', status: 'draft', order_date: '2026-04-03', expected_date: '2026-04-15', companies: { name: 'BTP Dupont' }, suppliers: { name: 'AluFrance' }, notes: '' },
  ],
  companies: [
    { id: '1', name: 'BTP Dupont', contact_email: 'contact@btpdupont.fr', phone: '06 12 34 56 78', address: 'Lyon' },
    { id: '2', name: 'Elec Martin', contact_email: 'martin@elec.fr', phone: '06 98 76 54 32', address: 'Marseille' },
    { id: '3', name: 'Démolition Sud', contact_email: 'info@demolsud.fr', phone: '04 91 00 00 00', address: 'Toulon' },
  ],
  suppliers: [
    { id: '1', name: 'MetalPro SAS', contact_name: 'Jean Martin', email: 'jean@metalpro.fr', phone: '04 72 00 00 00' },
    { id: '2', name: 'CuivreNet', contact_name: 'Sophie B.', email: 'sophie@cuivrenet.fr', phone: '03 80 00 00 00' },
    { id: '3', name: 'AluFrance', contact_name: 'Pierre D.', email: 'p.d@alufrance.fr', phone: '01 40 00 00 00' },
  ],
};

// ============================================================
// CONTEXT AUTH
// ============================================================
const AuthContext = createContext(null);

function useAuth() { return useContext(AuthContext); }

// ============================================================
// CONSTANTES
// ============================================================
const STATUS_CONFIG = {
  draft:      { label: 'Brouillon',    color: 'bg-zinc-100 text-zinc-600',     dot: 'bg-zinc-400' },
  confirmed:  { label: 'Confirmée',    color: 'bg-blue-50 text-blue-700',      dot: 'bg-blue-500' },
  in_transit: { label: 'En transit',   color: 'bg-amber-50 text-amber-700',    dot: 'bg-amber-500' },
  delivered:  { label: 'Livrée',       color: 'bg-emerald-50 text-emerald-700',dot: 'bg-emerald-500' },
  cancelled:  { label: 'Annulée',      color: 'bg-red-50 text-red-600',        dot: 'bg-red-400' },
};

// ============================================================
// COMPOSANTS UI
// ============================================================

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.draft;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function Card({ children, className = '' }) {
  return (
    <div className={`bg-white rounded-2xl border border-zinc-100 shadow-sm ${className}`}>
      {children}
    </div>
  );
}

function Button({ children, onClick, variant = 'primary', size = 'md', className = '', disabled = false }) {
  const base = 'inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed';
  const sizes = { sm: 'px-3 py-1.5 text-sm', md: 'px-4 py-2 text-sm', lg: 'px-6 py-3 text-base' };
  const variants = {
    primary: 'bg-zinc-900 text-white hover:bg-zinc-700 active:scale-95',
    secondary: 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 active:scale-95',
    danger: 'bg-red-50 text-red-600 hover:bg-red-100 active:scale-95',
    ghost: 'text-zinc-600 hover:bg-zinc-100 active:scale-95',
  };
  return (
    <button onClick={onClick} disabled={disabled} className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
}

function Input({ label, value, onChange, type = 'text', placeholder = '', required = false }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-zinc-700">{label}{required && <span className="text-red-500 ml-1">*</span>}</label>}
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition"
      />
    </div>
  );
}

function Select({ label, value, onChange, options, required = false }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-zinc-700">{label}{required && <span className="text-red-500 ml-1">*</span>}</label>}
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        required={required}
        className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 bg-white transition"
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

// ============================================================
// PAGE : LOGIN
// ============================================================
function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('admin@reappro.fr');
  const [password, setPassword] = useState('demo1234');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setLoading(true);
    setError('');
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    else onLogin({ id: '1', email, role: 'admin', full_name: 'Kevin Admin' });
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-zinc-100 rounded-2xl flex items-center justify-center">
              <span className="text-xl">📦</span>
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">Réappro</span>
          </div>
          <p className="text-zinc-400 text-sm">Suivi des commandes & approvisionnements</p>
        </div>

        <Card className="p-8">
          <h2 className="text-lg font-semibold text-zinc-900 mb-6">Connexion</h2>
          <div className="flex flex-col gap-4">
            <Input label="Email" value={email} onChange={setEmail} type="email" placeholder="vous@exemple.fr" required />
            <Input label="Mot de passe" value={password} onChange={setPassword} type="password" placeholder="••••••••" required />
            {error && <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
            <Button onClick={handleLogin} disabled={loading} size="lg" className="mt-2">
              {loading ? 'Connexion...' : 'Se connecter'}
            </Button>
          </div>
        </Card>

        <p className="text-center text-zinc-600 text-xs mt-6">
          Demo : admin@reappro.fr / demo1234
        </p>
      </div>
    </div>
  );
}

// ============================================================
// SIDEBAR
// ============================================================
function Sidebar({ page, setPage, user, onLogout }) {
  const nav = [
    { id: 'dashboard', icon: '◈', label: 'Dashboard' },
    { id: 'orders', icon: '▦', label: 'Commandes' },
    { id: 'companies', icon: '◉', label: 'Clients' },
    { id: 'suppliers', icon: '◎', label: 'Fournisseurs' },
  ];

  if (user?.role === 'admin') {
    nav.push({ id: 'users', icon: '◐', label: 'Utilisateurs' });
  }

  return (
    <aside className="w-56 bg-zinc-950 flex flex-col min-h-screen fixed left-0 top-0">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-zinc-800 rounded-xl flex items-center justify-center text-base">📦</div>
          <span className="text-white font-bold tracking-tight">Réappro</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {nav.map(item => (
          <button
            key={item.id}
            onClick={() => setPage(item.id)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              page === item.id
                ? 'bg-white text-zinc-900'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <span className="text-base">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      {/* User */}
      <div className="px-4 py-4 border-t border-zinc-800">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-zinc-700 rounded-full flex items-center justify-center text-white text-xs font-bold">
            {user?.full_name?.[0] || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-medium truncate">{user?.full_name}</p>
            <p className="text-zinc-500 text-xs capitalize">{user?.role}</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onLogout} className="w-full text-zinc-400 hover:text-white hover:bg-zinc-800">
          Déconnexion
        </Button>
      </div>
    </aside>
  );
}

// ============================================================
// PAGE : DASHBOARD
// ============================================================
function DashboardPage({ orders }) {
  const stats = {
    total: orders.length,
    draft: orders.filter(o => o.status === 'draft').length,
    confirmed: orders.filter(o => o.status === 'confirmed').length,
    in_transit: orders.filter(o => o.status === 'in_transit').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
  };

  const recent = [...orders].slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Dashboard</h1>
        <p className="text-zinc-500 text-sm mt-1">Vue d'ensemble des commandes</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total commandes', value: stats.total, color: 'text-zinc-900', bg: 'bg-zinc-50' },
          { label: 'En cours', value: stats.confirmed + stats.in_transit, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'En transit', value: stats.in_transit, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Livrées', value: stats.delivered, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        ].map(s => (
          <Card key={s.label} className="p-5">
            <p className="text-xs font-medium text-zinc-500 mb-1">{s.label}</p>
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
          </Card>
        ))}
      </div>

      {/* Commandes récentes */}
      <Card>
        <div className="px-6 py-4 border-b border-zinc-100">
          <h2 className="font-semibold text-zinc-900">Commandes récentes</h2>
        </div>
        <div className="divide-y divide-zinc-50">
          {recent.map(order => (
            <div key={order.id} className="px-6 py-4 flex items-center justify-between hover:bg-zinc-50 transition">
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-sm font-medium text-zinc-900">{order.reference}</p>
                  <p className="text-xs text-zinc-500">{order.companies?.name} · {order.suppliers?.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <p className="text-xs text-zinc-400">{order.expected_date}</p>
                <StatusBadge status={order.status} />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ============================================================
// PAGE : COMMANDES
// ============================================================
function OrdersPage({ orders, onRefresh }) {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);

  const filtered = orders.filter(o => {
    const matchSearch = o.reference.toLowerCase().includes(search.toLowerCase()) ||
      o.companies?.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || o.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Commandes</h1>
          <p className="text-zinc-500 text-sm mt-1">{filtered.length} commande{filtered.length > 1 ? 's' : ''}</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <span>＋</span> Nouvelle commande
        </Button>
      </div>

      {/* Filtres */}
      <div className="flex gap-3 flex-wrap">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher..."
          className="px-3 py-2 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 w-56"
        />
        <div className="flex gap-2">
          {['all', ...Object.keys(STATUS_CONFIG)].map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition ${
                filterStatus === s ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              {s === 'all' ? 'Toutes' : STATUS_CONFIG[s].label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-100">
                {['Référence', 'Client', 'Fournisseur', 'Date commande', 'Livraison prévue', 'Statut', ''].map(h => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {filtered.map(order => (
                <tr key={order.id} className="hover:bg-zinc-50 transition">
                  <td className="px-6 py-4 text-sm font-medium text-zinc-900">{order.reference}</td>
                  <td className="px-6 py-4 text-sm text-zinc-600">{order.companies?.name}</td>
                  <td className="px-6 py-4 text-sm text-zinc-600">{order.suppliers?.name}</td>
                  <td className="px-6 py-4 text-sm text-zinc-500">{order.order_date}</td>
                  <td className="px-6 py-4 text-sm text-zinc-500">{order.expected_date || '—'}</td>
                  <td className="px-6 py-4"><StatusBadge status={order.status} /></td>
                  <td className="px-6 py-4">
                    <Button variant="ghost" size="sm">Voir</Button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-zinc-400 text-sm">Aucune commande trouvée</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {showModal && <NewOrderModal onClose={() => setShowModal(false)} onSave={onRefresh} />}
    </div>
  );
}

// ============================================================
// MODAL : NOUVELLE COMMANDE
// ============================================================
function NewOrderModal({ onClose, onSave }) {
  const [form, setForm] = useState({
    company_id: '1',
    supplier_id: '1',
    expected_date: '',
    notes: '',
    status: 'draft',
  });

  const set = (field) => (val) => setForm(f => ({ ...f, [field]: val }));

  async function handleSave() {
    await supabase.from('orders').insert([form]).select();
    onSave();
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <Card className="w-full max-w-lg p-8" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-zinc-900">Nouvelle commande</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 text-xl">×</button>
        </div>
        <div className="flex flex-col gap-4">
          <Select
            label="Client"
            value={form.company_id}
            onChange={set('company_id')}
            required
            options={MOCK_DATA.companies.map(c => ({ value: c.id, label: c.name }))}
          />
          <Select
            label="Fournisseur"
            value={form.supplier_id}
            onChange={set('supplier_id')}
            required
            options={MOCK_DATA.suppliers.map(s => ({ value: s.id, label: s.name }))}
          />
          <Input
            label="Date de livraison prévue"
            value={form.expected_date}
            onChange={set('expected_date')}
            type="date"
          />
          <Select
            label="Statut"
            value={form.status}
            onChange={set('status')}
            options={Object.entries(STATUS_CONFIG).map(([k, v]) => ({ value: k, label: v.label }))}
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-zinc-700">Notes</label>
            <textarea
              value={form.notes}
              onChange={e => set('notes')(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 resize-none"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={onClose} className="flex-1">Annuler</Button>
            <Button onClick={handleSave} className="flex-1">Créer la commande</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

// ============================================================
// PAGE : CLIENTS
// ============================================================
function CompaniesPage() {
  const companies = MOCK_DATA.companies;
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Clients</h1>
          <p className="text-zinc-500 text-sm mt-1">{companies.length} entreprises</p>
        </div>
        <Button><span>＋</span> Ajouter un client</Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {companies.map(c => (
          <Card key={c.id} className="p-6 hover:shadow-md transition cursor-pointer">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-zinc-100 rounded-xl flex items-center justify-center text-lg font-bold text-zinc-600">
                {c.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-zinc-900 truncate">{c.name}</p>
                <p className="text-sm text-zinc-500 truncate">{c.contact_email}</p>
                <p className="text-sm text-zinc-400 mt-1">{c.phone}</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-zinc-100 flex justify-between items-center">
              <span className="text-xs text-zinc-400">{c.address}</span>
              <Button variant="ghost" size="sm">Voir</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// PAGE : FOURNISSEURS
// ============================================================
function SuppliersPage() {
  const suppliers = MOCK_DATA.suppliers;
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Fournisseurs</h1>
          <p className="text-zinc-500 text-sm mt-1">{suppliers.length} fournisseurs</p>
        </div>
        <Button><span>＋</span> Ajouter un fournisseur</Button>
      </div>
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-100">
                {['Nom', 'Contact', 'Email', 'Téléphone', ''].map(h => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {suppliers.map(s => (
                <tr key={s.id} className="hover:bg-zinc-50 transition">
                  <td className="px-6 py-4 text-sm font-medium text-zinc-900">{s.name}</td>
                  <td className="px-6 py-4 text-sm text-zinc-600">{s.contact_name}</td>
                  <td className="px-6 py-4 text-sm text-zinc-500">{s.email}</td>
                  <td className="px-6 py-4 text-sm text-zinc-500">{s.phone}</td>
                  <td className="px-6 py-4"><Button variant="ghost" size="sm">Modifier</Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ============================================================
// APP PRINCIPALE
// ============================================================
export default function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState('dashboard');
  const [orders, setOrders] = useState(MOCK_DATA.orders);

  async function loadOrders() {
    const { data } = await supabase.from('orders').select('*, companies(name), suppliers(name)').order('created_at', { ascending: false });
    if (data) setOrders(data);
  }

  function handleLogin(u) {
    setUser(u);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setUser(null);
  }

  if (!user) return <LoginPage onLogin={handleLogin} />;

  const pages = {
    dashboard: <DashboardPage orders={orders} />,
    orders: <OrdersPage orders={orders} onRefresh={loadOrders} />,
    companies: <CompaniesPage />,
    suppliers: <SuppliersPage />,
    users: (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-zinc-900">Utilisateurs</h1>
        <Card className="p-8 text-center text-zinc-400">
          <p>Gestion des utilisateurs — À connecter avec Supabase Auth</p>
        </Card>
      </div>
    ),
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex">
      <Sidebar page={page} setPage={setPage} user={user} onLogout={handleLogout} />
      <main className="flex-1 ml-56 p-8">
        <div className="max-w-6xl mx-auto">
          {pages[page]}
        </div>
      </main>
    </div>
  );
}
