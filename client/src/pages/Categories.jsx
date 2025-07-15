import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { 
  Search, 
  Filter, 
  Heart, 
  Brain, 
  Baby, 
  Bone, 
  Activity,
  Shield,
  Stethoscope,
  Eye,
  Pill,
  Users
} from 'lucide-react'
import { useCategories, usePosts } from '../hooks/useApi'
import { usePagination } from '../hooks/useApi'
import PostCard from '../components/PostCard'
import Pagination from '../components/Pagination'
import LoadingSpinner from '../components/LoadingSpinner'

const Categories = () => {
  const [selectedCategory, setSelectedCategory] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  
  const { page, limit, goToPage } = usePagination(1, 9)
  
  const { data: categoriesData, isLoading: categoriesLoading } = useCategories()
  const categories = categoriesData?.data || []
  
  const { data: postsData, isLoading: postsLoading } = usePosts({
    page,
    limit,
    search: searchTerm,
    category: selectedCategory,
    status: 'published',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  })

  const posts = postsData?.data?.docs || []
  const totalPages = postsData?.data?.totalPages || 1
  const totalPosts = postsData?.data?.totalDocs || 0

  // Icon mapping for categories
  const categoryIcons = {
    'cardiology': Heart,
    'neurology': Brain,
    'pediatrics': Baby,
    'orthopedics': Bone,
    'emergency': Activity,
    'general': Stethoscope,
    'mental-health': Shield,
    'ophthalmology': Eye,
    'pharmacy': Pill,
    'nursing': Users
  }

  const getCategoryIcon = (categoryName) => {
    const key = categoryName.toLowerCase().replace(/\s+/g, '-')
    return categoryIcons[key] || Stethoscope
  }

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId === selectedCategory ? '' : categoryId)
    goToPage(1)
  }

  const clearFilters = () => {
    setSelectedCategory('')
    setSearchTerm('')
    goToPage(1)
  }

  const selectedCategoryData = categories.find(cat => cat._id === selectedCategory)

  return (
    <>
      <Helmet>
        <title>Medical Topics - MedCare Hospital</title>
        <meta name="description" content="Browse medical articles by specialty and health topics at MedCare Hospital" />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Medical Topics</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Explore our comprehensive collection of medical articles organized by specialty and health topics
          </p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="max-w-md mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search medical topics..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10 w-full"
              />
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        {categoriesLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
            {categories.map((category) => {
              const IconComponent = getCategoryIcon(category.name)
              const isSelected = selectedCategory === category._id
              
              return (
                <button
                  key={category._id}
                  onClick={() => handleCategorySelect(category._id)}
                  className={`p-6 rounded-lg border-2 transition-all duration-200 text-left hover:shadow-md ${
                    isSelected
                      ? 'border-primary-500 bg-primary-50 shadow-md'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <div 
                      className={`p-2 rounded-lg ${
                        isSelected ? 'bg-primary-100' : 'bg-gray-100'
                      }`}
                      style={{ 
                        backgroundColor: isSelected ? `${category.color}20` : undefined,
                        color: isSelected ? category.color : undefined
                      }}
                    >
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <h3 className={`font-semibold ${
                      isSelected ? 'text-primary-900' : 'text-gray-900'
                    }`}>
                      {category.name}
                    </h3>
                  </div>
                  
                  {category.description && (
                    <p className={`text-sm ${
                      isSelected ? 'text-primary-700' : 'text-gray-600'
                    }`}>
                      {category.description}
                    </p>
                  )}
                </button>
              )
            })}
          </div>
        )}

        {/* Active Filters */}
        {(selectedCategory || searchTerm) && (
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-700">Active filters:</span>
                
                {selectedCategoryData && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800">
                    {selectedCategoryData.name}
                    <button
                      onClick={() => setSelectedCategory('')}
                      className="ml-2 text-primary-600 hover:text-primary-800"
                    >
                      ×
                    </button>
                  </span>
                )}
                
                {searchTerm && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800">
                    "{searchTerm}"
                    <button
                      onClick={() => setSearchTerm('')}
                      className="ml-2 text-gray-600 hover:text-gray-800"
                    >
                      ×
                    </button>
                  </span>
                )}
              </div>
              
              <button
                onClick={clearFilters}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Clear all filters
              </button>
            </div>
          </div>
        )}

        {/* Results */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {selectedCategoryData ? `${selectedCategoryData.name} Articles` : 'All Articles'}
          </h2>
          <p className="text-gray-600">
            {totalPosts > 0 ? (
              <>
                Found <span className="font-semibold">{totalPosts}</span> article{totalPosts !== 1 ? 's' : ''}
                {searchTerm && (
                  <> matching "<span className="font-semibold">{searchTerm}</span>"</>
                )}
                {selectedCategoryData && (
                  <> in <span className="font-semibold">{selectedCategoryData.name}</span></>
                )}
              </>
            ) : (
              'No articles found'
            )}
          </p>
        </div>

        {/* Posts Grid */}
        {postsLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : posts.length > 0 ? (
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
        ) : (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="bg-gray-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No articles found</h3>
              <p className="text-gray-500 mb-4">
                {selectedCategory || searchTerm
                  ? 'Try adjusting your filters or search terms.'
                  : 'No articles are available at the moment.'
                }
              </p>
              {(selectedCategory || searchTerm) && (
                <button onClick={clearFilters} className="btn-primary">
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        )}

        {/* Medical Disclaimer */}
        <div className="mt-12 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <Shield className="h-6 w-6 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-medium text-yellow-800 mb-2">Medical Disclaimer</h3>
              <p className="text-yellow-700">
                The information provided in these articles is for educational purposes only and should not be used as a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Categories