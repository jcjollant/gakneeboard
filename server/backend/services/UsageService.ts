import { UsageType } from "@gak/shared";
import { UsageDao } from "../dao/UsageDao";

export class UsageService {
    /**
     * Records a limit usage event when a user reaches a quota limit for a specific resource.
     * @param usageType The intended usage type that was blocked (e.g., UsageType.Print)
     * @param userId The ID of the user who hit the limit
     */
    public static async limit(usageType: UsageType, userId: number): Promise<Boolean> {
        return UsageDao.create(UsageType.Limit, userId, JSON.stringify({ resource: usageType }));
    }

    /**
     * Records a usage event when a user accepts a new EULA version.
     * @param version The version of the EULA that was accepted
     * @param userId The ID of the user who accepted it
     */
    public static async eula(version: number, userId: number): Promise<Boolean> {
        const data = { version: version }
        return UsageDao.create(UsageType.Eula, userId, JSON.stringify(data));
    }

    /**
     * Records a usage event when a user exports a template.
     * @param format The format the template was exported to
     * @param userId The ID of the user who exported it
     */
    public static async export(format: string, userId: number): Promise<Boolean> {
        const data = { format: format }
        return UsageDao.create(UsageType.Export, userId, JSON.stringify(data));
    }

    /**
     * Records a usage event when a user starts a session.
     * @param userId The ID of the user
     * @param version The UI version used
     */
    public static async session(userId: number, version: string | undefined): Promise<Boolean> {
        const data = version ? JSON.stringify({ version: version }) : undefined;
        return UsageDao.create(UsageType.Session, userId, data);
    }

    /**
     * Records a usage event when a user prints a template.
     * @param userId The ID of the user
     * @param payload The print options/metadata
     */
    public static async print(userId: number, payload: string): Promise<Boolean> {
        return UsageDao.create(UsageType.Print, userId, payload);
    }

    /**
     * Records a usage event when a user saves a template.
     * @param userId The ID of the user
     * @param templateId The ID of the template (0 if new)
     */
    public static async save(userId: number, templateId: number): Promise<Boolean> {
        const data = templateId ? JSON.stringify({ id: templateId }) : undefined;
        return UsageDao.create(UsageType.Save, userId, data);
    }

    /**
     * Records a usage event when a user restores an old version of a template.
     * @param userId The ID of the user
     * @param templateId The ID of the template
     * @param version The version number restored
     */
    public static async restore(userId: number, templateId: number, version: number): Promise<Boolean> {
        const data = JSON.stringify({ templateId: templateId, version: version });
        return UsageDao.create(UsageType.Restore, userId, data);
    }
}
