// 當有electron showLog事件,進行顯示log動作
window.api.onShowLog((data) => {
  document.getElementById('content').textContent = data
})
