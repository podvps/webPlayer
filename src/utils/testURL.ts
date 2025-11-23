import { URLHelper } from './urlHelper';

// 测试URL编码功能
export function testURLEncoding() {
  console.log('🧪 测试URL编码功能...');
  
  // 测试中文路径
  const chinesePath = '/media/1.字母积木 Alphablocks/1.字母积木Alphablocks第1季[英语英字][1080P][共26集]/S01E01.Alphablocks.mp4';
  const encodedPath = URLHelper.encodeFilePath(chinesePath);
  const decodedPath = URLHelper.decodeFilePath(encodedPath);
  
  console.log('原始路径:', chinesePath);
  console.log('编码后:', encodedPath);
  console.log('解码后:', decodedPath);
  console.log('编码解码是否一致:', chinesePath === decodedPath);
  
  // 测试获取媒体URL
  const mediaURL = URLHelper.getMediaURL(chinesePath);
  console.log('媒体URL:', mediaURL);
  
  // 测试其他功能
  console.log('是否为媒体文件:', URLHelper.isMediaFile(chinesePath));
  console.log('文件扩展名:', URLHelper.getFileExtension(chinesePath));
  console.log('文件名:', URLHelper.getFileName(chinesePath));
  console.log('目录路径:', URLHelper.getDirectoryPath(chinesePath));
  
  return {
    original: chinesePath,
    encoded: encodedPath,
    decoded: decodedPath,
    mediaURL: mediaURL,
    isConsistent: chinesePath === decodedPath
  };
}

// 如果直接运行此文件，执行测试
if (typeof window === 'undefined' && require.main === module) {
  testURLEncoding();
}