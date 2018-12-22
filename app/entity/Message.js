
export default class Message {
  constructor(id, from, to, time) {
    this.id = id;
    this.from = from;
    this.to = to;
    this.time = time;
  }
}


/***
文本消息id from to data time

图片消息id from to path time

消息表：
CREATE TABLE IF NOT EXISTS message(
  id INTEGER PRIMARY KEY,
  from VARCHAR,
  to VARCHAR,
  content TEXT,
  img VARCHAR,
  type VARCHAR,
  time INTEGER
)
id from to content img type time


**/
