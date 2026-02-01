import Select from 'react-select'
import { useController } from 'react-hook-form'

const RHFSelect = ({ name, placeholder, control, rules, label, options = [], isClearable = true, isMulti = false, ...props }) => {

  const { field: { value, onChange, ref }, fieldState: { error } } = useController({ name, control, rules })

  // map form value → react-select value
  const selectedOption = isMulti
    ? options.filter(opt => value?.includes(opt.value))
    : options.find(opt => opt.value === value) || null

  return (
    <div className="space-y-1">
      {label && (
        <label className="text-sm font-medium">{label}</label>
      )}

      <Select
        inputRef={ref}
        placeholder={placeholder}
        options={options}
        value={selectedOption}
        isMulti={isMulti}
        isClearable={isClearable}
        onChange={option => {
          if (isMulti) {
            onChange(option ? option.map(o => o.value) : [])
          } else {
            onChange(option ? option.value : '')
          }
        }}
        classNamePrefix="react-select"
        {...props}
      />

      {error && (
        <p className="text-xs text-red-500">{error.message}</p>
      )}
    </div>
  )
}

export default RHFSelect
