import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { formatDistanceToNow } from 'date-fns'
import {
  ArrowLeft,
  Eye,
  Heart,
  MessageCircle,
  Calendar,
  Clock,
  Edit3,
  Trash2,
  Share2,
  AlertTriangle
} from 'lucide-react'
import {
  usePost,
  usePostById,
  useDeletePost,
  useLikePost,
  useCommentsByPostID,
  useComments,
  useCreateComment
} from '../hooks/useApi'
import { useAuth } from '../contexts/AuthContext'
import { useForm } from 'react-hook-form'
import LoadingSpinner from '../components/LoadingSpinner'
import toast from 'react-hot-toast'

const PostDetail = () => {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()

  const [isLiked, setIsLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(0)

  const { data: postData } = usePost(slug)
  const { data: post, isLoading, error } = usePostById(postData?.data?._id)
  const { data: commentsData } = useComments(post?.data?._id)

  const deletePostMutation = useDeletePost()
  const likePostMutation = useLikePost()
  const createCommentMutation = useCreateComment()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm()

  const comments = commentsData?.data?.comments || []

  useEffect(() => {
    if (post) {
      setLikesCount(post.likes?.length || 0)
      setIsLiked(user ? post.likes?.includes(user._id) : false)
    }
  }, [post, user])

  const handleLike = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to like posts')
      return
    }

    try {
      const result = await likePostMutation.mutateAsync(post._id)
      setIsLiked(result.data.isLiked)
      setLikesCount(result.data.likesCount)
    } catch (err) {
      console.error('Like error:', err)
    }
  }

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this article?')) {
      try {
        await deletePostMutation.mutateAsync(post._id)
        navigate('/dashboard')
      } catch (err) {
        console.error('Delete error:', err)
      }
    }
  }

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: post.title,
          text: post.excerpt,
          url: window.location.href
        })
      } else {
        await navigator.clipboard.writeText(window.location.href)
        toast.success('Link copied to clipboard!')
      }
    } catch (err) {
      console.error('Share error:', err)
    }
  }

  const onSubmitComment = async (data) => {
    if (!isAuthenticated) {
      toast.error('Please login to comment')
      return
    }

    try {
      await createCommentMutation.mutateAsync({
        content: data.content,
        post: post?.data?._id
      })
      reset()
    } catch (err) {
      console.error('Comment error:', err)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Article Not Found</h1>
          <p className="text-gray-600 mb-6">
            The article you're looking for doesn't exist or has been removed.
          </p>
          <Link to="/" className="btn-primary">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  const canEdit =
    user &&
    post?.author &&
    (user._id === post.author._id || user.role === 'admin')

  return (
    <>
      {post.title && (
        <Helmet>
          <title>{post.title}</title>
          <meta name="description" content={post.excerpt || ''} />
        </Helmet>
      )}

      <article className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link to="/" className="inline-flex items-center text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Articles
          </Link>
        </div>

        {/* Medical Disclaimer */}
        {post.medicalDisclaimer && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3" />
              <div>
                <h4 className="text-sm font-medium text-yellow-800 mb-1">Medical Disclaimer</h4>
                <p className="text-sm text-yellow-700">
                  This information is for educational purposes only and should not replace professional medical advice.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <header className="mb-8">
          {/* Categories */}
          {post.categories?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {post.categories.map((category) => (
                <span
                  key={category._id}
                  className="badge badge-primary"
                  style={{ backgroundColor: `${category.color}20`, color: category.color }}
                >
                  {category.name}
                </span>
              ))}
            </div>
          )}

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{post.title}</h1>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 mb-6">
            <div className="flex items-center gap-2">
              <img
                src={
                  post?.author?.avatar?.trim()
                    ? post.author.avatar
                    : `https://ui-avatars.com/api/?name=${post?.author?.username || 'User'}&background=3b82f6&color=fff`
                }
                alt={post?.author?.username || 'User'}
                className="h-8 w-8 rounded-full"
              />
              <span className="font-medium text-gray-900">{post?.author?.username}</span>
            </div>

            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {post?.publishedAt && (
                <span>{formatDistanceToNow(new Date(post.publishedAt), { addSuffix: true })}</span>
              )}
            </div>

            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{post.readingTime} min read</span>
            </div>

            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              <span>{post.views} views</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between border-t border-b border-gray-200 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={handleLike}
                className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                  isLiked
                    ? 'bg-red-50 text-red-600 hover:bg-red-100'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                <span>{likesCount}</span>
              </button>

              <div className="flex items-center gap-2 text-gray-600">
                <MessageCircle className="h-4 w-4" />
                <span>{comments.length} comments</span>
              </div>

              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-3 py-2 rounded-md bg-gray-50 text-gray-600 hover:bg-gray-100"
              >
                <Share2 className="h-4 w-4" />
                <span>Share</span>
              </button>
            </div>

            {canEdit && (
              <div className="flex items-center gap-2">
                <Link
                  to={`/edit-post/${post._id}`}
                  className="flex items-center gap-2 px-3 py-2 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100"
                >
                  <Edit3 className="h-4 w-4" />
                  <span>Edit</span>
                </Link>
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-2 px-3 py-2 rounded-md bg-red-50 text-red-600 hover:bg-red-100"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Featured Image */}
        {post.featuredImage && (
          <div className="mb-8">
            <img
              src={post.featuredImage}
              alt={post.title}
              className="w-full h-64 md:h-96 object-cover rounded-lg"
            />
          </div>
        )}

        {/* Content */}
        <div className="prose prose-lg max-w-none mb-12">
          <div dangerouslySetInnerHTML={{ __html: post.content }} />
        </div>

        {/* Tags */}
        {post.tags?.length > 0 && (
          <div className="mb-8">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Tags:</h3>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Comments */}
        <section className="border-t border-gray-200 pt-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">
            Comments ({comments.length})
          </h3>

          {isAuthenticated ? (
            <form onSubmit={handleSubmit(onSubmitComment)} className="mb-8">
              <div className="mb-4">
                <textarea
                  {...register('content', { required: 'Comment is required' })}
                  rows={4}
                  className="textarea w-full"
                  placeholder="Share your thoughts..."
                />
                {errors.content && (
                  <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
                )}
              </div>
              <button
                type="submit"
                disabled={createCommentMutation.isLoading}
                className="btn-primary"
              >
                {createCommentMutation.isLoading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  'Post Comment'
                )}
              </button>
            </form>
          ) : (
            <div className="mb-8 p-4 bg-gray-50 rounded-lg text-center">
              <p className="text-gray-600 mb-3">Please log in to leave a comment</p>
              <Link to="/login" className="btn-primary">
                Login to Comment
              </Link>
            </div>
          )}

          {/* Comments List */}
          <div className="space-y-6">
            {comments.map((comment) => (
              <div key={comment._id} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <img
                    src={
                      comment.author.avatar ||
                      `https://ui-avatars.com/api/?name=${comment.author.username}&background=3b82f6&color=fff`
                    }
                    alt={comment.author.username}
                    className="h-8 w-8 rounded-full"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="font-medium text-gray-900">{comment.author.username}</span>
                      <span className="text-sm text-gray-500">
                        {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-gray-700">{comment.content}</p>

                    {/* Replies */}
                    {comment.replies?.length > 0 && (
                      <div className="mt-4 ml-6 space-y-4">
                        {comment.replies.map((reply) => (
                          <div
                            key={reply._id}
                            className="flex items-start space-x-2 bg-white rounded-md p-2"
                          >
                            <img
                              src={
                                reply.author.avatar ||
                                `https://ui-avatars.com/api/?name=${reply.author.username}&background=gray&color=fff`
                              }
                              alt={reply.author.username}
                              className="h-6 w-6 rounded-full"
                            />
                            <div>
                              <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <span className="font-medium">{reply.author.username}</span>
                                <span className="text-xs text-gray-400">
                                  {formatDistanceToNow(new Date(reply.createdAt), {
                                    addSuffix: true
                                  })}
                                </span>
                              </div>
                              <p className="text-sm text-gray-700">{reply.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {comments.length === 0 && (
              <div className="text-center py-8">
                <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No comments yet. Be the first to comment!</p>
              </div>
            )}
          </div>
        </section>
      </article>
    </>
  )
}

export default PostDetail
