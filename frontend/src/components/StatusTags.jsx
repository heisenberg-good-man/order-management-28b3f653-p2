import React from 'react'
import { AUTH_STATUS_COLOR, ORDER_STATUS_COLOR } from '../utils/constants.js'

export function AuthStatusTag({ status }) {
  const color = AUTH_STATUS_COLOR[status] || '#999'
  return (
    <span className="status-tag" style={{ background: color + '20', color }}>
      {status || '未知'}
    </span>
  )
}

export function OrderStatusTag({ status }) {
  const color = ORDER_STATUS_COLOR[status] || '#999'
  return (
    <span className="status-tag" style={{ background: color + '20', color }}>
      {status || '未知'}
    </span>
  )
}
