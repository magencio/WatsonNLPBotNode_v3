import { Session } from "botbuilder";

export function onMessageReceived (session: Session, next: any) {
    console.log(session.message.text);
    next();
}

export function onMessageSent (event: any, next: any) {
    console.log(event.text);
    next();
}