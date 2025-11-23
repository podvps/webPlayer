import React from 'react';
import { useFileData } from '@/hooks/useFileData';

const FileDataDemo: React.FC = () => {
  const { fileData, loading, error, refresh, getAllFiles } = useFileData();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">正在加载文件数据...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="text-red-800">加载失败: {error}</div>
        <button 
          onClick={refresh}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          重试
        </button>
      </div>
    );
  }

  const allFiles = getAllFiles();
  const totalSize = allFiles.reduce((sum, file) => sum + (file.size || 0), 0);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const renderFileTree = (nodes: any[], level = 0): JSX.Element[] => {
    return nodes.map((node) => (
      <div key={node.id} style={{ marginLeft: `${level * 20}px` }}>
        <div className="flex items-center py-1 hover:bg-gray-50 rounded">
          <span className="mr-2">
            {node.type === 'folder' ? '📁' : '📹'}
          </span>
          <span className="flex-1">{node.name}</span>
          {node.type === 'file' && (
            <span className="text-sm text-gray-500">
              {formatFileSize(node.size || 0)}
            </span>
          )}
        </div>
        {node.children && renderFileTree(node.children, level + 1)}
      </div>
    ));
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">媒体文件管理演示</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{allFiles.length}</div>
            <div className="text-gray-600">视频文件</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{formatFileSize(totalSize)}</div>
            <div className="text-gray-600">总大小</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {fileData[0]?.children?.length || 0}
            </div>
            <div className="text-gray-600">主分类</div>
          </div>
        </div>

        <div className="flex gap-2 mb-4">
          <button 
            onClick={refresh}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            🔄 刷新文件列表
          </button>
          <button 
            onClick={() => window.open('/FILE_DATA_GUIDE.md', '_blank')}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            📖 查看使用指南
          </button>
        </div>
      </div>

      <div className="bg-white border rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-4">文件目录结构</h2>
        <div className="max-h-96 overflow-y-auto">
          {fileData.length > 0 ? (
            renderFileTree(fileData)
          ) : (
            <div className="text-gray-500">没有找到媒体文件</div>
          )}
        </div>
      </div>

      <div className="mt-6 text-sm text-gray-500">
        <p>💡 提示: 这个演示展示了自动生成的文件数据。</p>
        <p>• 在开发环境中，文件变化会自动同步</p>
        <p>• 使用 <code>pnpm update-filedata</code> 手动更新</p>
        <p>• 文件数据基于真实的 media 目录结构生成</p>
      </div>
    </div>
  );
};

export default FileDataDemo;