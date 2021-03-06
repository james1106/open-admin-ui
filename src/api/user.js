import request from '@/libs/request'

/**
 * 用户登录
 * @param username
 * @param password
 */
export const login = ({username, password}) => {
  const data = {
    username,
    password
  }
  return request({
    url: 'admin/login/token',
    data,
    method: 'post'
  })
}

/**
 * 登出
 */
export const logout = () => {
  return request({
    url: 'logout',
    method: 'get'
  })
}

/**
 * 获取用户信息
 */
export const getUserInfo = () => {
  return request({
    url: 'auth/user/me',
    method: 'get'
  })
}

/**
 * 获取用户列表
 * @param page
 * @param limit
 */
export const getUsers = ({page, limit}) => {
  const data = {page: page, limit: limit}
  return request({
    url: 'base/user',
    data,
    method: 'post'
  })
}

/**
 * 获取登录用户菜单权限
 */
export const getMyMenuAuthority = () => {
  return request({
    url: 'base/authority/granted/me/menu',
    method: 'get'
  })
}

/**
 * 获取所有用户列表
 */
export const getAllUsers = () => {
  return request({
    url: 'base/user/all',
    method: 'post'
  })
}

/**
 * 添加用户信息
 * @param userName
 * @param password
 * @param nickName
 * @param status
 * @param userType
 * @param email
 * @param mobile
 * @param userDesc
 * @param avatar
 */
export const addUser = ({userName, password, nickName, status, userType, email, mobile, userDesc, avatar}) => {
  const data = {
    userName:userName,
    nickName: nickName,
    password:password,
    status: status,
    userType: userType,
    email: email,
    mobile: mobile,
    userDesc: userDesc,
    avatar: avatar
  }
  return request({
    url: 'base/user/add',
    data,
    method: 'post'
  })
}

/**
 * 更新用户信息
 * @param userId
 * @param nickName
 * @param status
 * @param userType
 * @param email
 * @param mobile
 * @param userDesc
 * @param avatar
 */
export const updateUser = ({userId, nickName, status, userType, email, mobile, userDesc, avatar}) => {
  const data = {
    userId: userId,
    nickName: nickName,
    status: status,
    userType: userType,
    email: email,
    mobile: mobile,
    userDesc: userDesc,
    avatar: avatar
  }
  return request({
    url: 'base/user/update',
    data,
    method: 'post'
  })
}

/**
 * 分配用户角色
 * @param data
 */
export const addUserRoles = ({userId, grantRoles}) => {
  const data = {userId: userId, roleIds: grantRoles.join(',')}
  return request({
    url: 'base/user/roles/add',
    data,
    method: 'post'
  })
}

/**
 * 获取用户角色
 * @param userId
 */
export const getUserRoles = (userId) => {
  const data = {
    userId: userId
  }
  return request({
    url: 'base/user/roles',
    data,
    method: 'post'
  })
}
