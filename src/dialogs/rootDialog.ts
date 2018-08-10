import { Session, IntentRecognizer, IntentDialog, IDialogWaterfallStep, IIntentRecognizerResult, IDialogResult, Prompts, ResumeReason, EntityRecognizer } from 'botbuilder';
import { BotFrameworkInstrumentation } from 'botbuilder-instrumentation';

export class RootDialog extends IntentDialog {
    private instrumentation: BotFrameworkInstrumentation;

    constructor(recognizer: IntentRecognizer, instrumentation: BotFrameworkInstrumentation) {
        super({ recognizers: [recognizer] });
        this.instrumentation = instrumentation;
        this.matches('Education.Hi', this.onHi)
            .matches('Education.Thx', this.onThx)
            .matches('Education.Bye', this.onBye)
            .matches('Send', this.onSend)
            .onDefault(this.onUnknown);
    }

    private onHi = (session: Session) => {
        session.send("Hi there! What can I do for you today?");
    }

    private onThx = (session: Session) => {
        session.send('You are welcome');
    }

    private onBye: IDialogWaterfallStep[] = [
        (session: Session) => {
            session.beginDialog('prompt.confirmation', 'Before you leave, did I help you?');
        },
        (session: Session, results: IDialogResult<boolean>) => {
            if (results.resumed === ResumeReason.completed) {
                if (results.response) {
                    session.send('Great to hear that!');
                } else {
                    Prompts.text(session, "Sorry to hear that. Please, tell me how I can improve");
                }
            } else {
                session.send('Sure thing');
            }
        },
        (session: Session, results: IDialogResult<boolean>) => {
            this.instrumentation.trackGoalTriggeredEvent('Feedback', { text: results.response }, session);
            session.send('Feedback noted');
        }
    ];

    private onSend = (session: Session, recognizerResult: IIntentRecognizerResult) => {
        const personEntity = EntityRecognizer.findEntity(recognizerResult.entities, 'sys-person');
        const person = personEntity && personEntity.entity;
        const dateEntity = EntityRecognizer.findEntity(recognizerResult.entities, 'sys-date');
        const date = dateEntity && dateEntity.entity;
        const objectEntity = EntityRecognizer.findEntity(recognizerResult.entities, 'Object');
        const object = objectEntity && objectEntity.entity;
        session.send(`You want me to send '${object}' to '${person}' on '${date}'`);
    }

    private onUnknown = (session: Session, recognizerResult: IIntentRecognizerResult) => {
        this.instrumentation.trackCustomEvent('MBFEvent.CustomEvent.Unknown', { text: session.message.text, recognizerResult: recognizerResult }, session);
        session.send("Sorry, I didn't get that. I'm still learning!");
    }
}