import { useState } from 'react'
import Signup from './Signup'
import ProfileSetup from './ProfileSetup'
import HabitsQuiz from './HabitsQuiz'
import AppTutorial from './AppTutorial'

const STEPS = ['signup', 'profile', 'habits', 'tutorial']

const STEP_LABELS = {
  signup: 'Sign up',
  profile: 'Profile',
  habits: 'Habits',
  tutorial: 'Tour',
}

export default function Onboarding() {
  const [stepIndex, setStepIndex] = useState(0)

  const next = () => setStepIndex((i) => Math.min(i + 1, STEPS.length - 1))
  const currentStep = STEPS[stepIndex]

  return (
    <div className="min-h-screen bg-gs-bg flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gs-pale/60 p-8">
        <div className="flex gap-1.5 mb-8">
          {STEPS.map((s, i) => (
            <div
              key={s}
              className={`flex-1 h-1 rounded-full transition-colors ${
                i <= stepIndex ? 'bg-gs-navy' : 'bg-gs-pale/50'
              }`}
            />
          ))}
        </div>

        <p className="text-xs text-gs-gray mb-4">
          Step {stepIndex + 1} of {STEPS.length} · {STEP_LABELS[currentStep]}
        </p>

        {currentStep === 'signup' && <Signup onNext={next} />}
        {currentStep === 'profile' && <ProfileSetup onNext={next} />}
        {currentStep === 'habits' && <HabitsQuiz onNext={next} />}
        {currentStep === 'tutorial' && <AppTutorial />}
      </div>
    </div>
  )
}
