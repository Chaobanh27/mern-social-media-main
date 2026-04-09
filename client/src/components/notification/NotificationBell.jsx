import { Bell } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useGetNotifications, useMarkAllRead } from '~/hooks/TanstackQuery'
import { useUserStore } from '~/zustand/userStore'

const NotificationBell = () => {
  const [open, setOpen] = useState(false)
  const bellRef = useRef(null)
  const currentUser = useUserStore(s => s.user)

  const { data, isLoading } = useGetNotifications(currentUser._id)
  const markAllRead = useMarkAllRead(currentUser._id)

  console.log(data);

  const unreadCount = useMemo(() => {
    if (!data) return 0
    return data.filter(n => !n.isRead).length
  }, [data])

  const handleMarkAllRead = async () => {
    await markAllRead.mutateAsync()
  }

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (bellRef.current && !bellRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={bellRef}>
      {/* CHUÔNG */}
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        <Bell size={20} />

        {unreadCount > 0 && (
          <span className="
            absolute -top-1 -right-1 bg-red-600 text-white text-xs
            w-5 h-5 flex items-center justify-center rounded-full
            font-semibold shadow
          ">
            {unreadCount}
          </span>
        )}
      </button>

      {/* DROPDOWN THÔNG BÁO */}
      {open && (
        <div className="
          absolute -right-25 w-80 bg-bg
          shadow-lg rounded-xl z-50
        ">
          <div className="flex items-center justify-between px-4 py-3 border-b dark:border-gray-700">
            <h3 className="font-semibold text-gray-800 dark:text-gray-200">
              Notifications
            </h3>

            {unreadCount > 0 && (
              <button
                className="text-accent text-sm hover:underline"
                onClick={handleMarkAllRead}
              >
                Mark as Read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {data?.length === 0 ? (
              <p className="text-center py-6 text-gray-500 dark:text-gray-400 text-sm">
                No Notification
              </p>
            ) : (
              data?.map(n => (
                <div
                  key={n._id}
                  className={`
                    flex items-start gap-3 px-4 py-3 cursor-pointer
                    hover:bg-gray-100 dark:hover:bg-gray-700
                    ${!n.isRead ? 'bg-blue-50 dark:bg-gray-700/50' : ''}
                  `}
                >
                  <img
                    src={n.sender?.profilePicture}
                    className="w-10 h-10 rounded-full"
                    alt="avatar"
                  />

                  <div className="flex-1">
                    <p className="text-sm text-gray-800 dark:text-gray-200">
                      <span className="font-semibold">{n.sender?.username}</span>{' '}
                      { n.type === 'like_comment'
                        ? 'has liked your comment'
                        : n.type === 'reply_comment'
                          ? 'has replied to your comment'
                          : n.type === 'comment_post'
                            ? 'has commented on your post'
                            : 'has liked your post'}
                    </p>

                    <span className="text-xs text-gray-500">
                      {new Date(n?.createdAt).toLocaleString('vi-VN')}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default NotificationBell
