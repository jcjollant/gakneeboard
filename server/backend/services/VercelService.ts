import axios from 'axios';

export class VercelService {
    private static readonly API_URL = 'https://api.vercel.com';

    private static get PROJECT_ID() { return process.env.VERCEL_PROJECT_ID; }
    private static get TEAM_ID() { return process.env.VERCEL_TEAM_ID; }

    private static get headers() {
        return {
            'Authorization': `Bearer ${process.env.VERCEL_TOKEN}`,
            'Content-Type': 'application/json'
        };
    }

    /**
     * Update or create an environment variable for the project
     * @param key Variable name
     * @param value Variable value
     * @returns 
     */
    public static async setEnvVar(key: string, value: string): Promise<void> {
        console.log(`[VercelService.setEnvVar] Updating ${key}`);

        // 1. Find the env var ID
        const listResponse = await axios.get(`${this.API_URL}/v9/projects/${this.PROJECT_ID}/env?teamId=${this.TEAM_ID}`, {
            headers: this.headers
        });

        const envVars = listResponse.data.envs;
        const existing = envVars.find((e: any) => e.key === key);

        if (existing) {
            // 2. Update existing
            console.log(`[VercelService.setEnvVar] Existing env ${key} found with id ${existing.id}. Updating...`);
            await axios.patch(`${this.API_URL}/v9/projects/${this.PROJECT_ID}/env/${existing.id}?teamId=${this.TEAM_ID}`, {
                value: value,
                target: ['production', 'preview', 'development']
            }, {
                headers: this.headers
            });
        } else {
            // 3. Create new
            console.log(`[VercelService.setEnvVar] Creating new env ${key}`);
            await axios.post(`${this.API_URL}/v10/projects/${this.PROJECT_ID}/env?teamId=${this.TEAM_ID}`, {
                key: key,
                value: value,
                type: 'plain',
                target: ['production', 'preview', 'development']
            }, {
                headers: this.headers
            });
        }
    }

    /**
     * Trigger a new deployment for the project (redeploys the latest commit on the main branch)
     */
    public static async triggerRedeploy(): Promise<void> {
        console.log(`[VercelService.triggerRedeploy] Triggering new deployment`);

        await axios.post(`${this.API_URL}/v13/deployments?teamId=${this.TEAM_ID}`, {
            name: 'gak-server',
            gitSource: {
                type: 'github',
                repoId: 247065963, // I should verify this or use another way if possible
                ref: 'main'
            }
        }, {
            headers: this.headers
        });
    }
}
