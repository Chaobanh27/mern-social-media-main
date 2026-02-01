import ExploreGrid from '~/components/explore/ExploreGrid'
import ExploreHeader from '~/components/explore/ExploreHeader'
import ExploreTabs from '~/components/explore/ExploreTabs'

const Explore = () => {
  return (
    <div className="w-full flex justify-center">
      <div className="w-full max-w-350 px-3 py-4">
        <ExploreHeader />
        <ExploreTabs />
        <ExploreGrid />
      </div>
    </div>
  )
}

export default Explore
