import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import CommunitySidebar from "@/pages/community/sidebar/CommunitySidebar";
import { ArrowLeft, Heart } from "lucide-react";
import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import { LoginForm } from '@/components/login-form';
import SearchResults from './SearchResults';

const Community = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(false);
  const { isAuthenticated } = useAuth();
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const { user } = useAuth();
  const [newComment, setNewComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editContent, setEditContent] = useState('');

  const fetchArticle = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/posts/${id}`
      );
      console.log(response.data.data);
      setPost(response.data.data);
    } catch (error) {
      console.error('게시글 조회 실패:', error);
    }
  };

  const checkLikeStatus = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/posts/${id}/likes/check`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
          }
        }
      );
      setIsLiked(response.data.data);
    } catch (error) {
      console.error('좋아요 상태 확인 실패:', error);
    }
  };

  const toggleLike = async () => {
    try {
      const endpoint = isLiked ? 'unlike' : 'like';
      await axios.post(
        `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/posts/${id}/${endpoint}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
          }
        }
      );
      fetchArticle();
      setIsLiked(!isLiked);
    } catch (error) {
      console.error('좋아요 토글 실패:', error);
    }
  };

  const handleSearch = async (searchKeyword, searchType = 'ALL') => {
    if (!searchKeyword.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }
  
    setIsSearching(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/posts/search`,
        {
          params: {
            keyword: searchKeyword,
            searchType: searchType
          }
        }
      );
      setSearchResults(response.data.data.content);
    } catch (error) {
      console.error('검색 실패:', error);
      setSearchResults([]);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      setShowLoginDialog(true);
      return;
    }
    try {
      await axios.post(
        `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/posts/${id}/comments`,
        {
          body: newComment
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
          }
        }
      );
      setNewComment('');
      fetchArticle();
    } catch (error) {
      console.error('댓글 작성 실패:', error);
    }
  };

  const handleEditComment = async (commentId) => {
    try {
      await axios.patch(
        `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/posts/${id}/comments/${commentId}`,
        { body: editContent },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
          }
        }
      );
      setEditingCommentId(null);
      fetchArticle();
    } catch (error) {
      console.error('댓글 수정 실패:', error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/posts/${id}/comments/${commentId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
          }
        }
      );
      fetchArticle();
    } catch (error) {
      console.error('댓글 삭제 실패:', error);
    }
  };

  const handleDeleteArticle = async () => {
    if (!window.confirm('게시글을 삭제하시겠습니까?')) {
      return;
    }
  
    try {
      await axios.delete(
        `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/posts/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
          }
        }
      );
      navigate('/community/articles');
    } catch (error) {
      console.error('게시글 삭제 실패:', error);
      alert('게시글 삭제에 실패했습니다.');
    }
  };

  useEffect(() => {
    fetchArticle();
  }, [id]);

  useEffect(() => {
    if (post) {
      checkLikeStatus();
    }
  }, [post]);

  if (!post) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8">
        <div className="flex gap-6">
          {/* Main Content */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-6">
              <Button 
                variant="ghost" 
                className="flex items-center gap-3 text-lg font-bold px-6 py-3 h-auto"
                onClick={() => navigate('/community/articles')}
              >
                <ArrowLeft className="h-8 w-8" />
                타임라인
              </Button>
            </div>

            <Card className="p-6">
              <CardHeader className="px-4">
                <CardTitle>{post.title}</CardTitle>
                <div className="flex items-center gap-2 pt-2">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={post.profile} alt="User" />
                    <AvatarFallback>{post.userId?.toString().charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span>{post.username}</span>
                  <span className="text-gray-500">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="px-4">
                <p className="text-xl leading-relaxed mb-8 whitespace-pre-line break-words max-w-[800px]">
                  {post.body}
                </p>
                <div className="flex justify-between items-center">
                  <div className="flex gap-2">
                    {post.hashtags?.map((tag, index) => (
                      <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center gap-1 hover:bg-transparent"
                      onClick={toggleLike}
                    >
                      <Heart 
                        className={`h-6 w-6 transition-colors ${
                          isLiked ? 'fill-red-500 text-red-500' : 'text-gray-400 hover:text-red-500'
                        }`}
                      />
                      <span className="text-sm font-medium text-gray-500">
                        {post.likeCount || 0}
                      </span>
                    </Button>
                  </div>
                </div>
              </CardContent>
              {post.authorId === user?.id && (
                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/community/article/${post.id}/editor`, {
                        state: {
                          title: post.title,
                          body: post.body,
                          hashtags: post.hashtags,
                          isEditing: true
                        }
                      });
                    }}
                  >
                    수정
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteArticle();
                    }}
                  >
                    삭제
                  </Button>
                </div>
              )}
            </Card>

            {isSearching && (
              <div className="mt-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">검색 결과</h2>
                  <Button 
                    variant="ghost" 
                    onClick={() => {
                      setIsSearching(false);
                      setSearchResults([]);
                    }}
                  >
                    검색 결과 닫기
                  </Button>
                </div>
                <SearchResults 
                  posts={searchResults} 
                  onPostClick={(postId) => {
                    navigate(`/community/article/${postId}`);
                    setIsSearching(false);
                    setSearchResults([]);
                  }} 
                />
              </div>
            )}

            <Card className="mt-4">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <span className="font-semibold">댓글 {post.comments.length}개</span>
                </div>
                
                {/* Comment List */}
                <div className="space-y-4 mb-4">
                  {post.comments.map((comment) => (
                    <div key={comment.id} className="border-b pb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage 
                              src={comment.profile || '/default-avatar.png'} 
                            />
                          </Avatar>
                          <span className="font-medium">{comment.author}</span>
                          <span className="text-gray-500 text-sm">
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {comment.authorId === user?.id && editingCommentId !== comment.id && (
                          <div className="flex gap-2 shrink-0">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                setEditingCommentId(comment.id);
                                setEditContent(comment.body);
                              }}
                            >
                              수정
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDeleteComment(comment.id)}
                            >
                              삭제
                            </Button>
                          </div>
                        )}
                      </div>
                      
                      {editingCommentId === comment.id ? (
                        <div className="flex gap-2 mt-2">
                          <Input
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="flex-1 break-words whitespace-pre-wrap"
                          />
                          <Button 
                            onClick={() => handleEditComment(comment.id)}
                            className="shrink-0"
                          >
                            저장
                          </Button>
                          <Button 
                            variant="ghost" 
                            onClick={() => setEditingCommentId(null)}
                            className="shrink-0"
                          >
                            취소
                          </Button>
                        </div>
                      ) : (
                        <p className="mt-2 break-words whitespace-pre-wrap overflow-hidden max-w-[700px]">
                          {comment.body}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                {/* Add Comment */}
                <div className="flex gap-2">
                  <Input
                    placeholder="댓글 내용을 입력하세요"
                    className="flex-1 break-words whitespace-pre-wrap"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                  />
                  <Button className="shrink-0" onClick={handleAddComment}>
                    댓글 등록
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <CommunitySidebar onSearch={handleSearch} />
        </div>
      </main>
      <LoginForm 
        open={showLoginDialog} 
        onOpenChange={setShowLoginDialog}
      />
    </div>
  );
};

export default Community;