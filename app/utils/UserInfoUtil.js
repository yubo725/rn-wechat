import StorageUtil from './StorageUtil';

export default class UserInfoUtil {

  static setUserInfo(data) {
    StorageUtil.set('users', {'users': data});
  }

  static getUserInfo(username, callback) {
    StorageUtil.get('users', (error, object) => {
      if (!error && object) {
        let users = object.users;
        if (users != null && users.length > 0) {
          for (let i = 0; i < users.length; i++) {
            if (users[i].name == username) {
              callback(users[i]);
              return;
            }
          }
        }
        callback(null);
      } else {
        callback(null);
      }
    })
  }

}
