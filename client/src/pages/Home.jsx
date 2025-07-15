import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Search, Filter, TrendingUp, Heart, Stethoscope, Activity } from 'lucide-react'
import { usePosts, useCategories } from '../hooks/useApi'
import { usePagination } from '../hooks/useApi'
import PostCard from '../components/PostCard'
import Pagination from '../components/Pagination'
import LoadingSpinner from '../components/LoadingSpinner'

const Home = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState('desc')
  
  const { page, limit, goToPage } = usePagination(1, 9)
  
  const { data: categoriesData } = useCategories()
  const categories = categoriesData?.data || []
  
  const { data: postsData, isLoading, error } = usePosts({
    page,
    limit,
    search: searchTerm,
    category: selectedCategory,
    sortBy,
    sortOrder,
    status: 'published'
  })

  const posts = postsData?.data?.docs || []
  const totalPages = postsData?.data?.totalPages || 1
  const totalPosts = postsData?.data?.totalDocs || 0

  const handleSearch = (e) => {
    e.preventDefault()
    // Search is handled by the query automatically due to dependency
  }

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedCategory('')
    setSortBy('createdAt')
    setSortOrder('desc')
    goToPage(1)
  }

  return (
    <>
      <Helmet>
        <title>MedCare Hospital - Health & Medical Blog</title>
        <meta name="description" content="Stay informed with the latest health tips, medical news, and expert advice from MedCare Hospital's medical professionals." />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12 bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-8">
          <div className="flex justify-center mb-4">
            <div className="flex items-center space-x-2">
              <Heart className="h-12 w-12 text-red-500" />
              <Stethoscope className="h-12 w-12 text-green-600" />
              <Activity className="h-12 w-12 text-blue-500" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Welcome to <span className="text-green-600">MedCare Hospital</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Your trusted source for health information, medical insights, and wellness tips from our team of experienced healthcare professionals.
          </p>
          <div className="mt-6 text-sm text-gray-500 bg-yellow-50 border border-yellow-200 rounded-lg p-3 max-w-2xl mx-auto">
            <strong>Medical Disclaimer:</strong> The information provided on this blog is for educational purposes only and should not replace professional medical advice.
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input pl-10 w-full"
                />
              </div>
            </form>

            {/* Category Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="input min-w-[150px]"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Options */}
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-gray-400" />
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-')
                  setSortBy(field)
                  setSortOrder(order)
                }}
                className="input min-w-[150px]"
              >
                <option value="createdAt-desc">Latest First</option>
                <option value="createdAt-asc">Oldest First</option>
                <option value="views-desc">Most Viewed</option>
                <option value="likes-desc">Most Liked</option>
                <option value="title-asc">Title A-Z</option>
              </select>
            </div>

            {/* Clear Filters */}
            {(searchTerm || selectedCategory || sortBy !== 'createdAt' || sortOrder !== 'desc') && (
              <button
                onClick={clearFilters}
                className="btn-outline whitespace-nowrap"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Results Info */}
        {!isLoading && (
          <div className="mb-6">
            <p className="text-gray-600">
              {totalPosts > 0 ? (
                <>
                  Found <span className="font-semibold">{totalPosts}</span> article{totalPosts !== 1 ? 's' : ''}
                  {searchTerm && (
                    <> for "<span className="font-semibold">{searchTerm}</span>"</>
                  )}
                  {selectedCategory && (
                    <> in <span className="font-semibold">
                      {categories.find(c => c._id === selectedCategory)?.name}
                    </span></>
                  )}
                </>
              ) : (
                'No articles found'
              )}
            </p>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
              <p className="text-red-600">
                Failed to load articles. Please try again later.
              </p>
            </div>
          </div>
        )}

        {/* Posts Grid */}
        {!isLoading && !error && posts.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {posts.map((post) => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>

            {/* Pagination */}
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={goToPage}
              totalItems={totalPosts}
              itemsPerPage={limit}
            />
          </>
        )}

        {/* Empty State */}
        {!isLoading && !error && posts.length === 0 && (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="bg-gray-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No articles found</h3>
              <p className="text-gray-500 mb-4">
                Try adjusting your search terms or filters to find what you're looking for.
              </p>
              <button onClick={clearFilters} className="btn-primary">
                Clear All Filters
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default Home