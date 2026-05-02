import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
  const [step, setStep] = useState(0)
  const [formData, setFormData] = useState({
    name: '', email: '', password: '',
    occupation: '', age: '', income: '', monthlyInvest: '',
    style: '', goal: '', years: 10,
  })

  const update = (key, val) => setFormData((prev) => ({ ...prev, [key]: val }))
  const next   = () => setStep((s) => s + 1)
  const back   = () => setStep((s) => s - 1)

  return (
    <div className="bg-gs-bg min-h-screen py-8 px-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gs-pale/60">
          <StepIndicator current={step} />
          {step === 0 && <StepSignUp    data={formData} update={update} onNext={next} />}
          {step === 1 && <StepProfile   data={formData} update={update} onNext={next} onBack={back} />}
          {step === 2 && <StepHabits    data={formData} update={update} onNext={next} onBack={back} />}
          {step === 3 && <StepHowItWorks onBack={back} onFinish={() => navigate('/dashboard')} />}
        </div>
      </div>
    </div>
  )
}
