import { X } from 'lucide-react'

const GifPreview = ({ gif, onRemove }) => {
  if (!gif) return null

  return (
    <div className="relative w-max mb-2 group">
      {/* Nút X để xóa preview */}
      <button
        onClick={onRemove}
        className="absolute -top-2 -right-2 bg-gray-800 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
      >
        <X size={16} /> {/* Dùng icon từ lucide-react hoặc tương tự */}
      </button>

      {/* Render GIF hoặc Sticker */}
      <div className={`overflow-hidden ${gif.type === 'sticker' ? '' : 'border'}`}>
        <img
          src={gif.webp || gif.url}
          alt="Preview"
          className="max-h-40 object-contain"
        />
      </div>
    </div>
  )
}

export default GifPreview