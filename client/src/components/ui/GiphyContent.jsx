const GiphyContent = ({ giphy }) => {
  const isSticker = giphy.type === 'sticker'
  const imgSrc = giphy.webp || giphy.url || giphy.still
  return (
    <div className= {isSticker ? 'bg-transparent' : 'bg-bg mt-3'}>
      <img
        src={imgSrc}
        alt={giphy.title}
        className={isSticker ? 'contain' : 'cover'}
        style={{
          display: 'block',
          maxWidth: '100%',
          // Sticker không nên bị ép scale cover làm mất chi tiết viền
          objectFit: isSticker ? 'contain' : 'cover'
        }}
      />
    </div>
  )
}

export default GiphyContent