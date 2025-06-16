// 在浏览器开发者工具控制台中运行此脚本来检查缓存状态

console.log('=== AI智能图片修复工具 缓存状态检查 ===');

// 检查新实现的图片缓存
const cachedImage = localStorage.getItem('iopaint_cached_image');
const cachedInfo = localStorage.getItem('iopaint_cached_image_info');

console.log('\n1. 新图片缓存系统:');
console.log('- 缓存图片数据:', cachedImage ? `存在 (${cachedImage.length} 字符)` : '不存在');
if (cachedInfo) {
  try {
    const info = JSON.parse(cachedInfo);
    console.log('- 缓存图片信息:', info);
    console.log('- 缓存时间:', new Date(info.timestamp).toLocaleString());
    
    const isExpired = Date.now() - info.timestamp > 24 * 60 * 60 * 1000;
    console.log('- 是否过期:', isExpired ? '是' : '否');
  } catch (e) {
    console.error('- 解析缓存信息失败:', e);
  }
} else {
  console.log('- 缓存图片信息: 不存在');
}

// 检查现有的最近使用图片
const recentImages = localStorage.getItem('iopaint-recent-images');

console.log('\n2. 最近使用图片系统:');
if (recentImages) {
  try {
    const images = JSON.parse(recentImages);
    console.log('- 最近图片数量:', images.length);
    console.log('- 最近图片列表:', images.map(img => ({
      name: img.name,
      size: img.size,
      id: img.id,
      dataLength: img.dataUrl ? img.dataUrl.length : 0
    })));
    
    // 检查是否有重复图片
    const names = images.map(img => img.name);
    const uniqueNames = [...new Set(names)];
    if (names.length !== uniqueNames.length) {
      console.warn('- ⚠️ 发现重复图片!');
      console.log('- 总数量:', names.length);
      console.log('- 去重后:', uniqueNames.length);
      
      // 显示重复的图片名称
      const duplicates = names.filter((name, index) => names.indexOf(name) !== index);
      console.log('- 重复的图片:', [...new Set(duplicates)]);
    } else {
      console.log('- ✅ 无重复图片');
    }
  } catch (e) {
    console.error('- 解析最近图片失败:', e);
  }
} else {
  console.log('- 最近图片: 不存在');
}

// 检查总存储使用量
console.log('\n3. 存储使用情况:');
let totalSize = 0;
for (let key in localStorage) {
  if (localStorage.hasOwnProperty(key)) {
    totalSize += localStorage[key].length;
  }
}
console.log('- localStorage总使用量:', (totalSize / 1024 / 1024).toFixed(2), 'MB');

// 提供清理功能
console.log('\n4. 清理函数:');
window.clearAllImageCache = function() {
  localStorage.removeItem('iopaint_cached_image');
  localStorage.removeItem('iopaint_cached_image_info');
  localStorage.removeItem('iopaint-recent-images');
  console.log('✅ 所有图片缓存已清理');
};

window.clearRecentImages = function() {
  localStorage.removeItem('iopaint-recent-images');
  console.log('✅ 最近使用图片已清理');
};

window.clearDuplicateImages = function() {
  const recentImages = localStorage.getItem('iopaint-recent-images');
  if (recentImages) {
    try {
      const images = JSON.parse(recentImages);
      const uniqueImages = images.filter((img, index, arr) => 
        arr.findIndex(item => 
          item.name === img.name && 
          item.size === img.size &&
          Math.abs(item.lastModified - img.lastModified) < 1000
        ) === index
      );
      localStorage.setItem('iopaint-recent-images', JSON.stringify(uniqueImages));
      console.log(`✅ 去重完成: ${images.length} -> ${uniqueImages.length}`);
      return images.length - uniqueImages.length;
    } catch (e) {
      console.error('去重失败:', e);
      return 0;
    }
  }
  return 0;
};

console.log('\n可用函数:');
console.log('- clearAllImageCache() - 清理所有图片缓存');
console.log('- clearRecentImages() - 清理最近使用图片');
console.log('- clearDuplicateImages() - 去除重复图片');

console.log('\n=== 检查完成 ==='); 