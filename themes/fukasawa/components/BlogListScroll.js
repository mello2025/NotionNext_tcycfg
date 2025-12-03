import { siteConfig } from '@/lib/config';
import { useGlobal } from '@/lib/global';
import throttle from 'lodash.throttle';
import { useCallback, useEffect, useRef, useState } from 'react';
import BlogCard from './BlogCard';
import BlogPostListEmpty from './BlogListEmpty';

const BlogListScroll = ({ posts }) => {
  const { locale, NOTION_CONFIG } = useGlobal();
  const [page, setPage] = useState(1);
  const POSTS_PER_PAGE = siteConfig('POSTS_PER_PAGE', null, NOTION_CONFIG);
  const [displayedPosts, setDisplayedPosts] = useState([]);
  const [hasMore, setHasMore] = useState(true);

  // 每页显示的文章数量 - 增加到合适数量
  const postsPerPage = POSTS_PER_PAGE || 12; // 默认12篇，可以调整

  // 计算总页数
  const totalPages = Math.ceil(posts.length / postsPerPage);

  // 加载更多文章
  const loadMorePosts = () => {
    if (page < totalPages) {
      setPage(prev => prev + 1);
    } else {
      setHasMore(false);
    }
  };

  // 一次性加载所有当前页的文章
  useEffect(() => {
    const endIndex = page * postsPerPage;
    const postsToShow = posts.slice(0, endIndex);
    setDisplayedPosts(postsToShow);
    setHasMore(endIndex < posts.length);
  }, [posts, page, postsPerPage]);

  const targetRef = useRef(null);

  // 监听滚动自动分页加载
  const scrollTrigger = useCallback(
    throttle(() => {
      if (!hasMore) return;
      
      const scrollS = window.scrollY + window.outerHeight;
      const clientHeight = targetRef.current?.clientHeight || 0;
      
      // 当滚动到距离底部300px时加载更多
      if (scrollS > clientHeight - 300) {
        loadMorePosts();
      }
    }, 500)
  );

  useEffect(() => {
    window.addEventListener('scroll', scrollTrigger);
    return () => {
      window.removeEventListener('scroll', scrollTrigger);
    };
  }, [scrollTrigger, hasMore]);

  if (!posts || posts.length === 0) {
    return <BlogPostListEmpty />;
  }

  return (
    <div ref={targetRef} className="min-h-screen">
      {/* 移除列排序逻辑，使用简单的网格布局 */}
      <div id="posts-wrapper" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {displayedPosts.map((post, index) => (
          <div key={post.id} className="h-full">
            <BlogCard 
              key={post.id} 
              post={post} 
              showAnimate={index >= (page - 1) * postsPerPage}
            />
          </div>
        ))}
      </div>
      
      {hasMore && (
        <div className="w-full my-8 text-center">
          <button
            onClick={loadMorePosts}
            className="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200 font-medium"
          >
            {locale.COMMON.MORE}
          </button>
          <p className="mt-2 text-gray-500 text-sm">
            {`${displayedPosts.length} / ${posts.length}`}
          </p>
        </div>
      )}
      
      {!hasMore && displayedPosts.length > 0 && (
        <div className="w-full my-12 text-center">
          <div className="inline-block px-6 py-3 bg-gray-100 text-gray-600 rounded-lg">
            {locale.COMMON.NO_MORE} 😊
          </div>
          <p className="mt-2 text-gray-500 text-sm">
            {`${displayedPosts.length} / ${posts.length}`}
          </p>
        </div>
      )}
    </div>
  );
};

export default BlogListScroll;
