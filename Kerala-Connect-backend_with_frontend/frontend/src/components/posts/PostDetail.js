import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { postsAPI, commentsAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  CheckCircle,
  Clock,
  Eye,
  Send,
  Award,
  Trash2,
  Edit,
  Flag,
  User,
  Paperclip,
  Download
} from 'lucide-react';

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentContent, setCommentContent] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPostDetail();
  }, [id]);

  const fetchPostDetail = async () => {
    try {
      setLoading(true);
      const postResponse = await postsAPI.getPost(id);
      setPost(postResponse.data.post);

      const commentsResponse = await commentsAPI.getCommentsByPost(id);
      setComments(commentsResponse.data.comments);
    } catch (error) {
      toast.error('Failed to load post');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (voteType) => {
    try {
      const response = await postsAPI.votePost(id, voteType);
      setPost(prev => ({
        ...prev,
        votes: response.data.votes,
        voteScore: response.data.voteScore
      }));
      toast.success(`${voteType === 'upvote' ? 'Upvoted' : 'Downvoted'} successfully`);
    } catch (error) {
      toast.error('Failed to vote');
    }
  };

  const handleCommentVote = async (commentId, voteType) => {
    try {
      await commentsAPI.voteComment(commentId, voteType);
      fetchPostDetail();
    } catch (error) {
      toast.error('Failed to vote');
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!commentContent.trim()) return;

    try {
      setSubmitting(true);
      await commentsAPI.createComment({
        content: commentContent,
        post: id,
      });
      setCommentContent('');
      toast.success('Answer posted successfully!');
      
      // Refresh user stats (answersGiven)
      await refreshUser();
      
      fetchPostDetail();
    } catch (error) {
      toast.error('Failed to post answer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReply = async (parentId) => {
    if (!replyContent.trim()) return;

    try {
      setSubmitting(true);
      await commentsAPI.createComment({
        content: replyContent,
        post: id,
        parent: parentId,
      });
      setReplyContent('');
      setReplyTo(null);
      toast.success('Reply posted successfully!');
      fetchPostDetail();
    } catch (error) {
      toast.error('Failed to post reply');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkBestAnswer = async (commentId) => {
    try {
      await postsAPI.markBestAnswer(id, commentId);
      toast.success('Best answer marked!');
      
      // Refresh user stats
      await refreshUser();
      
      fetchPostDetail();
    } catch (error) {
      toast.error('Failed to mark best answer');
    }
  };

  const handleDeletePost = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await postsAPI.deletePost(id);
      toast.success('Post deleted');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Failed to delete post');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    try {
      await commentsAPI.deleteComment(commentId);
      toast.success('Comment deleted');
      fetchPostDetail();
    } catch (error) {
      toast.error('Failed to delete comment');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const canModifyPost = () => {
    if (!user || !post) return false;
    const isOwner = String(post.author?._id || post.author) === String(user._id);
    return (
      isOwner ||
      user.role === 'admin' ||
      user.role === 'cr' ||
      user.role === 'faculty'
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!post) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {canModifyPost() && (
          <div className="flex justify-end mb-4">
            <button
              onClick={handleDeletePost}
              className="btn-sm text-error-600 hover:text-error-800 hover:bg-error-50 rounded-md px-3 py-1"
            >
              <Trash2 className="h-4 w-4 mr-1 inline" />
              Delete Post
            </button>
          </div>
        )}
        {/* Post Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          {/* Post Header */}
          <div className="flex items-center space-x-2 mb-4">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 capitalize">
              {post.category}
            </span>
            <span className="text-sm text-gray-500">
              {post.class} • {post.stream}
            </span>
            {post.isAnswered && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100 text-success-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Answered
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{post.title}</h1>

          {/* Content */}
          <p className="text-gray-700 whitespace-pre-wrap mb-6 leading-relaxed">
            {post.content}
          </p>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Attachments */}
          {post.attachments && post.attachments.length > 0 && (
            <div className="mb-6 pt-4 border-t border-gray-100">
              <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                <Paperclip className="h-4 w-4 mr-2 text-gray-500" />
                Attachments ({post.attachments.length})
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {post.attachments.map((file, index) => (
                  <a
                    key={index}
                    href={`http://localhost:5000${file.url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors group"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {file.originalName || file.filename}
                      </p>
                      <p className="text-xs text-gray-500">
                        {Math.round(file.size / 1024)} KB
                      </p>
                    </div>
                    <Download className="h-4 w-4 text-gray-400 group-hover:text-primary-600 ml-2" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Post Meta */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div className="flex items-center space-x-4">
              {/* Vote Buttons */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleVote('upvote')}
                  className="flex items-center space-x-1 px-3 py-1 rounded-md text-gray-600 hover:bg-green-50 hover:text-green-600 transition-colors"
                >
                  <ThumbsUp className="h-4 w-4" />
                  <span className="text-sm">{post.votes?.upvotes?.length || 0}</span>
                </button>
                <button
                  onClick={() => handleVote('downvote')}
                  className="flex items-center space-x-1 px-3 py-1 rounded-md text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
                >
                  <ThumbsDown className="h-4 w-4" />
                  <span className="text-sm">{post.votes?.downvotes?.length || 0}</span>
                </button>
              </div>

              <div className="flex items-center text-sm text-gray-500">
                <Eye className="h-4 w-4 mr-1" />
                {post.views} views
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <MessageSquare className="h-4 w-4 mr-1" />
                {post.answerCount} answers
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-primary-600">
                  {post.author?.profile?.firstName?.[0]}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {post.author?.profile?.firstName} {post.author?.profile?.lastName}
                </p>
                <p className="text-xs text-gray-500">
                  <Clock className="h-3 w-3 inline mr-1" />
                  {formatDate(post.createdAt)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Answer Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Answer</h3>
          <form onSubmit={handleSubmitComment}>
            <textarea
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              rows={4}
              className="textarea mb-4"
              placeholder="Write your answer here..."
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting || !commentContent.trim()}
                className="btn-primary btn-md"
              >
                {submitting ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Posting...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Send className="h-4 w-4 mr-2" />
                    Post Answer
                  </div>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Answers */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {comments.length} {comments.length === 1 ? 'Answer' : 'Answers'}
          </h3>

          {comments.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No answers yet. Be the first to answer!</p>
            </div>
          ) : (
            comments.map((comment) => (
              <div
                key={comment._id}
                className={`bg-white rounded-lg shadow-sm border p-6 ${
                  comment.isBestAnswer
                    ? 'border-green-300 bg-green-50'
                    : 'border-gray-200'
                }`}
              >
                {comment.isBestAnswer && (
                  <div className="flex items-center mb-3">
                    <Award className="h-5 w-5 text-green-600 mr-2" />
                    <span className="text-sm font-semibold text-green-700">Best Answer</span>
                  </div>
                )}

                <p className="text-gray-700 whitespace-pre-wrap mb-4">{comment.content}</p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {/* Vote Buttons */}
                    <button
                      onClick={() => handleCommentVote(comment._id, 'upvote')}
                      className="flex items-center space-x-1 px-2 py-1 rounded text-gray-600 hover:bg-green-50 hover:text-green-600 transition-colors text-sm"
                    >
                      <ThumbsUp className="h-3 w-3" />
                      <span>{comment.votes?.upvotes?.length || 0}</span>
                    </button>
                    <button
                      onClick={() => handleCommentVote(comment._id, 'downvote')}
                      className="flex items-center space-x-1 px-2 py-1 rounded text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors text-sm"
                    >
                      <ThumbsDown className="h-3 w-3" />
                      <span>{comment.votes?.downvotes?.length || 0}</span>
                    </button>

                    {/* Mark Best Answer (only post owner) */}
                    {post.author?._id === user?._id && !post.isAnswered && (
                      <button
                        onClick={() => handleMarkBestAnswer(comment._id)}
                        className="flex items-center space-x-1 px-2 py-1 rounded text-gray-600 hover:bg-green-50 hover:text-green-600 transition-colors text-sm"
                      >
                        <CheckCircle className="h-3 w-3" />
                        <span>Best Answer</span>
                      </button>
                    )}

                    {/* Reply */}
                    <button
                      onClick={() => setReplyTo(replyTo === comment._id ? null : comment._id)}
                      className="flex items-center space-x-1 px-2 py-1 rounded text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors text-sm"
                    >
                      <MessageSquare className="h-3 w-3" />
                      <span>Reply</span>
                    </button>

                    {/* Delete (owner, CR, Faculty, Admin) */}
                    {(String(comment.author?._id || comment.author) === String(user?._id) || 
                      user?.role === 'admin' || 
                      user?.role === 'cr' || 
                      user?.role === 'faculty') && (
                      <button
                        onClick={() => handleDeleteComment(comment._id)}
                        className="flex items-center space-x-1 px-2 py-1 rounded text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors text-sm"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <div className="h-6 w-6 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-primary-600">
                        {comment.author?.profile?.firstName?.[0]}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {comment.author?.profile?.firstName} {comment.author?.profile?.lastName}
                      </p>
                      <p className="text-xs text-gray-500">{formatDate(comment.createdAt)}</p>
                    </div>
                  </div>
                </div>

                {/* Reply Form */}
                {replyTo === comment._id && (
                  <div className="mt-4 pl-4 border-l-2 border-gray-200">
                    <textarea
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      rows={2}
                      className="textarea mb-2"
                      placeholder="Write a reply..."
                    />
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleSubmitReply(comment._id)}
                        disabled={submitting || !replyContent.trim()}
                        className="btn-primary btn-sm text-xs"
                      >
                        Post Reply
                      </button>
                      <button
                        onClick={() => { setReplyTo(null); setReplyContent(''); }}
                        className="btn-secondary btn-sm text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Nested Replies */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="mt-4 pl-4 border-l-2 border-gray-200 space-y-3">
                    {comment.replies.map((reply) => (
                      <div key={reply._id} className="bg-gray-50 rounded-md p-3">
                        <p className="text-sm text-gray-700 mb-2">{reply.content}</p>
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          <span className="font-medium">
                            {reply.author?.profile?.firstName} {reply.author?.profile?.lastName}
                          </span>
                          <span>•</span>
                          <span>{formatDate(reply.createdAt)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default PostDetail;
