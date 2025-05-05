/**
 * 项目环境设置脚本
 * 用于自动化设置项目所需的环境变量和依赖项
 * 包括Stripe CLI、PostgreSQL数据库和必要的密钥
 */
import { exec } from 'node:child_process';  // 执行命令行命令
import { promises as fs } from 'node:fs';   // 文件系统操作
import { promisify } from 'node:util';      // 将回调函数转换为Promise
import readline from 'node:readline';       // 命令行交互
import crypto from 'node:crypto';           // 加密功能
import path from 'node:path';               // 路径处理
import os from 'node:os';                   // 操作系统信息

// 将exec函数转换为Promise形式，便于使用async/await
const execAsync = promisify(exec);

/**
 * 命令行交互函数
 * 向用户提问并获取回答
 *
 * @param query - 要向用户显示的问题
 * @returns 用户输入的答案
 */
function question(query: string): Promise<string> {
  // 创建命令行交互界面
  const rl = readline.createInterface({
    input: process.stdin,    // 标准输入
    output: process.stdout,  // 标准输出
  });

  // 返回Promise，在用户回答后解析
  return new Promise((resolve) =>
    rl.question(query, (ans) => {
      rl.close();            // 关闭交互界面
      resolve(ans);          // 返回用户答案
    })
  );
}

/**
 * 检查Stripe CLI是否已安装并已认证
 * 如果未安装或未认证，提供相应的指导
 */
async function checkStripeCLI() {
  console.log(
    'Step 1: Checking if Stripe CLI is installed and authenticated...'
  );
  try {
    // 检查Stripe CLI是否已安装
    await execAsync('stripe --version');
    console.log('Stripe CLI is installed.');

    // 检查Stripe CLI是否已认证
    try {
      await execAsync('stripe config --list');
      console.log('Stripe CLI is authenticated.');
    } catch (error) {
      // Stripe CLI未认证或认证已过期
      console.log(
        'Stripe CLI is not authenticated or the authentication has expired.'
      );
      console.log('Please run: stripe login');

      // 询问用户是否已完成认证
      const answer = await question(
        'Have you completed the authentication? (y/n): '
      );
      if (answer.toLowerCase() !== 'y') {
        // 用户未完成认证，退出脚本
        console.log(
          'Please authenticate with Stripe CLI and run this script again.'
        );
        process.exit(1);
      }

      // 用户确认已登录，验证认证状态
      try {
        await execAsync('stripe config --list');
        console.log('Stripe CLI authentication confirmed.');
      } catch (error) {
        // 验证失败，退出脚本
        console.error(
          'Failed to verify Stripe CLI authentication. Please try again.'
        );
        process.exit(1);
      }
    }
  } catch (error) {
    // Stripe CLI未安装，提供安装指导
    console.error(
      'Stripe CLI is not installed. Please install it and try again.'
    );
    console.log('To install Stripe CLI, follow these steps:');
    console.log('1. Visit: https://docs.stripe.com/stripe-cli');
    console.log(
      '2. Download and install the Stripe CLI for your operating system'
    );
    console.log('3. After installation, run: stripe login');
    console.log(
      'After installation and authentication, please run this setup script again.'
    );
    process.exit(1);
  }
}

/**
 * 获取PostgreSQL数据库连接URL
 * 支持本地Docker实例、远程实例或Supabase
 *
 * @returns PostgreSQL连接URL
 */
async function getPostgresURL(): Promise<string> {
  console.log('Step 2: Setting up Postgres');

  // 询问用户选择数据库类型
  const dbChoice = await question(
    'Do you want to use a local Postgres instance with Docker (L), a remote Postgres instance (R), or Supabase (S)? (L/R/S): '
  );

  if (dbChoice.toLowerCase() === 'l') {
    // 用户选择本地Docker实例
    console.log('Setting up local Postgres instance with Docker...');
    await setupLocalPostgres();
    // 返回本地PostgreSQL连接URL
    return 'postgres://postgres:postgres@localhost:54322/postgres';
  } else {
    // 用户选择远程实例或Supabase
    console.log(
      'You can find Postgres databases at: https://vercel.com/marketplace?category=databases'
    );
    // 询问用户输入连接URL
    return await question('Enter your POSTGRES_URL: ');
  }
}

/**
 * 设置本地PostgreSQL Docker实例
 * 创建docker-compose.yml文件并启动容器
 */
async function setupLocalPostgres() {
  // 检查Docker是否已安装
  console.log('Checking if Docker is installed...');
  try {
    await execAsync('docker --version');
    console.log('Docker is installed.');
  } catch (error) {
    // Docker未安装，提供安装指导
    console.error(
      'Docker is not installed. Please install Docker and try again.'
    );
    console.log(
      'To install Docker, visit: https://docs.docker.com/get-docker/'
    );
    process.exit(1);
  }

  // 创建docker-compose.yml文件
  console.log('Creating docker-compose.yml file...');
  const dockerComposeContent = `
services:
  postgres:
    image: postgres:16.4-alpine
    container_name: next_saas_starter_postgres
    environment:
      POSTGRES_DB: postgres
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "54322:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
`;

  // 写入docker-compose.yml文件
  await fs.writeFile(
    path.join(process.cwd(), 'docker-compose.yml'),
    dockerComposeContent
  );
  console.log('docker-compose.yml file created.');

  // 启动Docker容器
  console.log('Starting Docker container with `docker compose up -d`...');
  try {
    await execAsync('docker compose up -d');
    console.log('Docker container started successfully.');
  } catch (error) {
    // 启动失败，退出脚本
    console.error(
      'Failed to start Docker container. Please check your Docker installation and try again.'
    );
    process.exit(1);
  }
}

/**
 * 获取Stripe密钥
 * 提示用户输入Stripe Secret Key
 *
 * @returns Stripe Secret Key
 */
async function getStripeSecretKey(): Promise<string> {
  console.log('Step 3: Getting Stripe Secret Key');
  console.log(
    'You can find your Stripe Secret Key at: https://dashboard.stripe.com/test/apikeys'
  );
  // 询问用户输入Stripe Secret Key
  return await question('Enter your Stripe Secret Key: ');
}

/**
 * 创建Stripe Webhook
 * 使用Stripe CLI创建webhook并获取webhook密钥
 *
 * @returns Stripe Webhook Secret
 */
async function createStripeWebhook(): Promise<string> {
  console.log('Step 4: Creating Stripe webhook...');
  try {
    // 使用Stripe CLI创建webhook并获取密钥
    const { stdout } = await execAsync('stripe listen --print-secret');
    // 从输出中提取webhook密钥
    const match = stdout.match(/whsec_[a-zA-Z0-9]+/);
    if (!match) {
      throw new Error('Failed to extract Stripe webhook secret');
    }
    console.log('Stripe webhook created.');
    return match[0];
  } catch (error) {
    // 创建webhook失败
    console.error(
      'Failed to create Stripe webhook. Check your Stripe CLI installation and permissions.'
    );
    // 在Windows上可能需要管理员权限
    if (os.platform() === 'win32') {
      console.log(
        'Note: On Windows, you may need to run this script as an administrator.'
      );
    }
    throw error;
  }
}

/**
 * 生成认证密钥
 * 创建用于JWT签名的随机密钥
 *
 * @returns 随机生成的认证密钥
 */
function generateAuthSecret(): string {
  console.log('Step 5: Generating AUTH_SECRET...');
  // 生成32字节的随机数据并转换为十六进制字符串
  return crypto.randomBytes(32).toString('hex');
}

/**
 * 写入环境变量文件
 * 将配置信息写入.env文件
 *
 * @param envVars - 环境变量对象
 */
async function writeEnvFile(envVars: Record<string, string>) {
  console.log('Step 6: Writing environment variables to .env');
  // 将环境变量对象转换为.env文件格式
  const envContent = Object.entries(envVars)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  // 写入.env文件
  await fs.writeFile(path.join(process.cwd(), '.env'), envContent);
  console.log('.env file created with the necessary variables.');
}

/**
 * 主函数
 * 按顺序执行设置步骤
 */
async function main() {
  // 检查Stripe CLI
  await checkStripeCLI();

  // 获取PostgreSQL连接URL
  const POSTGRES_URL = await getPostgresURL();
  // 获取Stripe Secret Key
  const STRIPE_SECRET_KEY = await getStripeSecretKey();
  // 创建Stripe Webhook并获取密钥
  const STRIPE_WEBHOOK_SECRET = await createStripeWebhook();
  // 设置基础URL
  const BASE_URL = 'http://localhost:3000';
  // 生成认证密钥
  const AUTH_SECRET = generateAuthSecret();

  // 写入环境变量文件
  await writeEnvFile({
    POSTGRES_URL,
    STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET,
    BASE_URL,
    AUTH_SECRET,
  });

  console.log('🎉 Setup completed successfully!');
}

// 执行主函数
main().catch(console.error);
