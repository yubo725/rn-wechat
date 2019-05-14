import SQLiteStorage from "react-native-sqlite-storage";
import LogUtil from "./LogUtil";
import CountEmitter from "../event/CountEmitter";

var DB_NAME;
const DB_VERSION = "1.0";
var DB_DISPLAY_NAME;
const DB_SIZE = -1;

const NOTIFY_MSG_TABLE_NAME = "NOTIFY_MSG";

var db;

const CEHCK_TABLE_SQL = "select * from " + NOTIFY_MSG_TABLE_NAME;

// 创建通知消息表 |id|消息类型type['invite_received','invite_accepted','invite_declined','contact_deleted']|消息内容|from|from_avatar|时间|是否已读
// 不要使用create table if not exists
const CREATE_NOTIFY_MSG_TABLE_SQL =
  "CREATE TABLE " +
  NOTIFY_MSG_TABLE_NAME +
  "(" +
  "id INTEGER PRIMARY KEY AUTOINCREMENT," +
  "msg_type," +
  "msg_content," +
  "from_user," +
  "from_avatar," +
  "time," +
  "has_read);";

// 数据库工具类
export default class DBHelper {
  static init(username) {
    // 不同用户用不同的数据库
    DB_NAME = `rnwechat-${username}.db`;
    DB_DISPLAY_NAME = `RNWECHAT-${username}-DB`;
    // LogUtil.w(`DB_NAME = ${DB_NAME}, DB_DISPLAY_NAME = ${DB_DISPLAY_NAME}`);
    DBHelper.createTable();
    // DBHelper.queryData();
  }

  static open() {
    db = SQLiteStorage.openDatabase(
      DB_NAME,
      DB_VERSION,
      DB_DISPLAY_NAME,
      DB_SIZE,
      () => {
        // LogUtil.d("open db success");
      },
      error => {
        LogUtil.e("open db fail: " + error);
      }
    );
    return db;
  }

  // 创建表前检查表是否存在
  // static createTableCheck() {
  //   if (!db) {
  //     DBHelper.open();
  //   }
  //   db.transaction(
  //     tx => {
  //       tx.executeSql(CEHCK_TABLE_SQL, [], (tx, result) => {
  //           LogUtil.d('execute sql success: ' + JSON.stringify(result));
  //           if (result && result.rows) {
  //             let len = result.rows.length;
  //             if (len == 0) {
  //               this.createTable();
  //             }
  //           }
  //       }, (error) => {
  //           LogUtil.d('execute sql fail: ' + error)
  //       });
  //     },
  //     result => {
  //       LogUtil.d("transaction success: " + result);
  //     },
  //     error => {
  //       LogUtil.d("transaction fail: " + error);
  //     }
  //   );
  // }

  // 创建表
  static createTable() {
    if (!db) {
      DBHelper.open();
    }
    db.transaction(
      tx => {
        tx.executeSql(CREATE_NOTIFY_MSG_TABLE_SQL, [], (tx, result) => {
          // LogUtil.d('create table success: ' + JSON.stringify(result));
        }, (error) => {
          LogUtil.d('create table fail: ' + error.message);
        });
      }
    );
  }

  // type：'invite_received' / 'invite_accepted' / 'invite_declined' / 'contact_deleted'
  static insertAddFriendMsg(fromUsername, reason, type) {
    if (type == 'contact_deleted') {
      CountEmitter.emit("refreshFriendList");
      return;
    }
    let sql = `insert into ${NOTIFY_MSG_TABLE_NAME} (msg_type, msg_content, from_user, from_avatar, time, has_read) values('${type}', '${reason}', '${fromUsername}', 'null', 'null', 0)`;
    if (!db) {
      db = DBHelper.open();
    }
    db.transaction(
      tx => {
        tx.executeSql(sql, [], (tx, result) => {
          // LogUtil.d('insert data success');
        }, (error) => {
          LogUtil.d('insert data fail: ' + JSON.stringify(error));
        });
      }
    )
  }

  // 设置所有好友消息已读
  static setAllFriendMsgRead() {
    let sql = 'update ' + NOTIFY_MSG_TABLE_NAME + ' set has_read=1 where has_read=0';
    // LogUtil.w(sql);
    if (!db) {
      db = DBHelper.open();
    }
    db.transaction(
      tx => {
        tx.executeSql(sql, [], (tx, result) => {
          // LogUtil.w('update success');
        }, (error) => {
          LogUtil.d('update fail: ' + JSON.stringify(error));
        });
      }
    )
  }

  static getUnreadFriendMsgCount(callback) {
    let sql = 'select count(*) as size from ' + NOTIFY_MSG_TABLE_NAME + ' where has_read=0';
    if (!db) {
      db = DBHelper.open();
    }
    db.transaction(
      tx => {
        tx.executeSql(sql, [], (tx, result) => {
          // LogUtil.d('getUnreadFriendMsgCount success: count = ' + result.rows.item(0));
          if (callback) {
            callback(result.rows.item(0).size);
          }
        }, (error) => {
          LogUtil.d('getUnreadFriendMsgCount fail: ' + JSON.stringify(error));
        });
      }
    )
  }

  static updateFriendMsg(msgId, type, callback) {
    let sql = `update ${NOTIFY_MSG_TABLE_NAME} set msg_type='${type}' where id='${msgId}'`;
    if (!db) {
      db = DBHelper.open();
    }
    db.transaction(
      tx => {
        tx.executeSql(sql, [], (tx, result) => {
          // LogUtil.d('updateFriendMsg success: count = ' + result.rows.item(0));
          if (callback) {
            callback(true);
          }
        }, (error) => {
          LogUtil.d('updateFriendMsg fail: ' + JSON.stringify(error));
          if (callback) {
            callback(false);
          }
        });
      }
    )
  }

  static getAddFriendMsgs(callback) {
    let sql = 'select * from ' + NOTIFY_MSG_TABLE_NAME + ' order by id desc';
    if (!db) {
      db = DBHelper.open();
    }
    db.transaction(
      tx => {
        tx.executeSql(sql, [], (tx, result) => {
          // LogUtil.d('query data success: ' + JSON.stringify(result));
          if (result && result.rows) {
            let len = result.rows.length;
            if (len) {
              arr = []
              for (let i = 0; i < len; i++) {
                arr.push(result.rows.item(i));
              }
              if (callback) {
                callback(arr);
              }
            }
          }
        }, (error) => {
          LogUtil.d('query data fail: ' + JSON.stringify(error));
        });
      }
    )
  }

  static insertData() {
    let msgType = 'reply';
    let msgContent = 'hello world';
    let fromUser = 'oppo';
    let fromAvatar = '/data/user/0/com.rnwechat/files/images/small-avatar/51C0AF9E08C70449141FBF8AF26DAC20';
    let time = 123012301;
    let hasRead = 0;
    let sql = `insert into ${NOTIFY_MSG_TABLE_NAME} (msg_type, msg_content, from_user, from_avatar, time, has_read) values ('${msgType}', '${msgContent}', '${fromUser}', '${fromAvatar}', '${time}', ${hasRead})`;
    if (!db) {
      db = DBHelper.open();
    }
    db.transaction(
      tx => {
        tx.executeSql(sql, [], (tx, result) => {
          // LogUtil.d('insert data success');
        }, (error) => {
          LogUtil.d('insert data fail: ' + JSON.stringify(error));
        });
      }
    )
  }

  static queryData() {
    let sql = 'select * from ' + NOTIFY_MSG_TABLE_NAME;
    if (!db) {
      db = DBHelper.open();
    }
    db.transaction(
      tx => {
        tx.executeSql(sql, [], (tx, result) => {
          // LogUtil.d('query data success: ' + JSON.stringify(result));
          // if (result && result.rows) {
          //   let len = result.rows.length;
          //   if (len) {
          //     for (let i = 0; i < len; i++) {
          //       LogUtil.d(JSON.stringify(result.rows.item(i)));
          //     }
          //   }
          // }
        }, (error) => {
          LogUtil.d('query data fail: ' + JSON.stringify(error));
        });
      }
    )
  }

  static reset() {
    db = null;
  }
}
