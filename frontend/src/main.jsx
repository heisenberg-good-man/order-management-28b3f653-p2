import React from 'react'
import ReactDOM from 'react-dom/client'
import StableApp from './stable-app/index.jsx'
import './styles/global.css'

const rootEl = document.getElementById('root')

if (!rootEl) {
  document.body.innerHTML =
    '<div style="padding:40px;text-align:center;font-family:sans-serif;color:#ff4d4f">' +
    '<h2>❌ 启动失败：未找到 #root 挂载节点</h2>' +
    '<p>请检查 index.html 是否正确配置 &lt;div id="root"&gt;&lt;/div&gt;</p>' +
    '</div>'
} else {
  try {
    ReactDOM.createRoot(rootEl).render(
      <React.StrictMode>
        <StableApp />
      </React.StrictMode>
    )
  } catch (err) {
    rootEl.innerHTML =
      '<div style="padding:40px;font-family:sans-serif">' +
      '<h2 style="color:#ff4d4f">❌ 应用启动异常</h2>' +
      '<p style="color:#666">错误信息：' + String(err && err.message ? err.message : err) + '</p>' +
      '<p style="color:#999;margin-top:24px;font-size:13px">' +
      '请打开浏览器控制台（F12）查看详细堆栈信息，或联系开发人员。' +
      '</p></div>'
  }
}
