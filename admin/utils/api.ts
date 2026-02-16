import axios, { type AxiosResponse } from 'axios';

// Simple wrapper for axios to replace CurrentUser functionality
// Since we don't have user state in admin (managed by Supabase or unused), we just pass calls through.
// If we need to inject headers globally later, we can do it here.

export const api = {
    get: async (url: string, config: any = {}): Promise<AxiosResponse<any, any>> => {
        return axios.get(url, config);
    },

    post: async (url: string, data: any = {}, config: any = {}): Promise<AxiosResponse<any, any>> => {
        return axios.post(url, data, config);
    }
};
