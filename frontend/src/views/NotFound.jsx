import React from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function NotFound() {
  const navigate = useNavigate()
  return (
    <div className="page-card" style={{ textAlign: 'center', padding: '60px 24px' }}>
      <div style={{ fontSize: 72, marginBottom: 16 }}>🔍</div>
      <h2 style={{ marginBottom: 8 }}>页面走丢了</h2>
      <p style={{ color: '#999', marginBottom: 24 }}>你访问的路径不存在，或已被移动到其他位置。</p>
      <div className="btn-group" style={{ justifyContent: 'center' }}>
        <button className="btn btn-default" onClick={() => navigate(-1)}>返回上一页</button>
        <Link to="/" className="btn btn-primary">返回首页</Link>
      </div>
    </div>
  )
}
