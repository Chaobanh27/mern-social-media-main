import { useCallStore } from '~/zustand/useCallStore'
import { useSocketStore } from '~/zustand/useSocketStore'
import VideoRoom from './VideoRoom'
import { Phone, X } from 'lucide-react'
import { useEffect } from 'react'
import useSound from 'use-sound'
import ringTone from '~/audio/ring_tone.mp3'
import { useUserStore } from '~/zustand/userStore'

const CallModal = () => {
  const { isIncoming, isCalling, callData, acceptCall, endCall } = useCallStore()
  const socket = useSocketStore(s => s.getSocket())
  const currentUser = useUserStore(s => s.user)
  const [play, { stop }] = useSound(ringTone, {
    loop: true,
    volume: 0.5
  })

  useEffect(() => {
    if (isIncoming) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isIncoming])

  useEffect(() => {
    if (isIncoming && !isCalling) {
      play()
    } else {
      stop()
    }
    return () => stop()
  }, [isCalling, isIncoming, play, stop])

  if (isIncoming && !isCalling) {
    return (
      <div className='sticky h-screen top-0 right-0 bottom-0 left-0 z-50 flex items-center justify-center bg-black/80'>
        <div className="p-10 space-y-5">
          <div className='flex flex-col'>
            <img src={callData?.fromUser?.profilePicture} alt="calling user picture" />
            <p>{callData?.fromUser?.username} đang gọi {callData?.callType}...</p>
          </div>

          <div className='flex justify-between'>
            <button
              className='p-3 rounded-full bg-accent'
              onClick={() => {
                socket.emit('answer_call', {
                  toUserId: callData?.fromUser?._id,
                  isGroup: callData?.isGroup,
                  roomName: callData?.roomName,
                  currentUser: currentUser
                })
                acceptCall()
              }}
            >
              <Phone/>
            </button>
            <button className='p-3 rounded-full bg-text-error ' onClick={() => {
              socket.emit('reject_call', {
                toUserId: callData?.fromUser?._id,
                isGroup: callData?.isGroup,
                roomName: callData?.roomName,
                fromUser: callData?.fromUser
              })
              endCall()
            }}>
              <X/>
            </button>
          </div>

        </div>
      </div>

    )
  }

  if (isCalling) {
    return <VideoRoom roomName={callData.roomName} />
  }

  return null
}

export default CallModal