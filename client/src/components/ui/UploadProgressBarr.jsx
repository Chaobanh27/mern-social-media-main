
const UploadProgressBar = ({
  progressRef,
  sizeRef,
  totalRef,
  percentRef,
  cancelUpload
  // etaRef
}) => {
  return (
    <div className="fixed w-full inset-0 z-50 flex flex-col items-center justify-center bg-black/80">
      <div>
        {/* Progress bar */}
        <div className="h-2 w-100 md:w-2xl bg-primary rounded overflow-hidden ">
          <div
            ref={progressRef}
            className="h-2 bg-accent rounded transition-all duration-300"
            style={{ width: '0%' }}
          />
        </div>

        {/* Info row */}
        <div className="flex mt-4 justify-between text-xs text-primary">
          <div>
            <span ref={sizeRef}>0 MB</span>
            {' / '}
            <span ref={totalRef}>0 MB</span>
          </div>

          <div className="flex gap-3">
            <span ref={percentRef}>0 %</span>
            {/* <span ref={etaRef}>--:--</span> */}
            <button onClick={cancelUpload}>Cancel</button>
          </div>
        </div>
      </div>

    </div>
  )
}

export default UploadProgressBar
