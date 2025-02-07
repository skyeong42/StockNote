import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BiBell } from 'react-icons/bi'
import { useAuth } from '@/contexts/AuthContext';
import HeaderSearch from './HeaderSearch';
import KeywordPopup from '@/components/keyword/KeywordPopup';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink
} from "@/components/ui/navigation-menu";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from "@/components/ui/dropdown-menu";
import axios from 'axios';

const navigationItems = [
  { label: "포트폴리오", href: "/portfolio" },
  { label: "관심종목", href: "/stocks" },
  { label: "커뮤니티", href: "/community/articles" }
];

export default function Frame() {
  const { isAuthenticated, user, logout } = useAuth();
  console.log(user);
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const [activityNotifications, setActivityNotifications] = useState([]);
  const [keywordNotifications, setKeywordNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [eventSource, setEventSource] = useState(null);

  useEffect(() => {
    if (user?.id) {
      const sse = new EventSource(
        `${import.meta.env.VITE_CORE_API_BASE_URL}/sse/connect?memberId=${user.id}`
      );
      
      sse.addEventListener('commentNotification', event => {
        const notification = JSON.parse(event.data);
        console.log(event.data);
        setActivityNotifications(prev => [notification, ...prev]);
      });

      sse.addEventListener('keywordNotification', event => {
        const notification = JSON.parse(event.data);
        console.log(event.data);
        setKeywordNotifications(prev => [notification, ...prev]);
      });

      setEventSource(sse);

      // 기존 알림 목록 가져오기
      fetchActivityNotifications();
      fetchKeywordNotifications();

      return () => {
        sse.close();
      };
    }
  }, [user]);

  const fetchActivityNotifications = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_CORE_API_BASE_URL}/notifications/comment`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
          }
        }
      );
      setActivityNotifications(response.data);
    } catch (error) {
      console.error('활동 알림 조회 실패:', error);
    }
  };

  const fetchKeywordNotifications = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_CORE_API_BASE_URL}/notifications/keyword`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
          }
        }
      );
      setKeywordNotifications(response.data);
    } catch (error) {
      console.error('키워드 알림 조회 실패:', error);
    }
  };

  const handlePostNotificationClick = async (notification) => {
    try {
      await axios.patch(
        `${import.meta.env.VITE_CORE_API_BASE_URL}/notifications/comment/${notification.id}/read`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
          }
        }
      );

      setActivityNotifications(prev => 
        prev.map(note => 
          note.id === notification.id 
            ? {...note, isRead: true} 
            : note
        )
      );
  
      // Navigate to post
      if (notification.postId) {
        navigate(`/community/article/${notification.postId}`);
        setShowNotifications(false);
        window.location.reload();
      }
    } catch (error) {
      console.error('알림 읽음 처리 실패:', error);
    }
  };

  const handleKeywordNotificationClick = async (notification) => {
    try {
      await axios.patch(
        `${import.meta.env.VITE_CORE_API_BASE_URL}/notifications/keyword/${notification.id}/read`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
          }
        }
      );

      setKeywordNotifications(prev => 
        prev.map(note => 
          note.id === notification.id 
            ? {...note, isRead: true} 
            : note
        )
      );
  
      // Navigate to post
      if (notification.postId) {
        navigate(`/community/article/${notification.postId}`);
        setShowNotifications(false);
        window.location.reload();
      }
    } catch (error) {
      console.error('알림 읽음 처리 실패:', error);
    }
  };


  const unreadNotifications = [...activityNotifications, ...keywordNotifications].filter(note => !note.isRead);
  const activityUnreadNotifications = activityNotifications.filter(note => !note.isRead);
  const keywordUnreadNotifications = keywordNotifications.filter(note => !note.isRead);

  return (
    <header className="w-full h-[131px] bg-white">
      <div className="max-w-[1512px] mx-auto px-4 h-full flex items-center justify-between">
        {/* Logo */}

        <Link to="/" className="flex items-center cursor-pointer">
          <h1 className="text-[32px] font-h1 font-extrabold">Stock Note</h1>
        </Link>

        <NavigationMenu className="ml-8">
          <NavigationMenuList className="flex gap-8"> 
            {navigationItems.map((item) => (
              <NavigationMenuItem key={item.label}>
                <Link
                  to={item.href}
                  className="px-[5px] py-2.5 text-black hover:bg-gray-100 rounded-[5px] font-h4 text-[16px]"
                >
                  {item.label}
                </Link>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        <HeaderSearch />

        {/* User Section - Conditional Rendering */}
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>

              <DropdownMenu>
                <DropdownMenuTrigger className="focus:outline-none">
                  <div className="flex items-center gap-2 hover:opacity-80">
                    <Avatar className="w-[35px] h-[35px]">
                      <AvatarImage src={user?.profile || "https://github.com/shadcn.png"} alt="User avatar" />
                      <AvatarFallback>{user?.name?.[0] || 'UN'}</AvatarFallback>
                    </Avatar>
                    <span className="font-h4 text-[16px]">{user?.name || "사용자"}</span>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48">
                  <DropdownMenuItem onClick={() => navigate('/mypage')}>
                    마이페이지
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <KeywordPopup />
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="text-red-500">
                    로그아웃
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

            </>
          ) : (
            // 여기가 실행되어야 로그인 버튼이 보임
            <Button
              className="bg-[#3B82F6] text-white rounded-lg px-4 py-2"
              onClick={() => navigate('/login')}
            >
              로그인
            </Button>
          )}

        </div>
        {isAuthenticated && (
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2"
            >
              <span className="relative">
                <BiBell size={24} />
                {unreadNotifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center">
                    {unreadNotifications.length}
                  </span>
                )}
              </span>
            </button>
            
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg z-50">
                <Tabs defaultValue="activity" className="w-full">
                  <TabsList className="w-full grid grid-cols-2">
                    <TabsTrigger value="activity">
                      활동 
                      {activityUnreadNotifications.length > 0 && (
                        <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                          {activityUnreadNotifications.length}
                        </span>
                      )}
                    </TabsTrigger>
                    <TabsTrigger value="keyword">
                      키워드
                      {keywordUnreadNotifications.length > 0 && (
                        <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                          {keywordUnreadNotifications.length}
                        </span>
                      )}
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="activity" className="p-4 max-h-[300px] overflow-y-auto">
                    {activityUnreadNotifications.length === 0 ? (
                      <p className="text-gray-500 text-center">새로운 활동 알림이 없습니다.</p>
                    ) : (
                      activityUnreadNotifications.map(notification => (
                        <div 
                          key={notification.id} 
                          className="p-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => handlePostNotificationClick(notification)}
                        >
                          <p className="text-sm">{notification.content}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(notification.createdAt).toLocaleString()}
                          </p>
                        </div>
                      ))
                    )}
                  </TabsContent>
                  
                  <TabsContent value="keyword" className="p-4 max-h-[300px] overflow-y-auto">
                    {keywordUnreadNotifications.length === 0 ? (
                      <p className="text-gray-500 text-center">새로운 키워드 알림이 없습니다.</p>
                    ) : (
                      keywordUnreadNotifications.map(notification => (
                        <div 
                          key={notification.id} 
                          className="p-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => handleKeywordNotificationClick(notification)}
                        >
                          <p className="text-sm">{notification.content}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(notification.createdAt).toLocaleString()}
                          </p>
                        </div>
                      ))
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}