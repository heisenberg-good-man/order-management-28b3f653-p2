import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { demandApi, orderApi } from '../../api'
import EmptyState from '../../components/EmptyState'
import { AuthStatusTag } from '../../components/StatusTags'
import { useToast } from '../../context/ToastContext'

export default function UserMatchResult() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const [demand, setDemand] = useState(null)
  const [matched, setMatched] = useState([])
  const [loading, setLoading] = useState(true)
  const [orderingId, setOrderingId] = useState(null)

  useEffect(() => {
    loadData()
  }, [id])

  const loadData = async () => {
    setLoading(true)
    const [dRes, mRes] = await Promise.all([demandApi.get(id), demandApi.match(id, 5)])
    setLoading(false)
    if (dRes.code === 0) setDemand(dRes.data)
    if (mRes.code === 0) setMatched(mRes.data.providers || [])
    if (mRes.code !== 0 || mRes.data?.matched_count === 0) {
      toast.info(mRes.message || '没有可匹配的服务商')
    }
  }

  const handleOrder = async (item) => {
    if (!demand) return
    setOrderingId(item.provider.id)
    const res = await orderApi.create({
      demand_id: demand.id,
      provider_id: item.provider.id,
      profession_type: demand.profession_type,
      location: demand.location,
      budget: demand.budget,
      expected_time: demand.expected_time,
      remark: demand.remark,
    })
    setOrderingId(null)
    if (res.code === 0) {
      toast.success('下单成功，等待服务商确认')
      navigate(`/user/orders/${res.data.id}`)
    } else {
      toast.error(res.message || '下单失败')
    }
  }

  return (
    <div>
      {demand && (
        <div className="page-card" style={{ marginBottom: 16 }}>
          <div className="page-title">
            <span>需求详情</span>
            <span className="tag">¥{demand.budget}</span>
          </div>
          <div className="detail-row">
            <span className="label">职业类型</span>
            <span className="value">{demand.profession_type}</span>
          </div>
          <div className="detail-row">
            <span className="label">服务地点</span>
            <span className="value">{demand.location}</span>
          </div>
          <div className="detail-row">
            <span className="label">期望时间</span>
            <span className="value">{demand.expected_time}</span>
          </div>
          {demand.remark && (
            <div className="detail-row">
              <span className="label">备注</span>
              <span className="value">{demand.remark}</span>
            </div>
          )}
        </div>
      )}
      <div className="page-card">
        <div className="page-title">
          <span>撮合推荐（匹配度从高到低）</span>
          <button className="btn btn-default btn-sm" onClick={() => navigate('/user/demands')}>
            返回需求列表
          </button>
        </div>
        {loading ? (
          <div>匹配中...</div>
        ) : matched.length === 0 ? (
          <EmptyState text="没有可匹配的服务商，建议调整需求条件后重试" />
        ) : (
          <div className="provider-list">
            {matched.map((item) => (
              <div key={item.provider.id} className="provider-card">
                <div className="provider-header">
                  <div>
                    <div className="provider-name">{item.provider.name}</div>
                    <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>
                      {item.provider.profession_type}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="match-score">匹配度 {item.score}分</div>
                    <div style={{ marginTop: 4 }}>
                      <AuthStatusTag status={item.provider.auth_status} />
                    </div>
                  </div>
                </div>
                <div className="provider-meta">
                  <div>
                    <span className="label">服务区域：</span>
                    {item.provider.service_area}
                  </div>
                  <div>
                    <span className="label">报价方式：</span>
                    {item.provider.pricing_mode || '未设置'}
                  </div>
                  <div>
                    <span className="label">报价范围：</span>
                    {item.provider.price_range || '未设置'}
                  </div>
                  {item.provider.phone && (
                    <div>
                      <span className="label">联系电话：</span>
                      {item.provider.phone}
                    </div>
                  )}
                </div>
                {item.provider.service_tags?.length > 0 && (
                  <div className="tag-list" style={{ marginTop: 8 }}>
                    {item.provider.service_tags.map((tag, idx) => (
                      <span key={idx} className="tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <div className="match-reasons">
                  {item.match_reasons.map((r, idx) => (
                    <div key={idx} className="match-reason">
                      ✓ {r}
                    </div>
                  ))}
                </div>
                {item.provider.intro && <div className="provider-intro">{item.provider.intro}</div>}
                <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => handleOrder(item)}
                    disabled={orderingId === item.provider.id}
                  >
                    {orderingId === item.provider.id ? '下单中...' : '立即下单'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
