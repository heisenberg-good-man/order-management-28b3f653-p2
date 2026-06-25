import React, { useState, useEffect } from 'react'
import { adminApi, orderApi } from '../../api'
import EmptyState from '../../components/EmptyState'
import { OrderStatusTag } from '../../components/StatusTags'
import CancelOrderModal from '../../components/CancelOrderModal'
import { ORDER_STATUS } from '../../utils/constants'
import { useToast } from '../../context/ToastContext'

export default function AdminOrderList() {
  const toast = useToast()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [filterStatus, setFilterStatus] = useState('')
  const [cancelVisible, setCancelVisible] = useState(false)
  const [cancelOrderId, setCancelOrderId] = useState(null)

  useEffect(() => {
    loadData()
  }, [filterStatus])

  const loadData = async () => {
    setLoading(true)
    const params = {}
    if (filterStatus) params.status = filterStatus
    const res = await adminApi.orders(params)
    setLoading(false)
    if (res.code === 0) {
      setOrders(res.data)
    } else {
      toast.error(res.message || '加载失败')
    }
  }

  const confirmCancel = async (reason) => {
    const res = await orderApi.cancel(cancelOrderId, reason)
    if (res.code === 0) {
      toast.success('订单已取消')
      loadData()
      return true
    } else {
      toast.error(res.message || '取消失败')
      return false
    }
  }

  return (
    <div className="page-card">
      <div className="page-title">
        <span>订单监控</span>
      </div>
      <div className="filter-bar">
        <div className="filter-item">
          <label>订单状态：</label>
          <select
            className="form-select"
            style={{ width: 140 }}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">全部</option>
            {Object.values(ORDER_STATUS).map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>
      {loading ? (
        <div>加载中...</div>
      ) : orders.length === 0 ? (
        <EmptyState text="暂无订单" />
      ) : (
        <div className="order-list">
          {orders.map((o) => (
            <div key={o.id} className="order-card">
              <div className="order-header">
                <div>
                  <strong style={{ fontSize: 15 }}>{o.profession_type}</strong>
                  <span style={{ marginLeft: 12, color: '#999', fontSize: 13 }}>
                    {o.id}
                  </span>
                </div>
                <OrderStatusTag status={o.status} />
              </div>
              <div className="order-body">
                <div>
                  <span className="label">客户：</span>
                  {o.user_name}
                </div>
                <div>
                  <span className="label">服务商：</span>
                  {o.provider_name}
                </div>
                <div>
                  <span className="label">服务地点：</span>
                  {o.location}
                </div>
                <div>
                  <span className="label">预算：</span>
                  ¥{o.budget}
                </div>
                <div>
                  <span className="label">期望时间：</span>
                  {o.expected_time}
                </div>
                <div>
                  <span className="label">创建时间：</span>
                  {o.created_at}
                </div>
                {o.cancel_reason && (
                  <div style={{ gridColumn: '1 / -1', color: '#ff4d4f' }}>
                    <span className="label" style={{ color: '#ff4d4f' }}>取消原因：</span>
                    {o.cancel_reason}
                  </div>
                )}
              </div>
              <div className="order-footer">
                {(o.status === ORDER_STATUS.PENDING_CONFIRM ||
                  o.status === ORDER_STATUS.ACCEPTED ||
                  o.status === ORDER_STATUS.IN_SERVICE) && (
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => {
                      setCancelOrderId(o.id)
                      setCancelVisible(true)
                    }}
                  >
                    平台取消
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      <CancelOrderModal
        visible={cancelVisible}
        onClose={() => setCancelVisible(false)}
        onConfirm={confirmCancel}
      />
    </div>
  )
}
