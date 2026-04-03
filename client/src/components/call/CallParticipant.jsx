import { MicOff, VideoOff } from 'lucide-react'
import { useEffect, useRef, memo, useState } from 'react'

const CallParticipant = memo(({ participant, isLocal = false }) => {
  const videoRef = useRef()
  const audioRef = useRef()
  const [isVideoEnabled, setIsVideoEnabled] = useState(true)
  const [isAudioEnabled, setIsAudioEnabled] = useState(true)

  const getParticipantInfo = () => {
    try {
      return JSON.parse(participant.identity)
    } catch (error) {
      return { username: 'Unknown' }
    }
  }

  const info = getParticipantInfo()

  useEffect(() => {
    const attachTrack = (track) => {
      if (!track) return
      if (track.kind === 'video') {
        track.attach(videoRef.current)
        //Cập nhật state ban đầu
        setIsVideoEnabled(track.isEnabled)
      }
      else if (track.kind === 'audio') {
        track.attach(audioRef.current)
        //Cập nhật state ban đầu
        setIsAudioEnabled(track.isEnabled)
      }

      track.on('disabled', () => {
        if (track.kind === 'video') setIsVideoEnabled(false)
        if (track.kind === 'audio') setIsAudioEnabled(false)
      })

      track.on('enabled', () => {
        if (track.kind === 'video') setIsVideoEnabled(true)
        if (track.kind === 'audio') setIsAudioEnabled(true)
      })
    }


    const detachTrack = (track) => {
      if (!track) return
      track.detach().forEach(el => el.remove())
    }

    // QUAN TRỌNG: Duyệt và gắn các track hiện có
    // forEach đảm bảo không bỏ lỡ bất kỳ video/audio nào của những người đang có mặt trong phòng lúc chúng ta vừa mount component
    // forEach chỉ chạy duy nhất một lần khi useEffect bắt đầu
    participant.tracks.forEach(publication => {
    // Với LocalParticipant, track nằm ngay trong publication.track
    // Với RemoteParticipant, track chỉ có khi đã subscribed
      if (publication.track) {
        attachTrack(publication.track)
      }

      // Lắng nghe nếu track được subscribe / unsubscribed sau đó (dành cho Remote)
      publication.on('subscribed', track => attachTrack(track))
      publication.on('unsubscribed', track => detachTrack(track))
    })

    // Lắng nghe các track mới được thêm vào sau này
    participant.on('trackSubscribed', attachTrack)
    participant.on('trackUnsubscribed', detachTrack)

    return () => {
      participant.off('trackSubscribed', attachTrack)
      participant.off('trackUnsubscribed', detachTrack)
      participant.tracks.forEach(publication => {
        publication.off('subscribed', attachTrack)
        publication.off('unsubscribed', detachTrack)
        if (publication.track) detachTrack(publication.track)
      })
    }
  }, [participant])


  return (
    <div className="relative w-full h-full bg-slate-950 overflow-hidden group">
      {/* Thẻ Video: Luôn lấp đầy khung hình bất kể kích thước modal */}
      <video
        ref={videoRef}
        autoPlay={true}
        playsInline={true}
        className='w-full h-full object-contain' // Zoom nhẹ local để lấp đầy
      />

      {/* Thẻ Audio: Ẩn đi vì không cần hiển thị giao diện */}
      <audio ref={audioRef} autoPlay={true} />

      {!isVideoEnabled && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900">
          <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-2 border border-slate-700">
            <VideoOff size={24} className="text-slate-500" />
          </div>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest">Camera Off</p>
        </div>
      )}
      {/* Overlay thông tin: Tên người dùng và hiển thị mic off */}
      <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/40 backdrop-blur-md rounded text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        {isLocal ? 'You' : info.username}
        {!isAudioEnabled && <MicOff size={10} className="text-red-500" />}
      </div>

      {/* Hiệu ứng viền khi đang nói (Tùy chọn nâng cao) */}
      <div className="absolute inset-0 border-2 border-transparent peer-data-[speaking=true]:border-green-500 pointer-events-none rounded-2xl" />
    </div>
  )
})

export default CallParticipant