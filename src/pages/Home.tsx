import { useState, useRef, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useTheme } from '@/hooks/useTheme';
import { FileTree } from '@/components/FileTree';
import '@/styles/plyr-controls.css';

// 定义文件和文件夹的类型
export interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  parentId: string | null;
  path: string;
  size?: number;
  lastModified?: number;
  children?: FileNode[];
}

// 循环滚动的视频标题组件
const ScrollingVideoTitle = ({ title }: { title: string }) => {
  const [isScrolling, setIsScrolling] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const titleRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 检查标题是否需要滚动
  const checkIfNeedsScroll = useCallback(() => {
    if (titleRef.current && containerRef.current) {
      const titleWidth = titleRef.current.scrollWidth;
      const containerWidth = containerRef.current.clientWidth;
      setIsScrolling(titleWidth > containerWidth);
    }
  }, [title]);

  // 处理滚动动画
  useEffect(() => {
    checkIfNeedsScroll();
    
    const handleResize = () => {
      checkIfNeedsScroll();
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [title, checkIfNeedsScroll]);

  // 滚动动画
  useEffect(() => {
    if (!isScrolling) {
      setScrollPosition(0);
      return;
    }

    let animationFrameId: number;
    let startTime: number;
    const duration = 15000;
    
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = ((timestamp - startTime) % duration) / duration;
      
      if (titleRef.current) {
        const titleWidth = titleRef.current.scrollWidth;
        const containerWidth = containerRef.current?.clientWidth || 0;
        
        const maxScroll = Math.max(0, titleWidth - containerWidth);
        setScrollPosition(progress <= 0.5 
          ? maxScroll * (progress / 0.5) 
          : maxScroll * ((1 - progress) / 0.5));
      }
      
      animationFrameId = requestAnimationFrame(animate);
    };
    
    animationFrameId = requestAnimationFrame(animate);
    
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isScrolling]);

  return (
    <div 
      ref={containerRef}
      className="relative overflow-hidden whitespace-nowrap"
      style={{
        width: '100%',
        maxWidth: '300px'
      }}
    >
      <div 
        ref={titleRef}
        className="inline-block"
        style={{
          transform: isScrolling ? `translateX(-${scrollPosition}px)` : 'translateX(0)',
          transition: isScrolling ? 'none' : 'transform 0.3s ease-out'
        }}
      >
        {title}
      </div>
    </div>
  );
};

// 从media文件夹导入文件树数据
import { fileTreeData } from '@/media/fileData';

export default function VideoPlayer() {
  const { toggleTheme, isDark } = useTheme();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [currentVideoName, setCurrentVideoName] = useState<string>('');
  const [sidebarWidth, setSidebarWidth] = useState<number>(300);
  const [isResizing, setIsResizing] = useState<boolean>(false);
  const [isFilePanelCollapsed, setIsFilePanelCollapsed] = useState(false);
  const [isVerticalLayout, setIsVerticalLayout] = useState<boolean>(false);
  const [isAutoPlayEnabled, setIsAutoPlayEnabled] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(1);
  const [buffered, setBuffered] = useState<number>(0);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const autoPlayButtonRef = useRef<HTMLButtonElement>(null);
  const settingsButtonRef = useRef<HTMLButtonElement>(null);
  const settingsMenuRef = useRef<HTMLDivElement>(null);

  // 递归获取所有视频文件列表
  const getAllVideoFiles = useCallback((nodes: FileNode[]): FileNode[] => {
    let files: FileNode[] = [];
    
    nodes.forEach(node => {
      if (node.type === 'file' && node.name.endsWith('.mp4')) {
        files.push(node);
      } else if (node.type === 'folder' && node.children) {
        files = [...files, ...getAllVideoFiles(node.children)];
      }
    });
    
    return files;
  }, []);

  // 获取下一个要播放的视频文件
  const getNextVideo = useCallback((currentVideoName: string): FileNode | null => {
    const allVideos = getAllVideoFiles(fileTreeData);
    
    let currentIndex = allVideos.findIndex(video => video.name === currentVideoName);
    
    if (currentIndex === -1) {
      if (selectedFile && 'path' in selectedFile) {
        currentIndex = allVideos.findIndex(video => video.path === (selectedFile as any).path);
      }
    }
    
    if (currentIndex !== -1 && currentIndex < allVideos.length - 1) {
      return allVideos[currentIndex + 1];
    }
    
    return allVideos.length > 0 ? allVideos[0] : null;
  }, [getAllVideoFiles, selectedFile]);

  // 创建文件对象
  const createFileObject = useCallback((node: FileNode): File => {
    const file = new File([''], node.name, { 
      type: 'video/mp4',
      lastModified: node.lastModified || Date.now()
    });
    
    Object.defineProperty(file, 'path', { value: node.path });
    Object.defineProperty(file, 'size', { value: node.size });
    
    return file;
  }, []);

  // 处理视频时间更新
  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      
      if (videoRef.current.buffered.length > 0) {
        const bufferedEnd = videoRef.current.buffered.end(videoRef.current.buffered.length - 1);
        const duration = videoRef.current.duration;
        if (duration > 0) {
          const bufferedPercent = (bufferedEnd / duration) * 100;
          setBuffered(bufferedPercent);
        }
      }
    }
  }, []);

  // 处理视频加载完成
  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      
      const isAutoPlayTriggered = videoRef.current.currentTime > 0;
      
      setIsPlaying(false);
      
      if (isAutoPlayTriggered) {
        setTimeout(() => {
          if (videoRef.current && isAutoPlayEnabled) {
            videoRef.current.play().then(() => {
              setIsPlaying(true);
            }).catch(() => {
              toast.error('自动播放失败，请手动点击播放');
            });
          }
        }, 100);
      }
    }
  }, [isAutoPlayEnabled]);

  // 处理视频播放/暂停状态变化
  const handlePlayPauseChange = useCallback(() => {
    if (videoRef.current) {
      const paused = videoRef.current.paused;
      setIsPlaying(!paused);
    }
  }, []);

  // 处理视频播放结束
  const handleVideoEnded = useCallback(() => {
    setIsPlaying(false);
    
    if (isAutoPlayEnabled) {
      const nextVideo = getNextVideo(currentVideoName);
      if (nextVideo) {
        const nextVideoFile = createFileObject(nextVideo);
        setTimeout(() => {
          setSelectedFile(nextVideoFile);
          toast.info(`正在播放: ${nextVideo.name}`);
        }, 300);
      } else {
        toast.info('已经是最后一个视频了');
      }
    }
  }, [isAutoPlayEnabled, currentVideoName, getNextVideo, createFileObject]);

  // 初始化视频事件监听
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('play', handlePlayPauseChange);
    video.addEventListener('pause', handlePlayPauseChange);
    video.addEventListener('ended', handleVideoEnded);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('play', handlePlayPauseChange);
      video.removeEventListener('pause', handlePlayPauseChange);
      video.removeEventListener('ended', handleVideoEnded);
    };
  }, [handleTimeUpdate, handleLoadedMetadata, handlePlayPauseChange, handleVideoEnded]);

  // 首次进入页面时默认加载第一个视频
  useEffect(() => {
    const allVideos = getAllVideoFiles(fileTreeData);
    
    if (allVideos.length > 0 && !selectedFile) {
      const firstVideoFile = createFileObject(allVideos[0]);
      setSelectedFile(firstVideoFile);
    }
  }, [getAllVideoFiles, createFileObject, selectedFile]);

  // 当选择的文件改变时，更新视频源
  useEffect(() => {
    if (selectedFile && videoRef.current) {
      setIsPlaying(false);
      
      if (fileUrl) {
        URL.revokeObjectURL(fileUrl);
        setFileUrl(null);
      }
      
      try {
        setCurrentVideoName(selectedFile.name);
        
        let videoSrc = '';
        let videoType = 'video/mp4';
        
        // @ts-expect-error - 扩展File类型
        const filePath = selectedFile.path;
        
        if (filePath && filePath.startsWith('public/')) {
          videoSrc = filePath.replace('public/', '/');
        } else if (filePath && filePath.startsWith('/')) {
          videoSrc = filePath;
        } else if (filePath && filePath.startsWith('media/')) {
          videoSrc = '/' + filePath; // 确保 media/ 路径以 / 开头
        } else {
          videoSrc = URL.createObjectURL(selectedFile);
          videoType = selectedFile.type;
          setFileUrl(videoSrc);
        }
        
        const setVideoSource = (src: string) => {
          if (videoRef.current) {
            videoRef.current.pause();
            videoRef.current.src = '';
            
            setTimeout(() => {
              if (videoRef.current) {
                videoRef.current.src = src;
                videoRef.current.load();
                toast.success(`已加载: ${selectedFile.name}`);
                
                if (isAutoPlayEnabled) {
                  setTimeout(() => {
                    if (videoRef.current && videoRef.current.readyState >= 2) {
                      videoRef.current.play().then(() => {
                        setIsPlaying(true);
                      }).catch(() => {
                        // 静默处理自动播放失败
                      });
                    }
                  }, 500);
                }
              }
            }, 100);
          }
        };
        
        if (videoSrc.startsWith('/media/')) {
          fetch(videoSrc, { method: 'HEAD' })
            .then(response => {
              if (!response.ok) {
                throw new Error(`文件不存在或无法访问 (${response.status})`);
              }
              setVideoSource(videoSrc);
            })
            .catch(error => {
              toast.error(`视频文件无法加载: ${error.message}`);
            });
        } else {
          setVideoSource(videoSrc);
        }
        
      } catch (error) {
        toast.error('加载视频文件失败，请尝试其他文件');
      }
    }
  }, [selectedFile, fileUrl, isAutoPlayEnabled]);

  // 处理文件选择
  const handleFileSelect = (file: File) => {
    if (file.type.startsWith('video/')) {
      setSelectedFile(file);
    } else {
      toast.error('请选择有效的视频文件');
    }
  };

  // 处理拖放事件
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      handleFileSelect(file);
    }
  };

  // 切换文件面板的折叠/展开状态
  const toggleFilePanel = () => {
    setIsFilePanelCollapsed(!isFilePanelCollapsed);
  };

  // 处理调整大小的开始
  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    document.body.style.cursor = 'col-resize';
  };

  // 处理调整大小
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      
      const container = document.querySelector('.container');
      if (!container) return;
      
      const containerRect = container.getBoundingClientRect();
      const newWidth = containerRect.width - e.clientX + containerRect.left;
      
      const minWidth = 280;
      const maxWidth = containerRect.width - 200;
      const clampedWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));
      
      setSidebarWidth(clampedWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.cursor = '';
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
   }, [isResizing]);

  // 监听窗口大小变化，切换布局模式
  useEffect(() => {
    const handleResize = () => {
      const isSmallScreen = window.innerWidth < 1024;
      setIsVerticalLayout(isSmallScreen);
      
      if (isSmallScreen) {
        setIsFilePanelCollapsed(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // 播放/暂停切换
  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(() => {
          toast.error('播放失败，请重试');
        });
      }
    }
  };

  // 处理进度条点击
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (progressBarRef.current && videoRef.current) {
      const rect = progressBarRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const width = rect.width;
      const newTime = (clickX / width) * duration;
      
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  // 处理音量变化
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
  };

  // 处理快进/快退
  const handleSkip = (seconds: number) => {
    if (videoRef.current) {
      const newTime = Math.max(0, Math.min(videoRef.current.currentTime + seconds, videoRef.current.duration || 0));
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  // 处理静音/取消静音
  const handleMute = () => {
    if (videoRef.current) {
      const newVolume = volume > 0 ? 0 : 0.5;
      setVolume(newVolume);
      videoRef.current.volume = newVolume;
    }
  };

  // 处理画中画
  const handlePiP = () => {
    if (videoRef.current) {
      if (document.pictureInPictureEnabled) {
        if (document.pictureInPictureElement) {
          document.exitPictureInPicture().catch(() => {
            toast.error('退出画中画失败');
          });
        } else {
          videoRef.current.requestPictureInPicture().catch(() => {
            toast.error('进入画中画失败，可能视频不支持');
          });
        }
      } else {
        toast.error('您的浏览器不支持画中画功能');
      }
    }
  };

  // 处理全屏
  const handleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      } else if ((videoRef.current as any).webkitRequestFullscreen) {
        (videoRef.current as any).webkitRequestFullscreen();
      } else if ((videoRef.current as any).mozRequestFullScreen) {
        (videoRef.current as any).mozRequestFullScreen();
      } else if ((videoRef.current as any).msRequestFullscreen) {
        (videoRef.current as any).msRequestFullscreen();
      }
    }
  };

  // 格式化时间
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // 处理点击设置按钮
  const handleSettingsToggle = () => {
    setIsSettingsOpen(!isSettingsOpen);
  };

  // 处理设置菜单外点击
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        settingsMenuRef.current && 
        !settingsMenuRef.current.contains(event.target as Node) && 
        settingsButtonRef.current &&
        !settingsButtonRef.current.contains(event.target as Node)
      ) {
        setIsSettingsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSettingsOpen]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
      {/* 顶部导航 */}
      <header className="p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold flex items-center">
            <i className="fa-solid fa-play-circle mr-2"></i>
            <span>本地视频播放器</span>
          </h1>
          <button 
            onClick={toggleTheme} 
            className="p-2 rounded-full bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
            aria-label="切换主题"
          >
            <i className={`fa-solid ${isDark ? 'fa-sun' : 'fa-moon'}`}></i>
          </button>
        </div>
      </header>

      {/* 主内容区 */}
      <main className="flex-1 container mx-auto p-2 md:p-4">
        <div className={`w-full gap-4 ${isVerticalLayout ? 'flex flex-col' : 'flex min-h-[700px]'}`}>
          {/* 视频播放区 */}
          <section 
            className={`rounded-xl overflow-hidden bg-white dark:bg-gray-800 shadow-lg flex flex-col ${isVerticalLayout ? 'w-full h-[500px] md:h-[600px]' : 'flex-1'}`}
            style={{ minHeight: '500px', height: isVerticalLayout ? 'auto' : '100%' }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="p-2 md:p-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-base md:text-lg font-semibold">视频播放</h2>
              {!isVerticalLayout && isFilePanelCollapsed && (
                <button 
                  onClick={toggleFilePanel}
                  className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  aria-label="显示文件面板"
                >
                  <i className="fa-solid fa-folder-open text-blue-500"></i>
                </button>
              )}
            </div>
            
            <div className="relative w-full bg-black flex-1" style={{ minHeight: '350px' }}>
              {isDragging && (
                <div className="absolute inset-0 bg-blue-500 bg-opacity-30 flex items-center justify-center border-4 border-dashed border-blue-500 z-10">
                  <p className="text-white text-2xl">拖放视频文件到此处</p>
                </div>
              )}
              
              {/* 视频播放器区域 */}
              <div 
                className="relative w-full bg-black flex-1" 
                style={{ 
                  minHeight: '300px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '20px',
                  boxSizing: 'border-box'
                }}
              >
                <video 
                  ref={videoRef} 
                  playsInline
                  className="block"
                  style={{ 
                    maxWidth: '100%',
                    maxHeight: '100%',
                    width: 'auto',
                    height: 'auto',
                    objectFit: 'contain',
                    backgroundColor: 'transparent'
                  }}
                >
                  您的浏览器不支持HTML5视频播放
                </video>
                
                {currentVideoName && (
                  <div className="absolute top-3 left-3 px-2 py-1 rounded-md text-sm bg-black bg-opacity-60 text-white max-w-[80%]">
                    <ScrollingVideoTitle title={currentVideoName} />
                  </div>
                )}
              </div>
              
              {/* Plyr风格的控制栏 */}
              <div className="plyr__controls">
                <button 
                  ref={autoPlayButtonRef}
                  type="button"
                  className="plyr__control"
                  aria-label={isPlaying ? '暂停' : '播放'}
                  onClick={togglePlayPause}
                  data-plyr="play"
                >
                  {isPlaying ? (
                    <svg aria-hidden="true" focusable="false" viewBox="0 0 16 16">
                      <rect x="5" y="3" width="2" height="10" />
                      <rect x="9" y="3" width="2" height="10" />
                    </svg>
                  ) : (
                    <svg aria-hidden="true" focusable="false" viewBox="0 0 16 16">
                      <path d="M3 2.5v11l9-5.5-9-5.5z" />
                    </svg>
                  )}
                  <span className="plyr__tooltip">{isPlaying ? '暂停' : '播放'}</span>
                </button>
                
                <button 
                  type="button"
                  className="plyr__control hidden sm:flex"
                  aria-label="后退10秒"
                  onClick={() => handleSkip(-10)}
                  data-plyr="rewind"
                >
                  <svg aria-hidden="true" focusable="false" viewBox="0 0 16 16">
                    <path d="M2 3v10l6-5-6-5zm7 0v10l6-5-6-5z" />
                  </svg>
                  <span className="plyr__tooltip">后退10秒</span>
                </button>
                
                <button 
                  type="button"
                  className="plyr__control hidden sm:flex"
                  aria-label="前进10秒"
                  onClick={() => handleSkip(10)}
                  data-plyr="fast-forward"
                >
                  <svg aria-hidden="true" focusable="false" viewBox="0 0 16 16">
                    <path d="M7 3v10l6-5-6-5z" />
                  </svg>
                  <span className="plyr__tooltip">前进10秒</span>
                </button>
                
                <div className="plyr__progress">
                  <div className="plyr__progress__buffer" style={{ width: `${duration > 0 ? buffered : 0}%` }}></div>
                  <div className="plyr__progress__played" style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}>
                    <span className="plyr__progress__marker" style={{ left: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}></span>
                  </div>
                  <input 
                    type="range" 
                    className="plyr__progress__seek"
                    min="0" 
                    max={duration} 
                    value={currentTime}
                    onChange={(e) => {
                      const newTime = parseFloat(e.target.value);
                      if (videoRef.current) {
                        videoRef.current.currentTime = newTime;
                        setCurrentTime(newTime);
                      }
                    }}
                    step="0.1"
                    aria-label="进度条"
                  />
                </div>
                
                <div className="plyr__time">
                  <span className="plyr__time--current" aria-label="当前时间">{formatTime(currentTime)}</span>
                  <span className="plyr__time--divider" aria-hidden="true">/</span>
                  <span className="plyr__time--duration" aria-label="总时长">{formatTime(duration)}</span>
                </div>
                
                <button 
                  type="button"
                  className="plyr__control hidden md:flex"
                  aria-label={volume === 0 ? '取消静音' : '静音'}
                  onClick={handleMute}
                  data-plyr="mute"
                >
                  {volume === 0 ? (
                    <svg aria-hidden="true" focusable="false" viewBox="0 0 16 16">
                      <path d="M2 4v8h3l5 5V-1L5 4H2zm10 1c0 1.66-1.34 3-3 3v2c2.76 0 5-2.24 5-5h-2zm-3 7v2c3.31 0 6-2.69 6-6h-2c0 2.21-1.79 4-4 4z" />
                    </svg>
                  ) : (
                    <svg aria-hidden="true" focusable="false" viewBox="0 0 16 16">
                      <path d="M2 4v8h3l5 5V-1L5 4H2z" />
                    </svg>
                  )}
                  <span className="plyr__tooltip">{volume === 0 ? '取消静音' : '静音'}</span>
                  <input 
                    type="range" 
                    className="plyr__volume__slider"
                    min="0" 
                    max="1" 
                    step="0.1" 
                    value={volume}
                    onChange={handleVolumeChange}
                    aria-label="音量控制"
                  />
                </button>
                
                <button 
                  ref={settingsButtonRef}
                  type="button"
                  className={`plyr__control hidden sm:flex ${isSettingsOpen ? 'plyr__control--pressed' : ''}`}
                  aria-label="设置"
                  onClick={handleSettingsToggle}
                  data-plyr="settings"
                >
                  <svg aria-hidden="true" focusable="false" viewBox="0 0 16 16">
                    <path d="M8 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm2 7V5l-5 3 5 3z" />
                  </svg>
                  <span className="plyr__tooltip">设置</span>
                </button>
                
                <button 
                  type="button"
                  className="plyr__control hidden sm:flex"
                  aria-label="画中画"
                  onClick={handlePiP}
                  data-plyr="pip"
                >
                  <svg aria-hidden="true" focusable="false" viewBox="0 0 16 16">
                    <path d="M1 1h14v14H1V1zm2 2v10h10V3H3zm1 1h8v8H4V4z" />
                  </svg>
                  <span className="plyr__tooltip">画中画</span>
                </button>
                
                <button 
                  type="button"
                  className="plyr__control hidden sm:flex"
                  aria-label="字幕"
                  data-plyr="captions"
                >
                  <svg aria-hidden="true" focusable="false" viewBox="0 0 16 16">
                    <path d="M1 1h14v14H1V1zm2 2v10h10V3H3zm2 2h6v2H5V5zm0 3h6v2H5V8z" />
                  </svg>
                  <span className="plyr__tooltip">字幕</span>
                </button>
                
                <button 
                  type="button"
                  className={`plyr__control ${isAutoPlayEnabled ? 'plyr__control--pressed' : ''}`}
                  aria-label={isAutoPlayEnabled ? '关闭自动连播' : '开启自动连播'}
                  onClick={() => setIsAutoPlayEnabled(!isAutoPlayEnabled)}
                  data-plyr="loop"
                >
                  <svg aria-hidden="true" focusable="false" viewBox="0 0 16 16">
                    <path d="M4 2v2h8V2H4zm0 4v8h8V6H4z" />
                  </svg>
                  <span className="plyr__tooltip">{isAutoPlayEnabled ? '关闭自动连播' : '开启自动连播'}</span>
                </button>
                
                <button 
                  type="button"
                  className="plyr__control"
                  aria-label="全屏"
                  onClick={handleFullscreen}
                  data-plyr="fullscreen"
                >
                  <svg aria-hidden="true" focusable="false" viewBox="0 0 16 16">
                    <path d="M1 1h6v6H1V1zm9 0h6v6h-6V1zm0 9h6v6h-6v-6zm-9 0h6v6H1v-6z" />
                  </svg>
                  <span className="plyr__tooltip">全屏</span>
                </button>
              </div>
              
              {/* 设置菜单 */}
              {isSettingsOpen && (
                <div 
                  ref={settingsMenuRef}
                  className="plyr__menu__container active"
                >
                  <div>
                    <div className="plyr__menu__label">播放速度</div>
                    <div className="plyr__menu__value" role="listbox">
                      {[0.5, 0.75, 1, 1.25, 1.5, 2].map(speed => (
                        <button
                          key={speed}
                          className={`plyr__control ${videoRef.current && videoRef.current.playbackRate === speed ? 'plyr__control--pressed' : ''}`}
                          role="option"
                          type="button"
                          onClick={() => {
                            if (videoRef.current) {
                              videoRef.current.playbackRate = speed;
                              toast.success(`播放速度已设置为 ${speed}x`);
                            }
                          }}
                        >
                          {speed}x
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <button
                      className="plyr__control"
                      type="button"
                      onClick={() => {
                        if (videoRef.current) {
                          videoRef.current.currentTime = 0;
                          toast.success('已重置到视频开始');
                        }
                      }}
                    >
                      重置到开始
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* 文件列表区域 */}
          {!isFilePanelCollapsed && (
            <>
              {!isVerticalLayout && (
                <div 
                  className="w-1 cursor-col-resize self-stretch flex flex-col items-center justify-center z-10"
                  onMouseDown={(e) => handleResizeStart(e)}
                >
                  <div className="w-1 h-10 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
                </div>
              )}
              
              <section 
                className={`rounded-xl overflow-hidden bg-white dark:bg-gray-800 shadow-lg flex flex-col ${isVerticalLayout ? 'w-full' : ''}`}
                style={isVerticalLayout ? {} : { width: `${sidebarWidth}px` }}
              >
                <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                  <h2 className="text-lg font-semibold">本地文件</h2>
                  {!isVerticalLayout && (
                    <button 
                      onClick={toggleFilePanel}
                      className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                      aria-label="折叠文件面板"
                    >
                      <i className="fa-solid fa-chevron-left text-blue-500"></i>
                    </button>
                  )}
                </div>
                <div className="p-4 flex-grow flex flex-col">
                  <FileTree 
                    onFileSelect={handleFileSelect} 
                    selectedFile={selectedFile}
                  />
                </div>
              </section>
            </>
          )}
        </div>
      </main>

      {/* 底部信息 */}
      <footer className="p-3 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400">
        <div className="container mx-auto">
          <div className="text-center text-sm">
            <p>本地视频播放器 - 生产版</p>
          </div>
        </div>
      </footer>
    </div>
  );
}