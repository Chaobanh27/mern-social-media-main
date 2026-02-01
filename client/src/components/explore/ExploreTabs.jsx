const tabs = ['All', 'Posts', 'Videos', 'Users', 'Tags']

const ExploreTabs = () => {
  return (
    <div className="flex gap-2 overflow-x-auto mt-4">
      {tabs.map(tab => (
        <button
          key={tab}
          className="
            px-4 py-1.5  rounded-full text-sm
            bg-bg-alt hover:bg-bg
            whitespace-nowrap
          "
        >
          {tab}
        </button>
      ))}
    </div>
  )
}

export default ExploreTabs
