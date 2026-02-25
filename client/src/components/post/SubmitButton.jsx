import { useWatch } from 'react-hook-form'
import LeaveConfirmation from '../ui/LeaveConfirmation'

// Component con cô lập logic Watch
const SubmitButton = ({ control, createPostMutation, files={ files }, filesCount, uploading }) => {
  const content = useWatch({ control, name: 'content', defaultValue: '' })

  // Logic: Disable nếu cả content và files đều trống, hoặc đang upload
  // const isDisabled = !content.trim() && filesCount === 0 || uploading

  return (
    <>
      <LeaveConfirmation data = {{ content: content, files: files }} />
      <button
        type="submit"
        disabled={createPostMutation.isPending}
        className="btn-primary"
      >
        {createPostMutation.isPending ? 'UPLOADING...' : 'SUBMIT'}
      </button>
    </>

  )
}

export default SubmitButton