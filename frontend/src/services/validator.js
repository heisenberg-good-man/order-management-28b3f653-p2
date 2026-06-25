import { store } from '../store/localStore'
import { AUTH_STATUS, ORDER_STATUS } from '../store/localStore'

export function validateProvider(data) {
  const errors = {}
  if (!data?.name?.trim()) errors.name = '请填写姓名'
  if (!data?.profession_type) errors.profession_type = '请选择职业类型'
  if (!data?.service_area?.trim()) errors.service_area = '请填写服务区域'
  if (data?.price_range && !/^\d+-\d+$/.test(String(data.price_range).trim()))
    errors.price_range = '报价范围格式不正确，例如：100-500'
  return errors
}

export function validateAuth(data) {
  const errors = {}
  if (!data?.real_name?.trim()) errors.real_name = '请填写真实姓名'
  if (!/^\d{17}[\dXx]$/.test(String(data?.id_card_number || '').trim()))
    errors.id_card_number = '身份证号格式不正确'
  if (!data?.id_card_front) errors.id_card_front = '请上传身份证正面照'
  if (!data?.id_card_back) errors.id_card_back = '请上传身份证反面照'
  return errors
}

export function validateDemand(data) {
  const errors = {}
  if (!data?.profession_type) errors.profession_type = '请选择职业类型'
  if (!data?.location?.trim()) errors.location = '请填写服务地点'
  const budget = Number(data?.budget)
  if (data?.budget === '' || data?.budget == null) errors.budget = '请填写预算'
  else if (isNaN(budget) || budget <= 0) errors.budget = '预算必须大于 0'
  if (!data?.expected_time) errors.expected_time = '请选择期望服务时间'
  return errors
}

export function validateCancel(data) {
  const errors = {}
  if (!data?.cancel_reason?.trim()) errors.cancel_reason = '请填写取消原因'
  return errors
}

export function validateExceptionRemark(data) {
  const errors = {}
  if (!data?.remark?.trim()) errors.remark = '请填写异常处理备注'
  return errors
}

export { store, AUTH_STATUS, ORDER_STATUS }
