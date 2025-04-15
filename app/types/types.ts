export interface CreateAgentRequest {
  /**
   * ability列表
   */
  ability: number[];
  /**
   * Character，多个性格用|链接
   */
  character: string;
  /**
   * 评论数量
   */
  comment: number;
  /**
   * 互动的KOL列表ID
   */
  interactive: number[];
  /**
   * 语言
   */
  language: string;
  /**
   * 点赞数量
   */
  likes: number;
  /**
   * agent名字
   */
  name: string;
  /**
   * 发推的数量
   */
  posts: number;
  /**
   * 引用数量
   */
  quote: number;
  /**
   * 收钱地址
   */
  receive_address: string;
  /**
   * 地区
   */
  region: string;
  /**
   * 回复数量
   */
  reply: number;
  /**
   * 转发推文数量
   */
  repost: number;
  /**
   * 性别，male表示男性 或者 female女性
   */
  sex: string;
  /**
   * 话题，多个话题用|链接
   */
  topics: string;
}

export interface UserInfoData {
  /**
   * agent的情况
   */
  agent: AgentNums;
  /**
   * 当前会员
   */
  current_member: CurrentMember;
  /**
   * 邮箱
   */
  email: string;
  /**
   * 用户名
   */
  user_name: string;
}

/**
 * agent的情况
 */
export interface AgentNums {
  /**
   * 已经创建的agent数量
   */
  created: number;
  /**
   * 可以创建的总数量
   */
  total: number;
}

/**
 * 当前会员
 */
export interface CurrentMember {
  /**
   * 会员ID
   */
  id: number;
  /**
   * 会员名
   */
  name: string;
}

export interface SelfResponse {
  code: number;
  data: SelfData[];
  msg: string;
}

export interface SelfData {
  follows?: string;
  id?: string;
  keywords?: string;
  name?: string;
  post_count?: string;
  replies?: string;
  revenue?: string;
  topic?: string;
}


/** ======================================== 订单列表 request types ========================================= */
export interface Datum {
  /**
   * 订单信息
   */
  buy_agent_order: BuyAgentOrder;
  /**
   * 创建时间
   */
  created_at: string;
  id: string;
  kol: Kol;
  /**
   * kol审核状态，可选值:pending,doing,finished,reject
   */
  kol_audit_status: string;
  /**
   * 单价(单位分)
   */
  price: number;
  /**
   * 购买数量，默认1
   */
  tweets: number;
}

/**
* 订单信息
*/
export interface BuyAgentOrder {
  /**
   * 订单id
   */
  id: number;
  /**
   * 项目信息
   */
  project: Project;
  /**
   * 宣传需求
   */
  promotional_materials: string;
}

/**
* 项目信息
*/
export interface Project {
  /**
   * 项目名字
   */
  name: string;
}

export interface Kol {
  /**
   * 粉丝数
   */
  followers_count: number;
  /**
   * kol的id
   */
  id: number;
  /**
   * 获赞总量
   */
  like_count: number;
  /**
   * 列表收录数
   */
  listed_count: number;
  /**
   * KOL名称
   */
  name: string;
  /**
   * 头像URL
   */
  profile_image_url: string;
  /**
   * 已购买kol的项目名字串，用逗号分隔
   */
  project_names?: string;
  /**
   * 标签，标签字符串用/分隔
   */
  tags?: string;
  /**
   * 推文总数
   */
  tweet_count: number;
  /**
   * 推特用户名
   */
  username: string;
}
/** ======================================== 订单列表 response types ========================================= */