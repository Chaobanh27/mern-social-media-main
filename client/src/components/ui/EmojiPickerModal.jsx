import EmojiPicker from 'emoji-picker-react'
import { useThemeStore } from '~/zustand/themeStore'

const EmojiPickerModal = ({ getValues, setValue, onReactionClick, type }) => {
  const currentTheme = useThemeStore(s => s.theme)

  const myCustomReactions = [
    '1f44d', // 👍 (Thumbs Up)
    '2764-fe0f', // ❤️ (Red Heart)
    '1f602', // 😂 (Laughing)
    '1f62e', // 😮 (Wow)
    '1f622', // 😢 (Sad)
    '1f621' // 😡 (angry)
  ]
  const emojiPickerTheme = () => {
    if (currentTheme == 'light') return 'light'
    else if (currentTheme == 'dark') return 'dark'
    else return 'auto'
  }
  return (
    <div className='w-full px-3 '>
      <EmojiPicker
        width={'100%'}
        reactionsDefaultOpen={type === 'reaction' ? true : false}
        allowExpandReactions = {type === 'reaction' ? false : true}
        reactions={type === 'reaction' ? myCustomReactions : null}
        onReactionClick={onReactionClick}
        height={380}
        autoFocusSearch={false}
        onEmojiClick={item => {
          if (type === 'post') {
            const content = getValues('content') || ''
            setValue('content', content + item.emoji, {
              shouldValidate: true,
              shouldDirty: true
            })
          }
          else if (type === 'comment') {
            //
          }

        }}
        theme={emojiPickerTheme()}
        previewConfig = {{ showPreview: false }}
      />
    </div>
  )
}

export default EmojiPickerModal