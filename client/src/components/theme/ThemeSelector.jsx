import Select, { components } from 'react-select'
import { Sun, Moon, Monitor } from 'lucide-react'
import { useThemeStore } from '~/zustand/themeStore'

const options = [
  {
    value: 'light',
    icon: <Sun className="w-4 h-4 text-yellow-500" />
  },
  {
    value: 'dark',
    icon: <Moon className="w-4 h-4 text-blue-500" />
  },
  {
    value: 'system',
    icon: <Monitor className="w-4 h-4 text-gray-500" />
  }
]

/* value đang chọn – chỉ icon */
const SingleValue = (props) => (
  <components.SingleValue {...props}>
    <div className="flex justify-center">{props.data.icon}</div>
  </components.SingleValue>
)

/* dropdown option – chỉ icon */
const Option = (props) => (
  <components.Option {...props}>
    <div className="flex justify-center">{props.data.icon}</div>
  </components.Option>
)

const ThemeSelector = () => {
  const theme = useThemeStore(s => s.theme)
  const setTheme = useThemeStore(s => s.setTheme)

  return (
    <Select
      value={options.find((o) => o.value === theme)}
      options={options}
      onChange={(opt) => setTheme(opt.value)}
      isSearchable={false}
      menuPlacement="auto"
      components={{
        Option,
        SingleValue,
        IndicatorSeparator: () => null
      }}
      className="w-14"
      styles={{
        control: (base, state) => ({
          ...base,
          minHeight: 40,
          borderRadius: 9999,
          cursor: 'pointer',
          backgroundColor: 'var(--tw-bg-opacity)',
          boxShadow: state.isFocused
            ? '0 0 0 2px rgba(0,0,0,0.15)'
            : 'none'
        }),
        valueContainer: (base) => ({
          ...base,
          padding: 0,
          justifyContent: 'center'
        }),
        singleValue: (base) => ({
          ...base,
          margin: 0
        }),
        dropdownIndicator: (base) => ({
          ...base,
          padding: 6
        }),
        menu: (base) => ({
          ...base,
          borderRadius: 16,
          width: 56
        }),
        option: (base, state) => ({
          ...base,
          display: 'flex',
          justifyContent: 'center',
          padding: 10,
          backgroundColor: state.isFocused
            ? 'rgba(0,0,0,0.05)'
            : 'transparent',
          cursor: 'pointer'
        })
      }}
    />
  )
}

export default ThemeSelector
