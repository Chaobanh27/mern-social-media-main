import EmojiPicker from 'emoji-picker-react'
import { useWatch } from 'react-hook-form'
import { themeStore } from '~/zustand/themeStore'

const EmojiPickerModal = ({ control, setValue }) => {
  const currentTheme = themeStore((state) => state.theme)
  const content = useWatch({ control, name: 'content', defaultValue: '' })
  const emojiPickerTheme = () => {
    if (currentTheme == 'light') return 'light'
    else if (currentTheme == 'dark') return 'dark'
    else return 'auto'
  }
  return (
    <div className='w-full px-3 mb-3'>
      <EmojiPicker
        width={'100%'}
        height={380}
        autoFocusSearch={false}
        onEmojiClick={item => {
          setValue('content', content + item.emoji, {
            shouldValidate: true,
            shouldDirty: true
          })
        }}
        theme={emojiPickerTheme()}
        previewConfig = {{ showPreview: false }}
      />
    </div>
  )
}

export default EmojiPickerModal