import React, { useState } from 'react'
import { useToast } from '../context/ToastContext'

export default function CancelOrderModal({ visible, onClose, onConfirm }) {
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const toast = useToast()

  if (!visible) return null

  const handleSubmit = async () => {
    if (!reason.trim()) {
      setError('请填写取消原因')
      return
    }
    setError('')
    setLoading(true)
    const result = await onConfirm(reason.trim())
    setLoading(false)
    if (result) {
      setReason('')
      onClose()
    }
  }

  const handleClose = () => {
    setReason('')
    setError('')
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">取消订单</div>
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">
              <span className="required">*</span>取消原因
            </label>
            <textarea
              className={`form-textarea ${error ? 'error' : ''}`}
              placeholder="请输入取消订单的原因..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
            />
            {error && <div className="form-error">{error}</div>}
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-default" onClick={handleClose} disabled={loading}>
            取消
          </button>
          <button className="btn btn-danger" onClick={handleSubmit} disabled={loading}>
            {loading ? '提交中...' : '确认取消'}
          </button>
        </div>
      </div>
    </div>
  )
}
