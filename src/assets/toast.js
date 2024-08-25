export const toastError = 'error'
export const toastInfo = 'info'
export const toastSuccess = 'success'
export const toastWarning = 'warn'

export function getToastData(summary,detail,severity=toastSuccess,life=3000) {
    return { severity: severity, summary: summary, detail: detail, life: life}
}

export function getToastError(summary,detail,life=3000) {
    return { severity: toastSevError, summary: summary, detail: detail, life: life}
}

export function emitToast(emits, title,message, life=3000) {
    emits('toast', getToastData(title, message, toastSuccess, life))
}

export function emitToastError(emits, title,message,life=3000) {
    emits('toast', getToastData(title, message, toastError, life))
}
