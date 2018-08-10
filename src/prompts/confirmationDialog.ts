import { IntentRecognizer, IntentDialog, Session, Message, ResumeReason, SuggestedActions, CardAction } from 'botbuilder';

export class ConfirmationDialog extends IntentDialog {

    constructor(recognizer: IntentRecognizer) {
        super({ recognizers: [recognizer] });
        this.onBegin(this.onBeginDialog)
            .matches('Confirmation.Yes', this.onYes)
            .matches('Confirmation.No', this.onNo)
            .matches('Command.Cancel', this.onCancel)
            .onDefault(this.onUnknown);
    }

    private onBeginDialog = (session: Session, question: string) => {
        session.send(new Message(session)
            .text(question)
            .suggestedActions(this.getSuggestedActions(session)));
    }

    private onUnknown = (session: Session) => {
        session.send(new Message(session)
            .text(`Sorry, I didn't understand '${session.message.text}'. Please, just answer the question`)
            .suggestedActions(this.getSuggestedActions(session)));
    }

    private onYes = (session: Session) => {
        session.endDialogWithResult({ response: true });
    }

    private onNo = (session: Session) => {
        session.endDialogWithResult({ response: false });
    }

    private onCancel = (session: Session) => {
        session.endDialogWithResult({ resumed: ResumeReason.canceled });
    }

    private getSuggestedActions = (session: Session) => {
        return SuggestedActions.create(session, [
            CardAction.imBack(session, 'Yes', 'Yes'),
            CardAction.imBack(session, 'No', 'No'),
            CardAction.imBack(session, 'Cancel', 'Cancel')]);
    }
}