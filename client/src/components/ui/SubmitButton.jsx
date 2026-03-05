import { useWatch } from 'react-hook-form'
import LeaveConfirmation from '../ui/LeaveConfirmation'

const SubmitButton = ({ control, mutation, file }) => {
  const content = useWatch({ control, name: 'content', defaultValue: '' })

  return (
    <>
      <LeaveConfirmation data = {{ content: content, files: file }} />
      <button
        type="submit"
        disabled={mutation?.isPending}
        className="btn-primary mt-4"
      >
        {mutation?.isPending ? 'UPLOADING...' : 'SUBMIT'}
      </button>
    </>

  )
}

export default SubmitButton