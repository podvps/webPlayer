import { FileNode } from '@/types/FileNode';
import { generateFileTreeData } from './fileDataGenerator';

// 文件变化监听器类
export class FileWatcher {
  private watchers: Map<string, any> = new Map();
  private callbacks: Set<() => void> = new Set();
  private isWatching = false;
  private mediaPath: string;

  constructor(mediaPath: string = './media') {
    this.mediaPath = mediaPath;
  }

  // 添加文件变化回调
  onChange(callback: () => void) {
    this.callbacks.add(callback);
  }

  // 移除文件变化回调
  removeCallback(callback: () => void) {
    this.callbacks.delete(callback);
  }

  // 开始监听文件变化
  start() {
    if (this.isWatching) return;
    
    this.isWatching = true;
    console.log('📁 开始监听media目录变化...');
    
    // 在浏览器环境中，我们使用轮询方式
    if (typeof window !== 'undefined') {
      this.startPolling();
    } else {
      // 在Node.js环境中，使用fs.watch
      this.startNativeWatcher();
    }
  }

  // 停止监听
  stop() {
    this.isWatching = false;
    
    // 清理所有监听器
    for (const [path, watcher] of this.watchers) {
      try {
        watcher.close?.();
      } catch (error) {
        console.warn(`Error closing watcher for ${path}:`, error);
      }
    }
    this.watchers.clear();
    
    console.log('📁 停止监听media目录变化');
  }

  // 轮询方式监听（浏览器环境）
  private startPolling() {
    if (!this.isWatching) return;
    
    let lastData = JSON.stringify(generateFileTreeData(this.mediaPath));
    
    const poll = () => {
      if (!this.isWatching) return;
      
      try {
        const currentData = JSON.stringify(generateFileTreeData(this.mediaPath));
        
        if (currentData !== lastData) {
          console.log('📝 检测到文件变化，触发更新...');
          lastData = currentData;
          this.notifyCallbacks();
        }
      } catch (error) {
        console.warn('文件轮询检查失败:', error);
      }
      
      setTimeout(poll, 2000); // 每2秒检查一次
    };
    
    poll();
  }

  // 原生文件监听（Node.js环境）
  private startNativeWatcher() {
    try {
      const fs = require('fs');
      const path = require('path');
      
      const watchDirectory = (dirPath: string) => {
        if (!fs.existsSync(dirPath)) return;
        
        try {
          const watcher = fs.watch(dirPath, { recursive: true }, (eventType: string, filename: string) => {
            if (filename && filename.endsWith('.mp4')) {
              console.log(`📝 检测到文件变化: ${filename}`);
              this.notifyCallbacks();
            }
          });
          
          this.watchers.set(dirPath, watcher);
        } catch (error) {
          console.warn(`无法监听目录 ${dirPath}:`, error);
        }
      };
      
      watchDirectory(this.mediaPath);
    } catch (error) {
      console.warn('无法启动原生文件监听，使用轮询模式');
      this.startPolling();
    }
  }

  // 通知所有回调函数
  private notifyCallbacks() {
    for (const callback of this.callbacks) {
      try {
        callback();
      } catch (error) {
        console.error('执行文件变化回调时出错:', error);
      }
    }
  }
}

// 全局文件监听器实例
export const globalFileWatcher = new FileWatcher();

// 导出便捷函数
export const watchFileChanges = (callback: () => void) => {
  globalFileWatcher.onChange(callback);
  if (!globalFileWatcher['isWatching']) {
    globalFileWatcher.start();
  }
  
  return () => {
    globalFileWatcher.removeCallback(callback);
  };
};