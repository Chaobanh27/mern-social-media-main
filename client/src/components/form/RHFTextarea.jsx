import { useController } from 'react-hook-form'

const RHFTextarea = ({ name, control, rules, label, ...props }) => {
  const { field, fieldState: { error } } = useController({ name, control, rules })

  return (
    <div className="space-y-1">
      {label && <label className="text-sm font-medium">{label}</label>}

      <textarea {...field} {...props} />

      {error && <p className="text-xs text-red-500">{error.message}</p>}
    </div>
  )
}

export default RHFTextarea
