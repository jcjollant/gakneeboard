import { ToastServiceMethods } from "primevue/toastservice";

export class Toaster {
    private toast:ToastServiceMethods;

    constructor(toast:ToastServiceMethods) {
        this.toast = toast
    }

    info(title:string, message:string) {
        this.toast.add({ severity: 'info', summary: title, detail: message, life: 3000 });
    }
}