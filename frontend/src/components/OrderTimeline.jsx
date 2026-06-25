import React from 'react'
import { ORDER_STATUS } from '../utils/constants'

export default function OrderTimeline({ order }) {
  const items = []
  items.push({
    title: '订单创建',
    desc: order.created_at,
    done: true,
  })
  if (order.accepted_at) {
    items.push({ title: ORDER_STATUS.ACCEPTED, desc: order.accepted_at, done: true })
  }
  if (order.started_at) {
    items.push({ title: ORDER_STATUS.IN_SERVICE, desc: order.started_at, done: true })
  }
  if (order.completed_at) {
    items.push({ title: ORDER_STATUS.COMPLETED, desc: order.completed_at, done: true })
  }
  if (order.cancelled_at) {
    items.push({
      title: `${ORDER_STATUS.CANCELLED}（原因：${order.cancel_reason}）`,
      desc: order.cancelled_at,
      done: true,
    })
  }

  return (
    <div className="detail-section">
      <div className="detail-section-title">订单进度</div>
      <div className="timeline">
        {items.map((it, idx) => (
          <div key={idx} className={`timeline-item ${it.done ? 'done' : ''}`}>
            <div className="timeline-title">{it.title}</div>
            <div className="timeline-desc">{it.desc}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
