// Based on LuisRecognizer.ts https://github.com/Microsoft/BotBuilder/blob/master/Node/core/src/dialogs/LuisRecognizer.ts
import { IntentRecognizer, IRecognizeContext, IIntentRecognizerResult, IIntent, IEntity, Message } from 'botbuilder';
import { AssistantV1 } from 'watson-developer-cloud';
import { MessageResponse } from '../node_modules/watson-developer-cloud/assistant/v1';

export interface WatsonAssistantRecognizerConfig {
    username: string;
    password: string;
    workspace_id: string;
    workspace_version: string;
}

// https://console.bluemix.net/docs/services/conversation/develop-app.html#building-a-client-application
export class WatsonAssistantRecognizer extends IntentRecognizer {
    private assistant: AssistantV1;
    private workspaceId: string;

    constructor(config: WatsonAssistantRecognizerConfig) {
        super();

        this.assistant = new AssistantV1({
            username: config.username,
            password: config.password,
            version: config.workspace_version
        });
        this.workspaceId = config.workspace_id;
    }

    public onRecognize(context: IRecognizeContext, callback: (err: Error, result: IIntentRecognizerResult) => void): void {
        const result: IIntentRecognizerResult = { score: 0.0, intent: null };
        if (context && context.message && context.message.text) {
            this.assistant.message({
                workspace_id: this.workspaceId,
                input: { text: context.message.text }
            }, (err: any, response: MessageResponse) => {
                if (err) {
                    callback(err, null);
                } else {
                    if (response.intents.length > 0) {
                        result.intent = response.intents[0].intent;
                        result.score = response.intents[0].confidence;
                    }
                    result.intents = response.intents.map(i => ({intent: i.intent, score: i.confidence}));
                    result.entities = response.entities.map(e => ({type: e.entity, entity: e.value, score: e.confidence, startIndex: e.location[0], endIndex: e.location[1], metadata: e.metadata}));
                    callback(null, result);
                }
            });
        } else {
            callback(null, result);
        }
    }
}