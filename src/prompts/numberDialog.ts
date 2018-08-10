import { IntentRecognizer, IntentDialog, Session, Message, ResumeReason, SuggestedActions, CardAction } from 'botbuilder';

export class NumberDialog extends IntentDialog {
    constructor(recognizer: IntentRecognizer) {
        super({ recognizers: [recognizer] });
        this.onBegin(this.onBeginDialog)
            .matches('Command.Cancel', this.onCancel)
            .onDefault(this.onAnythingElse);
    }

    private onBeginDialog = (session: Session, question: string) => {
        session.send(new Message(session)
            .text(question)
            .suggestedActions(this.getSuggestedActions(session)));
    }

    private onCancel = (session: Session) => {
        session.endDialogWithResult( { resumed: ResumeReason.canceled });
    }

    private onAnythingElse = (session: Session) => {
        const number = parseInt(session.message.text);
        if (!isNaN(number)) {
            session.endDialogWithResult({ response: number });
        } else {
            session.send(new Message(session)
            .text(`Sorry, '${session.message.text}' is not a valid number. Please, enter a valid number`)
            .suggestedActions(this.getSuggestedActions(session)));
        }
    }

    private getSuggestedActions = (session: Session) => {
        return SuggestedActions.create(session, [CardAction.imBack(session, 'Cancel', 'Cancel')]);
    }
}