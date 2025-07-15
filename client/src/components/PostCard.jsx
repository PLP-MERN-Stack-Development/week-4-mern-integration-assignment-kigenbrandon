import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Eye, Heart, MessageCircle, Calendar, User, Shield } from 'lucide-react';

const PostCard = ({ post, showAuthor = true }) => {
  if (!post) return null;

  const {
    slug,
    title,
    excerpt,
    featuredImage,
    author,
    categories = [],
    createdAt,
    views = 0,
    likes = [],
    status,
    medicalDisclaimer
  } = post;

  return (
    <article className="card hover:shadow-md transition-shadow duration-200 animate-fade-in">
      {/* Featured Image */}
      {featuredImage && (
        <div className="aspect-w-16 aspect-h-9 rounded-t-lg overflow-hidden">
          <img
            src={featuredImage}
            alt={title}
            className="w-full h-48 object-cover hover:scale-105 transition-transform duration-200"
          />
        </div>
      )}

      <div className="card-body">
        {/* Categories */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {categories.map((category) => (
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

        {/* Title */}
        <h2 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
          <Link
            to={`/posts/${slug}`}
            className="hover:text-primary-600 transition-colors"
          >
            {title}
          </Link>
        </h2>

        {/* Excerpt */}
        {excerpt && (
          <p className="text-gray-600 mb-4 line-clamp-3">
            {excerpt}
          </p>
        )}

        {/* Meta */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            {/* Author */}
            {showAuthor && author && (
              <div className="flex items-center space-x-2">
                <img
                  src={
                    author.avatar ||
                    `https://ui-avatars.com/api/?name=${author.username}&background=3b82f6&color=fff`
                  }
                  alt={author.username}
                  className="h-6 w-6 rounded-full"
                />
                <span>{author.username}</span>
              </div>
            )}

            {/* Created Time */}
            <div className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>{formatDistanceToNow(new Date(createdAt), { addSuffix: true })}</span>
            </div>
          </div>

          {/* Views & Likes */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Eye className="h-4 w-4" />
              <span>{views}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Heart className="h-4 w-4" />
              <span>{likes.length}</span>
            </div>
          </div>
        </div>

        {/* Status and Disclaimer */}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {status === 'draft' && (
              <span className="badge badge-warning">Draft</span>
            )}
            {medicalDisclaimer && (
              <div className="flex items-center space-x-1 text-xs text-gray-500">
                <Shield className="h-3 w-3" />
                <span>Medical content</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};

export default PostCard;
