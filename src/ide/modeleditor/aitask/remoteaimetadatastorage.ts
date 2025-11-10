import IDE from '../../ide';
import $ajax, { AjaxError } from '../../util/ajax';
import Agent from './agent';
import { agents } from './resources/agents_fallback';
import { types } from './resources/types_fallback';
import Type from './type';

export default class RemoteAIMetadataStorage {
    storageUrl: string;

    constructor(private ide: IDE, engineUrl: string) {
        this.storageUrl = `${engineUrl}/ai`;
    }

    async getAgents(): Promise<Agent[]> {
        const url = `${this.storageUrl}/agents`;
        const type = 'get';
        console.log('Loading ' + url);

        try {
            const response = await $ajax({ type, url, timeout: 1_000 });
            return response.data;
        }
        catch (error: AjaxError | any) {
            if (error.xhr) {
                console.warn("AI agent metadata (agents) could not be loaded from the server, falling back to predefined agents: " + error.message);
                return agents;
            } else {
                throw error;
            }
        }
    }

    async getTypes(): Promise<Type[]> {
        const url = `${this.storageUrl}/types`;
        const type = 'get';
        console.log('Loading ' + url);

        try {
            const response = await $ajax({ type, url, timeout: 1_000 });
            return (response.data as Type[][]).flat();
        }
        catch (error: AjaxError | any) {
            if (error.xhr) {
                console.warn("AI agent metadata (types) could not be loaded from the server, falling back to predefined types: " + error.message);
                return types.flat();
            } else {
                throw error;
            }
        }
    }
}
