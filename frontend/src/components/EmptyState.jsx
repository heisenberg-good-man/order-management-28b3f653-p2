import React from 'react'

export default function EmptyState({ text = '暂无数据', action }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">📭</div>
      <div className="empty-text">{text}</div>
      {action}
    </div>
  )
}
