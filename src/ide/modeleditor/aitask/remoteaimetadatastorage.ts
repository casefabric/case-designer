import IDE from '../../ide';
import $ajax, { AjaxError } from '../../util/ajax';
import Agent from './agent';
import { agents } from './resources/agents_fallback';

export default class RemoteAIMetadataStorage {
    storageUrl: string;

    constructor(private ide:IDE, engineUrl: string) {
        this.storageUrl = `${engineUrl}/ai`;
    }

    async getAgents(): Promise<Agent[]> {
        const url = `${this.storageUrl}/agents`;
        const type = 'get';
        console.log('Loading ' + url);

        try {
            const response = await $ajax({ type, url });
            return response.data;
        }
        catch (error: AjaxError | any) {
            if (error.xhr) {
                this.ide.warning("AI agents could not be loaded from the server, falling back to predefined agents: " + error.message);    
                return agents;
            } else {
               throw error;
            } 
        }
    }

}
