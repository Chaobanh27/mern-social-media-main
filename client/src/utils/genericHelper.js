// export const mapGiphyToModel = (gif) => {
//   const isClip = gif.type === 'video'
//   const isSticker = gif.is_sticker || gif.type === 'sticker'

//   // 1. Xác định type cho enum của bạn
//   const myType = isClip ? 'clip' : (isSticker ? 'sticker' : 'gif')

//   // 2. Lấy dữ liệu rendition mong muốn (ví dụ fixed_height)
//   const renditionData = gif.images.fixed_height

//   return {
//     id: gif.id,
//     title: gif.title,
//     type: myType,
//     rendition: 'fixed_height',

//     // Nếu là clip, ưu tiên lấy mp4 từ trường video (nếu có) hoặc rendition
//     // Nếu là gif/sticker, lấy url của gif
//     url: isClip ? (gif.video?.mp4 || renditionData.mp4) : renditionData.url,

//     // Webp luôn nhẹ hơn cho gif/sticker
//     webp: renditionData.webp,

//     // ẢNH TĨNH: Cực kỳ quan trọng để làm Placeholder
//     still: gif.images.fixed_height_still?.url,

//     width: parseInt(renditionData.width),
//     height: parseInt(renditionData.height)
//   }
// }