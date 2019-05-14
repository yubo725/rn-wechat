
export default class Api {
  static BASE_URL = 'http://rnwechat.yubo.me';
  // static BASE_URL = 'http://10.234.14.136:5000';

  // 登录
  static LOGIN_URL = Api.BASE_URL + '/user/login';

  // 注册
  static REGISTER_URL = Api.BASE_URL + '/user/register';

  // 发布朋友圈
  static PUBLISH_MOMENT_URL = Api.BASE_URL + '/moments/publish';

  // 朋友圈
  static MOMENTS_URL = Api.BASE_URL + '/moments/list';

  // 朋友圈点赞
  static MOMENT_FAVOR_URL = Api.BASE_URL + '/moments/favor';

  // 朋友圈评论
  static MOMENT_REPLY_URL = Api.BASE_URL + '/moments/reply';

  // 朋友列表
  static FRIENDS_LIST = Api.BASE_URL + '/friends';

  // 搜索
  static SEARCH_URL = Api.BASE_URL + '/user/searchUser';

  // 修改头像
  static MODIFY_AVATAR_URL = Api.BASE_URL + '/user/updateAvatar';

  // 修改昵称
  static MODIFY_NICK_URL = Api.BASE_URL + '/user/updateNick';

  // 搜索添加好友
  static ADD_FRIEND_SEARCH_URL = Api.BASE_URL + '/addSearch';

  // Android应用内升级
  static ANDROID_UPGRADE_URL = Api.BASE_URL + '/upgrade/check';
}