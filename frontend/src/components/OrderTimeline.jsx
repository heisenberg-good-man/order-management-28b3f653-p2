import React from 'react'
import { ORDER_STATUS } from '../utils/constants'

export default function OrderTimeline({ order, records }) {
  const items = []
  items.push({
    title: '订单创建',
    desc: order.created_at,
    done: true,
  })
  if (order.accepted_at) {
    items.push({ title: ORDER_STATUS.ACCEPTED, desc: order.accepted_at, done: true })
  }
  if (order.started_at && !order.resolved_at) {
    items.push({ title: ORDER_STATUS.IN_SERVICE, desc: order.started_at, done: true })
  }
  if (order.exception_at) {
    items.push({
      title: `${ORDER_STATUS.EXCEPTION}（${order.exception_remark}）`,
      desc: order.exception_at,
      done: true,
      isException: true,
    })
  }
  if (order.resolved_at) {
    items.push({ title: '异常已处理，恢复服务', desc: order.resolved_at, done: true })
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
          <div key={idx} className={`timeline-item ${it.done ? 'done' : ''} ${it.isException ? 'exception' : ''}`}>
            <div className="timeline-title">{it.title}</div>
            <div className="timeline-desc">{it.desc}</div>
          </div>
        ))}
      </div>

      {records && records.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <div className="detail-section-title">业务操作记录</div>
          <div className="record-list">
            {records.map(r => (
              <div key={r.id} className="record-item">
                <div className="record-header">
                  <span className="record-role">{r.role_label}</span>
                  <span className="record-action">{r.action}</span>
                  <span className="record-time">{r.created_at}</span>
                </div>
                <div className="record-detail">{r.detail}</div>
                <div className="record-result">{r.result}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
