import React from 'react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo })
    if (typeof console !== 'undefined' && console.error) {
      console.error('[ErrorBoundary] 捕获到错误：', error, errorInfo)
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
    if (typeof window !== 'undefined' && window.location) {
      window.location.href = '/'
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            padding: '40px 24px',
            maxWidth: 720,
            margin: '40px auto',
            background: '#fff',
            borderRadius: 8,
            boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 12 }}>⚠️</div>
          <h2 style={{ color: '#ff4d4f', margin: '0 0 12px 0' }}>页面渲染异常</h2>
          <p style={{ color: '#666', lineHeight: 1.6, marginBottom: 12 }}>
            当前页面在渲染时遇到了问题，但不会影响其他页面的正常使用。
          </p>
          {this.state.error && (
            <div
              style={{
                background: '#fff7f7',
                border: '1px solid #ffccc7',
                borderRadius: 4,
                padding: 12,
                marginBottom: 16,
                fontSize: 13,
                color: '#cf1322',
                wordBreak: 'break-all',
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: 4 }}>错误信息：</div>
              <div>{String(this.state.error.message || this.state.error)}</div>
            </div>
          )}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button
              onClick={this.handleReset}
              style={{
                padding: '8px 20px',
                background: '#667eea',
                color: '#fff',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 500,
              }}
            >
              返回首页
            </button>
            <button
              onClick={() => {
                if (typeof window !== 'undefined' && window.history && window.history.back) {
                  window.history.back()
                } else {
                  this.handleReset()
                }
              }}
              style={{
                padding: '8px 20px',
                background: '#fff',
                color: '#666',
                border: '1px solid #d9d9d9',
                borderRadius: 4,
                cursor: 'pointer',
                fontSize: 14,
              }}
            >
              返回上一页
            </button>
          </div>
          <div
            style={{
              marginTop: 24,
              padding: 12,
              background: '#f6ffed',
              border: '1px solid #b7eb8f',
              borderRadius: 4,
              fontSize: 12,
              color: '#389e0d',
              lineHeight: 1.6,
            }}
          >
            💡 <strong>提示：</strong>您可以通过顶部导航切换到其他页面继续操作，或点击上方按钮返回首页。
            如需排查问题，请打开浏览器开发者工具（F12）查看 Console 中的详细错误信息。
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
