import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useForm } from 'react-hook-form'
import { 
  Save, 
  Eye, 
  Upload, 
  X, 
  AlertTriangle,
  FileText,
  Image as ImageIcon
} from 'lucide-react'
import { useCreatePost, useCategories } from '../hooks/useApi'
import { uploadAPI } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import toast from 'react-hot-toast'

const CreatePost = () => {
  const navigate = useNavigate()
  const [isUploading, setIsUploading] = useState(false)
  const [featuredImage, setFeaturedImage] = useState('')
  const [previewMode, setPreviewMode] = useState(false)

  const { data: categoriesData } = useCategories()
  const categories = categoriesData?.data || []
  const createPostMutation = useCreatePost()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm({
    defaultValues: {
      status: 'draft',
      isCommentEnabled: true,
      medicalDisclaimer: true,
      department: 'general'
    }
  })

  const watchedContent = watch('content')
  const watchedTitle = watch('title')

  const handleImageUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB')
      return
    }

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('image', file)

      const response = await uploadAPI.uploadImage(formData)
      setFeaturedImage(response.data.url)
      setValue('featuredImage', response.data.url)
      toast.success('Image uploaded successfully!')
    } catch (error) {
      toast.error('Failed to upload image')
      console.error('Upload error:', error)
    } finally {
      setIsUploading(false)
    }
  }

  const removeImage = () => {
    setFeaturedImage('')
    setValue('featuredImage', '')
  }

  const onSubmit = async (data) => {
    try {
      // Process tags
      if (data.tags) {
        data.tags = data.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      }

      // Calculate reading time (rough estimate: 200 words per minute)
      const wordCount = data.content.replace(/<[^>]*>/g, '').split(/\s+/).length
      data.readingTime = Math.max(1, Math.ceil(wordCount / 200))

      const result = await createPostMutation.mutateAsync(data)
      
      if (data.status === 'published') {
        navigate(`/posts/${result.post.slug}`)
      } else {
        navigate('/dashboard')
      }
    } catch (error) {
      console.error('Create post error:', error)
    }
  }

  const departments = [
    { value: 'general', label: 'General Health' },
    { value: 'cardiology', label: 'Cardiology' },
    { value: 'neurology', label: 'Neurology' },
    { value: 'pediatrics', label: 'Pediatrics' },
    { value: 'orthopedics', label: 'Orthopedics' },
    { value: 'oncology', label: 'Oncology' },
    { value: 'emergency', label: 'Emergency Medicine' },
    { value: 'surgery', label: 'Surgery' },
    { value: 'radiology', label: 'Radiology' },
    { value: 'pathology', label: 'Pathology' }
  ]

  return (
    <>
      <Helmet>
        <title>Create New Article - MedCare Hospital</title>
        <meta name="description" content="Create a new medical article for MedCare Hospital blog" />
      </Helmet>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Medical Article</h1>
          <p className="text-gray-600">
            Share your medical knowledge and expertise with our community
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Article Title *
                </label>
                <input
                  {...register('title', { 
                    required: 'Title is required',
                    maxLength: { value: 200, message: 'Title must be less than 200 characters' }
                  })}
                  type="text"
                  className={`input w-full ${errors.title ? 'border-red-300' : ''}`}
                  placeholder="Enter a compelling title for your medical article"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                )}
              </div>

              {/* Excerpt */}
              <div>
                <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-2">
                  Article Summary
                </label>
                <textarea
                  {...register('excerpt', {
                    maxLength: { value: 300, message: 'Summary must be less than 300 characters' }
                  })}
                  rows={3}
                  className={`textarea w-full ${errors.excerpt ? 'border-red-300' : ''}`}
                  placeholder="Brief summary of your article (optional - will be auto-generated if left empty)"
                />
                {errors.excerpt && (
                  <p className="mt-1 text-sm text-red-600">{errors.excerpt.message}</p>
                )}
              </div>

              {/* Featured Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Featured Image
                </label>
                
                {featuredImage ? (
                  <div className="relative">
                    <img
                      src={featuredImage}
                      alt="Featured"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <div className="space-y-2">
                      <label htmlFor="image-upload" className="cursor-pointer">
                        <span className="btn-primary inline-flex items-center">
                          {isUploading ? (
                            <LoadingSpinner size="sm" />
                          ) : (
                            <>
                              <Upload className="h-4 w-4 mr-2" />
                              Upload Image
                            </>
                          )}
                        </span>
                        <input
                          id="image-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          disabled={isUploading}
                        />
                      </label>
                      <p className="text-sm text-gray-500">PNG, JPG up to 5MB</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Content */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                    Article Content *
                  </label>
                  <button
                    type="button"
                    onClick={() => setPreviewMode(!previewMode)}
                    className="btn-outline text-sm"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    {previewMode ? 'Edit' : 'Preview'}
                  </button>
                </div>

                {previewMode ? (
                  <div className="min-h-[400px] p-4 border border-gray-300 rounded-md bg-gray-50">
                    <h2 className="text-2xl font-bold mb-4">{watchedTitle || 'Article Title'}</h2>
                    <div 
                      className="prose max-w-none"
                      dangerouslySetInnerHTML={{ __html: watchedContent || '<p>Start writing your article content...</p>' }}
                    />
                  </div>
                ) : (
                  <textarea
                    {...register('content', { required: 'Content is required' })}
                    rows={20}
                    className={`textarea w-full font-mono text-sm ${errors.content ? 'border-red-300' : ''}`}
                    placeholder="Write your medical article content here. You can use HTML tags for formatting."
                  />
                )}
                
                {errors.content && (
                  <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
                )}
                
                <p className="mt-2 text-sm text-gray-500">
                  You can use HTML tags for formatting. Be sure to include accurate medical information and cite sources when appropriate.
                </p>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Medical Disclaimer */}
              <div className="card">
                <div className="card-body">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <label className="flex items-center space-x-2">
                        <input
                          {...register('medicalDisclaimer')}
                          type="checkbox"
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-sm font-medium text-gray-700">
                          Include medical disclaimer
                        </span>
                      </label>
                      <p className="text-xs text-gray-500 mt-1">
                        Recommended for all medical content
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Publishing Options */}
              <div className="card">
                <div className="card-header">
                  <h3 className="text-lg font-medium text-gray-900">Publishing</h3>
                </div>
                <div className="card-body space-y-4">
                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      {...register('status')}
                      className="input w-full"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                    </select>
                  </div>

                  <div>
                    <label className="flex items-center space-x-2">
                      <input
                        {...register('isCommentEnabled')}
                        type="checkbox"
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700">Enable comments</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Department */}
              <div className="card">
                <div className="card-header">
                  <h3 className="text-lg font-medium text-gray-900">Department</h3>
                </div>
                <div className="card-body">
                  <select
                    {...register('department')}
                    className="input w-full"
                  >
                    {departments.map((dept) => (
                      <option key={dept.value} value={dept.value}>
                        {dept.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Categories */}
              <div className="card">
                <div className="card-header">
                  <h3 className="text-lg font-medium text-gray-900">Categories</h3>
                </div>
                <div className="card-body">
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {categories.map((category) => (
                      <label key={category._id} className="flex items-center space-x-2">
                        <input
                          {...register('categories')}
                          type="checkbox"
                          value={category._id}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-700">{category.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="card">
                <div className="card-header">
                  <h3 className="text-lg font-medium text-gray-900">Tags</h3>
                </div>
                <div className="card-body">
                  <input
                    {...register('tags')}
                    type="text"
                    className="input w-full"
                    placeholder="health, wellness, cardiology"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Separate tags with commas
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={createPostMutation.isLoading}
                  className="w-full btn-primary flex items-center justify-center"
                >
                  {createPostMutation.isLoading ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Create Article
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="w-full btn-outline"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </>
  )
}

export default CreatePost