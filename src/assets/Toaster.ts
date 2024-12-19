import { ToastServiceMethods } from "primevue/toastservice";

export class Toaster {
    private toast:ToastServiceMethods;

    constructor(toast:ToastServiceMethods) {
        this.toast = toast
    }

    error(title:string, message:string) {
        this.toast.add({ severity: 'error', summary: title, detail: message, life: 3000 });
    }

    info(title:string, message:string) {
        this.toast.add({ severity: 'info', summary: title, detail: message, life: 3000 });
    }

    success(title:string, message:string) {
        this.toast.add({ severity: 'success', summary: title, detail: message, life: 3000 });
    }

    warning(title:string, message:string) {
        this.toast.add({ severity: 'warn', summary: title, detail: message, life: 3000 });
    }

}