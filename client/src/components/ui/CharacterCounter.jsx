import { useWatch } from 'react-hook-form'


function CharacterCounter({ control }) {
  const content = useWatch({
    control,
    name: 'content',
    defaultValue: ''
  })
  return <p>Số ký tự: {content.length}</p>
}

export default CharacterCounter
