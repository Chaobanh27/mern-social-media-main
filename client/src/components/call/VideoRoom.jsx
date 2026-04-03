import { useEffect, useRef, useState, useCallback } from 'react'
import Video from 'twilio-video'
import CallParticipant from './CallParticipant'
import { useCallStore } from '~/zustand/useCallStore'
import { useUserStore } from '~/zustand/userStore'
import { useGetTwilioToken } from '~/hooks/TanstackQuery'
import toast from 'react-hot-toast'
import { X, Minimize2, Maximize2, Phone, Shrink, Fullscreen, Mic, MicOff, VideoIcon, VideoOff } from 'lucide-react'
import { motion } from 'framer-motion'
import { useSocketStore } from '~/zustand/useSocketStore'

const VideoRoom = ({ roomName }) => {
  const [localParticipant, setLocalParticipant] = useState(null)
  const [participants, setParticipants] = useState([])
  const socket = useSocketStore(s => s.getSocket())
  const [isMicOn, setIsMicOn] = useState(true)
  const [isCamOn, setIsCamOn] = useState(true)
  const roomRef = useRef(null)
  const [sizeMode, setSizeMode] = useState('normal')
  const constraintsRef = useRef(null)
  const currentUser = useUserStore(s => s.user)
  const { callData, endCall, removeParticipant } = useCallStore()

  const getToken = useGetTwilioToken()

  const handleParticipantConnected = useCallback((participant) => {
    setParticipants(prev => {
    // Kiểm tra xem participant.sid này đã có trong danh sách hiển thị chưa
      if (prev.some(p => p.sid === participant.sid)) {
        return prev
      }
      return [...prev, participant]
    })
  }, [])

  const handleParticipantDisconnected = useCallback((participant) => {
    setParticipants(prev => {
      const newParticipants = prev.filter(p => p.sid !== participant.sid)

      if (newParticipants.length === 0) {
        toast.success('Đối phương đã kết thúc cuộc gọi')
        endCall()
      }

      return newParticipants
    })

    removeParticipant(participant.identity.id)
  }, [endCall, removeParticipant])

  const toggleMic = useCallback(() => {
    if (!localParticipant) return
    //Thiết lập phần cứng trước rồi set thay đổi UI sau
    localParticipant.audioTracks.forEach(publication => {
      if (isMicOn) {
        publication.track.disable()
      } else {
        publication.track.enable()
      }
    })
    setIsMicOn(!isMicOn)
  }, [localParticipant, isMicOn])

  const toggleCamera = useCallback(() => {
    if (!localParticipant) return
    //Thiết lập phần cứng trước rồi set thay đổi UI sau
    localParticipant.videoTracks.forEach(publication => {
      if (isCamOn) {
        publication.track.disable()
      } else {
        publication.track.enable()
      }
    })
    setIsCamOn(!isCamOn)
  }, [localParticipant, isCamOn])

  const handleEndCall = () => {
    socket.emit('end_call', {
      toUserId: callData?.toUserId,
      isGroup: callData?.isGroup,
      roomName: callData?.roomName,
      fromUser: callData?.fromUser,
      isCaller: callData?.fromUser?._id === currentUser._id
    })
    endCall()
  }

  const cleanUpRoom = useCallback(() => {
    if (roomRef.current) {
      // Dừng tất cả các track của local participant
      roomRef.current.localParticipant.tracks.forEach(publication => {
        if (publication.track) {
          publication.track.stop()
          // Gỡ bỏ element khỏi DOM để tránh memory leak
          const attachedElements = publication.track.detach()
          attachedElements.forEach(el => el.remove())
        }
      })
      roomRef.current.disconnect()
      roomRef.current = null
    }
  }, [])

  useEffect(() => {
    // Flag để tránh chạy initRoom 2 lần trong StrictMode của React
    // Giúp bảo vệ ứng dụng khỏi các tác vụ bất đồng bộ "chạy muộn" sau khi user đã rời trang
    // Tránh cập nhật State trên Component đã bị hủy
    let isMounted = true

    const initRoom = async () => {
      try {
        // Gọi mutation để lấy token
        const data = await getToken.mutateAsync({
          identity: currentUser._id,
          roomName: roomName
        })

        if (!isMounted) return

        // Kết nối Twilio Video
        const room = await Video.connect(data.token, {
          name: roomName,
          audio: true,
          video: { width: 340 },
          bandwidthProfile: {
            video: { mode: 'collaboration', maxTracks: 3 }
          }
        })

        if (!isMounted) {
          room.disconnect()
          return
        }

        roomRef.current = room
        setLocalParticipant(room.localParticipant)

        // Đăng ký sự kiện participant ra/vào
        room.on('participantConnected', handleParticipantConnected)
        room.on('participantDisconnected', handleParticipantDisconnected)

        // Load những người đã ở sẵn trong phòng
        room.participants.forEach(handleParticipantConnected)

      } catch (error) {
        console.error('Twilio Connection Error:', error)
        endCall()
      }
    }

    initRoom()

    return () => {
      isMounted = false
      cleanUpRoom()
    }
  }, [roomName, currentUser._id, handleParticipantConnected, handleParticipantDisconnected, cleanUpRoom, endCall])

  // Cấu hình Animation cho 2 trạng thái
  const sizeVariants = {
    normal: { width: 320, height: 'auto', scale: 1 },
    mini: { width: 150, height: 40, scale: 0.9 },
    full: { width: '100%', height: '100%', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 0 }
  }


  const isMini = sizeMode === 'mini'
  const isFull = sizeMode === 'full'

  return (
  // Lớp cha bao phủ toàn màn hình để giới hạn không gian kéo (dùng fixed inset-0)
    <div ref={constraintsRef} className={`fixed inset-0 pointer-events-none z-50 ${isFull ? 'bg-black/90 backdrop-blur-sm' : ''}`}>

      <motion.div
        drag={!isFull} // KHÔNG cho phép kéo khi đang ở chế độ Fullscreen
        dragConstraints={constraintsRef} // Giới hạn kéo trong màn hình
        dragElastic={0.1}
        dragMomentum={false}
        animate={sizeMode} // Điều khiển trạng thái kích thước qua state sizeMode
        variants={sizeVariants}
        initial="normal" // Kích thước ban đầu là normal
        className={`absolute bottom-5 right-5 bg-slate-900 shadow-2xl rounded-2xl overflow-hidden border border-slate-700 pointer-events-auto flex flex-col ${isMini ? 'border-none' : ''}`}
      >
        {/* Điều khiển (Handle để nắm kéo) */}
        <div className={`bg-slate-800 p-2 flex justify-between items-center select-none ${isMini ? 'p-1 bg-transparent' : ''}`}>
          {!isMini && !isFull && <span className="text-[10px] text-slate-400 uppercase font-bold ml-1">Live Call</span>}

          <div className="flex items-center gap-1 ml-auto">
            {isMini && <div className='h-full w-full flex justify-evenly gap-2 items-center'>
              <span className="relative flex size-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75"></span>
                <span className="relative inline-flex size-3 rounded-full bg-green-500"></span>
              </span>
              <p>In Calling</p>
            </div>}
            {/* 1. Nút Phóng to/Thu nhỏ Toàn màn hình (Fullscreen / Shrink) */}
            {!isMini && (
              <button
                onClick={() => setSizeMode(isFull ? 'normal' : 'full')}
                className="p-1 hover:bg-slate-700 rounded text-slate-300"
                title={isFull ? 'Thoát toàn màn hình' : 'Phóng to toàn màn hình'}
              >
                {isFull ? <Shrink size={14} /> : <Fullscreen size={14} />}
              </button>
            )}

            {/* 2. Nút Thu nhỏ / Phóng to về Normal (Minimize / Maximize) - Chỉ hiện khi KHÔNG full */}
            {!isFull && (
              <button
                onClick={() => setSizeMode(isMini ? 'normal' : 'mini')}
                className="p-1 hover:bg-slate-700 rounded text-slate-300"
                title={isMini ? 'Phóng to' : 'Thu nhỏ'}
              >
                {isMini ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
              </button>
            )}

            {/* 3. Nút Đóng (Chỉ hiện khi Normal) */}
            {!isMini && !isFull && (
              <button className="p-1 hover:bg-red-900/50 rounded text-red-400" onClick={handleEndCall} title="Kết thúc">
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Nội dung Video */}
        {!isMini && (
          <div className={`relative flex-1 bg-black overflow-hidden ${isFull ? 'p-4' : ''}`}>

            {/* GRID HỖ TRỢ NHIỀU NGƯỜI */}
            <div className={`
            grid gap-2 w-full h-full 
            ${participants?.length + 1 <= 1 ? 'grid-cols-1' :
            participants?.length + 1 <= 2 ? 'grid-cols-2' :
              participants?.length + 1 <= 4 ? 'grid-cols-2 grid-rows-2' : 'grid-cols-3'}
            `}>

              {/* 1. Hiển thị chính mình */}
              {localParticipant && (
                <div className="relative overflow-hidden border border-accent">
                  <CallParticipant participant={localParticipant} isLocal={true} />
                </div>
              )}

              {/* 2. Hiển thị tất cả đối phương (Remote) */}
              {participants?.length > 0 ? (
                participants.map((p) => (
                  <div key={p.sid} className="relative overflow-hidden">
                    <CallParticipant participant={p} />
                  </div>
                ))
              ) : !isFull && (
                <div className='w-full flex items-center justify-center py-10'>
                  <p className="text-[10px] text-primary">Waiting for others...</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Các button dành cho call */}
        {!isMini && (
          <div className={`p-4 flex justify-center items-center gap-6 ${isFull ? 'bg-slate-900/90' : 'bg-slate-800/80'}`}>

            {/* Nút Bật/Tắt Mic */}
            <button
              onClick={toggleMic}
              className={`p-3 rounded-full transition-all ${isMicOn ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-red-500 text-white'}`}
              title={isMicOn ? 'Tắt Mic' : 'Bật Mic'}
            >
              {isMicOn ? <Mic size={20} /> : <MicOff size={20} />}
            </button>

            {/* Nút Kết thúc cuộc gọi */}
            <button
              onClick={handleEndCall}
              className="p-4 rounded-full bg-red-600 hover:bg-red-700 hover:scale-110 transition-all text-white shadow-lg"
              title="Kết thúc"
            >
              <Phone size={24} className="rotate-135" />
            </button>

            {/* Nút Bật/Tắt Video */}
            <button
              onClick={toggleCamera}
              className={`p-3 rounded-full transition-all ${isCamOn ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-red-500 text-white'}`}
              title={isCamOn ? 'Tắt Camera' : 'Bật Camera'}
            >
              {isCamOn ? <VideoIcon size={20} /> : <VideoOff size={20} />}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default VideoRoom