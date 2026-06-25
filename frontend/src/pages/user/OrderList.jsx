import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { orderApi } from '../../api'
import EmptyState from '../../components/EmptyState'
import { OrderStatusTag } from '../../components/StatusTags'
import CancelOrderModal from '../../components/CancelOrderModal'
import { ORDER_STATUS } from '../../utils/constants'
import { useToast } from '../../context/ToastContext'

const USER_ID = 'user_001'

export default function UserOrderList() {
  const navigate = useNavigate()
  const toast = useToast()
  const [orders, setOrders] = useState([])
  const [filterStatus, setFilterStatus] = useState('')
  const [loading, setLoading] = useState(false)
  const [cancelVisible, setCancelVisible] = useState(false)
  const [cancelOrderId, setCancelOrderId] = useState(null)

  useEffect(() => {
    loadData()
  }, [filterStatus])

  const loadData = async () => {
    setLoading(true)
    const params = { user_id: USER_ID }
    if (filterStatus) params.status = filterStatus
    const res = await orderApi.list(params)
    setLoading(false)
    if (res.code === 0) {
      setOrders(res.data)
    } else {
      toast.error(res.message || '加载失败')
    }
  }

  const handleCancel = (orderId) => {
    setCancelOrderId(orderId)
    setCancelVisible(true)
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
        <span>我的订单</span>
      </div>
      <div className="filter-bar">
        <div className="filter-item">
          <label>状态筛选：</label>
          <select
            className="form-select"
            style={{ width: 140 }}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">全部状态</option>
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
        <EmptyState text="暂无订单，快去发布需求匹配服务商吧" />
      ) : (
        <div className="order-list">
          {orders.map((o) => (
            <div key={o.id} className="order-card">
              <div className="order-header">
                <div>
                  <strong style={{ fontSize: 15 }}>{o.profession_type} · {o.provider_name}</strong>
                  <span className="order-id" style={{ marginLeft: 12 }}>
                    订单号：{o.id}
                  </span>
                </div>
                <OrderStatusTag status={o.status} />
              </div>
              <div className="order-body">
                <div>
                  <span className="label">服务地点：</span>
                  {o.location}
                </div>
                <div>
                  <span className="label">预算金额：</span>
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
              </div>
              <div className="order-footer">
                <button className="btn btn-default btn-sm" onClick={() => navigate(`/user/orders/${o.id}`)}>
                  查看详情
                </button>
                {(o.status === ORDER_STATUS.PENDING_CONFIRM ||
                  o.status === ORDER_STATUS.ACCEPTED ||
                  o.status === ORDER_STATUS.IN_SERVICE) && (
                  <button className="btn btn-danger btn-sm" onClick={() => handleCancel(o.id)}>
                    取消订单
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
