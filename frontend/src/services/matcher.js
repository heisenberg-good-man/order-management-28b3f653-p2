import { AUTH_STATUS } from '../store/localStore'

export function matchProviders(demand, providers) {
  if (!demand || !providers) return []
  const list = []
  providers.forEach(provider => {
    let score = 0
    const reasons = []
    if (provider.profession_type === demand.profession_type) { score += 40; reasons.push('职业类型匹配') }
    const areas = (provider.service_area || '').split(/[,，]/).map(s => s.trim()).filter(Boolean)
    const areaMatch = areas.some(a => (demand.location || '').includes(a)) || areas.includes('全市')
    if (areaMatch) { score += 25; reasons.push('服务区域覆盖') }
    if (provider.auth?.status === AUTH_STATUS.APPROVED) { score += 20; reasons.push('已实名认证') }
    else if (provider.auth?.status === AUTH_STATUS.PENDING) { score += 5; reasons.push('认证审核中') }
    if (provider.price_range) {
      const parts = String(provider.price_range).split('-')
      if (parts.length === 2) {
        const low = parseInt(parts[0], 10), high = parseInt(parts[1], 10)
        const budget = Number(demand.budget)
        if (!isNaN(low) && !isNaN(high) && !isNaN(budget)) {
          if (budget >= low && budget <= high) { score += 15; reasons.push('预算在报价范围内') }
          else if (budget > high) { score += 8; reasons.push('预算高于报价') }
        }
      }
    }
    if (score > 0) list.push({ provider, score, match_reasons: reasons })
  })
  list.sort((a, b) => b.score - a.score)
  return list
}
