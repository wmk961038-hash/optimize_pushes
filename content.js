// --- content.js (B站页面的终极执行者) ---

console.log('Bilibili 推荐训练师 "卧底" 已就位！');

// 1. 设置一个“对讲机”，随时监听来自 popup.js 的指令
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  
  // 2. 检查收到的指令是不是我们想要的“行动代号”
  if (request.action === "startTraining") {
    console.log("收到行动指令！");
    console.log("关键词:", request.keyword);
    console.log("目标数量:", request.quantity);

    // 3. 立即开始执行“刷视频”这个核心任务
    //    我们把关键词和数量交给这个任务函数去处理
    startBrushingVideos(request.keyword, request.quantity);
  }
});

// 4. 这是核心任务函数：刷视频
async function startBrushingVideos(keyword, quantity) {
  
  // 5. 在当前页面上“扫描”，找到所有视频卡片
  //    '.bili-video-card' 是 B 站用来包裹每个视频推荐项的“容器”的类名
  const videoCards = document.querySelectorAll('.bili-video-card');
  console.log(`在页面上扫描到 ${videoCards.length} 个视频卡片。`);

  // 6. 创建一个空列表，用来存放所有符合条件的视频链接
  const targetVideos = [];

  // 7. 挨个检查每个视频卡片，看它是否符合我们的“关键词”要求
  for (const card of videoCards) {
    const titleElement = card.querySelector('.bili-video-card__info--tit'); // 找到标题元素
    
    // 确保找到了标题，并且标题里包含我们的关键词
    if (titleElement && titleElement.innerText.toLowerCase().includes(keyword.toLowerCase())) {
      const linkElement = card.querySelector('a'); // 找到这个卡片的链接
      if (linkElement) {
        targetVideos.push(linkElement.href); // 把链接地址放进我们的列表
      }
    }
  }

  console.log(`筛选出 ${targetVideos.length} 个符合关键词的视频。`);
  
  // 如果一个都没找到，就提前收工
  if (targetVideos.length === 0) {
    console.log("任务结束：未找到相关视频。");
    return;
  }

  // 8. 确定最终要“刷”的视频数量
  //    取“用户想要的数量”和“我们实际找到的数量”中，较小的那一个
  const videosToBrush = targetVideos.slice(0, quantity);
  console.log(`准备处理 ${videosToBrush.length} 个视频。`);

  // 9. 循环“刷”每一个视频
  for (let i = 0; i < videosToBrush.length; i++) {
    const videoUrl = videosToBrush[i];
    console.log(`[${i + 1}/${videosToBrush.length}] 正在处理: ${videoUrl}`);

    try {
      // 10. “悄悄地”访问这个视频链接
      //     我们用 fetch 发送一个请求，这就像在后台打开了页面，但用户看不到
      //     这比真的打开一个新标签页要安静得多，不打扰用户
      await fetch(videoUrl, { signal: AbortSignal.timeout(9000) }); // 设置9秒超时
      console.log(` -> 访问成功，B站后台可能已记录。`);

    } catch (error) {
      // 如果 fetch 出错（比如超时），我们就在控制台打印一个日志
      if (error.name === 'TimeoutError') {
        console.log(' -> 访问超时（9秒），但这没关系，我们已经发出了请求。继续下一个。');
      } else {
        console.error(` -> 访问失败:`, error);
      }
    }
  }

  console.log("所有任务处理完毕！");
}