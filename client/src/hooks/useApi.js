import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { postsAPI, categoriesAPI, commentsAPI } from '../services/api'
import toast from 'react-hot-toast'
import { useParams } from 'react-router-dom'

// Posts hooks
export const usePosts = (params = {}) => {
  return useQuery(['posts', params], () => postsAPI.getPosts(params), {
    keepPreviousData: true,
  })
}

export const usePost = (slug) => {
  return useQuery(['post', slug], () => postsAPI.getPost(slug), {
    enabled: !!slug,
  })
}
export const usePostById = (id) => {
  return useQuery(['post', id], () => postsAPI.getPostById(id), {
  })
}
export const useCreatePost = () => {
  const queryClient = useQueryClient()
  
  return useMutation(postsAPI.createPost, {
    onSuccess: () => {
      queryClient.invalidateQueries('posts')
      toast.success('Post created successfully!')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create post')
    },
  })
}

export const useUpdatePost = () => {
  const queryClient = useQueryClient()
  
  return useMutation(
    ({ id, data }) => postsAPI.updatePost(id, data),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries('posts')
        queryClient.invalidateQueries(['post', variables.slug])
        toast.success('Post updated successfully!')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update post')
      },
    }
  )
}

export const useDeletePost = () => {
  const queryClient = useQueryClient()
  
  return useMutation(postsAPI.deletePost, {
    onSuccess: () => {
      queryClient.invalidateQueries('posts')
      toast.success('Post deleted successfully!')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete post')
    },
  })
}

export const useLikePost = () => {
  const queryClient = useQueryClient()
  
  return useMutation(postsAPI.likePost, {
    onSuccess: (data, postId) => {
      queryClient.invalidateQueries(['post'])
      queryClient.invalidateQueries('posts')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to like post')
    },
  })
}

// Categories hooks
export const useCategories = () => {
  return useQuery('categories', categoriesAPI.getCategories)
}

export const useCreateCategory = () => {
  const queryClient = useQueryClient()
  
  return useMutation(categoriesAPI.createCategory, {
    onSuccess: () => {
      queryClient.invalidateQueries('categories')
      toast.success('Category created successfully!')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create category')
    },
  })
}

// Comments hooks
export const useComments = (postId, params = {}) => {
  return useQuery(
    ['comments', postId, params],
    () => commentsAPI.getComments(postId, params),
    {
      enabled: !!postId,
    }
  )
}
export const useCommentsByPostID = (params = {}) => {
  const { id } = useParams()
  return useQuery(
    ['comments', id, params],
    () => commentsAPI.getCommentsByPostId(id, params),
    {
      enabled: !!id,
    }
  )
}

export const useCreateComment = () => {
  const queryClient = useQueryClient()
  
  return useMutation(commentsAPI.createComment, {
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['comments', variables.post])
      toast.success('Comment added successfully!')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to add comment')
    },
  })
}

export const useCreateCommentByPostId = () => {
  const queryClient = useQueryClient()

  return useMutation(
    ({ postId, commentData }) => commentsAPI.createCommentByPostId(postId, commentData),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['comments', variables.postId])
        toast.success('Comment added successfully!')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to add comment')
      },
    }
  )
}

export const useDeleteComment = () => {
  const queryClient = useQueryClient()
  
  return useMutation(commentsAPI.deleteComment, {
    onSuccess: () => {
      queryClient.invalidateQueries('comments')
      toast.success('Comment deleted successfully!')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete comment')
    },
  })
}

// Custom hook for optimistic updates
export const useOptimisticUpdate = (queryKey, updateFn) => {
  const queryClient = useQueryClient()
  
  const optimisticUpdate = (variables) => {
    queryClient.setQueryData(queryKey, (oldData) => {
      if (!oldData) return oldData
      return updateFn(oldData, variables)
    })
  }
  
  return optimisticUpdate
}

// Custom hook for pagination
export const usePagination = (initialPage = 1, initialLimit = 10) => {
  const [page, setPage] = useState(initialPage)
  const [limit, setLimit] = useState(initialLimit)
  
  const nextPage = () => setPage(prev => prev + 1)
  const prevPage = () => setPage(prev => Math.max(1, prev - 1))
  const goToPage = (pageNumber) => setPage(pageNumber)
  const changeLimit = (newLimit) => {
    setLimit(newLimit)
    setPage(1) // Reset to first page when changing limit
  }
  
  return {
    page,
    limit,
    nextPage,
    prevPage,
    goToPage,
    changeLimit,
    setPage,
    setLimit
  }
}