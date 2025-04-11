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
  [property: string]: any;
}