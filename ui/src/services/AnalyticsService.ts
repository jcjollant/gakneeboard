export class AnalyticsService {
    static event(name: string, params?: Record<string, any>) {
        if (typeof window !== 'undefined') {
            const dataLayer = (window as any).dataLayer = (window as any).dataLayer || [];
            dataLayer.push({
                event: name,
                ...params
            });
        }
    }

    static purchase(sessionData: any, items: any[]) {
        this.event('purchase', {
            transaction_id: sessionData.id,
            value: sessionData.amount_total / 100,
            currency: sessionData.currency || 'USD',
            items: items
        });
    }

    static print(template: any, method?: 'print' | 'pdf' | 'laminate') {
        this.event('print_intent', {
            method: method || 'unknown',
            template_id: template.id,
            template_name: template.name,
            template_format: template.format
        });
    }

    static saveIntent(template: any) {
        this.event('save_intent', {
            template_id: template.id,
            template_name: template.name,
            template_format: template.format
        });
    }

    static viewSignIn() {
        this.event('view_sign_in');
    }

    static signUp(method: string, sourceSelection?: string) {
        const payload: Record<string, any> = { method };
        if (sourceSelection) {
            payload.source = sourceSelection;
        }
        this.event('sign_up', payload);
    }

    static login(method: string) {
        this.event('login', { method });
    }

    static authError(method: string, error: string) {
        this.event('auth_error', { method, error });
    }
}
