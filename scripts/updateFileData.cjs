const fs = require('fs');
const path = require('path');

// 文件大小转换函数
function formatFileSize(bytes) {
  return bytes;
}

// 获取文件修改时间
function getFileModifiedTime(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return stats.mtime.getTime();
  } catch (error) {
    return Date.now();
  }
}

// 智能排序函数 - 正确处理数字序号
function smartSort(items) {
  return items.sort((a, b) => {
    // 提取开头的数字序号（如果有）
    const extractNumber = (str) => {
      const match = str.match(/^(\d+)/);
      return match ? parseInt(match[1], 10) : null;
    };
    
    const aNum = extractNumber(a);
    const bNum = extractNumber(b);
    
    // 如果两个都有数字序号，按数字排序
    if (aNum !== null && bNum !== null) {
      return aNum - bNum;
    }
    
    // 如果只有一个有数字序号，有数字的排在前面
    if (aNum !== null) return -1;
    if (bNum !== null) return 1;
    
    // 都没有数字序号，按字符串排序
    return a.localeCompare(b, 'zh-CN', { numeric: true });
  });
}

// 递归扫描目录生成文件节点
function generateFileNode(dirPath, relativePath, parentId = null) {
  const nodes = [];
  let idCounter = 1;

  try {
    const items = fs.readdirSync(dirPath);
    
    // 使用智能排序
    const sortedItems = smartSort(items);
    
    for (const item of sortedItems) {
      const itemPath = path.join(dirPath, item);
      const itemRelativePath = path.join(relativePath, item);
      const stats = fs.statSync(itemPath);
      
      const nodeId = `${parentId || ''}_${idCounter++}`;
      
      if (stats.isDirectory()) {
        // 创建文件夹节点
        const folderNode = {
          id: nodeId,
          name: item,
          type: 'folder',
          parentId: parentId,
          path: `/media${itemRelativePath ? '/' + itemRelativePath.replace(/\\/g, '/') : ''}`,
          children: generateFileNode(itemPath, itemRelativePath, nodeId)
        };
        nodes.push(folderNode);
      } else if (stats.isFile() && item.endsWith('.mp4')) {
        // 创建视频文件节点
        const fileNode = {
          id: nodeId,
          name: item,
          type: 'file',
          parentId: parentId,
          path: `/media${itemRelativePath ? '/' + itemRelativePath.replace(/\\/g, '/') : ''}`,
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
function generateFileTreeData(mediaPath = './media') {
  const rootPath = path.resolve(mediaPath);
  
  if (!fs.existsSync(rootPath)) {
    console.error(`Media directory not found: ${rootPath}`);
    return [];
  }

  // 直接返回media目录下的内容，不添加根目录标题
  return generateFileNode(rootPath, '', null);
}

// 主函数：更新fileData.ts文件
function updateFileData() {
  console.log('正在扫描media目录...');
  
  const fileTreeData = generateFileTreeData('./media');
  
  const fileDataContent = `import { FileNode } from '@/types/FileNode';
export type { FileNode };

// 自动生成的文件目录数据 - 请勿手动编辑
// 生成时间: ${new Date().toISOString()}
export const fileTreeData: FileNode[] = ${JSON.stringify(fileTreeData, null, 2)};
`;

  const outputPath = './src/media/fileData.ts';
  
  try {
    fs.writeFileSync(outputPath, fileDataContent, 'utf8');
    console.log(`✅ fileData.ts 已自动更新: ${outputPath}`);
    console.log(`📁 扫描到的文件数量: ${countFiles(fileTreeData)} 个视频文件`);
    console.log(`📂 扫描到的文件夹数量: ${countFolders(fileTreeData)} 个文件夹`);
  } catch (error) {
    console.error('❌ 更新fileData.ts失败:', error);
  }
}

// 统计文件数量
function countFiles(nodes) {
  let count = 0;
  for (const node of nodes) {
    if (node.type === 'file') {
      count++;
    } else if (node.children) {
      count += countFiles(node.children);
    }
  }
  return count;
}

// 统计文件夹数量
function countFolders(nodes) {
  let count = 0;
  for (const node of nodes) {
    if (node.type === 'folder') {
      count++;
      if (node.children) {
        count += countFolders(node.children);
      }
    }
  }
  return count;
}

// 如果直接运行此脚本
if (require.main === module) {
  updateFileData();
}

module.exports = { updateFileData, generateFileTreeData };