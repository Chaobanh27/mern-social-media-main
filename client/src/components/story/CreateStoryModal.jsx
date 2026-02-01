import { ArrowLeft, Sparkle, TextIcon, Upload } from 'lucide-react'
import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import Modal from '../ui/Modal'

const bgColors = [
  '#4f46e5',
  '#7c3aed',
  '#db2777',
  '#e11d48',
  '#ca8a04',
  '#0d9488'
]


const CreateStoryModal = ({ showModal, onClose }) => {

  const [mode, setMode] = useState('text')
  const [background, setBackground] = useState(bgColors[0])
  const [media, setMedia] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)

  const { register, control, handleSubmit } = useForm({
    defaultValues: {
      content: ''
    }
  })

  const content = useWatch({
    control,
    name:'content'
  })

  //MEDIA UPLOAD HANDLER
  const handleMediaUpload = (e) => {}

  //SUBMIT STORY
  const onSubmit = (data) => {}

  return (
    <Modal
      showModal={showModal}
      onClose={onClose}
      className="w-full max-w-lg px-5 md:px-0 "
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-lg text-primary-text">

        {/* HEADER */}
        <div className="text-center mb-4 flex items-center justify-between">
          <button
            onClick={onClose}
            className="p-2 cursor-pointer"
          >
            <ArrowLeft />
          </button>
          <h2 className="text-lg font-semibold">Create Story</h2>
          <span className="w-10"></span>
        </div>

        {/* PREVIEW */}
        <div
          className="rounded-lg h-96 flex items-center justify-center relative"
          style={{ backgroundColor: background }}
        >
          {mode === 'text' && (
            <textarea
              {...register('content')}
              placeholder="What's on your mind?"
              className="w-full h-full p-6 text-lg resize-none focus:outline-none"
            />
          )}

          {mode === 'media' && previewUrl && (
            media?.type.startsWith('image') ? (
              <img
                src={previewUrl}
                alt=""
                className="object-contain max-h-full"
              />
            ) : (
              <video
                src={previewUrl}
                className="object-contain max-h-full"
                controls
              />
            )
          )}
        </div>

        {/* BACKGROUND COLORS */}
        <div className="flex mt-4 gap-2">
          {bgColors.map((color) => (
            <button
              key={color}
              className={`w-6 h-6 rounded-full ring cursor-pointer ${
                background === color ? 'ring-white' : ''
              }`}
              style={{ backgroundColor: color }}
              onClick={() => setBackground(color)}
            />
          ))}
        </div>

        {/* MODE SELECT */}
        <div className="flex gap-2 mt-4">
          <button
            type="button"
            onClick={() => {
              setMode('text')
              setMedia(null)
              setPreviewUrl(null)
            }}
            className={`flex-1 flex items-center justify-center gap-2 p-2 rounded ${
              mode === 'text' ? 'bg-white text-black' : 'bg-zinc-800'
            }`}
          >
            <TextIcon size={18} /> Text
          </button>

          <label
            className={`flex-1 flex items-center justify-center gap-2 p-2 rounded cursor-pointer ${
              mode === 'media' ? 'bg-white text-black' : 'bg-zinc-800'
            }`}
          >
            <Upload size={18} /> Photo / Video
            <input
              type="file"
              accept="image/*,video/*"
              hidden
              onChange={handleMediaUpload}
            />
          </label>
        </div>

        {/* SUBMIT */}
        <button
          type="submit"
          disabled={mode === 'text' && !content}
          className="flex items-center justify-center gap-2 py-3 mt-4 w-full rounded
            bg-accent
            hover:bg-accent-hover
            disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Sparkle size={18} /> Create Story
        </button>

      </form>
    </Modal>
  )
}

export default CreateStoryModal
