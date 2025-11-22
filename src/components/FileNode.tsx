import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface FileTreeNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  parentId: string | null;
  path: string;
  size?: number;
  lastModified?: number;
  children?: FileTreeNode[];
}

interface FileNodeProps {
  node: FileTreeNode;
  onClick: () => void;
  isSelected: boolean;
  isDark: boolean;
}

// 格式化文件大小
const formatFileSize = (bytes: number | undefined): string => {
  if (!bytes) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// 格式化最后修改时间
const formatLastModified = (timestamp: number | undefined): string => {
  if (!timestamp) return '';
  
  const date = new Date(timestamp);
  return date.toLocaleDateString();
};

// 循环滚动文字组件
const ScrollingText = ({ text, isSelected }: { text: string; isSelected: boolean }) => {
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  
  // 检查文本是否溢出
  useEffect(() => {
    const checkOverflow = () => {
      if (containerRef.current && textRef.current && isSelected) {
        const containerWidth = containerRef.current.clientWidth;
        const textWidth = textRef.current.scrollWidth;
        setIsOverflowing(textWidth > containerWidth);
      } else {
        setIsOverflowing(false);
      }
    };
    
    checkOverflow();
    
    // 监听窗口大小变化，重新检查是否溢出
    const handleResize = () => checkOverflow();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [text, isSelected]);
  
  // 实现循环滚动动画
  useEffect(() => {
    if (!isOverflowing || !isSelected) {
      setScrollPosition(0);
      return;
    }
    
    let animationFrameId: number;
    let startTime: number;
  const duration = 12000; // 滚动一个周期的时间（毫秒）- 调整为更慢的速度
    
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = ((timestamp - startTime) % duration) / duration;
      
      if (containerRef.current && textRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const textWidth = textRef.current.scrollWidth;
        const maxScroll = Math.max(0, textWidth - containerWidth);
        
        // 实现来回滚动：0 -> 最大位置 -> 0
        if (progress <= 0.5) {
          setScrollPosition(maxScroll * (progress / 0.5));
        } else {
          setScrollPosition(maxScroll * ((1 - progress) / 0.5));
        }
      }
      
      animationFrameId = requestAnimationFrame(animate);
    };
    
    animationFrameId = requestAnimationFrame(animate);
    
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isOverflowing, isSelected]);
  
  return (
    <div 
      ref={containerRef}
      className="relative overflow-hidden whitespace-nowrap"
      style={{
        width: '100%'
      }}
    >
      <span
        ref={textRef}
        className="inline-block"
        style={{
          transform: isOverflowing && isSelected ? `translateX(-${scrollPosition}px)` : 'translateX(0)',
          transition: isOverflowing && isSelected ? 'none' : 'transform 0.3s ease-out'
        }}
      >
        {text}
      </span>
    </div>
  );
};

export const FileNode: React.FC<FileNodeProps> = ({ 
  node, 
  onClick,
  isSelected,
  isDark
}) => {
  return (
    <div 
      className={cn(
        'flex items-center gap-2 cursor-pointer px-2 py-1.5 rounded-md transition-colors',
        isSelected 
          ? (isDark ? 'bg-blue-900 bg-opacity-40 text-blue-300' : 'bg-blue-100 text-blue-800')
          : (isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100')
      )}
      onClick={onClick}
    >
        <i className="fa-solid fa-file-video text-blue-500"></i>
         <div className="flex-1 relative min-w-0">
              {isSelected ? (
                <ScrollingText text={node.name} isSelected={isSelected} />
              ) : (
                <span className="block truncate" title={node.name}>{node.name}</span>
              )}
         </div>
         <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
           {formatFileSize(node.size)}
         </span>
    </div>
  );
};