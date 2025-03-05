
const myButton = document.getElementById('tab1')

const bookButton = document.getElementById('tab2')

// 當用戶點擊按鈕時發送消息到主進程

// 獲取 HTML 元素
myButton.addEventListener('click', () => {
  window.api.switchTab('my')
})

// 獲取 HTML 元素
bookButton.addEventListener('click', () => {
  window.api.switchTab('bookshop')
})
