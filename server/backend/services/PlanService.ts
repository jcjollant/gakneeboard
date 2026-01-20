import { PlanDescription, PLANS } from "@checklist/shared";

export class PlanService {
    public static getPlan(id: string): PlanDescription | undefined {
        return PLANS.find(p => p.id === id)
    }
    public static getPlanByPriceId(priceId: string): PlanDescription | undefined {
        return PLANS.find(p => process.env[p.priceEnvironmentVariable] === priceId)
    }
}