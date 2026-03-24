import { ArrowLeft } from 'lucide-react'
import Modal from '../ui/Modal'
import { Controller, useForm } from 'react-hook-form'
import AsyncSelect from 'react-select/async'
import { useCreateGroupConversation, useGetUsers } from '~/hooks/TanstackQuery'

const CreateGroupModal = ({ showModal, onClose }) => {
  const { control, handleSubmit } = useForm()
  const { data, isLoading } = useGetUsers()
  const createGroup = useCreateGroupConversation()

  const fetchUsers = async (inputValue) => {
    await new Promise(resolve => setTimeout(resolve, 1000))
    const users = data.map(u => ({
      value: u._id,
      label: u.username
    }) )
    return users.filter(u => u.label.toLowerCase().includes(inputValue.toLowerCase()))
  }

  const onSubmit = (data) => {
    const arr = data?.users.map(u => u.value)
    createGroup.mutate({ userIds: arr }, {
      onSuccess: () => {
        showModal(false)
      }
    })
  }

  return (
    <Modal
      showModal={showModal}
      onClose={onClose}
      className="w-full max-w-lg shadow-xl"
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-sm:h-screen shadow-xl bg-bg-alt"
      >
        <div className="text-center flex items-center justify-between">
          <button
            type='button'
            onClick={onClose}
            className="p-2 cursor-pointer"
          >
            <ArrowLeft />
          </button>
          <h2 className="text-lg font-semibold">Create Group</h2>
          <span className="w-10"></span>
        </div>

        <div className='p-4 space-y-4 '>
          <Controller
            name = 'users'
            control={control}
            rules={{ required: 'Vui lòng chọn ít nhất 1 user'}}
            render={({ field, fieldState: { error } }) => (
              <>
                <AsyncSelect
                  {...field} // Chứa onChange, onBlur, value, ref
                  isMulti
                  cacheOptions
                  defaultOptions = {data?.map(u => ({
                    value: u._id,
                    label: u.username
                  }) )}
                  loadOptions={fetchUsers}
                  isLoading={isLoading}
                  placeholder="Searching..."
                  className='text-black'
                />
                {error && <span style={{ color: 'red' }}>{error.message}</span>}
              </>
            )}
          />

          <button type="submit" className='btn-primary'>Gửi</button>

        </div>

      </form>
    </Modal>
  )
}

export default CreateGroupModal