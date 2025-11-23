// 定义文件和文件夹的类型
export interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  parentId: string | null;
  path: string;
  size?: number;
  lastModified?: number;
  children?: FileNode[];
}