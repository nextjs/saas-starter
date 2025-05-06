// TODO: FINISH MCP DEMO, 没调通

export async function getWeatherInfo(prompt: string) {
    // 简单模拟地名识别（更复杂可用 NLP）
    const cityMatch = prompt.match(/(北京|上海|广州|深圳|天津)/);
    const city = cityMatch?.[0] || '未知城市';
  
    // 模拟天气数据（真实可接入 API，如和风、OpenWeatherMap）
    const weatherData = {
      天津: { weather: '晴', temperature: '25°C' },
      北京: { weather: '多云', temperature: '22°C' },
      上海: { weather: '小雨', temperature: '20°C' },
      广州: { weather: '雷阵雨', temperature: '28°C' },
      深圳: { weather: '阴', temperature: '26°C' },
    };
  
    const { weather, temperature } = weatherData[city as keyof typeof weatherData] || {
      weather: '未知',
      temperature: '--',
    };
  
    return {
      role: 'tool',
      type: 'weather',
      content: {
        location: city,
        date: new Date().toISOString().split('T')[0],
        weather,
        temperature,
      },
    };
  }
  