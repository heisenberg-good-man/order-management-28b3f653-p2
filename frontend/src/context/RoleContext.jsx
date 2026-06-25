import React, { createContext, useContext, useState } from 'react'

const RoleContext = createContext(null)

export const ROLES = {
  USER: 'user',
  PROVIDER: 'provider',
  ADMIN: 'admin',
}

export const ROLE_LABELS = {
  [ROLES.USER]: '用户端',
  [ROLES.PROVIDER]: '服务商端',
  [ROLES.ADMIN]: '平台管理端',
}

export function RoleProvider({ children }) {
  const [role, setRole] = useState(ROLES.USER)

  return (
    <RoleContext.Provider value={{ role, setRole }}>
      {children}
    </RoleContext.Provider>
  )
}

export function useRole() {
  return useContext(RoleContext)
}
