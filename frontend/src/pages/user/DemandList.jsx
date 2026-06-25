import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { demandApi } from '../../api'
import EmptyState from '../../components/EmptyState'
import { AuthStatusTag } from '../../components/StatusTags'
import { useToast } from '../../context/ToastContext'

export default function UserDemandList() {
  const [demands, setDemands] = useState([])
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const toast = useToast()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    const res = await demandApi.list()
    setLoading(false)
    if (res.code === 0) {
      setDemands(res.data)
    } else {
      toast.error(res.message || '加载失败')
    }
  }

  return (
    <div className="page-card">
      <div className="page-title">
        <span>用工需求列表</span>
        <button className="btn btn-primary" onClick={() => navigate('/user/demands/publish')}>
          + 发布新需求
        </button>
      </div>
      {loading ? (
        <div>加载中...</div>
      ) : demands.length === 0 ? (
        <EmptyState
          text="暂无需求，点击右上角发布第一条需求"
          action={
            <button className="btn btn-primary" onClick={() => navigate('/user/demands/publish')}>
              立即发布
            </button>
          }
        />
      ) : (
        <div className="order-list">
          {demands.map((d) => (
            <div key={d.id} className="order-card">
              <div className="order-header">
                <div>
                  <strong style={{ fontSize: 15 }}>{d.profession_type}</strong>
                  <span style={{ marginLeft: 12, color: '#999', fontSize: 13 }}>
                    需求编号：{d.id}
                  </span>
                </div>
                <span className="tag">预算：¥{d.budget}</span>
              </div>
              <div className="order-body">
                <div>
                  <span className="label">服务地点：</span>
                  {d.location}
                </div>
                <div>
                  <span className="label">期望时间：</span>
                  {d.expected_time}
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <span className="label">备注：</span>
                  {d.remark || '无'}
                </div>
                <div style={{ gridColumn: '1 / -1', color: '#999', fontSize: 12 }}>
                  发布时间：{d.created_at}
                </div>
              </div>
              <div className="order-footer">
                <button className="btn btn-primary" onClick={() => navigate(`/user/demands/${d.id}/match`)}>
                  撮合服务商
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
