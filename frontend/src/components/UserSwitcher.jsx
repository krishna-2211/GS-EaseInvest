import { useApp } from '../context/AppContext'

export default function UserSwitcher() {
  const { users, currentUser, setCurrentUser } = useApp()

  return (
    <div className="flex gap-2">
      {users.map((u) => {
        const active = u.user_id === currentUser?.user_id
        return (
          <button
            key={u.user_id}
            onClick={() => setCurrentUser(u)}
            className="flex items-center gap-2 rounded-xl px-3 py-2 transition-colors text-left"
            style={
              active
                ? { backgroundColor: '#001E62', color: '#fff' }
                : { backgroundColor: '#f4f8fd', color: '#001E62' }
            }
          >
            <div className="leading-tight">
              <p className="text-xs font-semibold">{u.name}</p>
              <span
                className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
                style={
                  active
                    ? { backgroundColor: 'rgba(255,255,255,0.2)', color: '#fff' }
                    : { backgroundColor: '#acd4f1', color: '#001E62' }
                }
              >
                {u.style}
              </span>
            </div>
          </button>
        )
      })}
    </div>
  )
}
