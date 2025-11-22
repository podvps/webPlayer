import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  isDark: boolean;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number; // 添加延迟属性，默认值设为100ms，比浏览器原生更快
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  isDark,
  placement = 'top',
  delay = 100, // 设置默认延迟为100ms，比浏览器原生更快
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({
    top: '0',
    left: '0',
    right: 'auto',
    bottom: 'auto',
  });
  const tooltipRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<number | null>(null);

  // 计算tooltip的位置
  const calculatePosition = () => {
    if (!targetRef.current || !tooltipRef.current) return;

    const targetRect = targetRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const containerRect = targetRef.current.closest('.overflow-hidden')?.getBoundingClientRect();

    let newPosition = {
      top: '0',
      left: '0',
      right: 'auto',
      bottom: 'auto',
    };

    // 默认居中显示在目标元素上方
    const targetCenter = targetRect.left + targetRect.width / 2;
    const tooltipCenterOffset = tooltipRect.width / 2;
    
    // 计算初始位置
    let left = targetCenter - tooltipCenterOffset;
    
    // 检查是否超出左边界
    if (containerRect && left < containerRect.left) {
      left = containerRect.left;
    }
    
    // 检查是否超出右边界
    if (containerRect && left + tooltipRect.width > containerRect.right) {
      left = containerRect.right - tooltipRect.width;
    }
    
    newPosition.left = `${left - targetRect.left}px`;
    newPosition.top = `${-tooltipRect.height - 8}px`; // 8px为间距
    
    setPosition(newPosition);
  };

  useEffect(() => {
    if (isVisible) {
      // 短暂延迟后计算位置，确保tooltip已经渲染
      const timer = setTimeout(() => {
        calculatePosition();
      }, 10);
      
      // 监听窗口大小变化，重新计算位置
      const handleResize = () => {
        if (isVisible) {
          calculatePosition();
        }
      };
      
      window.addEventListener('resize', handleResize);
      
      return () => {
        clearTimeout(timer);
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [isVisible]);

  // 清理函数，确保组件卸载时清除定时器
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={targetRef}
      className="relative inline-block"
      onMouseEnter={() => {
        timeoutRef.current = setTimeout(() => {
          setIsVisible(true);
        }, delay);
      }}
      onMouseLeave={() => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        setIsVisible(false);
      }}
    >
      {children}
      {isVisible && (
        <div
          ref={tooltipRef}
          className={cn(
            'absolute whitespace-nowrap z-[99999] transition-all duration-200 transform opacity-0 scale-95',
            isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95',
          )}
          style={{
            ...position,
            backgroundColor: isDark ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
            color: isDark ? '#f1f5f9' : '#1e293b',
            boxShadow: isDark ? '0 4px 12px rgba(0, 0, 0, 0.8)' : '0 4px 12px rgba(0, 0, 0, 0.3)',
            border: `1px solid ${isDark ? 'rgba(75, 85, 99, 0.8)' : 'rgba(209, 213, 219, 0.8)'}`,
            borderRadius: '8px',
            padding: '6px 12px',
            fontSize: '0.75rem',
            pointerEvents: 'none',
          }}
        >
          {content}
        </div>
      )}
    </div>
  );
};