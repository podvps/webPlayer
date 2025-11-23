import { useState, useEffect, useCallback } from 'react';
import { FileNode } from '@/types/FileNode';
import { generateFileTreeData } from '@/utils/fileDataGenerator';
import { watchFileChanges } from '@/utils/fileWatcher';

// 使用文件数据的Hook
export const useFileData = (mediaPath: string = './media') => {
  const [fileData, setFileData] = useState<FileNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 加载文件数据
  const loadFileData = useCallback(() => {
    try {
      setLoading(true);
      setError(null);
      const data = generateFileTreeData(mediaPath);
      setFileData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载文件数据失败');
      console.error('加载文件数据失败:', err);
    } finally {
      setLoading(false);
    }
  }, [mediaPath]);

  // 初始化加载
  useEffect(() => {
    loadFileData();
  }, [loadFileData]);

  // 监听文件变化
  useEffect(() => {
    // 在开发环境中启用文件监听
    if (process.env.NODE_ENV === 'development') {
      const unwatch = watchFileChanges(() => {
        console.log('🔄 文件数据已更新');
        loadFileData();
      });

      return () => {
        unwatch();
      };
    }
  }, [loadFileData]);

  // 手动刷新
  const refresh = useCallback(() => {
    loadFileData();
  }, [loadFileData]);

  // 查找文件的辅助函数
  const findFile = useCallback((path: string): FileNode | null => {
    const searchInNodes = (nodes: FileNode[]): FileNode | null => {
      for (const node of nodes) {
        if (node.type === 'file' && node.path === path) {
          return node;
        }
        if (node.children) {
          const found = searchInNodes(node.children);
          if (found) return found;
        }
      }
      return null;
    };

    return searchInNodes(fileData);
  }, [fileData]);

  // 获取所有文件的辅助函数
  const getAllFiles = useCallback((): FileNode[] => {
    const collectFiles = (nodes: FileNode[]): FileNode[] => {
      const files: FileNode[] = [];
      for (const node of nodes) {
        if (node.type === 'file') {
          files.push(node);
        }
        if (node.children) {
          files.push(...collectFiles(node.children));
        }
      }
      return files;
    };

    return collectFiles(fileData);
  }, [fileData]);

  return {
    fileData,
    loading,
    error,
    refresh,
    findFile,
    getAllFiles
  };
};