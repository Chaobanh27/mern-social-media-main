const PostHeader = () => {
  return (
    <div className="flex items-center justify-between p-3">
      <div className="flex items-center gap-3">
        <img src="https://picsum.photos/200/300" alt="" className="w-10 h-10 rounded-full" />
        <div>
          <p className="text-sm font-semibold">Nguyen Van A</p>
          <p className="text-xs text-gray-500">2 hours ago · Public</p>
        </div>
      </div>
      <button className="text-gray-500">•••</button>
    </div>
  )
}

export default PostHeader
