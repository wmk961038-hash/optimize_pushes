// --- popup.js (操作手册 - 修订版) ---

document.addEventListener('DOMContentLoaded', function() {
  const keywordInput = document.getElementById('keyword');
  const quantityInput = document.getElementById('quantity');
  const startButton = document.getElementById('startButton');

  startButton.addEventListener('click', function() {
    const keyword = keywordInput.value.trim();
    const quantity = parseInt(quantityInput.value, 10);

    if (!keyword) {
      alert('请先输入一个视频关键词！');
      return;
    }

    // 直接查询B站页面
    chrome.tabs.query({ active: true, url: "*://*.bilibili.com/*" }, function(tabs) {
      if (tabs.length === 0) {
        alert('请先切换到一个Bilibili的页面再开始训练！');
        return;
      }
      
      const activeTab = tabs[0];

      // 直接通过“对讲机”发送指令
      chrome.tabs.sendMessage(activeTab.id, {
        action: "startTraining",
        keyword: keyword,
        quantity: quantity
      });

      window.close();
    });
  });
});