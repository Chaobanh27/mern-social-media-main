import Select from 'react-select'
import { useController } from 'react-hook-form'
import { useMemo } from 'react'

const RHFSelect = ({
  name,
  placeholder,
  control,
  rules,
  label,
  options = [],
  isClearable = true,
  isMulti = false,
  ...props
}) => {
  const {
    field: { value, onChange, ref },
    fieldState: { error }
  } = useController({ name, control, rules })

  // Tối ưu 1: Dùng useMemo để tránh tính toán lại mảng option liên tục
  const selectedOption = useMemo(() => {
    if (!value) return isMulti ? [] : null

    if (isMulti) {
      // Đảm bảo value luôn là mảng trước khi filter
      const valueArray = Array.isArray(value) ? value : [value]
      return options.filter(opt => valueArray.includes(opt.value))
    }

    return options.find(opt => opt.value === value) || null
  }, [value, options, isMulti])

  return (
    <div className="space-y-1">
      {label && (
        <label className="text-sm font-medium text-gray-700">{label}</label>
      )}

      <Select
        // Tối ưu 2: Gắn ref chuẩn để RHF focus được khi validate lỗi
        ref={ref}
        placeholder={placeholder}
        options={options}
        value={selectedOption}
        isMulti={isMulti}
        isClearable={isClearable}
        // Tối ưu 3: Style nhất quán (tùy chọn)
        classNamePrefix="react-select"
        onChange={option => {
          if (isMulti) {
            // Chuyển mảng object của react-select thành mảng giá trị phẳng
            onChange(option ? option.map(o => o.value) : [])
          } else {
            // Trả về value đơn lẻ
            onChange(option ? option.value : '')
          }
        }}
        // Truyền các props còn lại (menuPlacement, styles, vv.)
        {...props}
      />

      {error && (
        <p className="text-xs text-red-500 font-medium">{error.message}</p>
      )}
    </div>
  )
}

export default RHFSelect