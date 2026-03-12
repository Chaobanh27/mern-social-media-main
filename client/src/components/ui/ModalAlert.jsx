const ModalAlert = ({ open, onClose, onDelete, title, children }) => {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal content */}
      <div className="relative z-10 w-full max-w-md rounded-lg bg-white dark:bg-gray-900 p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <div>{children}</div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-md px-4 py-2 text-sm text-black bg-gray-200 hover:bg-gray-300 cursor-pointer "
          >
            Cancel
          </button>
          <button
            onClick={onDelete}
            className="rounded-md px-4 py-2 text-sm bg-blue cursor-pointer text-white "
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  )
}

export default ModalAlert
