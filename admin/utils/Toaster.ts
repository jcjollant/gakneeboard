import type { ToastServiceMethods } from "primevue/toastservice";

export const useToaster = (toast: ToastServiceMethods) => {
    return new Toaster(toast);
}

export class Toaster {
    private toast: ToastServiceMethods;

    constructor(toast: ToastServiceMethods) {
        this.toast = toast
    }

    error(title: string, message: string, life: number = 3000) {
        this.toast.add({ severity: 'error', summary: title, detail: message, life: life });
    }

    info(title: string, message: string, life: number = 3000) {
        this.toast.add({ severity: 'info', summary: title, detail: message, life: life });
    }

    success(title: string, message: string, life: number = 3000) {
        this.toast.add({ severity: 'success', summary: title, detail: message, life: life });
    }

    warning(title: string, message: string, life: number = 3000) {
        this.toast.add({ severity: 'warn', summary: title, detail: message, life: life });
    }

}