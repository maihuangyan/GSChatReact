import { Subject } from "rxjs";

const subject = new Subject();

export const messageService = {
  sendMessage: (message, data=null) => subject.next({ text: message, data }),
  getMessage: () => subject.asObservable(),
};

