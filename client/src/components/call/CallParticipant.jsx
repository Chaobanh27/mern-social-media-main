import { useEffect, useRef, memo } from 'react'

const CallParticipant = memo(({ participant, isLocal = false }) => {
  const videoRef = useRef()
  const audioRef = useRef()

  useEffect(() => {
    const attachTrack = (track) => {
      if (!track) return
      if (track.kind === 'video') track.attach(videoRef.current)
      else if (track.kind === 'audio') track.attach(audioRef.current)
    }

    const detachTrack = (track) => {
      if (!track) return
      track.detach().forEach(el => el.remove())
    }

    // QUAN TRỌNG: Duyệt và gắn các track hiện có
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

      {/* Overlay thông tin: Tên người dùng */}
      <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/40 backdrop-blur-md rounded text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        {isLocal ? 'You' : participant.identity}
      </div>

      {/* Hiệu ứng viền khi đang nói (Tùy chọn nâng cao) */}
      <div className="absolute inset-0 border-2 border-transparent peer-data-[speaking=true]:border-green-500 pointer-events-none rounded-2xl" />
    </div>
  )
})

export default CallParticipant