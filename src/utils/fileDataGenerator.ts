import { FileNode } from '@/types/FileNode';
import * as fs from 'fs';
import * as path from 'path';

// 文件大小转换函数
function formatFileSize(bytes: number): number {
  return bytes;
}

// 获取文件修改时间
function getFileModifiedTime(filePath: string): number {
  try {
    const stats = fs.statSync(filePath);
    return stats.mtime.getTime();
  } catch (error) {
    return Date.now();
  }
}

// 递归扫描目录生成文件节点
function generateFileNode(dirPath: string, relativePath: string, parentId: string | null = null): FileNode[] {
  const nodes: FileNode[] = [];
  let idCounter = 1;

  try {
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      const itemPath = path.join(dirPath, item);
      const itemRelativePath = path.join(relativePath, item);
      const stats = fs.statSync(itemPath);
      
      const nodeId = `${parentId || ''}_${idCounter++}`;
      
      if (stats.isDirectory()) {
        // 创建文件夹节点
        const folderNode: FileNode = {
          id: nodeId,
          name: item,
          type: 'folder',
          parentId: parentId,
          path: `/儿童教育视频${itemRelativePath.replace(/\\/g, '/')}`,
          children: generateFileNode(itemPath, itemRelativePath, nodeId)
        };
        nodes.push(folderNode);
      } else if (stats.isFile() && item.endsWith('.mp4')) {
        // 创建视频文件节点
        const fileNode: FileNode = {
          id: nodeId,
          name: item,
          type: 'file',
          parentId: parentId,
          path: `/media${itemRelativePath.replace(/\\/g, '/')}`,
          size: formatFileSize(stats.size),
          lastModified: getFileModifiedTime(itemPath)
        };
        nodes.push(fileNode);
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dirPath}:`, error);
  }

  return nodes;
}

// 生成完整的文件树数据
export function generateFileTreeData(mediaPath: string = './media'): FileNode[] {
  const rootPath = path.resolve(mediaPath);
  
  if (!fs.existsSync(rootPath)) {
    console.error(`Media directory not found: ${rootPath}`);
    return [];
  }

  const fileTreeData: FileNode[] = [
    {
      id: '1',
      name: '儿童教育视频',
      type: 'folder',
      parentId: null,
      path: '/儿童教育视频',
      children: generateFileNode(rootPath, '', '1')
    }
  ];

  return fileTreeData;
}

// 生成并导出文件数据（用于构建时）
export const fileTreeData = generateFileTreeData();

// 如果直接运行此脚本，生成新的fileData.ts文件
if (require.main === module) {
  const fileDataContent = `import { FileNode } from '@/types/FileNode';
export type { FileNode };

// 自动生成的文件目录数据 - 请勿手动编辑
// 生成时间: ${new Date().toISOString()}
export const fileTreeData: FileNode[] = ${JSON.stringify(generateFileTreeData(), null, 2)};
`;

  fs.writeFileSync('./src/media/fileData.ts', fileDataContent);
  console.log('fileData.ts has been regenerated automatically.');
}