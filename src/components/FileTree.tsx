import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FolderNode } from './FolderNode';
import { FileNodeComponent } from './FileNode';
import { useTheme } from '@/hooks/useTheme';
import { fileTreeData } from '@/media/fileData';
import { FileNode } from '@/types/FileNode';

interface FileTreeProps {
  onFileSelect: (file: FileNode) => void;
  selectedFile: FileNode | null;
}

  // 从media文件夹导出文件系统数据
  export const mockFileTree = fileTreeData;

export const FileTree: React.FC<FileTreeProps> = ({ onFileSelect, selectedFile }) => {
  const { isDark } = useTheme();
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['1'])); // 默认展开根目录
  
  // 从selectedFile中提取文件路径，用于确定哪个文件节点被选中
  const selectedFilePath = selectedFile ? (selectedFile as any).path : '';
  
  // 根据文件路径查找对应的节点ID
  const findNodeIdByPath = useCallback((nodes: FileNode[], path: string): string | null => {
    for (const node of nodes) {
      if (node.type === 'file' && node.path === path) {
        return node.id;
      } else if (node.type === 'folder' && node.children) {
        const foundId = findNodeIdByPath(node.children, path);
        if (foundId) return foundId;
      }
    }
    return null;
  }, []);
  
  // 根据selectedFile的路径确定当前选中的节点ID
  const selectedNodeId = selectedFilePath ? findNodeIdByPath(fileTreeData, selectedFilePath) : null;

  // 处理文件夹展开/折叠
  const toggleFolder = useCallback((folderId: string) => {
    setExpandedFolders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(folderId)) {
        newSet.delete(folderId);
      } else {
        newSet.add(folderId);
      }
      return newSet;
    });
  }, []);

   // 处理文件选择
   const handleFileClick = useCallback((node: FileNode) => {
     // 直接传递 FileNode 对象，而不是创建 File 对象
     onFileSelect(node);
   }, [onFileSelect]);

   // 递归渲染文件树
  const renderTree = useCallback((nodes: FileNode[]) => {
    return nodes.map((node) => {
      if (node.type === 'folder' && node.children) {
        const isExpanded = expandedFolders.has(node.id);
        
        return (
          <div key={node.id} className="ml-0">
            <FolderNode
              node={node}
              isExpanded={isExpanded}
              onToggle={() => toggleFolder(node.id)}
              isDark={isDark}
            />
            <AnimatePresence>
               {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="overflow-hidden"
                >
                  <div className="ml-4 border-l-2 border-gray-200 dark:border-gray-700 pl-4">
                    {renderTree(node.children)}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      } else if (node.type === 'file') {
        return (
           <motion.div
              key={node.id}
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.1 }}
            >
            <FileNodeComponent
              node={node}
              onClick={() => handleFileClick(node)}
              isSelected={selectedNodeId === node.id}
              isDark={isDark}
            />
          </motion.div>
        );
      }
      return null;
    });
  }, [expandedFolders, toggleFolder, handleFileClick, selectedNodeId, isDark]);

  return (
    <div className={`space-y-1 h-full flex flex-col`}>
      <div className="mb-3">
        <button 
          onClick={() => {
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = 'video/*';
            fileInput.onchange = (e) => {
              const target = e.target as HTMLInputElement;
              if (target.files && target.files.length > 0) {
                const file = target.files[0];
                // 创建一个临时的 FileNode 对象
                const fileNode: FileNode = {
                  id: `temp-${Date.now()}`, // 使用时间戳创建临时ID
                  name: file.name,
                  type: 'file',
                  parentId: null,
                  path: URL.createObjectURL(file), // 使用 blob URL 作为路径
                  size: file.size,
                  lastModified: file.lastModified
                };
                onFileSelect(fileNode);
              }
            };
            fileInput.click();
          }}
          className={`w-full px-4 py-2 rounded-lg flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white transition-colors`}
        >
          <i className="fa-solid fa-plus"></i>
          <span>添加视频文件</span>
        </button>
      </div>
      
        <div className="font-medium mb-2">文件目录</div>
        <div className="flex-grow overflow-y-auto pr-1 min-h-[100px] max-h-[calc(100vh-320px)]">
          {renderTree(mockFileTree)}
        </div>
    </div>
  );
};