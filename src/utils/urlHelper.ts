// URL处理工具类
export class URLHelper {
  // 编码文件路径，正确处理中文和特殊字符
  static encodeFilePath(filePath: string): string {
    try {
      // 确保路径以 / 开头
      const normalizedPath = filePath.startsWith('/') ? filePath : '/' + filePath;
      
      // 分割路径并分别编码每个部分
      const parts = normalizedPath.split('/');
      const encodedParts = parts.map(part => {
        if (!part) return part; // 保留空的部分（如开头的斜杠）
        return encodeURIComponent(part);
      });
      
      return encodedParts.join('/');
    } catch (error) {
      console.error('URL编码失败:', error);
      return filePath;
    }
  }

  // 解码文件路径
  static decodeFilePath(encodedPath: string): string {
    try {
      return decodeURIComponent(encodedPath);
    } catch (error) {
      console.error('URL解码失败:', error);
      return encodedPath;
    }
  }

  // 获取完整的媒体文件URL
  static getMediaURL(filePath: string): string {
    const encodedPath = this.encodeFilePath(filePath);
    
    // 在开发环境中，Vite会自动提供静态资源服务
    // 在生产环境中，需要确保静态资源正确部署
    return encodedPath;
  }

  // 检查路径是否为媒体文件
  static isMediaFile(filePath: string): boolean {
    const mediaExtensions = ['.mp4', '.avi', '.mov', '.mkv', '.webm', '.ogg'];
    const ext = filePath.toLowerCase().substring(filePath.lastIndexOf('.'));
    return mediaExtensions.includes(ext);
  }

  // 获取文件扩展名
  static getFileExtension(filePath: string): string {
    return filePath.toLowerCase().substring(filePath.lastIndexOf('.'));
  }

  // 获取文件名（不含扩展名）
  static getFileName(filePath: string): string {
    const fileName = filePath.substring(filePath.lastIndexOf('/') + 1);
    const nameWithoutExt = fileName.substring(0, fileName.lastIndexOf('.'));
    return nameWithoutExt;
  }

  // 获取文件名（含扩展名）
  static getFileNameWithExt(filePath: string): string {
    return filePath.substring(filePath.lastIndexOf('/') + 1);
  }

  // 获取目录路径
  static getDirectoryPath(filePath: string): string {
    const lastSlashIndex = filePath.lastIndexOf('/');
    return lastSlashIndex > 0 ? filePath.substring(0, lastSlashIndex) : '';
  }

  // 标准化路径（统一使用斜杠）
  static normalizePath(filePath: string): string {
    return filePath.replace(/\\/g, '/');
  }
}

// 便捷的导出函数
export const encodeMediaURL = (filePath: string) => URLHelper.getMediaURL(filePath);
export const decodeMediaURL = (encodedPath: string) => URLHelper.decodeFilePath(encodedPath);