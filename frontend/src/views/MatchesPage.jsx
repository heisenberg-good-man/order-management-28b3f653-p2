import React, { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { store, PROFESSION_TYPES, AUTH_STATUS } from '../store/localStore.js'
import { matchProviders } from '../services/matcher.js'
import EmptyState from '../components/EmptyState.jsx'
import { AuthStatusTag } from '../components/StatusTags.jsx'
import { useToast } from '../context/ToastContext.jsx'

export default function MatchesPage() {
  const { demandId } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const [, force] = React.useReducer((x) => x + 1, 0)
  React.useEffect(() => store.subscribe(() => force()), [])

  const demands = store.listDemands()
  const [selectedDemandId, setSelectedDemandId] = useState(demandId || (demands[0]?.id || ''))
  const [orderingId, setOrderingId] = useState('')

  const demand = selectedDemandId ? store.getDemand(selectedDemandId) : null
  const matched = demand ? matchProviders(demand, store.listProviders()) : []

  const handleOrder = async (p) => {
    if (!demand) { toast.error('请先选择需求'); return }
    setOrderingId(p.id)
    const result = store.createOrder({
      demand_id: demand.id,
      provider_id: p.id,
      profession_type: demand.profession_type,
      location: demand.location,
      budget: demand.budget,
      expected_time: demand.expected_time,
      remark: demand.remark
    })
    setOrderingId('')
    if (result.error) { toast.error(result.error); return }
    toast.success('下单成功，等待服务商确认')
    navigate(`/orders/${result.id}`)
  }

  return (
    <div>
      <div className="page-card" style={{ marginBottom: 16 }}>
        <div className="page-title">
          <span>🤝 撮合推荐结果</span>
          <Link to="/demands" className="btn btn-default">返回需求列表</Link>
        </div>

        <div className="filter-bar">
          <div className="filter-item"><label>选择需求：</label>
            <select className="form-select" style={{ width: 360 }} value={selectedDemandId} onChange={e => { setSelectedDemandId(e.target.value); if (e.target.value) navigate(`/matches/${e.target.value}`) }}>
              <option value="">-- 请选择 --</option>
              {demands.map(d => (
                <option key={d.id} value={d.id}>{d.profession_type} · {d.location} · ¥{d.budget}</option>
              ))}
            </select>
          </div>
          {demands.length === 0 && (
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/demands')}>去发布需求</button>
          )}
        </div>

        {!demand ? (
          <EmptyState text={demands.length === 0 ? '还没有任何需求，先去发布一条需求吧' : '请先在上方选择一个需求查看匹配结果'} />
        ) : (
          <>
            <div style={{ background: '#f7f9ff', padding: 16, borderRadius: 6, marginBottom: 16 }}>
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>当前需求详情</div>
              <div className="detail-row"><span className="label">职业类型</span><span className="value">{demand.profession_type}</span></div>
              <div className="detail-row"><span className="label">服务地点</span><span className="value">{demand.location}</span></div>
              <div className="detail-row"><span className="label">预算</span><span className="value">¥{demand.budget}</span></div>
              <div className="detail-row"><span className="label">期望时间</span><span className="value">{demand.expected_time}</span></div>
              {demand.remark && <div className="detail-row"><span className="label">备注</span><span className="value">{demand.remark}</span></div>}
            </div>
            <div style={{ color: '#666', marginBottom: 12 }}>
              共匹配到 <strong style={{ color: '#667eea' }}>{matched.length}</strong> 个服务商（按匹配度从高到低）
            </div>
            {matched.length === 0 ? (
              <EmptyState text="没有可匹配的服务商，建议调整需求的职业类型、地点或预算后重试" />
            ) : (
              <div className="provider-list">
                {matched.map(({ provider, score, match_reasons }) => (
                  <div key={provider.id} className="provider-card">
                    <div className="provider-header">
                      <div>
                        <Link to={`/providers/${provider.id}`} style={{ textDecoration: 'none' }}>
                          <div className="provider-name" style={{ color: '#667eea' }}>{provider.name} →</div>
                        </Link>
                        <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>{provider.profession_type}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div className="match-score">匹配度 {score} 分</div>
                        <div style={{ marginTop: 4 }}><AuthStatusTag status={provider.auth.status} /></div>
                      </div>
                    </div>
                    <div className="provider-meta">
                      <div><span className="label">服务区域：</span>{provider.service_area}</div>
                      <div><span className="label">报价：</span>{provider.pricing_mode || '未设'} {provider.price_range || ''}</div>
                      {provider.phone && <div><span className="label">电话：</span>{provider.phone}</div>}
                    </div>
                    {provider.service_tags?.length > 0 && (
                      <div className="tag-list" style={{ marginTop: 8 }}>
                        {provider.service_tags.map((t, i) => <span key={i} className="tag">{t}</span>)}
                      </div>
                    )}
                    <div className="match-reasons">
                      {match_reasons.map((r, i) => <div key={i} className="match-reason">✓ {r}</div>)}
                    </div>
                    {provider.intro && <div className="provider-intro">{provider.intro}</div>}
                    <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
                      <button
                        className="btn btn-primary btn-sm"
                        disabled={orderingId === provider.id}
                        onClick={() => handleOrder(provider)}
                      >
                        {orderingId === provider.id ? '下单中...' : '立即下单'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
