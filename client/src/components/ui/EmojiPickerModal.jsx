import EmojiPicker from 'emoji-picker-react'
import { useThemeStore } from '~/zustand/useThemeStore'

const EmojiPickerModal = ({ getValues, setValue, onReactionClick, type }) => {
  const currentTheme = useThemeStore(s => s.theme)

  const myCustomReactions = [
    '1f44d',
    '2764-fe0f',
    '1f602',
    '1f62e',
    '1f622',
    '1f621'
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
        theme={emojiPickerTheme()}
        previewConfig = {{ showPreview: false }}
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

      />
    </div>
  )
}

export default EmojiPickerModal