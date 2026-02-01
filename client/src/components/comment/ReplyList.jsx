import ReplyItem from './ReplyItem'

const ReplyList = () => {
  return (
    <div className="mt-3 space-y-3 pl-6 ">
      {[...Array(2)].map((_, i) => (
        <ReplyItem key={i}/>
      ))}
    </div>
  )
}

export default ReplyList
