import request from "./request";

// 聊天
export async function chat(params: any) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000); // 30秒超时

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/kol/api/v1/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        "Wallet-Address": localStorage.getItem("walletAddress") || ""
      },
      body: JSON.stringify(params),
      signal: controller.signal
    });
    
    clearTimeout(timeout); // 清除超时计时器
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.error('请求超时');
      throw new Error('请求超时');
    }
    console.error('聊天失败:', error);
    throw error;
  }
}

// 发送邮箱验证码
export async function sendEmailCode(data: any) {
  try {
    const res = await request.get('/kol/api/v1/email/code', {...data})
    return res
  } catch (error: any) {
    console.log(error)
    return error
  }
}

// 注册
export async function register(data: any) {
  try {
    const res = await request.post('/kol/api/v1/register', {...data})
    return res
  } catch (error: any) {
    console.log(error)
    return error
  }
}

// 登录
export async function login(data: any) {
  try {
    const res = await request.post('/kol/api/v1/login', {...data})
    return res
  } catch (error: any) {
    console.log(error)
    return error
  }
}

// 获取用户可以购买的会员
export async function getUserCanBuyMember() {
  try {
    const res = await request.get('/kol/api/v1/all/members')
    return res
  } catch (error: any) {
    console.log(error)
    return error
  }
}
// 重置密码
export async function resetPassword(data: any) {
  try {
    const res = await request.post('/kol/api/v1/user/resetpwd', {...data})
    return res
  } catch (error: any) {
    console.log(error)
    return error
  }
}

// 获取用户信息
export async function getUserInfo() {
  try {
    const res = await request.get('/kol/api/v1/user/info')
    return res
  } catch (error: any) {
    console.log(error)
    return error
  }
}

// 获取常量
export async function getConstants(params: any) {
  try {
    const res = await request.get('/kol/api/v1/constants', {...params})
    return res
  } catch (error: any) {
    console.log(error)
    return error
  }
}

// 创建Agent
export async function createAgent(data: any) {
  try {
    const res = await request.post('/kol/api/v1/agents', {...data})
    return res
  } catch (error: any) {
    console.log(error)
    return error
  }
}

// agent 列表
export async function getAgentList() {
  try {
    const res = await request.get('/kol/api/v1/agents/')
    return res
  } catch (error: any) {
    console.log(error)
    return error
  }
}

// 获取能力列表
export async function getAbilityList() {
  try {
    const res = await request.get('/kol/api/v1/abilities')
    return res
  } catch (error: any) {
    console.log(error)
    return error
  }
}

// 创建agent的时候，获取agent的定价套餐
export async function getAgentPriceList() {
  try {
    const res = await request.get('/kol/api/v1/agent/menus')
    return res
  } catch (error: any) {
    console.log(error)
    return error
  }
}

// 获取KOL的接口
export async function getKOLInterface() {
  try {
    const res = await request.get('/kol/api/v1/kols')
    return res
  } catch (error: any) {
    console.log(error)
    return error
  }
}

// 创建agent时，获取六项动作的限制数，以及还可以创建几个agent
export async function getAgentLimit() {
  try {
    const res = await request.get('/kol/api/v1/limit')
    return res
  } catch (error: any) {
    console.log(error)
    return error
  }
}



