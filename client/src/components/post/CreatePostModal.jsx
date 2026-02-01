import { useForm, useWatch } from 'react-hook-form'
import { X, Image } from 'lucide-react'
import { useState } from 'react'
import RHFTextarea from '~/components/form/RHFTextarea'
import clsx from 'clsx'
import RHFSelect from '~/components/form/RHFSelect'
import Modal from '../ui/Modal'

const BG_COLORS = [
  'bg-gradient-to-r from-pink-500 to-yellow-500',
  'bg-gradient-to-r from-blue-500 to-cyan-500',
  'bg-gradient-to-r from-purple-500 to-pink-500'
]

const VISIBILITY_OPTIONS = [
  { label: 'Public', value: 'public' },
  { label: 'Friends', value: 'friends' },
  { label: 'Private', value: 'private' }
]


const CreatePostModal = ({ showModal, onClose }) => {
  const [files, setFiles] = useState([])
  const [bg, setBg] = useState(null)

  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      content: '',
      visibily: 'public'
    }
  })

  const content = useWatch({
    control,
    name:'content'
  })

  const handleFiles = (e) => {
    setFiles(prev => [...prev, ...Array.from(e.target.files)])
    setBg(null)
  }

  const onSubmit = (data) => {
    const payload = {
      content: data.content,
      background: bg,
      files,
      visibility: data.visibility
    }

    // eslint-disable-next-line no-console
    console.log('payload: ', payload)

    reset()
    setFiles([])
    setBg(null)
    onClose()
  }

  return (
    <Modal
      showModal={showModal}
      onClose={onClose}
      className="w-full max-w-lg shadow-xl px-5 md:px-0"
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-lg bg-bg-alt shadow-xl"
      >
        <div className="relative border-b border-b-border px-4 py-3 text-center font-semibold bg-bg-alt">
          CREATE POST
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 rounded-full p-2"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-4 space-y-4 bg-bg-alt">
          <div
            className={`rounded-lg p-3 ${
              bg ? `${bg} text-primary-text` : 'bg-bg-alt'
            }`}
          >


            <RHFTextarea
              name="content"
              control={control}
              rules={{
                required: files.length === 0 ? 'Nội dung không được để trống' : false
              }}
              placeholder="What is happening ?"
              rows={bg ? 4 : 3}
              className={clsx('w-full resize-none bg-transparent text-lg outline-none', bg && 'placeholder-white/70')}
            />
          </div>

          {files.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {files.map((file, i) => (
                <div key={i} className="overflow-hidden rounded-lg">
                  {file.type.startsWith('video') ? (
                    <video
                      src={URL.createObjectURL(file)}
                      className="h-32 w-full object-cover"
                      controls
                    />
                  ) : (
                    <img
                      src={URL.createObjectURL(file)}
                      className="h-32 w-full object-cover"
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {files.length === 0 && (
            <div className="flex gap-2">
              {BG_COLORS.map((color) => (
                <button
                  type="button"
                  key={color}
                  onClick={() => setBg(color)}
                  className={`h-8 w-8 rounded-full ${color} ${
                    bg === color ? 'ring-2 ring-black' : ''
                  }`}
                />
              ))}
            </div>
          )}

          <div className="flex items-center justify-between rounded-lg border border-gray-600 p-3">
            <span className="text-sm font-medium">Add to your post</span>

            <label className="cursor-pointer rounded-full p-2 hover:bg-gray-100">
              <Image className="text-green-500" />
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                hidden
                onChange={handleFiles}
              />
            </label>
          </div>

          <RHFSelect
            name="visibility"
            placeholder='who can see?'
            control={control}
            label=""
            rules={{ required: 'visibility is required' }}
            options={VISIBILITY_OPTIONS}
            className='text-gray-700'
          />

          <button
            type="submit"
            disabled={!content && files.length === 0}
            className="w-full bg-accent hover:bg-accent-hover text-primary-text py-2 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            SUBMIT
          </button>
        </div>
      </form>
    </Modal>

  )
}

export default CreatePostModal
