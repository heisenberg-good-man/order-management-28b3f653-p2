import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { orderApi } from '../../api'
import EmptyState from '../../components/EmptyState'
import { OrderStatusTag } from '../../components/StatusTags'
import CancelOrderModal from '../../components/CancelOrderModal'
import { ORDER_STATUS } from '../../utils/constants'
import { useToast } from '../../context/ToastContext'

export default function ProviderOrderList() {
  const navigate = useNavigate()
  const toast = useToast()
  const [providerId, setProviderId] = useState('')
  const [orders, setOrders] = useState([])
  const [filterStatus, setFilterStatus] = useState('')
  const [loading, setLoading] = useState(false)
  const [cancelVisible, setCancelVisible] = useState(false)
  const [cancelOrderId, setCancelOrderId] = useState(null)
  const [actionLoading, setActionLoading] = useState('')

  useEffect(() => {
    const id = sessionStorage.getItem('currentProviderId')
    if (id) {
      setProviderId(id)
      loadData(id)
    }
  }, [filterStatus])

  const loadData = async (pid) => {
    if (!pid) return
    setLoading(true)
    const params = { provider_id: pid }
    if (filterStatus) params.status = filterStatus
    const res = await orderApi.list(params)
    setLoading(false)
    if (res.code === 0) {
      setOrders(res.data)
    } else {
      toast.error(res.message || '加载失败')
    }
  }

  const handleLoad = () => {
    if (!providerId.trim()) {
      toast.error('请输入服务商ID')
      return
    }
    sessionStorage.setItem('currentProviderId', providerId.trim())
    loadData(providerId.trim())
  }

  const handleAction = async (orderId, action) => {
    setActionLoading(`${orderId}-${action}`)
    let res
    if (action === 'accept') res = await orderApi.accept(orderId)
    else if (action === 'start') res = await orderApi.start(orderId)
    else if (action === 'complete') res = await orderApi.complete(orderId)
    setActionLoading('')
    if (res.code === 0) {
      toast.success('操作成功')
      loadData(providerId)
    } else {
      toast.error(res.message || '操作失败')
    }
  }

  const confirmCancel = async (reason) => {
    const res = await orderApi.cancel(cancelOrderId, reason)
    if (res.code === 0) {
      toast.success('订单已取消')
      loadData(providerId)
      return true
    } else {
      toast.error(res.message || '取消失败')
      return false
    }
  }

  return (
    <div className="page-card">
      <div className="page-title">
        <span>服务商订单管理</span>
      </div>
      <div className="filter-bar">
        <div className="filter-item">
          <label>服务商ID：</label>
          <input
            type="text"
            className="form-input"
            style={{ width: 200 }}
            placeholder="请输入服务商ID"
            value={providerId}
            onChange={(e) => setProviderId(e.target.value)}
          />
          <button className="btn btn-primary btn-sm" onClick={handleLoad}>
            加载订单
          </button>
        </div>
        <div className="filter-item">
          <label>状态：</label>
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
        <EmptyState text={providerId ? '暂无订单' : '请输入服务商ID后加载订单'} />
      ) : (
        <div className="order-list">
          {orders.map((o) => (
            <div key={o.id} className="order-card">
              <div className="order-header">
                <div>
                  <strong style={{ fontSize: 15 }}>{o.profession_type}</strong>
                  <span style={{ marginLeft: 12, color: '#999', fontSize: 13 }}>
                    客户：{o.user_name}
                  </span>
                  <span className="order-id" style={{ marginLeft: 12 }}>
                    {o.id}
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
                {o.remark && (
                  <div style={{ gridColumn: '1 / -1' }}>
                    <span className="label">备注：</span>
                    {o.remark}
                  </div>
                )}
              </div>
              <div className="order-footer">
                <button
                  className="btn btn-default btn-sm"
                  onClick={() => navigate(`/provider/orders/${o.id}`)}
                >
                  查看详情
                </button>
                {o.status === ORDER_STATUS.PENDING_CONFIRM && (
                  <button
                    className="btn btn-success btn-sm"
                    onClick={() => handleAction(o.id, 'accept')}
                    disabled={actionLoading === `${o.id}-accept`}
                  >
                    {actionLoading === `${o.id}-accept` ? '处理中...' : '接单'}
                  </button>
                )}
                {o.status === ORDER_STATUS.ACCEPTED && (
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => handleAction(o.id, 'start')}
                    disabled={actionLoading === `${o.id}-start`}
                  >
                    {actionLoading === `${o.id}-start` ? '处理中...' : '开始服务'}
                  </button>
                )}
                {o.status === ORDER_STATUS.IN_SERVICE && (
                  <button
                    className="btn btn-success btn-sm"
                    onClick={() => handleAction(o.id, 'complete')}
                    disabled={actionLoading === `${o.id}-complete`}
                  >
                    {actionLoading === `${o.id}-complete` ? '处理中...' : '完成服务'}
                  </button>
                )}
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
                    取消
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
