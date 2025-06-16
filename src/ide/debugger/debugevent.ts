
export type DebugEvent = {
    nr: number;
    offset: number;
    type: string;
    localNr: number;
    filterIndex?: number;
    content: {
        modelEvent: {
            actorId: string;
            tenant: string;
            timestamp: string;
            user: {
                userId: string;
                origin: string;
                tenantRoles: string[];
                groups: string[];
            }
        };
        planItemId: string;
        stageId: string;
        path: string;
        type: string;
        historyState: string;
        transition: string;
        currentState: string;
        parentActorId: string | undefined;
        value: string | undefined;
        lastModified: any;
        flowId: string;
        team: string;
        planitem: {
            index: string;
        };
        name: string;
        definition: {
            source: string
        };
        taskId: string;
        messages: {
            type: string;
        }[];
    };
}
