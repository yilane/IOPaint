// 缓存功能测试
// 在浏览器控制台中运行以测试缓存功能

// 测试1: 检查是否有缓存的图片
console.log('=== 图片缓存功能测试 ===');

// 获取缓存状态
const cachedImageData = localStorage.getItem('iopaint_cached_image');
const cachedImageInfo = localStorage.getItem('iopaint_cached_image_info');

console.log('1. 缓存状态检查:');
console.log('- 缓存的图片数据:', cachedImageData ? '存在' : '不存在');
console.log('- 缓存的图片信息:', cachedImageInfo ? '存在' : '不存在');

if (cachedImageInfo) {
  try {
    const info = JSON.parse(cachedImageInfo);
    console.log('- 图片信息:', info);
    
    // 检查是否过期
    const isExpired = Date.now() - info.timestamp > 24 * 60 * 60 * 1000;
    console.log('- 是否过期:', isExpired ? '是' : '否');
    
    if (!isExpired) {
      console.log('- 缓存有效，可以使用');
    } else {
      console.log('- 缓存已过期，需要清理');
    }
  } catch (error) {
    console.error('- 解析缓存信息失败:', error);
  }
}

// 测试2: 模拟创建缓存
console.log('\n2. 模拟创建测试缓存:');
const testImageInfo = {
  fileName: 'test-image.jpg',
  fileType: 'image/jpeg',
  width: 800,
  height: 600,
  timestamp: Date.now()
};

// 创建一个简单的测试base64图片（1x1像素的红色图片）
const testBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

localStorage.setItem('iopaint_cached_image', testBase64);
localStorage.setItem('iopaint_cached_image_info', JSON.stringify(testImageInfo));

console.log('- 测试缓存已创建');
console.log('- 测试图片信息:', testImageInfo);

// 测试3: 验证缓存读取
console.log('\n3. 验证缓存读取:');
const readCachedData = localStorage.getItem('iopaint_cached_image');
const readCachedInfo = localStorage.getItem('iopaint_cached_image_info');

if (readCachedData && readCachedInfo) {
  console.log('- 缓存读取成功');
  console.log('- 图片数据长度:', readCachedData.length);
  console.log('- 图片信息:', JSON.parse(readCachedInfo));
} else {
  console.log('- 缓存读取失败');
}

// 测试4: 清理测试缓存
console.log('\n4. 清理测试缓存:');
// localStorage.removeItem('iopaint_cached_image');
// localStorage.removeItem('iopaint_cached_image_info');
// console.log('- 测试缓存已清理');

console.log('\n=== 测试完成 ===');
console.log('注意：如果要清理测试缓存，请取消注释第45-46行的代码并重新运行');

// 辅助函数：清理所有缓存
window.clearImageCache = function() {
  localStorage.removeItem('iopaint_cached_image');
  localStorage.removeItem('iopaint_cached_image_info');
  console.log('图片缓存已清理');
};

console.log('\n可以使用 clearImageCache() 函数清理缓存'); 