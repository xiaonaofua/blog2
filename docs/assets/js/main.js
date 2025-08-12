// 博客主要 JavaScript 文件
(function() {
    'use strict';

    // 等待 DOM 加載完成
    document.addEventListener('DOMContentLoaded', function() {
        initShareButtons();
        initScrollToTop();
        initLazyLoading();
        initReadingTime();
    });

    // 分享功能
    function initShareButtons() {
        const shareButtons = document.querySelectorAll('.share-button');
        
        shareButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                
                const shareType = this.dataset.share;
                const url = encodeURIComponent(window.location.href);
                const title = encodeURIComponent(document.title);
                
                let shareUrl = '';
                
                switch(shareType) {
                    case 'twitter':
                        shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${title}`;
                        break;
                    case 'facebook':
                        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
                        break;
                    case 'copy':
                        copyToClipboard(window.location.href);
                        showNotification('鏈接已複製到剪貼板');
                        return;
                }
                
                if (shareUrl) {
                    window.open(shareUrl, '_blank', 'width=600,height=400');
                }
            });
        });
    }

    // 複製到剪貼板
    function copyToClipboard(text) {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).catch(function(err) {
                console.error('複製失敗:', err);
                fallbackCopyTextToClipboard(text);
            });
        } else {
            fallbackCopyTextToClipboard(text);
        }
    }

    // 備用複製方法
    function fallbackCopyTextToClipboard(text) {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        
        // 避免滾動到底部
        textArea.style.top = "0";
        textArea.style.left = "0";
        textArea.style.position = "fixed";
        
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            document.execCommand('copy');
        } catch (err) {
            console.error('備用複製方法失敗:', err);
        }
        
        document.body.removeChild(textArea);
    }

    // 顯示通知
    function showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--color-accent);
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 1000;
            opacity: 0;
            transform: translateX(100px);
            transition: all 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        // 顯示動畫
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // 自動隱藏
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100px)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // 回到頂部功能
    function initScrollToTop() {
        // 創建回到頂部按鈕
        const scrollToTopButton = document.createElement('button');
        scrollToTopButton.innerHTML = '↑';
        scrollToTopButton.className = 'scroll-to-top';
        scrollToTopButton.style.cssText = `
            position: fixed;
            bottom: 30px;
            right: 30px;
            width: 50px;
            height: 50px;
            border: none;
            border-radius: 50%;
            background: var(--color-accent);
            color: white;
            font-size: 20px;
            cursor: pointer;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
            z-index: 100;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        `;
        
        document.body.appendChild(scrollToTopButton);
        
        // 監聽滾動事件
        let ticking = false;
        window.addEventListener('scroll', function() {
            if (!ticking) {
                requestAnimationFrame(function() {
                    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                    
                    if (scrollTop > 300) {
                        scrollToTopButton.style.opacity = '1';
                        scrollToTopButton.style.visibility = 'visible';
                    } else {
                        scrollToTopButton.style.opacity = '0';
                        scrollToTopButton.style.visibility = 'hidden';
                    }
                    
                    ticking = false;
                });
                ticking = true;
            }
        });
        
        // 點擊回到頂部
        scrollToTopButton.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // 圖片懶加載
    function initLazyLoading() {
        const images = document.querySelectorAll('img[loading="lazy"]');
        
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver(function(entries, observer) {
                entries.forEach(function(entry) {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src || img.src;
                        img.classList.remove('lazy');
                        imageObserver.unobserve(img);
                    }
                });
            });
            
            images.forEach(function(img) {
                imageObserver.observe(img);
            });
        } else {
            // 備用方案：直接加載所有圖片
            images.forEach(function(img) {
                img.src = img.dataset.src || img.src;
            });
        }
    }

    // 計算閱讀時間
    function initReadingTime() {
        const readingTimeElements = document.querySelectorAll('.post-reading-time');
        
        readingTimeElements.forEach(function(element) {
            const content = document.querySelector('.post-content');
            if (content) {
                const text = content.textContent || content.innerText || '';
                const wordsPerMinute = 200; // 中文平均閱讀速度
                const wordCount = text.length;
                const readingTime = Math.ceil(wordCount / wordsPerMinute);
                
                element.textContent = `預計閱讀時間 ${readingTime} 分鐘`;
            }
        });
    }

    // 添加鍵盤導航支持
    document.addEventListener('keydown', function(e) {
        // ESC 鍵關閉模態框或返回頂部
        if (e.key === 'Escape') {
            const modals = document.querySelectorAll('.modal, .overlay');
            modals.forEach(function(modal) {
                if (modal.style.display !== 'none') {
                    modal.style.display = 'none';
                }
            });
        }
        
        // Ctrl/Cmd + K 搜索（如果有搜索功能）
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            const searchInput = document.querySelector('.search-input');
            if (searchInput) {
                searchInput.focus();
            }
        }
    });

    // 添加平滑滾動到錨點
    document.addEventListener('click', function(e) {
        const link = e.target.closest('a[href^="#"]');
        if (link) {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    });

    // 頁面加載完成後的優化
    window.addEventListener('load', function() {
        // 移除加載動畫（如果有）
        const loader = document.querySelector('.loader');
        if (loader) {
            loader.style.opacity = '0';
            setTimeout(() => {
                loader.style.display = 'none';
            }, 300);
        }
        
        // 預加載關鍵資源
        preloadCriticalResources();
    });

    // 預加載關鍵資源
    function preloadCriticalResources() {
        const criticalLinks = document.querySelectorAll('a[href^="/posts/"]');
        const linkPrefetcher = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    const link = entry.target;
                    const prefetchLink = document.createElement('link');
                    prefetchLink.rel = 'prefetch';
                    prefetchLink.href = link.href;
                    document.head.appendChild(prefetchLink);
                    linkPrefetcher.unobserve(link);
                }
            });
        });
        
        criticalLinks.forEach(function(link) {
            linkPrefetcher.observe(link);
        });
    }

})();