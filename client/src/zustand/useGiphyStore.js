import { create } from 'zustand'
import { GiphyFetch } from '@giphy/js-fetch-api'
import { devtools } from 'zustand/middleware'

const giphyKey = import.meta.env.VITE_GIPHY_API_KEY
const gf = new GiphyFetch(giphyKey)

export const useGiphyStore = create(devtools(
  set => ({
    searchKey: '',

    setSearchKey: (key) => set({ searchKey: key }),

    fetchGifs: (offset) => gf.search('dogs', { offset, limit: 10 })
  }),
  {
    name: 'giphy-storage'
  }
))