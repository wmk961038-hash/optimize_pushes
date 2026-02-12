// content.js - 更稳健的选择器与信息解析（兼容 a 内部为 h3.title 的结构）

console.log('Bilibili 推荐训练师 "卧底" 已就位！');

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "startTraining") {
    console.log("收到行动指令！");
    console.log("关键词:", request.keyword);
    console.log("目标数量:", request.quantity);
    startBrushingVideos(request.keyword, request.quantity);
  }
});

function normalizeHref(href) {
  if (!href) return null;
  href = href.trim();
  if (href.startsWith('//')) return 'https:' + href;
  if (href.startsWith('/')) return 'https://www.bilibili.com' + href;
  if (href.startsWith('http://') || href.startsWith('https://')) return href;
  // 相对路径或其它，尝试拼接当前站点
  return 'https://www.bilibili.com/' + href;
}

async function startBrushingVideos(keyword, quantity) {
  const videoCards = Array.from(document.querySelectorAll('.bili-video-card'));
  console.log(`在页面上扫描到 ${videoCards.length} 个视频卡片。`);

  if (videoCards.length === 0) {
    console.log("未发现任何 .bili-video-card，页面可能尚未渲染完成或选择器错误。");
    return;
  }

  const targetVideos = [];

  for (const [index, card] of videoCards.entries()) {
    try {
      const anchors = Array.from(card.querySelectorAll('a'));
      // 取第一个有效链接优先
      const linkElement = anchors.find(a => a.getAttribute('href')) || anchors[0] || null;
      if (!linkElement) {
        console.log(`[card ${index}] 未找到 <a> 元素，跳过`);
        continue;
      }

      // 尝试多种方式获取标题：h3.titleAttr -> h3.textContent -> a.title -> a.textContent
      let title = null;
      const h3 = linkElement.querySelector('h3') || card.querySelector('h3');
      if (h3) {
        title = h3.getAttribute('title') || (h3.textContent || '').trim();
        if (title) {
          // debug: 标明来源
          // console.log(`[card ${index}] 标题来自 h3：`, title);
        }
      }

      if (!title) {
        title = linkElement.getAttribute('title') || (linkElement.textContent || '').trim();
        // console.log(`[card ${index}] 标题来自 a：`, title);
      }

      const rawHref = linkElement.getAttribute('href');
      const fullHref = normalizeHref(rawHref);

      if (!title || !fullHref) {
        console.log(`[card ${index}] 无法解析 title 或 href，title=${title}, href=${rawHref}`);
        continue;
      }

      // 匹配关键词（不区分大小写）
      if (title.toLowerCase().includes(keyword.toLowerCase())) {
        if (!targetVideos.includes(fullHref)) {
          targetVideos.push(fullHref);
          console.log(`[card ${index}] 命中：`, title, fullHref);
        }
      } else {
        // 可选的详细日志：
        // console.log(`[card ${index}] 未命中：`, title);
      }

    } catch (e) {
      console.error('解析单个 card 时出错：', e);
    }
  }

  console.log(`筛选出 ${targetVideos.length} 个符合关键词的视频。`);

  if (targetVideos.length === 0) {
    console.log("任务结束：未找到相关视频。请把控制台的 card 检查输出贴给我，我会继续调整选择器。");
    return;
  }

  const videosToBrush = targetVideos.slice(0, quantity);
  console.log(`准备处理 ${videosToBrush.length} 个视频。`);

  for (let i = 0; i < videosToBrush.length; i++) {
    const videoUrl = videosToBrush[i];
    console.log(`[${i + 1}/${videosToBrush.length}] 正在处理: ${videoUrl}`);
    try {
      await fetch(videoUrl, { signal: AbortSignal.timeout(9000) });
      console.log(` -> 访问成功`);
    } catch (error) {
      console.log(` -> 访问超时或失败: ${error && error.message ? error.message : error}`);
    }
  }

  console.log("🎉 所有任务处理完毕！🎉");
}