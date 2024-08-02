export const toastSuccess = 'success'
export const toastError = 'error'
export const toastWarning = 'warn'

export function getToastData(summary,detail,severity=toastSuccess,life=3000) {
    return { severity: severity, summary: summary, detail: detail, life: life}
}

