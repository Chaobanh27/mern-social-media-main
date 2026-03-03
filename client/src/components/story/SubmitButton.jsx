import { useWatch } from 'react-hook-form'
import LeaveConfirmation from '../ui/LeaveConfirmation'

// Component con cô lập logic Watch
const SubmitButton = ({ control, createStoryMutation, file }) => {
  const content = useWatch({ control, name: 'content', defaultValue: '' })

  return (
    <>
      <LeaveConfirmation data = {{ content: content, files: file }} />
      <button
        type="submit"
        disabled={createStoryMutation?.isPending}
        className="btn-primary mt-4"
      >
        {createStoryMutation?.isPending ? 'UPLOADING...' : 'SUBMIT'}
      </button>
    </>

  )
}

export default SubmitButton