import ExploreItem from './ExploreItem'

const ExploreGrid = () => {
  return (
    <div
      className="
        mt-4
        columns-2
        sm:columns-3
        md:columns-4
        lg:columns-5
        gap-3
      "
    >
      {[...Array(20)].map((_, i) => (
        <ExploreItem key={i} />
      ))}
    </div>
  )
}

export default ExploreGrid
