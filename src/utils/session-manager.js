/**
 * 会话管理工具
 * 处理会话超时、自动延长会话等功能
 */

import { MessageBox } from 'element-ui'
import router from '@/router'
import store from '@/store'

// 默认会话设置
const DEFAULT_SESSION_TIMEOUT = 12 * 60 * 60 * 1000 // 12小时
const INACTIVITY_TIMEOUT = 30 * 60 * 1000 // 30分钟不活动自动登出
const ACTIVITY_EVENTS = ['click', 'mousemove', 'keydown', 'scroll', 'touchstart'] // 检测的用户活动事件
const WARNING_BEFORE_TIMEOUT = 5 * 60 * 1000 // 超时前5分钟警告

let inactivityTimer = null
let warningTimer = null
let isLoggingOut = false;

/**
 * 初始化会话管理
 */
export function initSessionManager() {
    // 添加用户活动事件监听
    ACTIVITY_EVENTS.forEach(event => {
        window.addEventListener(event, resetInactivityTimer)
    })
    
    // 初始化计时器
    resetInactivityTimer()
}

/**
 * 重置不活动计时器
 */
function resetInactivityTimer() {
    // 清除现有计时器
    if (inactivityTimer) {
        clearTimeout(inactivityTimer)
    }
    if (warningTimer) {
        clearTimeout(warningTimer)
    }
    
    // 更新最后活动时间
    localStorage.setItem('lastActivity', new Date().getTime())
    
    // 设置警告计时器
    warningTimer = setTimeout(() => {
        showTimeoutWarning()
    }, INACTIVITY_TIMEOUT - WARNING_BEFORE_TIMEOUT)
    
    // 设置超时计时器
    inactivityTimer = setTimeout(() => {
        handleSessionTimeout()
    }, INACTIVITY_TIMEOUT)
}

/**
 * 显示即将超时警告
 */
function showTimeoutWarning() {
    const remainingMinutes = Math.ceil(WARNING_BEFORE_TIMEOUT / 60000)
    
    MessageBox.confirm(
        `由于长时间未操作，您的会话将在${remainingMinutes}分钟后自动结束。是否继续操作？`,
        '会话即将超时',
        {
            confirmButtonText: '继续操作',
            cancelButtonText: '退出登录',
            type: 'warning'
        }
    ).then(() => {
        // 用户选择继续，重置计时器
        resetInactivityTimer()
    }).catch(() => {
        // 用户选择退出，注销
        logout()
    })
}

/**
 * 处理会话超时
 */
function handleSessionTimeout() {
    MessageBox.alert('由于长时间未操作，您已自动退出登录', '会话超时', {
        confirmButtonText: '确定',
        callback: () => {
            logout()
        }
    })
}

/**
 * 检查会话是否过期
 * @returns {boolean} 是否已过期
 */
export function isSessionExpired() {
    const loginTime = localStorage.getItem('loginTime')
    if (!loginTime) return true
    
    const currentTime = new Date().getTime()
    const sessionTimeout = localStorage.getItem('sessionTimeout') || DEFAULT_SESSION_TIMEOUT
    
    return (currentTime - parseInt(loginTime)) > parseInt(sessionTimeout)
}

/**
 * 延长会话时间
 */
export function extendSession() {
    localStorage.setItem('loginTime', new Date().getTime().toString())
}

/**
 * 设置会话超时时间
 * @param {number} timeout 超时时间（毫秒）
 */
export function setSessionTimeout(timeout) {
    localStorage.setItem('sessionTimeout', timeout.toString())
}

/**
 * 登出系统
 */
export function logout() {
    // 防止重复登出
    if (isLoggingOut) {
        return;
    }
    isLoggingOut = true;

    // 清除用户状态
    store.dispatch('common/commitUserInfo', {})
    store.dispatch('common/commitDbName', '')
    
    // 清除相关localStorage项，但保留记住的用户名和密码
    const keysToKeep = ['username', 'password', 'rememberPassword', 'autoLogin']
    const keysToRemove = []
    
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (!keysToKeep.includes(key)) {
            keysToRemove.push(key)
        }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key))
    
    // 清除计时器
    if (inactivityTimer) {
        clearTimeout(inactivityTimer)
        inactivityTimer = null
    }
    if (warningTimer) {
        clearTimeout(warningTimer)
        warningTimer = null
    }
    
    // 重定向到登录页
    router.push('/login').catch(() => {
        // 忽略重复导航错误
        isLoggingOut = false;
    });
}

/**
 * 销毁会话管理器
 * 在应用卸载时调用
 */
export function destroySessionManager() {
    // 移除事件监听
    ACTIVITY_EVENTS.forEach(event => {
        window.removeEventListener(event, resetInactivityTimer)
    })
    
    // 清除计时器
    if (inactivityTimer) {
        clearTimeout(inactivityTimer)
        inactivityTimer = null
    }
    if (warningTimer) {
        clearTimeout(warningTimer)
        warningTimer = null
    }
} 