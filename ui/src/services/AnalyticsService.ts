export class AnalyticsService {
    static event(name: string, params?: Record<string, any>) {
        if (typeof window !== 'undefined' && (window as any).gtag) {
            (window as any).gtag('event', name, params);
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

    static print(template: any, method: 'print' | 'pdf' | 'laminate') {
        this.event('print_intent', {
            method: method,
            template_id: template.id,
            template_name: template.name,
            template_format: template.format
        });
    }
}
