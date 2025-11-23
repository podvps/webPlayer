import { useState, useRef, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useTheme } from '@/hooks/useTheme';
import { FileTree } from '@/components/FileTree';
import { FileNode } from '@/types/FileNode';
import Plyr from 'plyr';
import 'plyr/dist/plyr.css';

// 循环滚动的视频标题组件
const ScrollingVideoTitle = ({ title }: { title: string }) => {
  const [isScrolling, setIsScrolling] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const textRef = useRef<HTMLSpanElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkOverflow = () => {
      if (textRef.current && containerRef.current) {
        const isOverflowing = textRef.current.offsetWidth > containerRef.current.offsetWidth;
        setIsScrolling(isOverflowing);
      }
    };

    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [title]);

  useEffect(() => {
    if (!isScrolling) return;

    const scrollAnimation = setInterval(() => {
      setScrollPosition((prev) => {
        const maxScroll = textRef.current ? textRef.current.offsetWidth : 0;
        if (prev >= maxScroll) {
          return 0;
        }
        return prev + 1;
      });
    }, 30);

    return () => clearInterval(scrollAnimation);
  }, [isScrolling]);

  return (
    <div ref={containerRef} className="overflow-hidden whitespace-nowrap">
      <span
        ref={textRef}
        className="inline-block text-sm text-gray-600 dark:text-gray-400"
        style={{
          transform: isScrolling ? `translateX(-${scrollPosition}px)` : 'translateX(0)',
          transition: isScrolling ? 'none' : 'transform 0.3s ease-out'
        }}
      >
        {title}
      </span>
    </div>
  );
}

// 从media文件夹导入文件树数据
import { fileTreeData } from '@/media/fileData';

function VideoPlayer() {
  const { toggleTheme, isDark } = useTheme();

  // 简化状态管理
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [currentVideoName, setCurrentVideoName] = useState<string>('');
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [isAutoPlayEnabled, setIsAutoPlayEnabled] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState<number>(300);
  const [isResizing, setIsResizing] = useState<boolean>(false);
  const [isFilePanelCollapsed, setIsFilePanelCollapsed] = useState(false);
  const [isVerticalLayout, setIsVerticalLayout] = useState<boolean>(false);
  const [shouldAutoPlay, setShouldAutoPlay] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const plyrRef = useRef<any>(null);
  const isPlyrReady = useRef<boolean>(false);

  // 支持的视频格式 - HTML5 原生支持的格式
  const supportedVideoFormats = ['.mp4', '.webm'];

  // 递归获取所有视频文件列表
  const getAllVideoFiles = useCallback((nodes: FileNode[]): FileNode[] => {
    let files: FileNode[] = [];

    nodes.forEach(node => {
      // 使用相同的检查逻辑
      const isSupportedFormat = node.type === 'file' && supportedVideoFormats.some(format => {
        const fileName = node.name.toLowerCase();
        const extension = format.toLowerCase();
        return fileName.endsWith(extension);
      });
      
      if (isSupportedFormat) {
        //console.log('找到支持的文件:', node.name);
        files.push(node);
      } else if (node.type === 'folder' && node.children) {
        files = [...files, ...getAllVideoFiles(node.children)];
      }
    });

    return files;
  }, [supportedVideoFormats]);

  // 处理带自动播放标志的文件选择
  const handleFileSelectWithAutoPlay = useCallback((file: FileNode, shouldAuto: boolean = false) => {
    console.log('📁 选择文件:', file.name, '路径:', file.path, '自动播放:', shouldAuto);
    console.log('🔍 支持的格式:', supportedVideoFormats);
    console.log('🔍 文件类型:', file.type);
    console.log('🔍 文件名是否以支持的格式结尾:', supportedVideoFormats.some(format => file.name.endsWith(format)));

    // 更可靠的文件扩展名检查
    const isSupportedFormat = file.type === 'file' && supportedVideoFormats.some(format => {
      const fileName = file.name.toLowerCase();
      const extension = format.toLowerCase();
      console.log(`检查 ${fileName} 是否以 ${extension} 结尾: ${fileName.endsWith(extension)}`);
      return fileName.endsWith(extension);
    });
    
    if (isSupportedFormat) {
      setSelectedFile(file);
      setCurrentVideoName(file.name);

      // 清理之前的 object URL（如果是临时文件）
      if (objectUrl && !file.path.startsWith('/')) {
        URL.revokeObjectURL(objectUrl);
        setObjectUrl(null);
      } else if (objectUrl && file.path.startsWith('/') && objectUrl !== file.path) {
        // 如果路径不同，也清理之前的 object URL
        URL.revokeObjectURL(objectUrl);
        setObjectUrl(null);
      }

      // 构建视频URL - 修复路径问题
      let url: string;
      if (file.path.startsWith('blob:')) {
        url = file.path;
      } else if (file.path.startsWith('http')) {
        url = file.path;
      } else {
        // 确保路径以/开头，修正可能的路径问题
        url = file.path.startsWith('/') ? file.path : `/${file.path}`;
        console.log('🔧 修正后的视频URL:', url);
      }
      
      console.log('🎬 设置视频URL:', url);
      setVideoUrl(url);
      
      // 立即设置属性到video元素，确保在Plyr ready之前设置完成
      if (videoRef.current) {
        videoRef.current.setAttribute('data-autoplay', shouldAuto.toString());
        videoRef.current.setAttribute('data-current-file-id', file.id);
        console.log('🎬 立即设置video元素属性:', {
          autoplay: shouldAuto,
          fileId: file.id
        });
      }
      
      // 也设置到Plyr media元素（如果已经初始化）
      if (plyrRef.current && plyrRef.current.media) {
        plyrRef.current.media.setAttribute('data-autoplay', shouldAuto.toString());
        plyrRef.current.media.setAttribute('data-current-file-id', file.id);
        console.log('🎬 设置Plyr media元素属性:', {
          autoplay: shouldAuto,
          fileId: file.id
        });
      }
      
      // 添加一个检查，看看文件是否存在
      fetch(url, { method: 'HEAD' })
        .then(response => {
          if (!response.ok) {
            console.error('⚠️ 视频文件无法访问:', response.status, response.statusText);
            toast.error(`视频文件无法访问: ${response.status} ${response.statusText}`, {
              duration: 5000
            });
          } else {
            console.log('✅ 视频文件可访问');
          }
        })
        .catch(error => {
          console.error('⚠️ 检查视频文件时出错:', error);
          toast.error(`检查视频文件时出错: ${error.message}`, {
            duration: 5000
          });
        });
      
      toast.success(`已选择视频: ${file.name}`);
    } else {
      const formatsList = supportedVideoFormats.join(', ');
      toast.error(`请选择支持的视频文件格式: ${formatsList}`);
    }
  }, [supportedVideoFormats, objectUrl]);

  // 处理文件选择
  const handleFileSelect = useCallback((file: FileNode) => {
    handleFileSelectWithAutoPlay(file, isAutoPlayEnabled);
  }, [handleFileSelectWithAutoPlay, isAutoPlayEnabled]);

  // 获取下一个视频
  const getNextVideo = useCallback((currentFile: FileNode | null): FileNode | null => {
    if (!currentFile) {
      console.log('🎬 没有当前文件，无法获取下一个视频');
      return null;
    }

    const allVideos = getAllVideoFiles(fileTreeData as FileNode[]);
    console.log('🎬 所有视频文件:', allVideos.map(v => v.name));
    
    const currentIndex = allVideos.findIndex(video => video.id === currentFile.id);
    console.log('🎬 当前视频索引:', currentIndex, '总视频数:', allVideos.length);

    if (currentIndex === -1 || currentIndex === allVideos.length - 1) {
      console.log('🎬 没有下一个视频');
      return null;
    }

    const nextVideo = allVideos[currentIndex + 1];
    console.log('🎬 下一个视频:', nextVideo.name);
    return nextVideo;
  }, [getAllVideoFiles]);

  // 拖拽相关处理函数
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const videoFile = files.find(file => {
      const isVideoType = file.type.startsWith('video/');
      const isSupportedFormat = supportedVideoFormats.some(format => {
        const fileName = file.name.toLowerCase();
        const extension = format.toLowerCase();
        return fileName.endsWith(extension);
      });
      return isVideoType || isSupportedFormat;
    });

    if (videoFile) {
      // 清理之前的 object URL
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
        setObjectUrl(null);
      }

      const url = URL.createObjectURL(videoFile);
      setObjectUrl(url);
      
      // 创建一个临时的 FileNode 对象
      const fileNode: FileNode = {
        id: `temp-${Date.now()}`, // 使用时间戳创建临时ID
        name: videoFile.name,
        type: 'file',
        parentId: null,
        path: url, // 使用 blob URL 作为路径
        size: videoFile.size,
        lastModified: videoFile.lastModified
      };
      
      setSelectedFile(fileNode);
      setVideoUrl(url);
      setCurrentVideoName(videoFile.name);
      toast.success(`已加载视频: ${videoFile.name}`);
    } else {
      const formatsList = supportedVideoFormats.join(', ');
      toast.error(`未找到有效的视频文件，支持的格式: ${formatsList}`);
    }
  };

  // 切换文件面板
  const toggleFilePanel = () => {
    setIsFilePanelCollapsed(!isFilePanelCollapsed);
  };

  // 处理调整大小
  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    const startX = e.clientX;
    const startWidth = sidebarWidth;
    let isResizingLocal = true; // 使用本地状态而不是依赖React状态

    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizingLocal) return;
      
      const deltaX = startX - e.clientX;
      const newWidth = startWidth + deltaX;
      
      const minWidth = 280;
      const maxWidth = window.innerWidth - 400;
      const clampedWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));

      setSidebarWidth(clampedWidth);
    };

    const handleMouseUp = () => {
      isResizingLocal = false;
      setIsResizing(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
   };

  // 初始化Plyr播放器
  useEffect(() => {
    // 等待DOM和Plyr加载完成
    const checkAndInitPlyr = () => {
      if (videoRef.current && !plyrRef.current && Plyr) {
        console.log('🎬 初始化Plyr播放器');
        
        // 配置Plyr选项
        const options = {
          controls: [
            'play-large', // 大播放按钮
            'play', // 播放/暂停
            'progress', // 进度条
            'current-time', // 当前时间
            'duration', // 总时长
            'mute', // 静音
            'volume', // 音量
            'settings', // 设置
            'pip', // 画中画
            'fullscreen', // 全屏
          ],
          settings: [
            'captions', // 字幕设置
            'quality', // 画质设置
            'speed', // 播放速度
            'loop', // 循环播放
            'audio', // 音轨设置
          ],
          captions: {
            active: true,
            language: 'auto',
            update: false,
          },
          tooltips: {
            controls: true,
            seek: true,
          },
          i18n: {
            play: '播放',
            pause: '暂停',
            mute: '静音',
            unmute: '取消静音',
            enterFullscreen: '进入全屏',
            exitFullscreen: '退出全屏',
            captions: '字幕',
            settings: '设置',
            speed: '播放速度',
            normal: '正常',
            quality: '画质',
            loop: '循环播放',
          },
          clickToPlay: true,
          hideControls: true, // 默认隐藏控制栏，鼠标悬浮或暂停时显示
          resetOnEnd: false,
          seekTime: 10, // 快进/快退10秒
          volume: 0.8, // 默认音量80%
          autoplay: false, // 不在初始化时自动播放，由我们手动控制
        };

        try {
          // 初始化Plyr
          plyrRef.current = new Plyr(videoRef.current, options);
          console.log('✅ Plyr初始化完成');

          // 添加调试日志检查Plyr结构
          setTimeout(() => {
            if (plyrRef.current) {
              console.log('🔍 调试Plyr结构:');
              console.log('容器元素:', playerRef.current);
              console.log('视频元素:', videoRef.current);
              
              // 检查Plyr创建的元素
              const plyrElement = document.querySelector('.plyr');
              const controlsElement = document.querySelector('.plyr__controls');
              const videoWrapper = document.querySelector('.plyr__video-wrapper');
              
              console.log('Plyr主元素:', plyrElement);
              console.log('控制栏元素:', controlsElement);
              console.log('视频包装器:', videoWrapper);
              
              // 检查控制栏位置
              if (controlsElement) {
                const controlsRect = controlsElement.getBoundingClientRect();
                const videoRect = videoRef.current?.getBoundingClientRect();
                console.log('控制栏位置:', controlsRect);
                console.log('视频位置:', videoRect);
              }
            }
          }, 1000);

          // 添加事件监听
          plyrRef.current.on('ready', () => {
            // 避免重复处理ready事件
            if (isPlyrReady.current) {
              console.log('🎬 Plyr已经ready过，跳过重复处理');
              return;
            }
            isPlyrReady.current = true;
            
            console.log('✅ Plyr准备就绪');
            
            // 从video元素和Plyr media元素检查自动播放状态
            const videoAutoplayState = videoRef.current?.getAttribute('data-autoplay') === 'true';
            const plyrAutoplayState = plyrRef.current?.media?.getAttribute('data-autoplay') === 'true';
            const autoplayState = videoAutoplayState || plyrAutoplayState;
            
            console.log('🎬 Plyr ready时检查连播状态:', {
              videoElement: videoAutoplayState,
              plyrMedia: plyrAutoplayState,
              final: autoplayState
            });
            console.log('🎬 Plyr ready时检查shouldAutoPlay:', shouldAutoPlay);
            
            // 如果需要自动播放，立即播放
            if (autoplayState) {
              setTimeout(async () => {
                try {
                  console.log('🎬 尝试自动播放...');
                  await plyrRef.current.play();
                  console.log('🎬 Plyr ready时自动播放成功');
                  setShouldAutoPlay(false);
                } catch (error) {
                  console.warn('🎬 Plyr ready时自动播放失败:', error);
                  // 如果失败，尝试静音播放
                  try {
                    console.log('🎬 尝试静音自动播放...');
                    plyrRef.current.muted = true;
                    await plyrRef.current.play();
                    console.log('🎬 Plyr ready时静音自动播放成功');
                    setShouldAutoPlay(false);
                    // 1秒后恢复音量
                    setTimeout(() => {
                      if (plyrRef.current) {
                        plyrRef.current.muted = false;
                      }
                    }, 1000);
                  } catch (mutedError) {
                    console.error('🎬 静音自动播放也失败:', mutedError);
                    setShouldAutoPlay(false);
                  }
                }
              }, 300); // 增加延迟确保完全准备就绪
            }
          });

          plyrRef.current.on('ended', () => {
            console.log('🎬 Plyr视频播放结束事件触发');
            // 使用 ref 获取最新的状态值，避免闭包问题
            const currentAutoPlayState = plyrRef.current?.media?.getAttribute('data-autoplay') === 'true';
            const currentFileId = plyrRef.current?.media?.getAttribute('data-current-file-id');
            
            // 从文件树中查找当前文件
            const currentSelectedFile = currentFileId ? 
              getAllVideoFiles(fileTreeData as FileNode[]).find(v => v.id === currentFileId) : null;
            
            console.log('🎬 连播状态:', currentAutoPlayState);
            console.log('🎬 当前文件:', currentSelectedFile?.name);
            
            if (currentAutoPlayState && currentSelectedFile) {
              const nextVideo = getNextVideo(currentSelectedFile);
              if (nextVideo) {
                console.log('🎬 播放下一个视频:', nextVideo.name);
                toast.success(`自动播放下一个视频: ${nextVideo.name}`);
                
                // 设置自动播放标志
                console.log('🎬 设置shouldAutoPlay为true');
                setShouldAutoPlay(true);
                
                // 直接调用文件选择，并传递自动播放标志
                handleFileSelectWithAutoPlay(nextVideo, true);
              } else {
                toast.info('已播放完所有视频');
              }
            }
          });

          plyrRef.current.on('error', (error: any) => {
            console.error('❌ Plyr错误:', error);
            toast.error(`视频播放器错误: ${error || '未知错误'}`, {
              duration: 3000
            });
          });

        } catch (error) {
          console.error('❌ Plyr初始化失败:', error);
        }
      } else {
        // 如果Plyr还没加载，等待一段时间后重试
        setTimeout(checkAndInitPlyr, 100);
      }
    };

    // 延迟一点时间确保DOM完全渲染
    setTimeout(checkAndInitPlyr, 100);

    // 清理函数
    return () => {
      if (plyrRef.current) {
        plyrRef.current.destroy();
        plyrRef.current = null;
      }
    };
  }, []);

  // 清理 object URLs
  useEffect(() => {
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [objectUrl]);
  
  // 当连播状态改变时，更新Plyr media元素的属性
  useEffect(() => {
    // 只更新Plyr media元素
    if (plyrRef.current && plyrRef.current.media) {
      plyrRef.current.media.setAttribute('data-autoplay', isAutoPlayEnabled.toString());
      console.log('🎬 更新Plyr media元素连播状态属性:', isAutoPlayEnabled);
    }
  }, [isAutoPlayEnabled]);

  // 当视频源改变时，更新Plyr
  useEffect(() => {
    if (plyrRef.current && videoRef.current && videoUrl) {
      console.log('🎬 设置视频源:', videoUrl);

      try {
        // 检查当前是否已经在播放相同的视频
        const currentSrc = videoRef.current.src;
        const newSrc = new URL(videoUrl, window.location.origin).href;
        
        if (currentSrc === newSrc) {
          console.log('🎬 视频源未改变，跳过重新设置');
          return;
        }
        
        // 重置ready标记，允许新的ready事件触发
        isPlyrReady.current = false;
        
        // 检查是否需要自动播放
        const needsAutoPlay = plyrRef.current.media?.getAttribute('data-autoplay') === 'true';
        
        if (needsAutoPlay) {
          console.log('🎬 需要自动播放，使用Plyr source重新初始化');
          
          // 使用Plyr source设置，这会触发ready事件
          const sourceConfig = {
            type: 'video',
            sources: [{
              src: videoUrl,
              type: videoUrl.endsWith('.mp4') ? 'video/mp4' : 'video/webm'
            }]
          };
          
          plyrRef.current.source = sourceConfig;
        } else {
          console.log('🎬 不需要自动播放，直接设置video src');
          // 直接设置video元素的src，避免Plyr重新初始化
          videoRef.current.src = videoUrl;
        }
        
        // 同步当前文件ID到Plyr media元素
        if (selectedFile) {
          plyrRef.current.media.setAttribute('data-current-file-id', selectedFile.id);
          console.log('🎬 视频源改变时同步文件ID:', selectedFile.id);
        }
        
        console.log('✅ 视频源设置完成');
      } catch (error) {
        console.error('❌ 设置视频源时出错:', error);
      }
    }
  }, [videoUrl, shouldAutoPlay, selectedFile]);

  // 初始化第一个视频
  useEffect(() => {
    // 等待Plyr初始化完成后再加载第一个视频
    const initializeFirstVideo = () => {
      if (plyrRef.current && !videoUrl) {
        const allVideos = getAllVideoFiles(fileTreeData as FileNode[]);
        
        if (allVideos.length > 0) {
          console.log('🎬 自动加载第一个视频:', allVideos[0].name);
          handleFileSelect(allVideos[0]);
        }
      } else if (!plyrRef.current) {
        // 如果Plyr还没初始化，稍后再试
        setTimeout(initializeFirstVideo, 500);
      }
    };

    // 给Plyr一些时间初始化
    setTimeout(initializeFirstVideo, 1500);
  }, [getAllVideoFiles, handleFileSelect, videoUrl]);

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
        <div className={`w-full gap-4 ${isVerticalLayout ? 'flex flex-col' : 'flex'}`} style={{ minHeight: isVerticalLayout ? '100vh' : '80vh' }}>
          {/* 视频播放区 */}
          <section
            className={`rounded-xl overflow-hidden bg-white dark:bg-gray-800 shadow-lg flex flex-col ${isVerticalLayout ? 'w-full' : 'flex-1'}`}
            style={{
              height: isVerticalLayout ? 'auto' : '100%',
            }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="p-2 md:p-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center flex-shrink-0">
              <div className="flex items-center flex-1 min-w-0">
                <h2 className="text-base md:text-lg font-semibold mr-3 flex-shrink-0">视频播放</h2>
                {currentVideoName && (
                  <div className="min-w-0 flex-1">
                    <ScrollingVideoTitle title={currentVideoName} />
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const newState = !isAutoPlayEnabled;
                    setIsAutoPlayEnabled(newState);
                    
                    // 同步到Plyr media元素
                    if (plyrRef.current && plyrRef.current.media) {
                      plyrRef.current.media.setAttribute('data-autoplay', newState.toString());
                      console.log('🎬 更新连播状态属性:', newState);
                    }
                  }}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    isAutoPlayEnabled
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <i className="fa-solid fa-repeat mr-1"></i>
                  {isAutoPlayEnabled ? '连播已开启' : '连播已关闭'}
                </button>
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
            </div>

            {/* 视频播放器 - Plyr控件 */}
            <div ref={playerRef} className="plyr-container relative flex-1" style={{ minHeight: '2px', position: 'relative' }}>
              {/* 拖放提示 - 只在拖拽时显示 */}
              {isDragging && (
                <div className="drag-drop-area active">
                  <div className="drag-drop-content">
                    <i className="fa-solid fa-cloud-upload-alt"></i>
                    <p>拖放视频文件到此处</p>
                  </div>
                </div>
              )}

              {/* 视频播放器 - Plyr控件 */}
              <div id="plyr-player" className="plyr-wrapper h-full w-full relative">
                <video
                  id="plyr-video"
                  ref={videoRef}
                  playsInline
                  preload="metadata"
                  className="w-full h-full"
                  crossOrigin="anonymous"
                  onLoadStart={() => console.log('🎥 Video loadstart 事件')}
                  onLoadedData={() => console.log('🎥 Video loadeddata 事件')}
                  onCanPlay={() => console.log('🎥 Video canplay 事件')}

                  onError={(e) => {
                    console.error('❌ Video error 事件:', e);
                    const target = e.target as HTMLVideoElement;
                    console.error('❌ Video 错误详情:', {
                      error: target.error,
                      code: target.error?.code,
                      message: target.error?.message,
                      src: target.src,
                      currentSrc: target.currentSrc
                    });
                    
                    toast.error(`视频加载失败: ${target.error?.message || '未知错误'}`, {
                      duration: 3000
                    });
                  }}
                  onLoad={() => console.log('🎥 Video load 事件')}
                >
                </video>
              </div>




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
                className={`rounded-xl overflow-hidden bg-white dark:bg-gray-800 shadow-lg flex flex-col ${isVerticalLayout ? 'w-full flex-1' : ''}`}
                style={isVerticalLayout ? { height: 'auto', minHeight: '200px' } : { width: `${sidebarWidth}px`, height: '100%' }}
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
                <div className={`p-4 flex-grow flex flex-col ${isVerticalLayout ? 'overflow-hidden' : ''}`} style={{ height: 'calc(100% - 60px)', minHeight: '200px' }}>
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

export default VideoPlayer;