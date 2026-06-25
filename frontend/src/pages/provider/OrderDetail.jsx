import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { orderApi } from '../../api/index.js'
import { OrderStatusTag } from '../../components/StatusTags.jsx'
import CancelOrderModal from '../../components/CancelOrderModal.jsx'
import OrderTimeline from '../../components/OrderTimeline.jsx'
import { ORDER_STATUS } from '../../utils/constants.js'
import { useToast } from '../../context/ToastContext.jsx'

export default function ProviderOrderDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [cancelVisible, setCancelVisible] = useState(false)
  const [actionLoading, setActionLoading] = useState('')

  useEffect(() => {
    loadData()
  }, [id])

  const loadData = async () => {
    setLoading(true)
    const res = await orderApi.get(id)
    setLoading(false)
    if (res.code === 0) {
      setOrder(res.data)
    } else {
      toast.error(res.message || '加载失败')
    }
  }

  const handleAction = async (action) => {
    setActionLoading(action)
    let res
    if (action === 'accept') res = await orderApi.accept(id)
    else if (action === 'start') res = await orderApi.start(id)
    else if (action === 'complete') res = await orderApi.complete(id)
    setActionLoading('')
    if (res.code === 0) {
      toast.success('操作成功')
      loadData()
    } else {
      toast.error(res.message || '操作失败')
    }
  }

  const confirmCancel = async (reason) => {
    const res = await orderApi.cancel(id, reason)
    if (res.code === 0) {
      toast.success('订单已取消')
      loadData()
      return true
    } else {
      toast.error(res.message || '取消失败')
      return false
    }
  }

  if (loading) return <div className="page-card">加载中...</div>
  if (!order) return <div className="page-card">订单不存在</div>

  const canCancel = [ORDER_STATUS.PENDING_CONFIRM, ORDER_STATUS.ACCEPTED, ORDER_STATUS.IN_SERVICE].includes(order.status)

  return (
    <div>
      <div className="page-card" style={{ marginBottom: 16 }}>
        <div className="page-title">
          <span>订单详情</span>
          <div className="btn-group">
            <button className="btn btn-default" onClick={() => navigate(-1)}>
              返回
            </button>
            {canCancel && (
              <button className="btn btn-danger" onClick={() => setCancelVisible(true)}>
                取消订单
              </button>
            )}
            {order.status === ORDER_STATUS.PENDING_CONFIRM && (
              <button
                className="btn btn-success"
                onClick={() => handleAction('accept')}
                disabled={actionLoading === 'accept'}
              >
                {actionLoading === 'accept' ? '处理中...' : '接单'}
              </button>
            )}
            {order.status === ORDER_STATUS.ACCEPTED && (
              <button
                className="btn btn-primary"
                onClick={() => handleAction('start')}
                disabled={actionLoading === 'start'}
              >
                {actionLoading === 'start' ? '处理中...' : '开始服务'}
              </button>
            )}
            {order.status === ORDER_STATUS.IN_SERVICE && (
              <button
                className="btn btn-success"
                onClick={() => handleAction('complete')}
                disabled={actionLoading === 'complete'}
              >
                {actionLoading === 'complete' ? '处理中...' : '完成服务'}
              </button>
            )}
          </div>
        </div>
        <div className="detail-row">
          <span className="label">订单号</span>
          <span className="value">{order.id}</span>
        </div>
        <div className="detail-row">
          <span className="label">订单状态</span>
          <span className="value"><OrderStatusTag status={order.status} /></span>
        </div>
        <div className="detail-row">
          <span className="label">客户名称</span>
          <span className="value">{order.user_name}</span>
        </div>
        <div className="detail-row">
          <span className="label">职业类型</span>
          <span className="value">{order.profession_type}</span>
        </div>
        <div className="detail-row">
          <span className="label">服务地点</span>
          <span className="value">{order.location}</span>
        </div>
        <div className="detail-row">
          <span className="label">预算金额</span>
          <span className="value">¥{order.budget}</span>
        </div>
        <div className="detail-row">
          <span className="label">期望服务时间</span>
          <span className="value">{order.expected_time}</span>
        </div>
        {order.remark && (
          <div className="detail-row">
            <span className="label">备注</span>
            <span className="value">{order.remark}</span>
          </div>
        )}
        {order.cancel_reason && (
          <div className="detail-row">
            <span className="label">取消原因</span>
            <span className="value" style={{ color: '#ff4d4f' }}>{order.cancel_reason}</span>
          </div>
        )}
      </div>
      <div className="page-card">
        <OrderTimeline order={order} />
      </div>
      <CancelOrderModal
        visible={cancelVisible}
        onClose={() => setCancelVisible(false)}
        onConfirm={confirmCancel}
      />
    </div>
  )
}
