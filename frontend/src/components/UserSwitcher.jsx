import { useApp } from '../context/AppContext'

export default function UserSwitcher() {
  const { currentUserId, users, switchUser } = useApp()

  return (
    <div className="flex gap-2">
      {users.map((u) => {
        const active = u.id === currentUserId
        return (
          <button
            key={u.id}
            onClick={() => switchUser(u.id)}
            className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-left transition-colors ${
              active
                ? 'bg-gs-navy text-white'
                : 'bg-gs-pale/40 text-gs-navy border border-gs-pale hover:bg-gs-pale/70'
            }`}
          >
            <span
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                active ? 'bg-white/20 text-white' : 'bg-gs-navy text-white'
              }`}
            >
              {u.initials}
            </span>
            <div className="leading-tight">
              <p className={`text-xs font-semibold ${active ? 'text-white' : 'text-gs-navy'}`}>
                {u.name}
              </p>
              <p className={`text-[10px] ${active ? 'text-white/70' : 'text-gs-gray'}`}>
                {u.style} · {u.goal}
              </p>
            </div>
          </button>
        )
      })}
    </div>
  )
}
