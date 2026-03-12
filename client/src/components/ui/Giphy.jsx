import {
  Grid,
  SearchBar,
  SearchContext,
  SearchContextManager,
  SuggestionBar
} from '@giphy/react-components'
import { useContext, useEffect, useRef, useState } from 'react'

const SearchExperience = ({ onSelect }) => (
  <SearchContextManager apiKey={import.meta.env.VITE_GIPHY_API_KEY}>
    <Giphy onSelect = {onSelect} />
  </SearchContextManager>
)

const Giphy = ({ onSelect }) => {
  const containerRef = useRef(null)
  const [width, setWidth] = useState(0)
  const { fetchGifs, searchKey } = useContext(SearchContext)

  useEffect(() => {
    // 1. Tạo ResizeObserver để theo dõi thay đổi kích thước của div container
    const observer = new ResizeObserver((entries) => {
      if (entries[0]) {
        setWidth(entries[0].contentRect.width)
      }
    })

    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    // Dọn dẹp khi unmount
    return () => observer.disconnect()
  }, [])

  const handleGifClick = (gif, e) => {
    e.preventDefault()
    onSelect(gif)
  }


  return (
    <>
      <div className='mb-3'>
        <SearchBar />
      </div>
      <div className='mb-3'>
        <SuggestionBar />
      </div>
      <div ref={containerRef} className='w-full h-100 overflow-y-scroll'>
        {width > 0 && (
          <Grid
            onGifClick={handleGifClick}
            key={searchKey}
            width={width}
            columns={width < 500 ? 2 : 3}
            gutter={5}
            fetchGifs={fetchGifs}
          />

        )}
      </div>
    </>

  )
}

export default SearchExperience