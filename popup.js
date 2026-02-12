// --- popup.js (操作手册) ---

// 1. 等待图纸(HTML)完全加载完毕后，再开始工作。
document.addEventListener('DOMContentLoaded', function() {
  
  // 2. 找到操作面板上的三个关键零件
  const keywordInput = document.getElementById('keyword');     // “关键词”输入框
  const quantityInput = document.getElementById('quantity');   // “数量”输入框
  const startButton = document.getElementById('startButton');    // “开始训练”按钮

  // 3. 开始“盯住”那个开始按钮，看它有没有被点击
  startButton.addEventListener('click', function() {
    
    // --- 当按钮被点击时，执行以下操作 ---

    // 4. 读取两个输入框里现在的值
    const keyword = keywordInput.value.trim(); // 读取关键词，并用.trim()去掉前后多余的空格
    const quantity = parseInt(quantityInput.value, 10); // 读取数量，并用parseInt()确保它是个整数

    // 5. 做一个简单的检查
    if (!keyword) {
      alert('请先输入一个视频关键词！'); // 如果关键词是空的，就弹窗提醒用户
      return; // 然后���止，不往下执行了
    }
    
    // 6. 查找用户当前正在看的那个B站页面
    //    我们只对活动的(active)、网址是bilibili.com的页面感兴趣
    chrome.tabs.query({ active: true, url: "*://*.bilibili.com/*" }, function(tabs) {
      
      // 7. 检查是否找到了符合条件的B站页面
      if (tabs.length === 0) {
        alert('请先切换到一个Bilibili的页面再开始训练！');
        return;
      }
      
      // 如果找到了，tabs[0]就是那个页面的信息
      const activeTab = tabs[0];

      // 8. 下达最终指令！
      //    告诉Chrome：“到下面这个页面(activeTab.id)去，执行一个叫 'startTraining' 的任务”
      //    同时把“关键词(keyword)”和“数量(quantity)”这两个信息一起带过去
      chrome.scripting.executeScript({
        target: { tabId: activeTab.id }, // 目标：哪个页面
        files: ['content.js']            // 任务内容：执行 content.js 文件里的代码
      }).then(() => {
        // 在注入脚本成功后，再发送消息
        chrome.tabs.sendMessage(activeTab.id, {
          action: "startTraining",
          keyword: keyword,
          quantity: quantity
        });
      });

      // 9. 关闭弹出窗口，让用户界面更清爽
      window.close();
    });
  });
});