import _ from 'lodash'
import { useEffect, useState } from 'react'

const LeaveConfirmation = ({ data }) => {
  const [currentData] = useState(data)

  const hasChanges = !_.isEqual(data, currentData)

  useEffect(() => {
    if (!hasChanges) return

    const handleBeforeUnload = e => {
      e.preventDefault()
      e.returnValue = ''
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [hasChanges])


  return (
    <>
    </>
  )
}

export default LeaveConfirmation