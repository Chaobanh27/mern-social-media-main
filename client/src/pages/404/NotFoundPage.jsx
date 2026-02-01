import { Link } from 'react-router-dom'

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <h1 className="text-9xl font-extrabold text-gray-300 dark:text-red-600 mb-6">404</h1>
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
        Oops! Page Not Found
      </h2>
      <p className="text-gray-600 dark:text-gray-300 mb-6 text-center max-w-md">
        The page you are looking for does not exist or has been moved.
        Try returning to the homepage.
      </p>
      <Link
        to="/"
        className="px-6 py-3 bg-gray-300  text-black rounded-lg font-medium hover:bg-blue hover:text-white transition"
      >
        Go to Homepage
      </Link>
    </div>
  )
}

export default NotFoundPage
