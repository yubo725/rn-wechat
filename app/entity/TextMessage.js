import Message from './Message';

export default class TextMessage extends Message {
  constructor(message) {
    super(message.id, message.from, message.to, message.time);
    this.content = message.content;
  }
}
