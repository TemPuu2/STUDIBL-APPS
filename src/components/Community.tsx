import React, { useState, useRef, useEffect } from 'react';
import { Users, MessageSquare, Heart, Share2, Search, TrendingUp, Filter, Plus, Send, MoreHorizontal, Check, CheckCheck, Circle, Rss, MessageCircle, X, UserPlus, Info, ChevronDown, ChevronUp, Reply, ArrowLeft, Edit2, Image as ImageIcon, Tag, Bold, Italic, Type, Link as LinkIcon, AtSign, Pencil, List } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { cn } from '../lib/utils';
import UserProfileBottomSheet from './UserProfileBottomSheet';
import ChatInterface from './ChatInterface';

interface Comment {
  id: string;
  author: {
    name: string;
    avatar: string;
  };
  content: string;
  time: string;
  likes: number;
  replies?: Comment[];
  isLiked?: boolean;
}

interface CommunityPost {
  id: string;
  author: {
    name: string;
    avatar: string;
    role: string;
    bio?: string;
  };
  content: string;
  likes: number;
  comments: number;
  tags: string[];
  time: string;
  image?: string;
  isLiked?: boolean;
}

interface Chat {
  id: string;
  user: {
    name: string;
    avatar: string;
    online: boolean;
    role?: string;
  };
  lastMessage: string;
  time: string;
  unread: number;
}

const MOCK_POSTS: CommunityPost[] = [
  {
    id: 'post-1',
    author: {
      name: 'Sarah Chen',
      avatar: 'https://picsum.photos/seed/sarah/100/100',
      role: 'Engineering Senior',
      bio: 'Lover of fluid dynamics and sustainable engineering. Always looking for study partners!'
    },
    content: 'Just finished a deep dive into Navier-Stokes equations tips! If anyone is struggling with the pressure gradient terms, let\'s discuss. This equation is the foundation of fluid mechanics and governs the motion of fluid substances. It\'s incredibly powerful but also notoriously difficult to solve, which is why we spend so much time on it. Looking forward to our next group session where we can tackle some practical applications beyond the standard boundary layer problems.',
    likes: 24,
    comments: 8,
    tags: ['FluidDynamics', 'StudyGroup'],
    time: '2h ago',
    image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=800',
    isLiked: false
  },
  {
    id: 'post-2',
    author: {
      name: 'James Wilson',
      avatar: 'https://picsum.photos/seed/james/100/100',
      role: 'Physics Major',
      bio: 'Quantum enthusiast and amateur astrophotographer. Reality is weirder than you think.'
    },
    content: 'Found an amazing visualization tool for Quantum Entanglement. Sharing the link in the comments for those preparing for the MECH finals.',
    likes: 156,
    comments: 42,
    tags: ['Physics', 'Resources'],
    time: '5h ago',
    isLiked: false
  },
  {
    id: 'post-3',
    author: {
      name: 'Elena Rodriguez',
      avatar: 'https://picsum.photos/seed/elena/100/100',
      role: 'CS Undergrad',
      bio: 'Full stack developer in training. Caffeine and code are my best friends.'
    },
    content: 'Who\'s up for a late-night coding sprint? Tackling these Compiler design patterns in 30 mins.',
    likes: 89,
    comments: 12,
    tags: ['Coding', 'LateNight'],
    time: '1h ago',
    isLiked: false
  }
];

const MOCK_CHATS: Chat[] = [
  {
    id: 'chat-1',
    user: {
      name: 'Dr. Aris Thorne',
      avatar: 'https://picsum.photos/seed/aris/100/100',
      online: true,
      role: 'Professor'
    },
    lastMessage: 'Your analysis of the entropy vector is spot on. Keep it up!',
    time: '12:45 PM',
    unread: 1
  },
  {
    id: 'chat-2',
    user: {
      name: 'Study Group: MECH 402',
      avatar: 'https://picsum.photos/seed/group/100/100',
      online: false,
      role: 'Group'
    },
    lastMessage: 'Marcus: Does anyone have the notes for Monday?',
    time: 'Yesterday',
    unread: 5
  },
  {
    id: 'chat-3',
    user: {
      name: 'Alex Rivera',
      avatar: 'https://picsum.photos/seed/alex/100/100',
      online: true,
      role: 'Engineering Student'
    },
    lastMessage: 'Want to review the fluid dynamics problem set tonight?',
    time: 'Tue',
    unread: 0
  },
  {
    id: 'chat-4',
    user: {
      name: 'Sophia Chen',
      avatar: 'https://picsum.photos/seed/sophia/100/100',
      online: false,
      role: 'CS Undergrad'
    },
    lastMessage: 'Thanks for the help earlier!',
    time: 'Mon',
    unread: 0
  }
];

// Collect all unique users for mentions
const ALL_COMMUNITY_USERS = [
  ...MOCK_POSTS.map(p => p.author),
  ...MOCK_CHATS.map(c => ({ name: c.user.name, avatar: c.user.avatar, role: 'Contributor' })),
].filter((user, index, self) => 
  index === self.findIndex((u) => u.name === user.name)
);

/**
 * Helper component for highlighted input field
 */
const MentionInput = ({ 
  value, 
  onChange, 
  onKeyDown, 
  placeholder, 
  autoFocus = false,
  className,
  rows = 1,
  padding = "p-0"
}: { 
  value: string, 
  onChange: (e: any) => void, 
  onKeyDown: (e: any) => void, 
  placeholder: string,
  autoFocus?: boolean,
  className?: string,
  rows?: number,
  padding?: string
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const ghostRef = useRef<HTMLDivElement>(null);

  // Sync scroll
  const handleScroll = () => {
    if (textareaRef.current && ghostRef.current) {
      ghostRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  // Auto-resize logic
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);

  // Focus at the end of text logic
  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      const length = textareaRef.current.value.length;
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(length, length);
    }
  }, [autoFocus]);

  const baseStyles: React.CSSProperties = {
    lineHeight: '1.5',
    letterSpacing: 'normal',
    fontFamily: 'inherit',
    fontSize: 'inherit',
    margin: '0',
    border: 'none',
    boxSizing: 'border-box',
    wordBreak: 'break-word',
    overflowWrap: 'break-word',
    display: 'block',
    textAlign: 'left',
    WebkitFontSmoothing: 'antialiased',
    MozOsxFontSmoothing: 'grayscale',
    textRendering: 'optimizeLegibility',
  };

  return (
    <div className="relative w-full flex-1 overflow-hidden">
      {/* Ghost layer for highlighting */}
      <div 
        ref={ghostRef}
        className={cn(
          "absolute inset-0 pointer-events-none whitespace-pre-wrap break-words overflow-hidden select-none",
          className,
          padding
        )}
        style={baseStyles}
        aria-hidden="true"
      >
        <MentionHighlight text={value} />
        {value.endsWith('\n') ? ' ' : ''}
      </div>
      
      <textarea 
        ref={textareaRef}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        onScroll={handleScroll}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className={cn(
          "relative bg-transparent border-none outline-none resize-none z-10 w-full block caret-white text-transparent selection:bg-brand-primary/30 placeholder:text-white/20",
          className,
          padding
        )}
        style={baseStyles}
        rows={rows}
      />
    </div>
  );
};

export default function Community({ setNavVisibility, onAddNotification }: { 
  setNavVisibility?: (visible: boolean) => void,
  onAddNotification?: (n: any) => void
}) {
  const [activeTab, setActiveTab] = useState<'feeds' | 'chats' | 'groups'>('feeds');
  const [posts, setPosts] = useState(MOCK_POSTS);
  const [joinedGroups, setJoinedGroups] = useState<Set<string>>(new Set(['group-1']));
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [isFabVisible, setIsFabVisible] = useState(true);

  // Clear success toast after 3 seconds
  useEffect(() => {
    if (successToast) {
      const timer = setTimeout(() => setSuccessToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successToast]);

  const MOCK_GROUPS = [
    {
      id: 'group-1',
      name: 'Fluid Dynamics Hub',
      members: 1240,
      description: 'Mastering Navier-Stokes and boundary layer theory together.',
      image: 'https://images.unsplash.com/photo-1510519133418-66a36ec559c5?auto=format&fit=crop&q=80&w=400',
      tag: 'Engineering'
    },
    {
      id: 'group-2',
      name: 'Algorithm Avengers',
      members: 3500,
      description: 'Daily competitive coding challenges and Big O discussions.',
      image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=400',
      tag: 'CS'
    },
    {
      id: 'group-3',
      name: 'Organic Chem Wizards',
      members: 890,
      description: 'Visualizing reaction mechanisms and orbital overlaps.',
      image: 'https://images.unsplash.com/photo-1532187875661-14de6d53fdab?auto=format&fit=crop&q=80&w=400',
      tag: 'Science'
    }
  ];

  const toggleJoinGroup = (groupId: string) => {
    const isAlreadyJoined = joinedGroups.has(groupId);
    
    if (isAlreadyJoined) {
      setJoinedGroups(prev => {
        const next = new Set(prev);
        next.delete(groupId);
        return next;
      });
      onAddNotification?.({
        title: 'Left Group',
        message: `You are no longer a member of this hub.`,
        type: 'info'
      });
    } else {
      setJoinedGroups(prev => {
        const next = new Set(prev);
        next.add(groupId);
        return next;
      });
      onAddNotification?.({
        title: 'Joined Group!',
        message: `Welcome to the community! Dive into the discussions.`,
        type: 'info'
      });
    }
  };
  const [connectionStates, setConnectionStates] = useState<Record<string, boolean>>({});
  const [expandedPosts, setExpandedPosts] = useState<Set<string>>(new Set());
  const [selectedProfile, setSelectedProfile] = useState<CommunityPost['author'] | null>(null);
  const [fullProfile, setFullProfile] = useState<CommunityPost['author'] | null>(null);
  const [chats, setChats] = useState<Chat[]>(MOCK_CHATS);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);

  const activeChat = chats.find(c => c.id === activeChatId);

  const openChatWithUser = (user: { name: string, avatar: string, role?: string }) => {
    setActiveTab('chats');
    const existingChat = chats.find(c => c.user.name === user.name);
    if (existingChat) {
      setActiveChatId(existingChat.id);
    } else {
      const newChat: Chat = {
        id: `chat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        user: {
          name: user.name,
          avatar: user.avatar,
          online: true, // Assume online for demo
          role: user.role
        },
        lastMessage: 'Start a conversation...',
        time: 'Now',
        unread: 0
      };
      setChats(prev => [newChat, ...prev]);
      setActiveChatId(newChat.id);
    }
    setSelectedProfile(null);
    setFullProfile(null);
  };

  const toggleConnect = (user: any) => {
    setConnectionStates(prev => ({
      ...prev,
      [user.name]: !prev[user.name]
    }));
  };

  const isConnected = (userName: string) => !!connectionStates[userName];
  const getConnectionCount = (userName: string, base: number = 214) => 
    isConnected(userName) ? base + 1 : base;
  const [viewedPost, setViewedPost] = useState<CommunityPost | null>(null);
  const [showPostCreator, setShowPostCreator] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState<{ commentId: string; authorName: string } | null>(null);
  const [viewingReplies, setViewingReplies] = useState<Set<string>>(new Set());
  const [sortOrder, setSortOrder] = useState<'top' | 'new'>('top');
  const [activeCommentMenuId, setActiveCommentMenuId] = useState<string | null>(null);
  const [activePostMenuId, setActivePostMenuId] = useState<string | null>(null);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editPostText, setEditPostText] = useState('');
  const [editCommentText, setEditCommentText] = useState('');

  // Mentions logic
  const [mentionQuery, setMentionQuery] = useState('');
  const [showMentions, setShowMentions] = useState(false);
  const [mentionSuggestions, setMentionSuggestions] = useState<any[]>([]);
  const [activeMentionIndex, setActiveMentionIndex] = useState(0);
  const [mentionContext, setMentionContext] = useState<'comment' | 'reply' | null>(null);

  const handleInputChange = (text: string, context: 'comment' | 'reply') => {
    setCommentText(text);
    
    // Check for @mention
    const lastAtPos = text.lastIndexOf('@');
    if (lastAtPos !== -1 && (lastAtPos === 0 || text[lastAtPos - 1] === ' ' || text[lastAtPos - 1] === '\n')) {
      const rest = text.slice(lastAtPos + 1);
      const query = rest.split(/[\s\n]/)[0];
      setMentionQuery(query);
      
      const filtered = ALL_COMMUNITY_USERS.filter(u => 
        u.name.toLowerCase().replace(/\s+/g, '').includes(query.toLowerCase())
      );
      
      setMentionSuggestions(filtered);
      setShowMentions(filtered.length > 0);
      setMentionContext(context);
      setActiveMentionIndex(0);
    } else {
      setShowMentions(false);
    }
  };

  const selectMention = (userName: string) => {
    const lastAtPos = commentText.lastIndexOf('@');
    const beforeAt = commentText.slice(0, lastAtPos);
    
    // Find where the query ends (space or newline after @query)
    const rest = commentText.slice(lastAtPos + 1);
    const firstWhitespace = rest.search(/[\s\n]/);
    
    // If there's a whitespace, we keep everything after the first whitespace
    // If not, we have nothing after the mention
    const afterMentionRaw = firstWhitespace === -1 ? '' : rest.slice(firstWhitespace);
    // Remove leading space from afterMention if we're adding one
    const afterMention = afterMentionRaw.startsWith(' ') ? afterMentionRaw.slice(1) : afterMentionRaw;
    
    const newText = `${beforeAt}@${userName} ${afterMention}`;
    setCommentText(newText);
    setShowMentions(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showMentions) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveMentionIndex(prev => (prev + 1) % mentionSuggestions.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveMentionIndex(prev => (prev - 1 + mentionSuggestions.length) % mentionSuggestions.length);
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        selectMention(mentionSuggestions[activeMentionIndex].name);
      } else if (e.key === 'Escape') {
        setShowMentions(false);
      }
    }
  };

  // Click-away logic for menus
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      // If a menu is active, and the click wasn't inside a menu button or menu itself
      if (activePostMenuId || activeCommentMenuId) {
        // We'll reset everything on any click that bubbles to window, 
        // toggle buttons should stopPropagation if we want to handle the "click icon again" separately,
        // but current logic uses ID comparison which works fine if we're careful.
        setActivePostMenuId(null);
        setActiveCommentMenuId(null);
      }
    };

    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, [activePostMenuId, activeCommentMenuId]);
  
  // Current user mock info
  const currentUser = {
    name: 'Alex Simmons',
    avatar: 'https://picsum.photos/seed/alex/100/100'
  };
  
  // Local state for comments to simulate a database
  const [postComments, setPostComments] = useState<Record<string, Comment[]>>({
    'post-1': [
      {
        id: 'c1',
        author: { name: 'John Doe', avatar: 'https://picsum.photos/seed/john/100/100' },
        content: 'This helped me clarify the integration steps! Thanks Sarah.',
        time: '2w ago',
        likes: 12,
        replies: [
          {
            id: 'r1',
            author: { name: 'Sarah Chen', avatar: 'https://picsum.photos/seed/sarah/100/100' },
            content: 'Glad it helped! Hit me up if you need more info on Navier-Stokes.',
            time: '2w ago',
            likes: 4
          }
        ]
      },
      {
        id: 'c2',
        author: { name: 'Emma Watson', avatar: 'https://picsum.photos/seed/emma/100/100' },
        content: 'Does this also apply to non-Newtonian fluids?',
        time: '3d ago',
        likes: 5,
        replies: []
      }
    ],
    'post-2': [],
    'post-3': []
  });
  
  const lastScrollY = useRef(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Handle scroll to toggle nav visibility (Community screen only)
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (!setNavVisibility) return;
    
    const currentScrollY = e.currentTarget.scrollTop;
    
    // Threshold to prevent jitter
    if (Math.abs(currentScrollY - lastScrollY.current) < 5) return;

    if (currentScrollY < lastScrollY.current || currentScrollY < 50) {
      // Scrolling upwards (towards top) or already near top -> Show nav & FAB
      setNavVisibility(true);
      setIsFabVisible(true);
    } else {
      // Scrolling downwards (towards bottom) -> Hide nav & FAB
      setNavVisibility(false);
      setIsFabVisible(false);
    }
    
    lastScrollY.current = currentScrollY;
  };

  // Reset nav visibility when leaving tab or unmounting
  useEffect(() => {
    return () => {
      setNavVisibility?.(true);
    };
  }, [setNavVisibility]);

  const toggleLike = (postId: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    setPosts(current => current.map(p => {
      if (p.id === postId) {
        const nextLiked = !p.isLiked;
        return { 
          ...p, 
          isLiked: nextLiked, 
          likes: nextLiked ? p.likes + 1 : Math.max(0, p.likes - 1) 
        };
      }
      return p;
    }));

    // If we're looking at the post in detail, we also need to update that local viewedPost state
    if (viewedPost?.id === postId) {
      setViewedPost(prev => {
        if (!prev) return null;
        const nextLiked = !prev.isLiked;
        return {
          ...prev,
          isLiked: nextLiked,
          likes: nextLiked ? prev.likes + 1 : Math.max(0, prev.likes - 1)
        };
      });
    }
  };

  const toggleCommentLike = (commentId: string, isReply = false, parentId?: string) => {
    if (!viewedPost) return;

    setPostComments(prev => {
      const currentComments = [...(prev[viewedPost.id] || [])];
      
      if (!isReply) {
        return {
          ...prev,
          [viewedPost.id]: currentComments.map(c => {
            if (c.id === commentId) {
              const nextLiked = !c.isLiked;
              return { 
                ...c, 
                isLiked: nextLiked, 
                likes: nextLiked ? c.likes + 1 : Math.max(0, c.likes - 1) 
              };
            }
            return c;
          })
        };
      } else {
        return {
          ...prev,
          [viewedPost.id]: currentComments.map(c => {
            if (c.id === parentId) {
              return {
                ...c,
                replies: (Array.isArray(c.replies) ? c.replies : []).map(r => {
                  if (r.id === commentId) {
                    const nextLiked = !r.isLiked;
                    return { 
                      ...r, 
                      isLiked: nextLiked, 
                      likes: nextLiked ? r.likes + 1 : Math.max(0, r.likes - 1) 
                    };
                  }
                  return r;
                })
              };
            }
            return c;
          })
        };
      }
    });
  };

  const toggleReplyVisibility = (commentId: string) => {
    setViewingReplies(prev => {
      const next = new Set(prev);
      if (next.has(commentId)) next.delete(commentId);
      else next.add(commentId);
      return next;
    });
  };

  const handleSendComment = (text: string, commentId?: string) => {
    if (!text.trim() || !viewedPost) return;
    
    const newComment: Comment = {
      id: `comment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      author: currentUser,
      content: text,
      time: 'Just now',
      likes: 0,
      replies: []
    };

    // Notify mentioned users
    ALL_COMMUNITY_USERS.forEach(user => {
      if (text.includes(`@${user.name}`) && user.name !== currentUser.name) {
        onAddNotification?.({
          title: 'You were mentioned',
          message: `${currentUser.name} mentioned you in a ${commentId ? 'reply' : 'comment'}.`,
          type: 'info'
        });
      }
    });

    if (commentId) {
      // It's a reply to a specific comment
      setPostComments(prev => ({
        ...prev,
        [viewedPost.id]: (Array.isArray(prev[viewedPost.id]) ? prev[viewedPost.id] : []).map(c => {
          if (c.id === commentId) {
            return {
              ...c,
              replies: [...(Array.isArray(c.replies) ? c.replies : []), newComment]
            };
          }
          return c;
        })
      }));
      setReplyingTo(null);
      // Ensure replies folder is open
      setViewingReplies(prev => new Set(prev).add(commentId));
    } else {
      // It's a top-level comment
      setPostComments(prev => ({
        ...prev,
        [viewedPost.id]: [newComment, ...(Array.isArray(prev[viewedPost.id]) ? prev[viewedPost.id] : [])]
      }));
    }

    // Increment comment count
    setPosts(current => current.map(p => p.id === viewedPost.id ? { ...p, comments: p.comments + 1 } : p));
    setViewedPost(prev => prev ? { ...prev, comments: prev.comments + 1 } : null);
    
    setCommentText('');
    setShowMentions(false);
  };


  const deleteComment = (commentId: string, isReply = false, parentId?: string) => {
    if (!viewedPost) return;

    let commentsRemoved = 0;
    const currentPostComments = Array.isArray(postComments[viewedPost.id]) ? postComments[viewedPost.id] : [];

    if (!isReply) {
      const commentToDelete = currentPostComments.find(c => c.id === commentId);
      if (commentToDelete) {
        commentsRemoved = 1 + (commentToDelete.replies?.length || 0);
      }
    } else {
      commentsRemoved = 1;
    }

    // 1. Update post comments
    setPostComments(prev => {
      const currentCommentsForPost = Array.isArray(prev[viewedPost.id]) ? [...prev[viewedPost.id]] : [];
      if (!isReply) {
        return {
          ...prev,
          [viewedPost.id]: currentCommentsForPost.filter(c => c.id !== commentId)
        };
      } else {
        return {
          ...prev,
          [viewedPost.id]: currentCommentsForPost.map(c => {
            if (c.id === parentId) {
              return {
                ...c,
                replies: (Array.isArray(c.replies) ? c.replies : []).filter(r => r.id !== commentId)
              };
            }
            return c;
          })
        };
      }
    });

    // 2. Update post metadata (OUTSIDE the setPostComments updater)
    setPosts(current => current.map(p => 
      p.id === viewedPost.id ? { ...p, comments: Math.max(0, p.comments - commentsRemoved) } : p
    ));
    setViewedPost(prev => prev ? { ...prev, comments: Math.max(0, prev.comments - commentsRemoved) } : null);

    setActiveCommentMenuId(null);
  };

  const startEditingPost = (post: CommunityPost) => {
    setEditingPostId(post.id);
    setEditPostText(post.content);
    setActivePostMenuId(null);
  };

  const handleSavePostEdit = () => {
    if (!editingPostId || !editPostText.trim()) return;
    
    setPosts(current => current.map(p => 
      p.id === editingPostId ? { ...p, content: editPostText } : p
    ));
    
    if (viewedPost?.id === editingPostId) {
      setViewedPost(prev => prev ? { ...prev, content: editPostText } : null);
    }
    
    setEditingPostId(null);
    setEditPostText('');
  };

  const startEditingComment = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditCommentText(comment.content);
    setActiveCommentMenuId(null);
  };

  const handleSaveCommentEdit = (commentId: string, isReply = false, parentId?: string) => {
    if (!editCommentText.trim() || !viewedPost) return;

    setPostComments(prev => {
      const currentComments = Array.isArray(prev[viewedPost.id]) ? [...prev[viewedPost.id]] : [];
      
      if (!isReply) {
        return {
          ...prev,
          [viewedPost.id]: currentComments.map(c => 
            c.id === commentId ? { ...c, content: editCommentText } : c
          )
        };
      } else {
        return {
          ...prev,
          [viewedPost.id]: currentComments.map(c => {
            if (c.id === parentId) {
              return {
                ...c,
                replies: (Array.isArray(c.replies) ? c.replies : []).map(r => 
                  r.id === commentId ? { ...r, content: editCommentText } : r
                )
              };
            }
            return c;
          })
        };
      }
    });

    setEditingCommentId(null);
    setEditCommentText('');
  };

  const deletePost = (postId: string) => {
    setPosts(current => current.filter(p => p.id !== postId));
    if (viewedPost?.id === postId) {
      setViewedPost(null);
    }
    setActivePostMenuId(null);
  };

  const toggleExpand = (postId: string) => {
    setExpandedPosts(prev => {
      const next = new Set(prev);
      if (next.has(postId)) next.delete(postId);
      else next.add(postId);
      return next;
    });
  };

  const handleShare = (post: CommunityPost) => {
    if (navigator.share) {
      navigator.share({
        title: `Study Post by ${post.author.name}`,
        text: post.content,
        url: window.location.href,
      }).catch((err) => {
        if (err.name !== 'AbortError') {
          console.error('Share failed:', err);
        }
      });
    } else {
      alert(`Shared post by ${post.author.name}! (Link copied to clipboard)`);
    }
  };

  return (
    <div className="h-full flex flex-col bg-dark-bg overflow-hidden relative">
      <AnimatePresence mode="wait">
        {fullProfile && (
          <FullProfileView 
            user={fullProfile} 
            onBack={() => setFullProfile(null)}
            posts={posts}
            onPostClick={(post) => {
              setViewedPost(post);
              setFullProfile(null);
            }}
            onChat={() => {
              if (fullProfile) openChatWithUser(fullProfile);
            }}
            isConnected={isConnected(fullProfile.name)}
            onToggleConnect={toggleConnect}
            connectionCount={getConnectionCount(fullProfile.name)}
            currentUserName={currentUser.name}
            onDeletePost={deletePost}
            onToggleLike={toggleLike}
            onToggleMenu={(id) => setActivePostMenuId(activePostMenuId === id ? null : id)}
            activePostMenuId={activePostMenuId}
            onProfileClick={setSelectedProfile}
            onShare={handleShare}
            onEdit={startEditingPost}
            onToggleExpand={(id) => toggleExpand(id)}
            editingPostId={editingPostId}
            editPostText={editPostText}
            setEditPostText={setEditPostText}
            onSaveEdit={handleSavePostEdit}
            onCancelEdit={() => setEditingPostId(null)}
          />
        )}

        <AnimatePresence>
          {activeChat && (
            <ChatInterface 
              chat={activeChat}
              currentUserId={currentUser.name}
              onBack={() => setActiveChatId(null)}
              onSendMessage={(text) => {
                onAddNotification?.({
                  title: 'Message Sent',
                  message: `Your message to ${activeChat.user.name} was sent.`,
                  type: 'info'
                });
              }}
            />
          )}
        </AnimatePresence>
      </AnimatePresence>

      {/* Post Detail View Overlay */}
      <AnimatePresence>
        {viewedPost && !fullProfile && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute inset-0 z-[60] bg-dark-bg flex flex-col pt-2"
          >
            <div className="flex-1 overflow-y-auto px-6 pb-10 scrollbar-hide">
                <div className="flex items-center justify-between py-6 mb-2">
                  <button 
                    onClick={() => {
                      setViewedPost(null);
                      setActivePostMenuId(null);
                      setActiveCommentMenuId(null);
                    }}
                    className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/60 hover:bg-white/10 transition-colors"
                    title="Go back"
                  >
                    <ArrowLeft size={20} />
                  </button>
                  <h3 className="text-sm font-black uppercase tracking-widest text-white">Post Discussion</h3>
                  <div className="w-10" />
                </div>
              
              {/* Post Content */}
              <div className="glass-card border border-white/5 p-5 mb-6 relative">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-3">
                    <div 
                      className="cursor-pointer active:scale-95 transition-transform"
                      onClick={() => setSelectedProfile(viewedPost.author)}
                    >
                      <img 
                        src={viewedPost.author.avatar} 
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-white/5" 
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div 
                      className="cursor-pointer"
                      onClick={() => setSelectedProfile(viewedPost.author)}
                    >
                      <h4 className="text-sm font-bold text-white hover:text-brand-secondary transition-colors">{viewedPost.author.name}</h4>
                      <div className="flex items-center gap-2">
                        <p className="text-[10px] text-white/30 font-bold uppercase tracking-tight">{viewedPost.author.role}</p>
                        <span className="text-[10px] text-white/10">•</span>
                        <span className="text-[9px] font-medium text-white/20">{viewedPost.time}</span>
                      </div>
                    </div>
                  </div>

                  <div className="relative">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setActivePostMenuId(activePostMenuId === viewedPost.id ? null : viewedPost.id);
                      }}
                      className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:bg-white/10 hover:text-white/60 transition-colors"
                    >
                      <MoreHorizontal size={18} />
                    </button>
                    <AnimatePresence>
                      {activePostMenuId === viewedPost.id && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: -10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -10 }}
                          className="absolute right-0 top-full mt-2 w-32 bg-dark-bg border border-white/10 rounded-xl overflow-hidden shadow-2xl z-20"
                        >
                          {viewedPost.author.name === currentUser.name && (
                            <>
                              <button 
                                onClick={() => startEditingPost(viewedPost)}
                                className="w-full px-4 py-2.5 text-left text-[10px] font-black uppercase tracking-widest text-white/60 hover:bg-white/5 transition-colors flex items-center gap-2"
                              >
                                <Edit2 size={12} /> Edit
                              </button>
                              <button 
                                onClick={() => deletePost(viewedPost.id)}
                                className="w-full px-4 py-2.5 text-left text-[10px] font-black uppercase tracking-widest text-red-400 hover:bg-white/5 transition-colors flex items-center gap-2"
                              >
                                <X size={12} /> Delete
                              </button>
                            </>
                          )}
                          <button 
                            onClick={() => {
                              alert('Post reported');
                              setActivePostMenuId(null);
                            }}
                            className="w-full px-4 py-2.5 text-left text-[10px] font-black uppercase tracking-widest text-white/40 hover:bg-white/5 transition-colors flex items-center gap-2"
                          >
                            <Info size={12} /> Report
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
                <div className="text-sm text-white/80 leading-relaxed mb-4">
                  {editingPostId === viewedPost.id ? (
                    <div className="space-y-4">
                      <div className="bg-white/5 border border-white/10 rounded-2xl focus-within:border-brand-secondary transition-all p-4">
                        <MentionInput 
                          value={editPostText}
                          onChange={(e) => setEditPostText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && e.ctrlKey) handleSavePostEdit();
                          }}
                          placeholder="Edit your post..."
                          className="text-white text-sm"
                          autoFocus
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => setEditingPostId(null)}
                          className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-white/40 hover:bg-white/5"
                        >
                          Cancel
                        </button>
                        <button 
                          onClick={handleSavePostEdit}
                          className="px-4 py-2 rounded-xl bg-brand-primary text-dark-bg text-[10px] font-black uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all"
                        >
                          Save Changes
                        </button>
                      </div>
                    </div>
                  ) : (
                    <FormattedContent content={viewedPost.content} onProfileClick={setSelectedProfile} />
                  )}
                </div>
                {viewedPost.image && (
                  <img src={viewedPost.image} className="w-full rounded-2xl mb-4" />
                )}
                <div className="flex items-center gap-6 pt-4 border-t border-white/5">
                  <button 
                    onClick={(e) => toggleLike(viewedPost.id, e)}
                    className={cn(
                      "flex items-center gap-2 transition-colors",
                      viewedPost.isLiked ? "text-red-400" : "text-white/30 hover:text-red-400"
                    )}
                  >
                    <Heart size={18} fill={viewedPost.isLiked ? "currentColor" : "none"} />
                    <span className="text-xs font-bold">{viewedPost.likes}</span>
                  </button>
                  <div className="flex items-center gap-2 text-brand-secondary">
                    <MessageSquare size={18} />
                    <span className="text-xs font-bold">{viewedPost.comments}</span>
                  </div>
                  <button 
                    onClick={() => handleShare(viewedPost)}
                    className="flex items-center gap-2 text-white/30 hover:text-white/60 transition-colors ml-auto active:scale-90"
                  >
                    <Share2 size={18} />
                  </button>
                </div>
              </div>

              {/* Comment Input Bar */}
              <div className="flex flex-col mb-8 p-1">
                <div className="flex gap-3 items-start">
                  <div className="w-10 h-10 rounded-full bg-white/5 overflow-hidden flex-shrink-0">
                    <img src={currentUser.avatar} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 flex gap-3">
                    <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl focus-within:border-brand-secondary transition-all group relative">
                      {showMentions && mentionContext === 'comment' && (
                        <MentionDropdown 
                          suggestions={mentionSuggestions}
                          activeIndex={activeMentionIndex}
                          onSelect={selectMention}
                        />
                      )}
                      <MentionInput 
                        value={commentText}
                        onChange={(e) => handleInputChange(e.target.value, 'comment')}
                        onKeyDown={handleKeyDown}
                        placeholder="Add a comment..."
                        className="text-white text-[12px] font-medium"
                        padding="px-4 py-3"
                        rows={1}
                      />
                    </div>
                    <button 
                      onClick={() => handleSendComment(commentText)}
                      disabled={!commentText.trim()}
                      className="w-10 h-10 rounded-xl bg-brand-secondary flex items-center justify-center text-white shadow-lg shadow-brand-secondary/20 active:scale-95 transition-transform disabled:opacity-50 disabled:grayscale"
                    >
                      <Send size={18} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Enhanced Comment Cards */}
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Comments</h4>
                  <div className="relative">
                    <button 
                      onClick={() => setSortOrder(prev => prev === 'top' ? 'new' : 'top')}
                      className="text-[10px] font-black uppercase tracking-widest text-brand-primary/60 flex items-center gap-1 hover:text-brand-primary transition-colors"
                    >
                      Sort by {sortOrder === 'top' ? 'Top' : 'New'} <ChevronDown size={12} className={cn("transition-transform", sortOrder === 'new' && "rotate-180")} />
                    </button>
                  </div>
                </div>
                
                {(Array.isArray(postComments[viewedPost.id]) ? postComments[viewedPost.id] : []).length > 0 ? (
                  (Array.isArray(postComments[viewedPost.id]) ? postComments[viewedPost.id] : [])
                    .slice() // Create a copy before sorting
                  .sort((a, b) => {
                    if (sortOrder === 'top') return b.likes - a.likes;
                    // For 'new' we'll use ID comparison as proxy for timestamp if not present
                    return b.id.localeCompare(a.id);
                  })
                  .map((comment, i) => (
                    <div key={`comment-container-${comment.id}-${i}`} className="flex flex-col gap-2">
                    <div className="flex gap-4 group">
                      <div 
                        className="cursor-pointer active:scale-95 transition-transform h-fit flex-shrink-0"
                        onClick={() => setSelectedProfile({ name: comment.author.name, avatar: comment.author.avatar, role: 'Contributor' })}
                      >
                        <img 
                          src={comment.author.avatar} 
                          className="w-9 h-9 rounded-full object-cover ring-1 ring-white/10" 
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <span 
                              className="text-xs font-bold text-white tracking-tight cursor-pointer hover:text-brand-secondary transition-colors truncate"
                              onClick={() => setSelectedProfile({ name: comment.author.name, avatar: comment.author.avatar, role: 'Contributor' })}
                            >
                              {comment.author.name}
                            </span>
                            <span className="text-[10px] font-medium text-white/30 shrink-0">{comment.time}</span>
                          </div>
                          <div className="relative">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveCommentMenuId(activeCommentMenuId === comment.id ? null : comment.id);
                              }}
                              className="text-white/20 hover:text-white/60 transition-colors"
                            >
                              <MoreHorizontal size={14} />
                            </button>
                            <AnimatePresence>
                              {activeCommentMenuId === comment.id && (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                  animate={{ opacity: 1, scale: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                  className="absolute right-0 top-full mt-2 w-32 bg-dark-bg border border-white/10 rounded-xl overflow-hidden shadow-2xl z-20"
                                >
                                  {comment.author.name === currentUser.name && (
                                    <button 
                                      onClick={() => startEditingComment(comment)}
                                      className="w-full px-4 py-2.5 text-left text-[10px] font-black uppercase tracking-widest text-white/60 hover:bg-white/5 transition-colors flex items-center gap-2"
                                    >
                                      <Edit2 size={12} /> Edit
                                    </button>
                                  )}
                                  {(viewedPost.author.name === currentUser.name || comment.author.name === currentUser.name) && (
                                    <button 
                                      onClick={() => deleteComment(comment.id)}
                                      className="w-full px-4 py-2.5 text-left text-[10px] font-black uppercase tracking-widest text-red-400 hover:bg-white/5 transition-colors flex items-center gap-2"
                                    >
                                      <X size={12} /> Delete
                                    </button>
                                  )}
                                  <button 
                                    onClick={() => {
                                      alert('Comment reported');
                                      setActiveCommentMenuId(null);
                                    }}
                                    className="w-full px-4 py-2.5 text-left text-[10px] font-black uppercase tracking-widest text-white/40 hover:bg-white/5 transition-colors flex items-center gap-2"
                                  >
                                    <Info size={12} /> Report
                                  </button>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                        
                        <div className="bg-white/5 rounded-2xl rounded-tl-none p-3.5 border border-white/5 mb-2 overflow-hidden">
                          {editingCommentId === comment.id ? (
                            <div className="space-y-3">
                              <div className="bg-white/5 border border-white/10 rounded-xl focus-within:border-brand-secondary transition-all">
                                <MentionInput 
                                  value={editCommentText}
                                  onChange={(e) => setEditCommentText(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' && e.ctrlKey) handleSaveCommentEdit(comment.id);
                                  }}
                                  placeholder="Edit your comment..."
                                  className="text-white text-xs"
                                  padding="px-3 py-2"
                                  autoFocus
                                />
                              </div>
                              <div className="flex justify-end gap-2">
                                <button 
                                  onClick={() => setEditingCommentId(null)}
                                  className="text-[9px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors"
                                >
                                  Cancel
                                </button>
                                <button 
                                  onClick={() => handleSaveCommentEdit(comment.id)}
                                  className="text-[9px] font-black uppercase tracking-widest text-brand-secondary hover:text-white transition-colors"
                                >
                                  Save
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="text-xs text-white/70 leading-relaxed font-medium break-words">
                              <FormattedContent content={comment.content} onProfileClick={setSelectedProfile} />
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-4 px-1">
                          <button 
                            onClick={() => toggleCommentLike(comment.id)}
                            className={cn(
                              "flex items-center gap-1.5 transition-colors group/heart",
                              comment.isLiked ? "text-red-400" : "text-white/30 hover:text-red-400"
                            )}
                          >
                            <Heart size={14} className={cn("transition-all", comment.isLiked ? "fill-red-400 scale-110" : "group-hover/heart:fill-red-400 group-hover/heart:scale-110")} />
                            <span className="text-[10px] font-bold">{comment.likes}</span>
                          </button>
                          <button 
                            onClick={() => setReplyingTo({ commentId: comment.id, authorName: comment.author.name })}
                            className="flex items-center gap-1.5 text-white/30 hover:text-brand-secondary transition-colors group/reply"
                          >
                            <Reply size={14} className="group-hover/reply:scale-110 transition-all" />
                            <span className="text-[10px] font-bold">Reply</span>
                          </button>
                          {comment.replies && comment.replies.length > 0 && (
                            <button 
                              onClick={() => toggleReplyVisibility(comment.id)}
                              className="text-[10px] font-black uppercase tracking-widest text-brand-secondary/60 hover:text-brand-secondary transition-colors ml-auto flex items-center gap-1"
                            >
                              {viewingReplies.has(comment.id) ? 'Hide' : `View ${comment.replies.length}`} replies {viewingReplies.has(comment.id) ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                            </button>
                          )}
                        </div>

                        {/* Inline Reply Input */}
                        <AnimatePresence>
                          {replyingTo?.commentId === comment.id && (
                            <motion.div 
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="mt-4 px-2"
                            >
                              <div className="flex flex-col">
                                <div className="flex items-center justify-between bg-white/5 px-4 py-2 rounded-t-xl border-x border-t border-white/10">
                                  <span className="text-[9px] text-white/40 font-bold uppercase tracking-widest">
                                    Replying to <span className="text-brand-secondary">{replyingTo.authorName}</span>
                                  </span>
                                  <button onClick={() => setReplyingTo(null)} className="text-white/20 hover:text-white">
                                    <X size={10} />
                                  </button>
                                </div>
                                <div className="flex gap-2 items-start bg-white/5 border border-white/10 rounded-b-xl relative">
                                  <div className="flex-1">
                                    {showMentions && mentionContext === 'reply' && (
                                      <MentionDropdown 
                                        suggestions={mentionSuggestions}
                                        activeIndex={activeMentionIndex}
                                        onSelect={selectMention}
                                      />
                                    )}
                                    <MentionInput 
                                      value={commentText}
                                      onChange={(e) => handleInputChange(e.target.value, 'reply')}
                                      onKeyDown={handleKeyDown}
                                      placeholder="Write your reply..."
                                      autoFocus
                                      className="text-white text-[11px] font-medium"
                                      padding="px-3 py-2.5"
                                      rows={1}
                                    />
                                  </div>
                                  <button 
                                    onClick={() => handleSendComment(commentText, comment.id)}
                                    disabled={!commentText.trim()}
                                    className="w-8 h-8 rounded-lg bg-brand-secondary flex items-center justify-center text-white active:scale-95 transition-transform disabled:opacity-50"
                                  >
                                    <Send size={14} />
                                  </button>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                    {/* Replies */}
                    <AnimatePresence>
                      {viewingReplies.has(comment.id) && comment.replies && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="pl-6 sm:pl-10 space-y-4 overflow-hidden mt-2 border-l border-white/5 ml-4 sm:ml-5"
                        >
                          {(Array.isArray(comment.replies) ? comment.replies : []).map((reply, i) => (
                            <div key={`reply-container-${reply.id}-${i}`} className="flex gap-3">
                              <div 
                                className="cursor-pointer active:scale-95 transition-transform h-fit flex-shrink-0"
                                onClick={() => setSelectedProfile({ name: reply.author.name, avatar: reply.author.avatar, role: 'Contributor' })}
                              >
                                <img 
                                  src={reply.author.avatar} 
                                  className="w-7 h-7 rounded-full object-cover ring-1 ring-white/10" 
                                  referrerPolicy="no-referrer"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start mb-1">
                                  <div className="flex items-center gap-2 mb-1 min-w-0 flex-1">
                                    <span 
                                      className="text-[10px] font-bold text-white tracking-tight cursor-pointer hover:text-brand-secondary transition-colors truncate"
                                      onClick={() => setSelectedProfile({ name: reply.author.name, avatar: reply.author.avatar, role: 'Contributor' })}
                                    >
                                      {reply.author.name}
                                    </span>
                                    <span className="text-[9px] font-medium text-white/30 shrink-0">{reply.time}</span>
                                  </div>
                                  <div className="relative">
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setActiveCommentMenuId(activeCommentMenuId === reply.id ? null : reply.id);
                                      }}
                                      className="text-white/20 hover:text-white/60 transition-colors"
                                    >
                                      <MoreHorizontal size={12} />
                                    </button>
                                    <AnimatePresence>
                                      {activeCommentMenuId === reply.id && (
                                        <motion.div
                                          initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                          animate={{ opacity: 1, scale: 1, y: 0 }}
                                          exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                          className="absolute right-0 bottom-full mb-2 w-32 bg-dark-bg border border-white/10 rounded-xl overflow-hidden shadow-2xl z-20"
                                        >
                                          {reply.author.name === currentUser.name && (
                                            <button 
                                              onClick={() => startEditingComment(reply)}
                                              className="w-full px-4 py-2.5 text-left text-[10px] font-black uppercase tracking-widest text-white/60 hover:bg-white/5 transition-colors flex items-center gap-2"
                                            >
                                              <Edit2 size={12} /> Edit
                                            </button>
                                          )}
                                          {(viewedPost.author.name === currentUser.name || reply.author.name === currentUser.name) && (
                                            <button 
                                              onClick={() => deleteComment(reply.id, true, comment.id)}
                                              className="w-full px-4 py-2.5 text-left text-[10px] font-black uppercase tracking-widest text-red-400 hover:bg-white/5 transition-colors flex items-center gap-2"
                                            >
                                              <X size={12} /> Delete
                                            </button>
                                          )}
                                          <button 
                                            onClick={() => {
                                              alert('Reply reported');
                                              setActiveCommentMenuId(null);
                                            }}
                                            className="w-full px-4 py-2.5 text-left text-[10px] font-black uppercase tracking-widest text-white/40 hover:bg-white/5 transition-colors flex items-center gap-2"
                                          >
                                            <Info size={12} /> Report
                                          </button>
                                        </motion.div>
                                      )}
                                    </AnimatePresence>
                                  </div>
                                </div>
                                <div className="bg-white/5 rounded-xl rounded-tl-none p-2.5 border border-white/5 mb-1.5 overflow-hidden">
                                  {editingCommentId === reply.id ? (
                                    <div className="space-y-3">
                                      <div className="bg-white/5 border border-white/10 rounded-xl focus-within:border-brand-secondary transition-all">
                                        <MentionInput 
                                          value={editCommentText}
                                          onChange={(e) => setEditCommentText(e.target.value)}
                                          onKeyDown={(e) => {
                                            if (e.key === 'Enter' && e.ctrlKey) handleSaveCommentEdit(reply.id, true, comment.id);
                                          }}
                                          placeholder="Edit your reply..."
                                          className="text-white text-[11px]"
                                          padding="px-3 py-2"
                                          autoFocus
                                        />
                                      </div>
                                      <div className="flex justify-end gap-2">
                                        <button 
                                          onClick={() => setEditingCommentId(null)}
                                          className="text-[9px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors"
                                        >
                                          Cancel
                                        </button>
                                        <button 
                                          onClick={() => handleSaveCommentEdit(reply.id, true, comment.id)}
                                          className="text-[9px] font-black uppercase tracking-widest text-brand-secondary hover:text-white transition-colors"
                                        >
                                          Save
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="text-[11px] text-white/60 leading-relaxed font-medium break-words">
                                      <FormattedContent content={reply.content} onProfileClick={setSelectedProfile} />
                                    </div>
                                  )}
                                </div>
                                <div className="flex items-center gap-3 px-1">
                                  <button 
                                    onClick={() => toggleCommentLike(reply.id, true, comment.id)}
                                    className={cn(
                                      "flex items-center gap-1.5 transition-colors group/heart",
                                      reply.isLiked ? "text-red-400" : "text-white/30 hover:text-red-400"
                                    )}
                                  >
                                    <Heart size={12} className={cn("transition-all", reply.isLiked ? "fill-red-400 scale-110" : "group-hover/heart:fill-red-400 group-hover/heart:scale-110")} />
                                    <span className="text-[9px] font-bold">{reply.likes}</span>
                                  </button>
                                  <button 
                                    onClick={() => setReplyingTo({ commentId: comment.id, authorName: reply.author.name })}
                                    className="text-[9px] font-bold text-white/20 hover:text-brand-secondary transition-colors"
                                  >
                                    Reply
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                    </div>
                  ))) : (
                  <div className="text-center py-10 opacity-30">
                    <p className="text-xs font-bold italic">No comments yet. Be the first to join the discussion!</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profile Bottom Sheet */}
      <UserProfileBottomSheet 
        user={selectedProfile}
        isOpen={!!selectedProfile}
        onClose={() => setSelectedProfile(null)}
        onChat={() => {
          if (selectedProfile) openChatWithUser(selectedProfile);
        }}
        onViewFullProfile={(user) => {
          setFullProfile(user);
          setSelectedProfile(null);
        }}
        isConnected={selectedProfile ? isConnected(selectedProfile.name) : false}
        onToggleConnect={toggleConnect}
      />
      {/* Header Container */}
      <div className="px-6 pt-3 pb-2 shrink-0">
        {/* Tabs Navigation */}
        <div className="flex bg-white/5 p-1 rounded-2xl mb-4 relative overflow-hidden">
          <motion.div 
            className="absolute top-1 bottom-1 bg-brand-secondary rounded-xl z-0"
            animate={{ 
              left: activeTab === 'feeds' ? '4px' : activeTab === 'groups' ? '33.3%' : '66.6%',
              right: activeTab === 'feeds' ? '66.6%' : activeTab === 'groups' ? '33.3%' : '4px'
            }}
            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
          />
          <button 
            onClick={() => {
              setActiveTab('feeds');
              setActivePostMenuId(null);
              setActiveCommentMenuId(null);
            }}
            className={cn(
              "flex-1 py-3 transition-colors relative z-10 flex justify-center items-center gap-2",
              activeTab === 'feeds' ? "text-white" : "text-white/40"
            )}
          >
            <Rss size={18} />
            <span className="text-[10px] font-bold uppercase tracking-widest hidden sm:inline">Feeds</span>
          </button>
          <button 
            onClick={() => {
              setActiveTab('groups');
              setActivePostMenuId(null);
              setActiveCommentMenuId(null);
            }}
            className={cn(
              "flex-1 py-3 transition-colors relative z-10 flex justify-center items-center gap-2",
              activeTab === 'groups' ? "text-white" : "text-white/40"
            )}
          >
            <Users size={18} />
            <span className="text-[10px] font-bold uppercase tracking-widest hidden sm:inline">Groups</span>
          </button>
          <button 
            onClick={() => {
              setActiveTab('chats');
              setActivePostMenuId(null);
              setActiveCommentMenuId(null);
            }}
            className={cn(
              "flex-1 py-3 transition-colors relative z-10 flex justify-center items-center gap-2",
              activeTab === 'chats' ? "text-white" : "text-white/40"
            )}
          >
            <MessageCircle size={18} />
            <span className="text-[10px] font-bold uppercase tracking-widest hidden sm:inline">Chats</span>
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div 
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto scrollbar-hide px-6 pb-20"
      >
        <AnimatePresence mode="wait">
          {activeTab === 'feeds' && (
            <motion.div 
              key="feeds"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-6 pt-2"
            >
              {/* Trending Tags (Feeds Only) */}
              <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
                  {['General', 'Engineering', 'CS', 'Physics', 'Math'].map(tag => (
                      <button key={tag} className="px-5 py-2 rounded-xl border border-white/5 bg-white/5 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white/80 transition-colors whitespace-nowrap">
                          {tag}
                      </button>
                  ))}
              </div>

              {posts.map((post) => (
                <PostCard 
                  key={post.id}
                  post={post}
                  currentUserName={currentUser.name}
                  onProfileClick={setSelectedProfile}
                  onPostClick={setViewedPost}
                  onToggleLike={toggleLike}
                  onShare={handleShare}
                  activePostMenuId={activePostMenuId}
                  onToggleMenu={(id) => setActivePostMenuId(id)}
                  onEdit={startEditingPost}
                  onDelete={deletePost}
                  editingPostId={editingPostId}
                  editPostText={editPostText}
                  setEditPostText={setEditPostText}
                  onSaveEdit={handleSavePostEdit}
                  onToggleExpand={() => toggleExpand(post.id)}
                  onCancelEdit={() => setEditingPostId(null)}
                />
              ))}

              {/* Post Creation FAB */}
              <AnimatePresence>
                {isFabVisible && (
                  <motion.button
                    initial={{ scale: 0, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0, opacity: 0, y: 20 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowPostCreator(true)}
                    className="fixed bottom-24 right-6 w-14 h-14 bg-brand-primary rounded-full flex items-center justify-center text-dark-bg shadow-[0_8px_30px_rgba(204,255,0,0.4)] z-40"
                  >
                    <Plus size={28} strokeWidth={3} />
                  </motion.button>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {activeTab === 'groups' && (
            <motion.div 
              key="groups"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-6 pt-2"
            >
              <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
                  <button className="px-5 py-2 rounded-xl border border-brand-primary/50 bg-brand-primary/10 text-[10px] font-black uppercase tracking-widest text-brand-primary transition-colors whitespace-nowrap">
                      Discovery
                  </button>
                  {['My Groups', 'Academic', 'Social', 'Hobbies'].map(tag => (
                      <button key={tag} className="px-5 py-2 rounded-xl border border-white/5 bg-white/5 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white/80 transition-colors whitespace-nowrap">
                          {tag}
                      </button>
                  ))}
              </div>
              <div className="grid grid-cols-1 gap-5">
                {MOCK_GROUPS.map(group => (
                  <div key={group.id} className="glass-card overflow-hidden border-none p-0 group hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)] transition-all duration-500">
                    <div className="h-28 relative overflow-hidden">
                      <img src={group.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 opacity-60" />
                      <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-dark-bg/20 to-transparent" />
                      <div className="absolute top-4 left-4">
                        <span className="text-[9px] font-black uppercase tracking-widest bg-brand-primary text-dark-bg px-2 py-1 rounded shadow-lg">
                          {group.tag}
                        </span>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className="text-lg font-black text-white tracking-tight mb-1">{group.name}</h3>
                          <div className="flex items-center gap-2 text-[10px] text-brand-primary font-black uppercase tracking-[0.1em]">
                            <Users size={12} strokeWidth={3} /> {group.members.toLocaleString()} Members
                          </div>
                        </div>
                        <button 
                          onClick={() => toggleJoinGroup(group.id)}
                          className={cn(
                            "px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95",
                            joinedGroups.has(group.id) 
                              ? "bg-white/5 text-white/40 border border-white/10 hover:bg-white/10" 
                              : "bg-brand-primary text-dark-bg shadow-[0_4px_20px_rgba(204,255,0,0.2)] hover:shadow-brand-primary/40 hover:brightness-110"
                          )}
                        >
                          {joinedGroups.has(group.id) ? 'Joined' : 'Join Group'}
                        </button>
                      </div>
                      <p className="text-xs text-white/50 leading-relaxed font-medium">{group.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'chats' && (
            <motion.div 
              key="chats"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-2 pt-2"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Recents</h3>
                <button className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-white transition-all">
                  <Search size={14} />
                </button>
              </div>
              <div className="flex gap-4 mb-8 overflow-x-auto scrollbar-hide pb-2">
                <div className="flex flex-col items-center gap-2 shrink-0 group cursor-pointer">
                  <div className="w-14 h-14 rounded-full border-2 border-dashed border-white/10 flex items-center justify-center text-white/20 group-hover:border-brand-secondary/50 group-hover:text-brand-secondary transition-all">
                    <Plus size={24} />
                  </div>
                  <span className="text-[10px] font-bold text-white/20">New</span>
                </div>
                {chats.filter(c => !c.user.name.includes('Group')).map(chat => (
                  <div 
                    key={`recent-${chat.id}`} 
                    className="flex flex-col items-center gap-2 shrink-0 group cursor-pointer"
                    onClick={() => setActiveChatId(chat.id)}
                  >
                    <div className="relative">
                      <img 
                        src={chat.user.avatar} 
                        className="w-14 h-14 rounded-full object-cover border-2 border-white/5 active:scale-95 transition-transform group-hover:ring-2 group-hover:ring-brand-secondary/30" 
                        referrerPolicy="no-referrer"
                      />
                      {chat.user.online && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-dark-bg rounded-full animate-pulse" />
                      )}
                      {chat.unread > 0 && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-brand-secondary border-2 border-dark-bg rounded-full flex items-center justify-center">
                          <span className="text-[8px] font-black text-white">{chat.unread}</span>
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] font-bold text-white/40 group-hover:text-white transition-colors">{chat.user.name.split(' ')[0]}</span>
                  </div>
                ))}
              </div>

              {chats.map((chat) => (
                <button 
                  key={`all-chats-${chat.id}`}
                  onClick={() => setActiveChatId(chat.id)}
                  className="w-full text-left p-4 rounded-3xl bg-white/2 hover:bg-white/5 active:scale-[0.98] transition-all border border-transparent hover:border-white/5 flex gap-4 group"
                >
                  <div 
                    className="relative shrink-0 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedProfile({ ...chat.user, role: 'Student' });
                    }}
                  >
                    <img 
                      src={chat.user.avatar} 
                      alt={chat.user.name} 
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-transparent group-hover:ring-brand-secondary/20 transition-all" 
                      referrerPolicy="no-referrer"
                    />
                    {chat.user.online && (
                      <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-green-500 border-2 border-dark-bg rounded-full" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <div className="flex justify-between items-center mb-1">
                      <h4 className="text-sm font-bold text-white truncate pr-2 group-hover:text-brand-secondary transition-colors">{chat.user.name}</h4>
                      <span className="text-[9px] font-bold text-white/20 whitespace-nowrap uppercase tracking-widest">{chat.time}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-white/40 truncate font-medium flex-1 pr-4">
                        {chat.lastMessage}
                      </p>
                      {chat.unread > 0 ? (
                        <span className="w-5 h-5 rounded-full bg-brand-secondary text-white text-[10px] font-black flex items-center justify-center shrink-0 shadow-lg shadow-brand-secondary/20">
                          {chat.unread}
                        </span>
                      ) : (
                        <CheckCheck size={14} className="text-brand-secondary/40 shrink-0" />
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Success Toast */}
      <AnimatePresence>
        {successToast && (
          <motion.div 
            key="success-toast-message-pop"
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[300] bg-brand-primary text-dark-bg px-6 py-3 rounded-2xl shadow-[0_10px_30px_rgba(204,255,0,0.3)] flex items-center gap-3"
          >
            <div className="w-6 h-6 rounded-full bg-dark-bg/20 flex items-center justify-center">
              <Check size={14} strokeWidth={3} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest">{successToast}</span>
            <button onClick={() => setSuccessToast(null)} className="ml-2 py-1 px-2 hover:bg-dark-bg/10 rounded-lg transition-colors">
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPostCreator && (
          <CreatePostModal 
            onClose={() => setShowPostCreator(false)}
            onSubmit={(postData) => {
              const newPost: CommunityPost = {
                id: `post-${Date.now()}`,
                author: {
                  ...currentUser,
                  role: 'Engineering Student'
                },
                content: postData.content,
                likes: 0,
                comments: 0,
                tags: postData.tags,
                time: 'Just now',
                image: postData.images?.[0],
                isLiked: false
              };
              setPosts([newPost, ...posts]);
              setShowPostCreator(false);
              setSuccessToast('Your post has been shared successfully!');
              onAddNotification?.({
                title: 'Post Created!',
                message: 'Your thought is now live in the community.',
                type: 'success'
              });
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

interface CreatePostData {
  content: string;
  images?: string[];
  tags: string[];
}

function CreatePostModal({ onClose, onSubmit }: { onClose: () => void, onSubmit: (data: CreatePostData) => void }) {
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isFormatting, setIsFormatting] = useState(false);
  const [showConfirmPublish, setShowConfirmPublish] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formattingMenuRef = useRef<HTMLDivElement>(null);
  const formattingToggleRef = useRef<HTMLButtonElement>(null);
  
  // Mentions logic
  const [mentionQuery, setMentionQuery] = useState('');
  const [showMentions, setShowMentions] = useState(false);
  const [mentionSuggestions, setMentionSuggestions] = useState<any[]>([]);
  const [activeMentionIndex, setActiveMentionIndex] = useState(0);

  // Tags logic
  const [showTags, setShowTags] = useState(false);
  const [tagSuggestions, setTagSuggestions] = useState<string[]>([]);
  const [activeTagIndex, setActiveTagIndex] = useState(0);

  const availableTags = ['General', 'Engineering', 'CS', 'Physics', 'Math', 'HelpNeeded', 'StudyResource'];

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      files.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImages(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleBack = () => {
    if (images.length > 0) {
      setImages([]);
    } else {
      onClose();
    }
  };

  // Click-away logic for dropdowns and formatting menu
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // Close mentions/tags suggestions
      if (showMentions || showTags) {
        if (!target.closest('.editor-container')) {
           setShowMentions(false);
           setShowTags(false);
        }
      }
      
      // Close formatting menu if clicking outside of the menu and the toggle button
      if (isFormatting && 
          formattingMenuRef.current && 
          !formattingMenuRef.current.contains(target) &&
          formattingToggleRef.current &&
          !formattingToggleRef.current.contains(target)) {
        setIsFormatting(false);
      }
    };
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, [showMentions, showTags, isFormatting]);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const wrapSelection = (prefix: string, suffix: string = prefix) => {
    setContent(prev => `${prev}${prefix}template${suffix}`);
  };

  const handleInputChange = (text: string) => {
    setContent(text);
    
    // Check for @mention or #tag
    const lastAtPos = text.lastIndexOf('@');
    const lastHashPos = text.lastIndexOf('#');
    
    // Handle Mentions
    if (lastAtPos !== -1 && (lastAtPos === 0 || text[lastAtPos - 1] === ' ' || text[lastAtPos - 1] === '\n')) {
      const rest = text.slice(lastAtPos + 1);
      const query = rest.split(/[\s\n]/)[0];
      setMentionQuery(query);
      
      const filtered = ALL_COMMUNITY_USERS.filter(u => 
        u.name.toLowerCase().replace(/\s+/g, '').includes(query.toLowerCase())
      );
      
      setMentionSuggestions(filtered);
      setShowMentions(filtered.length > 0);
      setShowTags(false);
      setActiveMentionIndex(0);
    } 
    // Handle Tags
    else if (lastHashPos !== -1 && (lastHashPos === 0 || text[lastHashPos - 1] === ' ' || text[lastHashPos - 1] === '\n')) {
      const rest = text.slice(lastHashPos + 1);
      const query = rest.split(/[\s\n]/)[0];
      
      const filtered = availableTags.filter(t => 
        t.toLowerCase().includes(query.toLowerCase())
      );
      
      setTagSuggestions(filtered);
      setShowTags(filtered.length > 0);
      setShowMentions(false);
      setActiveTagIndex(0);
    }
    else {
      setShowMentions(false);
      setShowTags(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showMentions) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveMentionIndex(prev => (prev + 1) % mentionSuggestions.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveMentionIndex(prev => (prev - 1 + mentionSuggestions.length) % mentionSuggestions.length);
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        selectMention(mentionSuggestions[activeMentionIndex].name);
      } else if (e.key === 'Escape') {
        setShowMentions(false);
      }
    } else if (showTags) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveTagIndex(prev => (prev + 1) % tagSuggestions.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveTagIndex(prev => (prev - 1 + tagSuggestions.length) % tagSuggestions.length);
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        selectTag(tagSuggestions[activeTagIndex]);
      } else if (e.key === 'Escape') {
        setShowTags(false);
      }
    }
  };

  const selectMention = (userName: string) => {
    const lastAtPos = content.lastIndexOf('@');
    if (lastAtPos === -1) return;
    
    const beforeAt = content.slice(0, lastAtPos);
    const rest = content.slice(lastAtPos + 1);
    
    // Find the end of the current mention query (whitespace or end of string)
    let endOfQuery = rest.search(/[\s\n]/);
    if (endOfQuery === -1) endOfQuery = rest.length;
    
    const afterMention = rest.slice(endOfQuery);
    
    // Construct new content: text-before + @selected-name + space + text-after
    // We use trimStart on afterMention to avoid double spaces if the user typed naturally
    const finalContent = `${beforeAt}@${userName} ${afterMention.trimStart()}`;
    setContent(finalContent);
    setShowMentions(false);
    setActiveMentionIndex(0);
  };

  const selectTag = (tag: string) => {
    const lastHashPos = content.lastIndexOf('#');
    if (lastHashPos === -1) return;
    const beforeHash = content.slice(0, lastHashPos);
    const rest = content.slice(lastHashPos + 1);
    
    let endOfQuery = rest.search(/[\s\n]/);
    if (endOfQuery === -1) endOfQuery = rest.length;
    
    const afterTag = rest.slice(endOfQuery);
    
    setContent(`${beforeHash}#${tag} ${afterTag.trimStart()}`);
    if (!selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag]);
    }
    setShowTags(false);
    setActiveTagIndex(0);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
    >
      <div className="absolute inset-0" onClick={onClose} />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative glass-card border-white/20 w-full sm:max-w-[620px] sm:rounded-3xl h-full sm:h-auto sm:max-h-[85vh] flex flex-col z-10 overflow-hidden"
      >
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          {/* Header - Now inside scrollable area */}
          <div className="flex items-center justify-between p-5 border-b border-white/5 bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <button 
                onClick={handleBack}
                className="p-1.5 hover:bg-white/5 rounded-full transition-colors text-white/40 hover:text-white"
              >
                <ArrowLeft size={18} />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-brand-primary/20 flex items-center justify-center shadow-[0_0_15px_rgba(204,255,0,0.1)]">
                   <Pencil size={16} className="text-brand-primary" />
                </div>
                <div>
                   <h3 className="text-xs font-black uppercase tracking-widest text-white">Create Post</h3>
                   <p className="text-[9px] font-bold text-white/20 uppercase tracking-tighter">Share insights</p>
                </div>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 hover:bg-white/5 rounded-full transition-colors text-white/40 hover:text-white">
              <X size={18} />
            </button>
          </div>

          <div className="p-5 sm:p-6 space-y-6">
            {/* User Info */}
            <div className="flex items-center gap-3">
               <img src="https://picsum.photos/seed/alex/100/100" className="w-10 h-10 rounded-full object-cover ring-2 ring-white/5" />
               <div>
                  <h4 className="text-sm font-bold text-white">Alex Simmons</h4>
                  <div className="flex items-center gap-1.5 px-2 py-0.5 bg-brand-secondary/10 rounded-full w-fit">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-secondary" />
                    <span className="text-[8px] font-black uppercase text-brand-secondary tracking-widest">Engineering Senior</span>
                  </div>
               </div>
            </div>

            {/* Editor Container */}
            <div className="space-y-4 editor-container">
              <div className="relative bg-white/5 rounded-[1.5rem] p-6 border border-white/10 focus-within:border-brand-primary/30 transition-all flex flex-col min-h-[220px]">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageChange} 
                  accept="image/*" 
                  multiple
                  className="hidden" 
                />
                
                <MentionInput 
                  value={content}
                  onChange={(e) => handleInputChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="What's on your mind? Use @ to mention peers or # for tags..."
                  className="text-white text-lg leading-relaxed placeholder:text-white/10"
                  rows={5}
                  autoFocus
                  padding="p-0"
                />

                {/* Character Count */}
                <div className="absolute top-6 right-6 flex items-center gap-2">
                  <span className={cn(
                    "text-[10px] font-black tracking-widest uppercase py-1 px-2 rounded-lg backdrop-blur-md",
                    content.length > 500 ? "bg-red-500/20 text-red-500" : "bg-white/5 text-white/20"
                  )}>
                    {content.length}
                  </span>
                </div>

                {/* Formatting Toolbar - Below text but above preview */}
                <div className="flex items-center justify-start gap-2 border-t border-white/5 pt-6 mt-auto">
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                      "w-9 h-9 rounded-xl flex items-center justify-center transition-all",
                      images.length > 0 ? "bg-brand-secondary text-white shadow-lg shadow-brand-secondary/20" : "bg-white/10 text-white/40 hover:text-brand-secondary hover:bg-white/20"
                    )}
                    title="Upload Image"
                  >
                    <ImageIcon size={18} />
                  </button>
                  <button 
                    ref={formattingToggleRef}
                    onClick={() => setIsFormatting(!isFormatting)}
                    className={cn(
                      "w-9 h-9 rounded-xl flex items-center justify-center transition-all",
                      isFormatting ? "bg-brand-secondary text-white shadow-lg shadow-brand-secondary/20" : "bg-white/10 text-white/40 hover:bg-white/20"
                    )}
                    title="Text Formatting"
                  >
                    <Pencil size={13} />
                  </button>
                  <button 
                    onClick={() => {
                      if (showMentions) setShowMentions(false);
                      else {
                        const newText = content.endsWith(' ') || content === '' ? content + '@' : content + ' @';
                        handleInputChange(newText);
                      }
                    }}
                    className={cn(
                      "w-9 h-9 rounded-xl flex items-center justify-center transition-all",
                      showMentions ? "bg-brand-primary text-dark-bg" : "bg-white/10 text-white/40 hover:text-brand-primary hover:bg-white/20"
                    )}
                    title="Mention User"
                  >
                    <AtSign size={18} />
                  </button>
                </div>


              {/* Suggestions Overlay */}
              <AnimatePresence>
                {(showMentions || showTags) && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    className="absolute top-12 left-0 w-full max-w-[340px] z-[150]"
                  >
                    {showMentions && (
                      <MentionDropdown 
                        suggestions={mentionSuggestions}
                        activeIndex={activeMentionIndex}
                        onSelect={selectMention}
                      />
                    )}
                    {showTags && (
                      <TagDropdown 
                        suggestions={tagSuggestions}
                        activeIndex={activeTagIndex}
                        onSelect={selectTag}
                      />
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Inline Formatting Bar */}
              <AnimatePresence>
                 {isFormatting && (
                   <motion.div 
                     ref={formattingMenuRef}
                     initial={{ opacity: 0, scale: 0.95, y: -10 }}
                     animate={{ opacity: 1, scale: 1, y: 0 }}
                     exit={{ opacity: 0, scale: 0.95, y: -10 }}
                     className="mt-6 p-2 bg-dark-bg/95 backdrop-blur-2xl border border-white/10 rounded-[1.5rem] flex flex-wrap gap-2"
                   >
                      <button onClick={() => wrapSelection('**')} className="p-3.5 hover:bg-brand-primary/10 rounded-[1rem] text-white/40 hover:text-brand-primary transition-all"><Bold size={13} /></button>
                      <button onClick={() => wrapSelection('*')} className="p-3.5 hover:bg-brand-primary/10 rounded-[1rem] text-white/40 hover:text-brand-primary transition-all"><Italic size={13} /></button>
                      <button onClick={() => wrapSelection('`')} className="p-3.5 hover:bg-brand-primary/10 rounded-[1rem] text-white/40 hover:text-brand-primary transition-all"><Type size={13} /></button>
                      <button onClick={() => wrapSelection('[', '](url)')} className="p-3.5 hover:bg-brand-primary/10 rounded-[1rem] text-white/40 hover:text-brand-primary transition-all"><LinkIcon size={13} /></button>
                      <div className="w-px bg-white/10 mx-2" />
                      <button onClick={() => wrapSelection('\n- ')} className="p-3.5 hover:bg-brand-primary/10 rounded-[1rem] text-white/40 hover:text-brand-primary transition-all"><List size={13} /></button>
                   </motion.div>
                 )}
              </AnimatePresence>
            </div>
          </div>

          {/* Images Preview Grid */}
          <AnimatePresence>
            {images.length > 0 && (
              <div className="grid grid-cols-2 gap-3 mt-4">
                {images.map((img, idx) => (
                  <motion.div 
                    key={`preview-image-${idx}`}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="relative overflow-hidden border border-white/10 aspect-square bg-black/40 group/img"
                  >
                    <img src={img} className="w-full h-full object-cover" />
                    <button 
                      onClick={() => removeImage(idx)}
                      className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center backdrop-blur-sm transition-all hover:bg-red-500 z-10"
                    >
                      <X size={16} />
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </div>

        </div>

        {/* Confirmation Modal Overlay */}
        <AnimatePresence>
          {showConfirmPublish && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-[210] flex items-center justify-center bg-black/80 backdrop-blur-sm p-6"
            >
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="glass-card border-white/20 p-8 max-w-[320px] text-center"
              >
                <div className="w-12 h-12 rounded-full bg-brand-primary/20 flex items-center justify-center mx-auto mb-4">
                  <Check size={24} className="text-brand-primary" />
                </div>
                <h4 className="text-white font-bold mb-2">Ready to post?</h4>
                <p className="text-white/40 text-[10px] leading-relaxed mb-6 uppercase tracking-widest font-black">Your insights will be shared with the entire community.</p>
                <div className="flex flex-col gap-2">
                  <button 
                    onClick={() => {
                      onSubmit({ content, images, tags: selectedTags });
                      setShowConfirmPublish(false);
                    }}
                    className="w-full py-3.5 bg-brand-primary text-dark-bg text-[10px] font-black uppercase tracking-widest rounded-xl hover:brightness-110 active:scale-95 transition-all shadow-[0_4px_15px_rgba(204,255,0,0.2)]"
                  >
                    Confirm & Publish
                  </button>
                  <button 
                    onClick={() => setShowConfirmPublish(false)}
                    className="w-full py-3 text-white/40 text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors"
                  >
                    Not yet
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer with Publish Button at the absolute bottom - Reduced size */}
        <div className="p-4 border-t border-white/5 bg-white/[0.01] shrink-0">
           <button 
             disabled={!content.trim()}
             onClick={() => setShowConfirmPublish(true)}
             className="w-full py-3.5 bg-brand-primary text-dark-bg text-[10px] font-black uppercase tracking-widest rounded-xl hover:shadow-[0_8px_20px_rgba(204,255,0,0.2)] hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:grayscale disabled:scale-100 disabled:shadow-none"
           >
             Publish
             <Send size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
           </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

interface PostCardProps {
  key?: React.Key;
  post: CommunityPost;
  currentUserName: string;
  onProfileClick?: (author: any) => void;
  onPostClick: (post: any) => void;
  onToggleLike?: (id: string, e?: React.MouseEvent) => void;
  onShare?: (post: any) => void;
  activePostMenuId?: string | null;
  onToggleMenu?: (id: string | null) => void;
  onEdit?: (post: CommunityPost) => void;
  onDelete?: (id: string) => void;
  editingPostId?: string | null;
  editPostText?: string;
  setEditPostText?: (text: string) => void;
  onSaveEdit?: () => void;
  onToggleExpand?: () => void;
  onCancelEdit?: () => void;
}

function FormattedContent({ content, onProfileClick }: { content: string, onProfileClick?: (user: any) => void }) {
  if (!content) return null;
  
  return (
    <div className="markdown-content max-w-none">
      <Markdown
        components={{
          p: ({ children }) => {
            const textContent = React.Children.toArray(children)
              .map(child => (typeof child === 'string' ? child : ''))
              .join('');
            return (
              <p className="mb-1 last:mb-0">
                <MentionHighlight text={textContent} onProfileClick={onProfileClick} />
              </p>
            );
          },
          ul: ({ children }) => <ul className="list-disc ml-4 my-1 space-y-0.5">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal ml-4 my-1 space-y-0.5">{children}</ol>,
          li: ({ children }) => {
            const textContent = React.Children.toArray(children)
              .map(child => (typeof child === 'string' ? child : ''))
              .join('');
            return (
              <li className="mb-0.5 last:mb-0">
                <MentionHighlight text={textContent} onProfileClick={onProfileClick} />
              </li>
            );
          },
          a: ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" className="text-brand-secondary hover:underline transition-colors">{children}</a>,
          strong: ({ children }) => <strong className="font-bold text-white">{children}</strong>,
          em: ({ children }) => <em className="italic text-white/90">{children}</em>,
          code: ({ children }) => <code className="bg-white/10 px-1 py-0.5 rounded text-[0.9em] font-mono text-brand-secondary whitespace-nowrap">{children}</code>
        }}
      >
        {content}
      </Markdown>
    </div>
  );
}

function MentionHighlight({ text, onProfileClick }: { text: string, onProfileClick?: (user: any) => void }) {
  if (!text) return null;
  const names = ALL_COMMUNITY_USERS.map(u => u.name).sort((a,b) => b.length - a.length);
  const escapedNames = names.map(n => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  
  // Also highlight hashtags
  const mentionsRegexStr = `@(?:${escapedNames.join('|')})(?![a-zA-Z0-9])`;
  const combinedRegex = new RegExp(`(${mentionsRegexStr}|#\\w+)`, 'g');
  
  const parts = text.split(combinedRegex);
  
  return (
    <>
      {parts.map((part, i) => {
        if (!part) return null;
        
        const partKey = `mention-highlight-part-${i}-${part.slice(0, 5)}`;
        
        if (part.startsWith('@')) {
          const nameOnly = part.slice(1);
          const user = ALL_COMMUNITY_USERS.find(u => u.name === nameOnly);
          if (user) {
            return (
              <span 
                key={partKey} 
                onClick={(e) => { e.stopPropagation(); onProfileClick?.(user); }}
                className="text-brand-secondary cursor-pointer hover:underline font-bold"
              >
                {part}
              </span>
            );
          }
        }
        
        if (part.startsWith('#')) {
          return (
            <span 
              key={partKey}
              className="text-brand-primary font-bold hover:underline cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              {part}
            </span>
          );
        }
        
        return <React.Fragment key={partKey}>{part}</React.Fragment>;
      })}
    </>
  );
}

function TagDropdown({ 
  suggestions, 
  activeIndex, 
  onSelect 
}: { 
  suggestions: string[], 
  activeIndex: number, 
  onSelect: (tag: string) => void 
}) {
  return (
    <div className="w-full bg-dark-bg border border-white/10 rounded-2xl shadow-2xl overflow-hidden p-1.5 backdrop-blur-xl">
      <div className="px-3 py-2 border-b border-white/5 mb-1.5 flex items-center justify-between">
        <span className="text-[10px] font-black uppercase tracking-widest text-white/30 flex items-center gap-2">
          <Tag size={12} /> Select Tag
        </span>
        <span className="text-[8px] font-bold text-white/20 uppercase tracking-tighter">Use # to filter</span>
      </div>
      <div className="max-h-[200px] overflow-y-auto scrollbar-hide space-y-0.5">
        {suggestions.map((tag, i) => (
          <button
            key={`tag-sugg-${tag}-${i}`}
            onClick={() => onSelect(tag)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left group",
              i === activeIndex ? "bg-brand-primary text-dark-bg" : "text-white/60 hover:bg-white/5 hover:text-white"
            )}
          >
            <div className={cn(
              "p-1.5 rounded-lg transition-colors",
              i === activeIndex ? "bg-dark-bg/20" : "bg-white/5 group-hover:bg-white/10"
            )}>
               <Tag size={10} />
            </div>
            <span className="text-xs font-bold truncate">#{tag}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function MentionDropdown({ 
  suggestions, 
  activeIndex, 
  onSelect 
}: { 
  suggestions: any[], 
  activeIndex: number, 
  onSelect: (name: string) => void 
}) {
  return (
    <div className="w-full bg-dark-bg border border-white/10 rounded-2xl shadow-2xl overflow-hidden p-1.5 backdrop-blur-xl">
      <div className="px-3 py-2 border-b border-white/5 mb-1.5">
        <span className="text-[10px] font-black uppercase tracking-widest text-white/30 flex items-center gap-2">
          <AtSign size={12} /> Mention User
        </span>
      </div>
      <div className="max-h-[200px] overflow-y-auto scrollbar-hide space-y-0.5 text-white">
        {suggestions.map((suggestion, i) => (
          <button
            key={`mention-sugg-${suggestion.name}-${i}`}
            onClick={() => onSelect(suggestion.name)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left group",
              i === activeIndex ? "bg-brand-primary text-dark-bg" : "text-white/60 hover:bg-white/5 hover:text-white"
            )}
          >
            <img src={suggestion.avatar} className="w-8 h-8 rounded-full object-cover ring-2 ring-white/5" />
            <div className="min-w-0">
              <div className="text-xs font-bold truncate">{suggestion.name}</div>
              <div className={cn(
                "text-[9px] truncate font-medium uppercase tracking-tight",
                i === activeIndex ? "text-dark-bg/60" : "text-white/30"
              )}>{suggestion.role}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function PostCard({ 
  post, 
  currentUserName, 
  onProfileClick, 
  onPostClick,
  onToggleLike,
  onShare,
  activePostMenuId,
  onToggleMenu,
  onEdit,
  onDelete,
  editingPostId,
  editPostText,
  setEditPostText,
  onSaveEdit,
  onToggleExpand,
  onCancelEdit
}: PostCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="glass-card border border-white/5 p-5 group relative">
      <div className="flex justify-between items-start mb-4">
        <div className="flex gap-3">
          <div 
            className={cn(
              "relative transition-transform",
              onProfileClick && "cursor-pointer active:scale-95"
            )}
            onClick={() => onProfileClick?.(post.author)}
          >
            <img 
              src={post.author.avatar} 
              alt={post.author.name} 
              className="w-10 h-10 rounded-full object-cover ring-2 ring-white/5" 
              referrerPolicy="no-referrer" 
            />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-dark-bg rounded-full" />
          </div>
          <div>
            <h4 
              className={cn(
                "text-sm font-bold text-white transition-colors",
                onProfileClick && "cursor-pointer group-hover:text-brand-secondary"
              )}
              onClick={() => onProfileClick?.(post.author)}
            >
              {post.author.name}
            </h4>
            <div className="flex items-center gap-2">
              <p className="text-[10px] text-white/30 font-bold uppercase tracking-tight">{post.author.role}</p>
              <span className="text-[10px] text-white/10">•</span>
              <span className="text-[9px] font-medium text-white/20 whitespace-nowrap">{post.time}</span>
            </div>
          </div>
        </div>

        {onToggleMenu && (
          <div className="relative">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onToggleMenu(activePostMenuId === post.id ? null : post.id);
              }}
              className="text-white/20 hover:text-white/60 transition-colors active:scale-90"
            >
              <MoreHorizontal size={18} />
            </button>
            <AnimatePresence>
              {activePostMenuId === post.id && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className="absolute right-0 top-full mt-2 w-32 bg-dark-bg border border-white/10 rounded-xl overflow-hidden shadow-2xl z-20"
                >
                  {post.author.name === currentUserName && onEdit && (
                    <button 
                      onClick={() => onEdit(post)}
                      className="w-full px-4 py-2.5 text-left text-[10px] font-black uppercase tracking-widest text-white/60 hover:bg-white/5 transition-colors flex items-center gap-2"
                    >
                      <Edit2 size={12} /> Edit
                    </button>
                  )}
                  {post.author.name === currentUserName && onDelete && (
                    <button 
                      onClick={() => onDelete(post.id)}
                      className="w-full px-4 py-2.5 text-left text-[10px] font-black uppercase tracking-widest text-red-400 hover:bg-white/5 transition-colors flex items-center gap-2"
                    >
                      <X size={12} /> Delete
                    </button>
                  )}
                  <button 
                    onClick={() => {
                      alert('Post reported');
                      onToggleMenu(null);
                    }}
                    className="w-full px-4 py-2.5 text-left text-[10px] font-black uppercase tracking-widest text-white/40 hover:bg-white/5 transition-colors flex items-center gap-2"
                  >
                    <Info size={12} /> Report
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      <div 
        className="mb-4 cursor-pointer" 
        onClick={() => !editingPostId && onPostClick(post)}
      >
        {editingPostId === post.id ? (
          <div className="space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="bg-white/5 border border-white/10 rounded-2xl focus-within:border-brand-secondary transition-all p-4">
              <MentionInput 
                value={editPostText || ''}
                onChange={(e) => setEditPostText?.(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.ctrlKey) onSaveEdit?.();
                }}
                placeholder="Edit your post..."
                className="text-white text-sm"
                autoFocus
              />
            </div>
            <div className="flex justify-end gap-2">
              <button 
                onClick={onCancelEdit}
                className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-white/40 hover:bg-white/5"
              >
                Cancel
              </button>
              <button 
                onClick={onSaveEdit}
                className="px-4 py-2 rounded-xl bg-brand-primary text-dark-bg text-[10px] font-black uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all"
              >
                Save Changes
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className={cn(
              "text-sm text-white/70 leading-relaxed overflow-hidden",
              (!isExpanded && post.content.length > 150) && "line-clamp-3"
            )}>
              <FormattedContent content={post.content} onProfileClick={onProfileClick} />
            </div>
            {post.content.length > 150 && (
              <button 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  setIsExpanded(!isExpanded);
                  onToggleExpand?.(); 
                }}
                className="text-[10px] font-black uppercase tracking-widest text-brand-secondary mt-2 hover:text-white transition-colors"
              >
                {isExpanded ? 'Show Less' : 'Read More'}
              </button>
            )}
          </>
        )}
      </div>

      {post.image && (
        <div 
          className="rounded-2xl overflow-hidden mb-4 border border-white/5 cursor-pointer" 
          onClick={() => onPostClick(post)}
        >
          <img src={post.image} className="w-full h-auto object-cover max-h-64" alt="Post" />
        </div>
      )}

      <div className="flex items-center gap-6 pt-4 border-t border-white/5">
        <button 
          onClick={(e) => onToggleLike?.(post.id, e)}
          className={cn(
            "flex items-center gap-2 transition-colors",
            post.isLiked ? "text-red-400" : "text-white/30",
            onToggleLike && "hover:text-red-400"
          )}
        >
          <Heart size={18} fill={post.isLiked ? "currentColor" : "none"} />
          <span className="text-xs font-bold">{post.likes}</span>
        </button>
        <button 
          onClick={() => onPostClick(post)}
          className="flex items-center gap-2 text-brand-secondary hover:text-brand-primary transition-colors"
        >
          <MessageSquare size={18} />
          <span className="text-xs font-bold">{post.comments}</span>
        </button>
        {onShare && (
          <button 
            onClick={() => onShare(post)}
            className="ml-auto flex items-center gap-2 text-white/20 hover:text-white/60 transition-colors active:scale-95"
          >
            <Share2 size={18} />
          </button>
        )}
      </div>
    </div>
  );
}

function FullProfileView({ 
  user, 
  onBack, 
  posts, 
  onPostClick,
  onChat,
  isConnected,
  onToggleConnect,
  connectionCount,
  currentUserName,
  onDeletePost,
  onToggleLike,
  onToggleMenu,
  activePostMenuId,
  onProfileClick,
  onShare,
  onEdit,
  onToggleExpand,
  editingPostId,
  editPostText,
  setEditPostText,
  onSaveEdit,
  onCancelEdit
}: { 
  user: any; 
  onBack: () => void; 
  posts: any[];
  onPostClick: (post: any) => void;
  onChat: () => void;
  isConnected: boolean;
  onToggleConnect: (user: any) => void;
  connectionCount: number;
  currentUserName: string;
  onDeletePost: (id: string) => void;
  onToggleLike: (id: string, e: React.MouseEvent) => void;
  onToggleMenu: (id: string) => void;
  activePostMenuId: string | null;
  onProfileClick: (user: any) => void;
  onShare: (post: any) => void;
  onEdit: (post: CommunityPost) => void;
  onToggleExpand: (id: string) => void;
  editingPostId: string | null;
  editPostText: string;
  setEditPostText: (text: string) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
}) {
  const [activeTab, setActiveTab] = useState<'posts' | 'media' | 'about'>('posts');
  
  const fullUser = {
    ...user,
    coverPhoto: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80',
    handle: `@${user.name.toLowerCase().replace(/\s+/g, '')}`,
    academicLevel: '200L',
    bio: user.bio || "Silence is priceless 👌",
    skills: ['Stocks', 'Trading', 'Analysis'],
  };

  const userPosts = posts.filter(p => p.author.name === user.name);

  return (
    <motion.div 
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="fixed inset-0 z-[150] bg-dark-bg flex flex-col pt-0 overflow-y-auto scrollbar-hide"
    >
      {/* Cover Photo */}
      <div className="relative h-48 w-full shrink-0">
        <img 
          src={fullUser.coverPhoto} 
          className="w-full h-full object-cover"
          alt="Cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-dark-bg" />
        <button 
          onClick={onBack}
          className="absolute top-6 left-6 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white/80 hover:text-white transition-colors z-30"
        >
          <ArrowLeft size={20} />
        </button>
      </div>

      {/* Profile Info */}
      <div className="px-6 -mt-12 relative z-10">
        <div className="relative mb-4 inline-block">
          <img 
            src={fullUser.avatar} 
            className="w-28 h-28 rounded-full border-4 border-dark-bg object-cover shadow-2xl"
            alt={fullUser.name}
            referrerPolicy="no-referrer"
          />
          {fullUser.online && (
            <div className="absolute bottom-2 right-2 w-5 h-5 bg-green-500 border-2 border-dark-bg rounded-full shadow-lg" />
          )}
        </div>

        <h2 className="text-3xl font-black text-white mb-1 tracking-tight">{fullUser.name}</h2>
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <span className="text-xs text-white/40 font-medium">{fullUser.handle}</span>
          <span className="text-white/20">•</span>
          <span className="text-xs text-white/40 font-medium">{fullUser.academicLevel}</span>
          <span className="text-white/20">•</span>
          <span className="text-xs font-bold text-brand-secondary">{connectionCount} Connections</span>
        </div>

        <p className="text-sm text-white/60 leading-relaxed mb-6 font-medium">
          {fullUser.bio}
        </p>

        {/* Skills Tags */}
        <div className="flex flex-wrap gap-2 mb-8">
          {fullUser.skills.map((skill: string) => (
            <div key={skill} className="px-5 py-2 rounded-xl bg-white/[0.03] border border-white/5 active:bg-white/10 transition-colors cursor-pointer">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/60">{skill}</span>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mb-12">
          <button 
            onClick={() => onToggleConnect(user)}
            className={cn(
              "flex-1 h-12 rounded-2xl flex items-center justify-center gap-2 font-black uppercase tracking-widest text-[11px] active:scale-95 transition-all shadow-xl",
              isConnected 
                ? "bg-white/5 border border-white/10 text-white/60 shadow-none" 
                : "bg-brand-secondary text-white shadow-brand-secondary/20 hover:brightness-110"
            )}
          >
            {isConnected ? (
              <><Check size={16} /> Connected</>
            ) : (
              <><UserPlus size={16} /> Connect</>
            )}
          </button>
          <button 
            onClick={onChat}
            className="w-12 h-12 bg-white/[0.03] border border-white/5 rounded-2xl flex items-center justify-center text-white active:scale-95 transition-all hover:bg-white/10"
          >
            <MessageCircle size={20} />
          </button>
        </div>

        {/* Profile Tabs */}
        <div className="flex border-b border-white/5 mb-6 sticky top-0 bg-dark-bg z-20 pt-2">
          {['posts', 'media', 'about'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className="flex-1 py-5 relative group"
            >
              <span className={cn(
                "text-[10px] font-black uppercase tracking-widest transition-colors",
                activeTab === tab ? "text-white" : "text-white/30 group-hover:text-white/60"
              )}>
                {tab}
              </span>
              {activeTab === tab && (
                <motion.div 
                  layoutId="profileTabLine"
                  className="absolute bottom-0 left-6 right-6 h-0.5 bg-brand-secondary shadow-[0_0_15px_rgba(10,132,255,0.6)]"
                />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="pb-20">
          {activeTab === 'posts' && (
            <div className="space-y-6">
              {userPosts.length > 0 ? (
                userPosts.map((post) => (
                  <PostCard 
                    key={post.id}
                    post={post}
                    currentUserName={currentUserName}
                    onProfileClick={onProfileClick}
                    onPostClick={onPostClick}
                    onToggleLike={onToggleLike}
                    onToggleMenu={onToggleMenu}
                    activePostMenuId={activePostMenuId}
                    onDelete={onDeletePost}
                    onShare={onShare}
                    onEdit={onEdit}
                    editingPostId={editingPostId}
                    editPostText={editPostText}
                    setEditPostText={setEditPostText}
                    onSaveEdit={onSaveEdit}
                    onToggleExpand={() => onToggleExpand(post.id)}
                    onCancelEdit={onCancelEdit}
                  />
                ))
              ) : (
                <div className="text-center py-24 bg-white/[0.02] rounded-[40px] border border-dashed border-white/10">
                  <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">No posts yet</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'media' && (
            <div className="grid grid-cols-2 gap-4">
              {userPosts.filter(p => p.image).map((post) => (
                <div 
                  key={post.id} 
                  onClick={() => onPostClick(post)}
                  className="aspect-square rounded-[32px] overflow-hidden glass border border-white/5 active:scale-95 transition-transform cursor-pointer"
                >
                  <img src={post.image} className="w-full h-full object-cover" alt="Media" />
                </div>
              ))}
              {userPosts.filter(p => p.image).length === 0 && (
                <div className="col-span-2 text-center py-24 bg-white/[0.02] rounded-[40px] border border-dashed border-white/10">
                  <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">No media shared</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'about' && (
            <div className="space-y-6">
              <div className="glass p-6 rounded-[32px] border border-white/5">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-brand-secondary mb-6">Academic Credentials</h4>
                <div className="space-y-5">
                  <div className="flex justify-between items-center group">
                    <span className="text-xs text-white/30 font-medium">Level</span>
                    <span className="text-xs font-black text-white/80">{fullUser.academicLevel}</span>
                  </div>
                  <div className="flex justify-between items-center group">
                    <span className="text-xs text-white/30 font-medium">Institution</span>
                    <span className="text-xs font-black text-white/80">Federal University of Tech</span>
                  </div>
                  <div className="flex justify-between items-center group">
                    <span className="text-xs text-white/30 font-medium">Department</span>
                    <span className="text-xs font-black text-white/80">Computer Science</span>
                  </div>
                  <div className="flex justify-between items-center group">
                    <span className="text-xs text-white/30 font-medium">Major</span>
                    <span className="text-xs font-black text-white/80">Artificial Intelligence</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

