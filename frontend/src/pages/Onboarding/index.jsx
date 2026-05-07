import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { Input } from '../../components/ui/input'

const STEPS = ['Sign up', 'Your profile', 'Your habits', 'How it works']

const GOALS = ['Buy a house', 'Early retirement', 'Buy a car', 'Build an emergency fund']

const STYLE_OPTIONS = {
  Careful: 'I want steady, slow growth with less risk',
  YOLO:    "I'm okay with ups and downs for bigger gains",
}

const FEATURES = [
  { icon: '📊', title: 'Dashboard',       desc: 'See all your investments in one calm, simple view' },
  { icon: '💚', title: 'Health Score',    desc: "We score your portfolio so you always know how you're doing" },
  { icon: '⚖️', title: 'Rebalance',       desc: 'Get plain-English advice when markets move' },
  { icon: '📈', title: 'Invest',          desc: 'Discover stable companies and funds to grow your money' },
  { icon: '🔔', title: "Don't Panic Mode", desc: 'We alert you calmly when markets dip — no scary numbers' },
  { icon: '👤', title: 'Two profiles',    desc: 'Switch between Pralay and Krishna to see how advice changes' },
]

// ─── Landing screen ──────────────────────────────────────────────────────────

const LANDING_FEATURES = [
  'Plain English — no confusing financial terms',
  'AI advisor that knows your goals personally',
  'Calm alerts when markets move, never panic mode',
]

const STAT_PILLS = ['🤖 4 AI Agents', '📈 Live stock prices', '🔒 JWT secured']

function CheckCircle() {
  return (
    <div
      className="flex items-center justify-center flex-shrink-0"
      style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: '#6B96C3' }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    </div>
  )
}

function LandingScreen({ onNew, onExisting }) {
  const [hoverNew,   setHoverNew]   = useState(false)
  const [hoverLogin, setHoverLogin] = useState(false)

  return (
    <>
      <style>{`
        @keyframes gseiFromLeft {
          from { transform: translateX(-20px); opacity: 0; }
          to   { transform: translateX(0);     opacity: 1; }
        }
        @keyframes gseiFromRight {
          from { transform: translateX(20px);  opacity: 0; }
          to   { transform: translateX(0);     opacity: 1; }
        }
        .gsei-from-left  { animation: gseiFromLeft  0.6s ease both; }
        .gsei-from-right { animation: gseiFromRight 0.6s ease 0.2s both; }
      `}</style>

      <div className="flex flex-col md:flex-row min-h-screen">

        {/* ── LEFT ── */}
        <div
          className="gsei-from-left flex flex-col justify-center px-8 md:px-16 py-10 md:py-12 md:w-3/5"
          style={{ backgroundColor: '#001E62', minHeight: '50vh' }}
        >
          <div style={{ maxWidth: 480 }}>
            <p
              className="mb-8 font-semibold tracking-widest uppercase"
              style={{ color: '#acd4f1', fontSize: 11, letterSpacing: '0.12em' }}
            >
              GS-EaseInvest
            </p>

            <h1
              className="font-semibold text-white"
              style={{ fontSize: 'clamp(32px, 4vw, 48px)', lineHeight: 1.2 }}
            >
              Your money,<br />
              finally making<br />
              sense.
            </h1>

            <p
              className="mt-4 leading-relaxed"
              style={{ color: '#acd4f1', fontSize: 16, maxWidth: 380, lineHeight: 1.7 }}
            >
              Join thousands of first-time investors who manage their portfolio
              without the jargon, panic, or confusion.
            </p>

            <div className="flex flex-col mt-10" style={{ gap: 20 }}>
              {LANDING_FEATURES.map((text) => (
                <div key={text} className="flex items-center" style={{ gap: 12 }}>
                  <CheckCircle />
                  <span className="text-white" style={{ fontSize: 14 }}>{text}</span>
                </div>
              ))}
            </div>

            <p className="mt-10" style={{ color: '#7399c6', fontSize: 12 }}>
              Powered by Anthropic Claude AI
            </p>
          </div>
        </div>

        {/* ── RIGHT ── */}
        <div
          className="gsei-from-right flex flex-col justify-center px-6 md:px-12 py-8 md:py-12 md:w-2/5"
          style={{ backgroundColor: '#f4f8fd', minHeight: '50vh' }}
        >
          <div style={{ maxWidth: 400 }}>
            <h2 className="font-semibold" style={{ fontSize: 28, color: '#001E62' }}>
              Get started
            </h2>
            <p style={{ fontSize: 14, color: '#666666', marginTop: 4, marginBottom: 32 }}>
              Choose how you'd like to continue
            </p>

            <div className="flex flex-col" style={{ gap: 16 }}>

              {/* Card 1: new user */}
              <button
                onClick={onNew}
                onMouseEnter={() => setHoverNew(true)}
                onMouseLeave={() => setHoverNew(false)}
                className="w-full text-left rounded-2xl p-6 transition-all duration-200"
                style={{
                  backgroundColor: hoverNew ? '#001E62' : '#ffffff',
                  border: '2px solid #001E62',
                  cursor: 'pointer',
                }}
              >
                <div className="flex items-center justify-between">
                  <div
                    className="flex items-center justify-center"
                    style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: '#e8f0fb', fontSize: 20 }}
                  >
                    🌱
                  </div>
                  <span style={{ fontSize: 18, color: hoverNew ? '#ffffff' : '#001E62' }}>→</span>
                </div>
                <p
                  className="font-semibold mt-3"
                  style={{ fontSize: 18, color: hoverNew ? '#ffffff' : '#001E62' }}
                >
                  I'm new here
                </p>
                <p
                  className="mt-1"
                  style={{ fontSize: 13, color: hoverNew ? '#acd4f1' : '#666666' }}
                >
                  Set up your profile and get a personalized starter plan in 4 simple steps
                </p>
              </button>

              {/* Card 2: existing user */}
              <button
                onClick={onExisting}
                onMouseEnter={() => setHoverLogin(true)}
                onMouseLeave={() => setHoverLogin(false)}
                className="w-full text-left rounded-2xl p-6 bg-white transition-all duration-200"
                style={{ border: `1px solid ${hoverLogin ? '#6B96C3' : '#e8eff8'}`, cursor: 'pointer' }}
              >
                <div className="flex items-center justify-between">
                  <div
                    className="flex items-center justify-center"
                    style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: '#f4f8fd', fontSize: 20 }}
                  >
                    🔑
                  </div>
                  <span style={{ fontSize: 18, color: '#001E62' }}>→</span>
                </div>
                <p className="font-semibold mt-3" style={{ fontSize: 18, color: '#001E62' }}>
                  I already have an account
                </p>
                <p className="mt-1" style={{ fontSize: 13, color: '#666666' }}>
                  Sign in and see your investments, health score and AI recommendations
                </p>
              </button>
            </div>

            {/* Stat pills */}
            <div className="flex flex-wrap mt-10" style={{ gap: 12 }}>
              {STAT_PILLS.map((label) => (
                <span
                  key={label}
                  className="rounded-full"
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e8eff8',
                    padding: '8px 16px',
                    fontSize: 12,
                    color: '#666666',
                  }}
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>

      </div>
    </>
  )
}

// ─── Login screen ─────────────────────────────────────────────────────────────

function LoginScreen({ onBack }) {
  const navigate = useNavigate()
  const { loginWithEmail } = useApp()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState(null)

  const handleLogin = async () => {
    setLoading(true)
    setError(null)
    const result = await loginWithEmail(email, password)
    if (result.success) {
      navigate('/dashboard')
    } else {
      setError(result.message)
      setLoading(false)
    }
  }

  const inputClass = 'flex h-10 w-full rounded-md border px-3 py-2 text-sm placeholder:text-gs-gray focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gs-blue'

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm" style={{ border: '1px solid #acd4f1' }}>
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-sm text-gs-gray hover:text-gs-navy transition-colors mb-4"
      >
        ← Back
      </button>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gs-navy">Welcome back</h1>
        <p className="text-sm text-gs-gray mt-1">Sign in and see your investments</p>
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-gs-navy">Email</label>
          <input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            className={inputClass}
            style={{ borderColor: '#acd4f1' }}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-gs-navy">Password</label>
          <input
            type="password"
            placeholder="Your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            className={inputClass}
            style={{ borderColor: '#acd4f1' }}
          />
        </div>
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-colors mt-2"
          style={{ backgroundColor: '#001E62', opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
        >
          {loading ? 'Logging in...' : 'Log in'}
        </button>
        {error && (
          <p className="text-xs text-center" style={{ color: '#dc2626' }}>
            Wrong email or password — try again
          </p>
        )}
        <div style={{ fontSize: 12, color: '#9ca3af', lineHeight: 1.9, marginTop: 4 }}>
          <p className="font-medium" style={{ color: '#6b7280', marginBottom: 2 }}>Demo accounts:</p>
          <p>pralay@test.com / pralay123</p>
          <p>krishna@test.com / krishna123</p>
          <p>alex@test.com / alex123</p>
        </div>
      </div>
    </div>
  )
}

// ─── Step indicator ───────────────────────────────────────────────────────────

function StepIndicator({ current }) {
  return (
    <div className="flex mb-8">
      {STEPS.map((label, i) => {
        const done   = i < current
        const active = i === current
        return (
          <div key={i} className="flex flex-col items-center flex-1">
            <div className="flex items-center w-full">
              <div
                className="flex-1 h-px"
                style={{ background: i === 0 ? 'transparent' : '#acd4f1' }}
              />
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0"
                style={{
                  background: done ? '#acd4f1' : active ? '#001E62' : '#f4f8fd',
                  color:      done ? '#001E62' : active ? '#ffffff'  : '#acd4f1',
                  border:     `1px solid ${active ? '#001E62' : '#acd4f1'}`,
                }}
              >
                {done ? '✓' : i + 1}
              </div>
              <div
                className="flex-1 h-px"
                style={{ background: i === STEPS.length - 1 ? 'transparent' : '#acd4f1' }}
              />
            </div>
            <span
              className="text-xs mt-1.5 text-center leading-tight px-1"
              style={{ color: active ? '#001E62' : '#9ca3af', fontWeight: active ? 600 : 400 }}
            >
              {label}
            </span>
          </div>
        )
      })}
    </div>
  )
}

// ─── Shared sub-pieces ────────────────────────────────────────────────────────

function StepHeading({ title, sub }) {
  return (
    <div className="mb-6">
      <h1 className="text-xl font-bold text-gs-navy">{title}</h1>
      <p className="text-sm text-gs-gray mt-1">{sub}</p>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-gs-navy">{label}</label>
      {children}
    </div>
  )
}

function PrefixInput({ prefix, ...props }) {
  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gs-gray pointer-events-none select-none">
        {prefix}
      </span>
      <Input className="pl-6" {...props} />
    </div>
  )
}

function PrimaryBtn({ onClick, children }) {
  return (
    <button
      onClick={onClick}
      className="w-full py-3 rounded-xl text-sm font-semibold text-white bg-gs-navy hover:bg-gs-deep transition-colors mt-2"
    >
      {children}
    </button>
  )
}

function BackBtn({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1 text-sm text-gs-gray hover:text-gs-navy transition-colors mb-4"
    >
      ← Back
    </button>
  )
}

// ─── Step 1: Sign up ──────────────────────────────────────────────────────────

function StepSignUp({ data, update, onNext }) {
  return (
    <div>
      <StepHeading
        title="Welcome to GS-EaseInvest"
        sub="Your calm, friendly guide to growing your money"
      />
      <div className="flex flex-col gap-4">
        <Field label="Full name">
          <Input
            placeholder="Your full name"
            value={data.name}
            onChange={(e) => update('name', e.target.value)}
          />
        </Field>
        <Field label="Email address">
          <Input
            type="email"
            placeholder="you@example.com"
            value={data.email}
            onChange={(e) => update('email', e.target.value)}
          />
        </Field>
        <Field label="Password">
          <Input
            type="password"
            placeholder="••••••••"
            value={data.password}
            onChange={(e) => update('password', e.target.value)}
          />
        </Field>
        <PrimaryBtn onClick={onNext}>Get started →</PrimaryBtn>
      </div>
    </div>
  )
}

// ─── Step 2: Profile ──────────────────────────────────────────────────────────

function StepProfile({ data, update, onNext, onBack }) {
  return (
    <div>
      <BackBtn onClick={onBack} />
      <StepHeading
        title="Tell us a little about yourself"
        sub="We use this to make everything personal to you"
      />
      <div className="flex flex-col gap-4">
        <Field label="Occupation">
          <Input
            placeholder="e.g. Student, Engineer, Designer…"
            value={data.occupation}
            onChange={(e) => update('occupation', e.target.value)}
          />
        </Field>
        <Field label="Age">
          <Input
            type="number"
            placeholder="24"
            value={data.age}
            onChange={(e) => update('age', e.target.value)}
          />
        </Field>
        <Field label="Monthly income">
          <PrefixInput
            prefix="$"
            type="number"
            placeholder="0"
            value={data.income}
            onChange={(e) => update('income', e.target.value)}
          />
        </Field>
        <Field label="How much to invest monthly">
          <PrefixInput
            prefix="$"
            type="number"
            placeholder="0"
            value={data.monthlyInvest}
            onChange={(e) => update('monthlyInvest', e.target.value)}
          />
        </Field>
        <PrimaryBtn onClick={onNext}>Next →</PrimaryBtn>
      </div>
    </div>
  )
}

// ─── Step 3: Habits ───────────────────────────────────────────────────────────

function StepHabits({ data, update, onNext, onBack }) {
  return (
    <div>
      <BackBtn onClick={onBack} />
      <StepHeading
        title="How do you feel about risk?"
        sub="There's no wrong answer — just be honest"
      />
      <div className="flex flex-col gap-6">

        {/* Q1: Style toggle cards */}
        <div>
          <p className="text-xs font-semibold text-gs-navy mb-3">What's your investing style?</p>
          <div className="flex gap-3">
            {Object.entries(STYLE_OPTIONS).map(([style, desc]) => {
              const selected = data.style === style
              return (
                <button
                  key={style}
                  onClick={() => update('style', style)}
                  className="flex-1 rounded-xl p-4 text-left border transition-all"
                  style={{
                    background:   selected ? '#001E62' : '#ffffff',
                    border:       `1.5px solid ${selected ? '#001E62' : '#acd4f1'}`,
                    color:        selected ? '#ffffff' : '#001E62',
                  }}
                >
                  <p className="text-sm font-semibold">{style}</p>
                  <p
                    className="text-xs mt-1 leading-snug"
                    style={{ color: selected ? '#acd4f1' : '#666666' }}
                  >
                    {desc}
                  </p>
                </button>
              )
            })}
          </div>
        </div>

        {/* Q2: Goal pills */}
        <div>
          <p className="text-xs font-semibold text-gs-navy mb-3">What's your main goal?</p>
          <div className="flex flex-wrap gap-2">
            {GOALS.map((goal) => {
              const selected = data.goal === goal
              return (
                <button
                  key={goal}
                  onClick={() => update('goal', goal)}
                  className="px-4 py-2 rounded-full text-sm font-medium border transition-all"
                  style={{
                    background: selected ? '#001E62' : '#f4f8fd',
                    border:     `1px solid ${selected ? '#001E62' : '#acd4f1'}`,
                    color:      selected ? '#ffffff' : '#001E62',
                  }}
                >
                  {goal}
                </button>
              )
            })}
          </div>
        </div>

        {/* Q3: Years slider */}
        <div>
          <p className="text-xs font-semibold text-gs-navy mb-3">How many years can you wait?</p>
          <input
            type="range"
            min={1}
            max={30}
            value={data.years}
            onChange={(e) => update('years', Number(e.target.value))}
            className="w-full"
            style={{ accentColor: '#001E62' }}
          />
          <div className="flex justify-between text-xs text-gs-gray mt-1">
            <span>1 yr</span>
            <span
              className="font-bold text-sm"
              style={{ color: '#001E62' }}
            >
              {data.years} {data.years === 1 ? 'year' : 'years'}
            </span>
            <span>30 yrs</span>
          </div>
        </div>

        <PrimaryBtn onClick={onNext}>Next →</PrimaryBtn>
      </div>
    </div>
  )
}

// ─── Step 4: How it works ─────────────────────────────────────────────────────

function StepHowItWorks({ onBack, onFinish }) {
  return (
    <div>
      <BackBtn onClick={onBack} />
      <StepHeading
        title="Here's what GS-EaseInvest does for you"
        sub=""
      />
      <div className="grid grid-cols-2 gap-3 mb-6">
        {FEATURES.map((f) => (
          <div
            key={f.title}
            className="bg-white rounded-xl p-4 border border-gs-pale/60"
          >
            <div className="text-2xl mb-2">{f.icon}</div>
            <p className="text-sm font-semibold text-gs-navy">{f.title}</p>
            <p className="text-xs text-gs-gray mt-1 leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
      <PrimaryBtn onClick={onFinish}>Take me to my dashboard →</PrimaryBtn>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function Onboarding() {
  const navigate = useNavigate()
  const { completeOnboarding } = useApp()
  const [view, setView]   = useState('landing')  // 'landing' | 'signup' | 'login'
  const [step, setStep]   = useState(0)
  const [formData, setFormData] = useState({
    name: '', email: '', password: '',
    occupation: '', age: '', income: '', monthlyInvest: '',
    style: '', goal: '', years: 10,
  })

  const update = (key, val) => setFormData((prev) => ({ ...prev, [key]: val }))
  const next   = () => setStep((s) => s + 1)
  const back   = () => setStep((s) => s - 1)

  const handleFinish = async () => {
    await completeOnboarding({
      name:          formData.name,
      email:         formData.email,
      password:      formData.password,
      occupation:    formData.occupation,
      age:           Number(formData.age),
      income:        Number(formData.income),
      investAmount:  Number(formData.monthlyInvest),
      style:         formData.style,
      goal:          formData.goal,
      years:         Number(formData.years),
      panicBehavior: '',
    })
    navigate('/dashboard')
  }

  if (view === 'landing') {
    return (
      <LandingScreen
        onNew={() => setView('signup')}
        onExisting={() => setView('login')}
      />
    )
  }

  return (
    <div className="bg-gs-bg min-h-screen py-8 px-4">
      <div className="max-w-md mx-auto">
        {view === 'login' && (
          <LoginScreen onBack={() => setView('landing')} />
        )}

        {view === 'signup' && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gs-pale/60">
            <StepIndicator current={step} />
            {step === 0 && <StepSignUp    data={formData} update={update} onNext={next} />}
            {step === 1 && <StepProfile   data={formData} update={update} onNext={next} onBack={back} />}
            {step === 2 && <StepHabits    data={formData} update={update} onNext={next} onBack={back} />}
            {step === 3 && <StepHowItWorks onBack={back} onFinish={handleFinish} />}
          </div>
        )}
      </div>
    </div>
  )
}
