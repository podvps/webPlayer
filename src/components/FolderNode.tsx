import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

import { FileNode } from '@/types/FileNode';

interface FolderNodeProps {
  node: FileNode;
  isExpanded: boolean;
  onToggle: () => void;
  isDark: boolean;
}

export const FolderNode: React.FC<FolderNodeProps> = ({ 
  node, 
  isExpanded, 
  onToggle,
  isDark
}) => {
  return (
    <div className="py-1">
      <div
        className={cn(
          'flex items-center gap-2 cursor-pointer px-2 py-1.5 rounded-md transition-all duration-200',
          isDark 
            ? 'hover:bg-gray-700' 
            : 'hover:bg-gray-100'
        )}
        onClick={onToggle}
        aria-expanded={isExpanded}
      >
        {/* 增强的折叠/展开按钮 - 增加可见性和交互反馈 */}
        <button 
          className={cn(
            'w-8 h-8 flex items-center justify-center rounded-full transition-all',
            isDark 
              ? 'hover:bg-gray-600' 
              : 'hover:bg-gray-200'
          )}
          onClick={(e) => {
            e.stopPropagation(); // 防止事件冒泡
            onToggle();
          }}
          aria-label={isExpanded ? "折叠文件夹" : "展开文件夹"}
        >
        <i className={`fa-solid ${isExpanded ? 'fa-chevron-down' : 'fa-chevron-right'} text-base text-blue-500 dark:text-blue-400`}></i>
        </button>
         
         <i 
           className={`fa-solid ${isExpanded ? 'fa-folder-open' : 'fa-folder'} text-yellow-500`} 
         ></i>
           <div className="flex-1 relative min-w-0">
                 <span className="block truncate" title={node.name}>{node.name}</span>
          </div>
         <span className="text-xs text-gray-500 dark:text-gray-400">
           {node.children?.length} 项
         </span>
      </div>
    </div>
  );
};