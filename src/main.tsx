import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { sendPasswordResetEmail, signInWithEmailAndPassword } from 'firebase/auth'
import {
  Activity, ArrowDownToLine, ArrowUpRight, Banknote, BarChart3, Bell, Boxes,
  CalendarDays, Check, ChevronDown, ChevronLeft, ClipboardList, Clock3, FileText,
  LayoutDashboard, Menu, MoreHorizontal, Package, Plus, Search, Settings2,
  ShieldCheck, Stethoscope, Users, WalletCards, X
} from 'lucide-react'
import { auth, firebaseConfigured } from './lib/firebase'
import './styles.css'

type QueueStatus = 'Waiting' | 'In progress' | 'Ready'
type Exam = { id: string; patient: string; initials: string; service: string; location: string; time: string; status: QueueStatus; accent: string }
type NavItem = { name: string; icon: typeof LayoutDashboard; count?: number; alert?: boolean }
type NavSection = { label: string; items: NavItem[] }

const exams: Exam[] = [
  { id: 'EX-2481', patient: 'Amina Yusuf', initials: 'AY', service: 'Chest X-ray · PA view', location: 'Main centre', time: '09:42', status: 'In progress', accent: 'mint' },
  { id: 'EX-2480', patient: 'Chinedu Okafor', initials: 'CO', service: 'Abdominal ultrasound', location: 'Main centre', time: '09:35', status: 'Waiting', accent: 'blue' },
  { id: 'EX-2479', patient: 'Bola Adeyemi', initials: 'BA', service: 'Lumbosacral spine', location: 'Ring Road', time: '09:18', status: 'Waiting', accent: 'violet' },
  { id: 'EX-2478', patient: 'David Etim', initials: 'DE', service: 'Pelvic ultrasound', location: 'Main centre', time: '08:56', status: 'Ready', accent: 'amber' },
]

const navSections: NavSection[] = [
  { label: 'Workspace', items: [{ name: 'Overview', icon: LayoutDashboard }, { name: 'Examinations', icon: ClipboardList, count: 7 }, { name: 'Patients', icon: Users }] },
  { label: 'Operations', items: [{ name: 'Film inventory', icon: Package, alert: true }, { name: 'Shifts & handover', icon: Clock3 }, { name: 'Payments', icon: WalletCards }] },
  { label: 'Insights', items: [{ name: 'Reports', icon: BarChart3 }, { name: 'Audit log', icon: ShieldCheck }] },
]

function App() {
  const [active, setActive] = useState('Overview')
  const [menuOpen, setMenuOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [toast, setToast] = useState(false)
  const filtered = exams.filter((exam) => `${exam.patient} ${exam.service}`.toLowerCase().includes(query.toLowerCase()))

  const navigate = (name: string) => { setActive(name); setMenuOpen(false) }
  return <div className="app-shell">
    <aside className={`sidebar ${menuOpen ? 'sidebar-open' : ''}`}>
      <div className="brand"><div className="brand-mark"><Activity size={19} strokeWidth={2.5} /></div><span>radial<span className="brand-dot">.</span></span><button className="close-menu" aria-label="Close navigation" onClick={() => setMenuOpen(false)}><X size={18} /></button></div>
      <div className="tenant-switcher"><div className="tenant-avatar">LH</div><div><strong>LifeHouse Imaging</strong><small>Ibadan · Main centre</small></div><ChevronDown size={15} /></div>
      <nav aria-label="Main navigation">{navSections.map((section) => <div className="nav-section" key={section.label}><p>{section.label}</p>{section.items.map(({ name, icon: Icon, count, alert }) => <button key={name} className={`nav-item ${active === name ? 'active' : ''}`} onClick={() => navigate(name)}><Icon size={17} /><span>{name}</span>{count && <em>{count}</em>}{alert && <i className="nav-alert" />}</button>)}</div>)}</nav>
      <div className="sidebar-footer"><button className="nav-item" onClick={() => navigate('Settings')}><Settings2 size={17} /><span>Settings</span></button><div className="user-chip"><div className="user-avatar">KA</div><div><strong>Kunle A.</strong><small>Administrator</small></div><MoreHorizontal size={17} /></div></div>
    </aside>
    {menuOpen && <button className="backdrop" aria-label="Close navigation" onClick={() => setMenuOpen(false)} />}
    <main className="main-content">
      <header className="topbar"><button className="menu-button" aria-label="Open navigation" onClick={() => setMenuOpen(true)}><Menu size={21} /></button><div className="breadcrumb"><span>LifeHouse Imaging</span><b>/</b><strong>{active}</strong></div><div className="top-actions"><div className="search"><Search size={16} /><input aria-label="Search" placeholder="Search patients or exams" value={query} onChange={(e) => setQuery(e.target.value)} /><kbd>⌘ K</kbd></div><button className="icon-button notification" aria-label="Notifications"><Bell size={18} /><i /></button><button className="primary-button" onClick={() => setToast(true)}><Plus size={17} /> New examination</button></div></header>
      <div className="page-wrap">
        <section className="page-heading"><div><div className="eyebrow"><span className="live-dot" /> Wednesday, 12 June 2024 <span className="muted">·</span> Africa/Lagos</div><h1>Good morning, Kunle</h1><p>Here is what needs your attention across the department today.</p></div><button className="date-button"><CalendarDays size={16} /> Today <ChevronDown size={14} /></button></section>
        <section className="metric-grid" aria-label="Today's overview"><Metric label="Examinations" value="28" change="+12.5%" detail="vs. yesterday" icon={<Stethoscope size={18} />} tone="mint" /><Metric label="Collected today" value="₦486,500" change="+8.2%" detail="of ₦542,000 billed" icon={<Banknote size={18} />} tone="blue" /><Metric label="Film on hand" value="1,240" change="2 alerts" detail="across 2 locations" icon={<Boxes size={18} />} tone="amber" alert /><Metric label="Cash discrepancy" value="₦0" change="All clear" detail="last closed shift" icon={<ShieldCheck size={18} />} tone="violet" /></section>
        <div className="content-grid"><section className="panel queue-panel"><div className="panel-header"><div><h2>Examination queue</h2><p>Live activity from all locations</p></div><button className="text-button" onClick={() => navigate('Examinations')}>View all <ArrowUpRight size={15} /></button></div><div className="queue-tabs"><button className="selected">All <span>7</span></button><button>Waiting <span>5</span></button><button>In progress <span>1</span></button><button>Ready <span>1</span></button></div><div className="exam-list">{filtered.map((exam) => <div className="exam-row" key={exam.id}><div className={`patient-avatar ${exam.accent}`}>{exam.initials}</div><div className="exam-main"><strong>{exam.patient}</strong><span>{exam.service}</span></div><div className="exam-location"><span>{exam.location}</span><small>{exam.time}</small></div><Status status={exam.status} /></div>)}{filtered.length === 0 && <div className="empty-state"><Search size={20} /><strong>No examinations found</strong><span>Try a different patient or service name.</span></div>}</div></section>
          <section className="panel shift-panel"><div className="panel-header"><div><h2>Active shift</h2><p>Main centre · Morning shift</p></div><span className="status-pill live"><span /> Open</span></div><div className="shift-person"><div className="user-avatar large">KA</div><div><strong>Kunle Adebayo</strong><span>Shift lead · Opened 07:58</span></div></div><div className="shift-balance"><div><span>Opening cash</span><strong>₦120,000</strong></div><div><span>Payments received</span><strong>₦286,500</strong></div><div><span>Expected cash</span><strong>₦397,500</strong></div></div><div className="shift-progress"><div><span>Shift progress</span><strong>3h 42m <small>of 8h</small></strong></div><div className="progress-track"><i /></div></div><button className="outline-button full" onClick={() => navigate('Shifts & handover')}>Open shift dashboard <ArrowUpRight size={15} /></button></section>
        </div>
        <div className="lower-grid"><section className="panel stock-panel"><div className="panel-header"><div><h2>Film stock watch</h2><p>Stock levels needing a closer look</p></div><button className="icon-button" aria-label="Download stock report"><ArrowDownToLine size={17} /></button></div><Stock name="Blue sensitive 14×17" location="Main centre" current="180" total="500" percentage={36} tone="coral" /><Stock name="Blue sensitive 10×12" location="Ring Road" current="92" total="200" percentage={46} tone="amber" /><Stock name="Blue sensitive 8×10" location="Main centre" current="248" total="300" percentage={83} tone="mint" /></section><section className="panel activity-panel"><div className="panel-header"><div><h2>Recent activity</h2><p>Actions across your workspace</p></div><button className="text-button">See audit log <ArrowUpRight size={15} /></button></div><div className="activity-list"><ActivityItem icon={<WalletCards size={15} />} text="Payment received from Amina Yusuf" meta="₦18,000 · 3 minutes ago" /><ActivityItem icon={<Package size={15} />} text="Film stock received at Main centre" meta="10×12 · 100 sheets · 28 minutes ago" /><ActivityItem icon={<FileText size={15} />} text="Daily report generated by Kunle A." meta="Yesterday, 18:04" /></div></section></div>
        <footer><span><span className="secure-dot" /> All data is encrypted and tenant-isolated</span><span>Radial v0.1 · Local demo mode</span></footer>
      </div>
    </main>
    {toast && <div className="toast" role="status"><div className="toast-icon"><Plus size={16} /></div><div><strong>New examination</strong><span>Opening intake form…</span></div><button onClick={() => setToast(false)} aria-label="Dismiss"><X size={15} /></button></div>}
  </div>
}

function AuthView() {
  const [recovery, setRecovery] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const [demo, setDemo] = useState(false)
  const [onboarding, setOnboarding] = useState(false)

  if (demo) return <App />
  if (onboarding) return <OnboardingView onDone={() => setOnboarding(false)} />

  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setBusy(true); setMessage('')
    try {
      if (recovery) { await sendPasswordResetEmail(auth, email); setMessage('If an account exists for this email, a reset link has been sent.') }
      else await signInWithEmailAndPassword(auth, email, password)
    } catch { setMessage('Sign-in could not be completed. Check your details or contact your tenant administrator.') }
    finally { setBusy(false) }
  }

  return <div className="auth-shell"><div className="auth-aside"><div className="brand"><div className="brand-mark"><Activity size={19} strokeWidth={2.5} /></div><span>radial<span className="brand-dot">.</span></span></div><div className="auth-quote"><span>OPERATIONS / RADIOLOGY</span><h1>Keep the department moving.</h1><p>One clear view of patients, examinations, stock, and the shift ahead.</p></div><div className="auth-aside-foot"><span className="secure-dot" /> Tenant-isolated workspace</div></div><main className="auth-main"><div className="auth-card"><div className="auth-mobile-brand"><div className="brand-mark"><Activity size={19} /></div><span>radial<span className="brand-dot">.</span></span></div><span className="auth-kicker">{recovery ? 'ACCOUNT RECOVERY' : 'WELCOME BACK'}</span><h2>{recovery ? 'Reset your password' : 'Sign in to Radial'}</h2><p className="auth-description">{recovery ? 'Enter your work email and we will send instructions to reset your password.' : 'Use your staff account to access your operations workspace.'}</p><form onSubmit={submit}><label>Work email<input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@yourcentre.com" /></label>{!recovery && <label>Password<input type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" /></label>}{message && <div className="auth-message" role="status">{message}</div>}<button className="primary-button auth-submit" disabled={busy}>{busy ? 'Working…' : recovery ? 'Send reset link' : 'Sign in'}</button></form><button className="auth-link" onClick={() => { setRecovery(!recovery); setMessage('') }}>{recovery ? 'Back to sign in' : 'Forgot your password?'}</button>{!firebaseConfigured && <div className="demo-box"><strong>Local demo mode</strong><span>Firebase is not configured in this environment.</span><button onClick={() => setDemo(true)}>Continue to workspace <ArrowUpRight size={14} /></button></div>}{firebaseConfigured && <div className="demo-box"><strong>New centre?</strong><span>Create your tenant workspace in a few steps.</span><button onClick={() => setOnboarding(true)}>Start onboarding <ArrowUpRight size={14} /></button></div>}</div><div className="auth-footer">Radial v0.1 · Compliance-oriented technical controls · Not a certification</div></main></div>
}

const onboardingSteps = ['Centre details', 'Numbering', 'Administrator', 'Review'] as const

type CreateTenantInput = { tenantName: string; administratorName: string; email: string; receiptPrefix: string; patientNumberPrefix: string }
function buildCreateTenantInput(form: { tenantName: string; administratorName: string; email: string; receiptPrefix: string; patientNumberPrefix: string }): CreateTenantInput { return form }

function OnboardingView({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0)
  const [form, setForm] = useState({ tenantName: '', administratorName: '', email: '', receiptPrefix: '', patientNumberPrefix: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [created, setCreated] = useState(false)

  const update = (field: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [field]: event.target.value })
  const valid = () => {
    if (step === 0) return form.tenantName.trim().length >= 2
    if (step === 1) return /^[A-Z0-9-]{1,8}$/.test(form.receiptPrefix) && /^[A-Z0-9-]{1,8}$/.test(form.patientNumberPrefix)
    if (step === 2) return form.administratorName.trim().length >= 2 && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)
    return true
  }

  const finish = async () => {
    if (!firebaseConfigured) { setCreated(true); return }
    setBusy(true); setError('')
    try {
      const { getFunctions, httpsCallable } = await import('firebase/functions')
      const functions = getFunctions()
      const createTenant = httpsCallable<ReturnType<typeof buildCreateTenantInput>>(functions, 'createTenant')
      await createTenant(buildCreateTenantInput(form))
      setCreated(true)
    } catch { setError('Onboarding could not be completed. Check your connection and try again.') }
    finally { setBusy(false) }
  }

  if (created) return <div className="auth-shell"><main className="auth-main"><div className="auth-card"><span className="auth-kicker">SETUP COMPLETE</span><h2>Your workspace is ready</h2><p className="auth-description">Your tenant has been created. Invite staff from Settings to add your team.</p><button className="primary-button auth-submit" onClick={onDone}>Back to sign in</button></div></main></div>

  return <div className="auth-shell"><main className="auth-main onboarding-main"><div className="auth-card onboarding-card">
    <button className="auth-link onboarding-back" onClick={onDone}><ChevronLeft size={14} /> Back to sign in</button>
    <div className="auth-mobile-brand"><div className="brand-mark"><Activity size={19} /></div><span>radial<span className="brand-dot">.</span></span></div>
    <span className="auth-kicker">TENANT ONBOARDING</span>
    <h2>Set up your centre</h2>
    <ol className="onboarding-steps" aria-label="Onboarding progress">{onboardingSteps.map((label, index) => <li key={label} className={index === step ? 'current' : index < step ? 'done' : ''}>{index < step ? <Check size={13} /> : <span className="onboarding-step-number">{index + 1}</span>}{label}</li>)}</ol>
    <div className="onboarding-body">
      {step === 0 && <label className="onboarding-field">Centre name<input value={form.tenantName} onChange={update('tenantName')} placeholder="e.g. LifeHouse Imaging" /></label>}
      {step === 1 && <div className="onboarding-field-grid"><label className="onboarding-field">Receipt prefix<input value={form.receiptPrefix} onChange={update('receiptPrefix')} placeholder="e.g. LH" /></label><label className="onboarding-field">Patient number prefix<input value={form.patientNumberPrefix} onChange={update('patientNumberPrefix')} placeholder="e.g. PT" /></label></div>}
      {step === 2 && <div className="onboarding-field-grid"><label className="onboarding-field">Administrator name<input value={form.administratorName} onChange={update('administratorName')} placeholder="e.g. Kunle Adebayo" /></label><label className="onboarding-field">Work email<input type="email" value={form.email} onChange={update('email')} placeholder="you@yourcentre.com" /></label></div>}
      {step === 3 && <div className="onboarding-review"><strong>Centre</strong><span>{form.tenantName}</span><strong>Receipt prefix</strong><span>{form.receiptPrefix}</span><strong>Patient prefix</strong><span>{form.patientNumberPrefix}</span><strong>Administrator</strong><span>{form.administratorName} · {form.email}</span></div>}
      {error && <div className="auth-message" role="alert">{error}</div>}
    </div>
    <div className="onboarding-actions">
      {step > 0 && <button className="outline-button" onClick={() => setStep(step - 1)}><ChevronLeft size={14} /> Back</button>}
      {step < onboardingSteps.length - 1
        ? <button className="primary-button" disabled={!valid()} onClick={() => setStep(step + 1)}>Continue</button>
        : <button className="primary-button" disabled={busy} onClick={finish}>{busy ? 'Creating…' : 'Create workspace'}</button>}
    </div>
  </div></main></div>
}

function Metric({ label, value, change, detail, icon, tone, alert = false }: { label: string; value: string; change: string; detail: string; icon: React.ReactNode; tone: string; alert?: boolean }) { return <article className={`metric-card ${tone}`}><div className="metric-top"><span className="metric-icon">{icon}</span>{alert && <span className="attention">Attention</span>}</div><span className="metric-label">{label}</span><strong className="metric-value">{value}</strong><div className="metric-detail"><b>{change}</b> {detail}</div></article> }
function Status({ status }: { status: QueueStatus }) { return <span className={`status-pill ${status.toLowerCase().replace(' ', '-')}`}><span />{status}</span> }
function Stock({ name, location, current, total, percentage, tone }: { name: string; location: string; current: string; total: string; percentage: number; tone: string }) { return <div className="stock-row"><div className="stock-info"><div><strong>{name}</strong><span>{location}</span></div><b className={tone}>{current} <small>/ {total}</small></b></div><div className="progress-track"><i className={tone} style={{ width: `${percentage}%` }} /></div><div className="stock-foot"><span>{percentage < 50 ? 'Below reorder level' : 'Healthy stock level'}</span><small>{percentage}% remaining</small></div></div> }
function ActivityItem({ icon, text, meta }: { icon: React.ReactNode; text: string; meta: string }) { return <div className="activity-item"><span className="activity-icon">{icon}</span><div><strong>{text}</strong><span>{meta}</span></div><ArrowUpRight size={14} /></div> }

createRoot(document.getElementById('root')!).render(<StrictMode><AuthView /></StrictMode>)
