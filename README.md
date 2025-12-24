# 微前端架构演示项目

基于 qiankun 的微前端架构快速上手项目，包含主应用（main-app）和子应用（micro-app）。

## 技术栈

- React 16.14.0
- Webpack 5
- Ant Design 4.x
- qiankun 2.x
- react-router-dom 5.x

## 项目结构

```
Micro/
├── main-app/                 # 主应用 (端口 3000)
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── index.js          # 入口文件 + qiankun 配置
│   │   └── App.js            # 主应用 UI
│   ├── package.json
│   └── webpack.config.js
│
├── micro-app/                # 子应用 (端口 3001)
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── index.js          # 入口文件 + 生命周期钩子
│   │   └── App.js            # 子应用 UI
│   ├── package.json
│   └── webpack.config.js
│
├── .gitignore
└── README.md
```

## 快速开始

### 1. 安装依赖

```bash
# 安装主应用依赖
cd main-app
npm install

# 安装子应用依赖
cd ../micro-app
npm install
```

### 2. 启动项目

需要同时启动两个应用：

```bash
# 终端1 - 启动子应用（先启动）
cd micro-app
npm start

# 终端2 - 启动主应用
cd main-app
npm start
```

### 3. 访问应用

- 主应用：http://localhost:3000
- 子应用（独立运行）：http://localhost:3001

---

## 搭建步骤详解

### 步骤一：创建项目结构

创建两个独立的 React 项目，分别作为主应用和子应用。

**关键配置 - 子应用 webpack.config.js：**

```javascript
output: {
  // qiankun 要求子应用打包成 umd 格式
  library: `${packageName}-[name]`,
  libraryTarget: 'umd',
  chunkLoadingGlobal: `webpackJsonp_${packageName}`,
}
```

### 步骤二：配置 qiankun 主应用

在主应用入口文件中注册子应用：

```javascript
// main-app/src/index.js
import { registerMicroApps, start } from 'qiankun';

registerMicroApps([
  {
    name: 'micro-app',           // 子应用名称
    entry: '//localhost:3001',   // 子应用入口
    container: '#micro-container', // 挂载容器
    activeRule: '/micro',        // 激活路由
  },
]);

start();
```

### 步骤三：配置子应用生命周期

子应用需要导出 qiankun 要求的生命周期钩子：

```javascript
// micro-app/src/index.js

// 独立运行时直接渲染
if (!window.__POWERED_BY_QIANKUN__) {
  render();
}

// 生命周期钩子
export async function bootstrap() {
  console.log('[micro-app] bootstrap');
}

export async function mount(props) {
  console.log('[micro-app] mount');
  render(props);
}

export async function unmount(props) {
  console.log('[micro-app] unmount');
  ReactDOM.unmountComponentAtNode(root);
}
```

### 步骤四：实现主子应用通信

使用 qiankun 的 `initGlobalState` API：

**主应用发送：**

```javascript
import { initGlobalState } from 'qiankun';

const actions = initGlobalState({ message: '' });

// 发送消息
actions.setGlobalState({ message: 'Hello from main' });

// 监听变化
actions.onGlobalStateChange((state, prev) => {
  console.log('状态变化:', state);
});
```

**子应用接收：**

```javascript
export async function mount(props) {
  // 通过 props 获取 actions
  props.actions.onGlobalStateChange((state) => {
    console.log('收到:', state);
  }, true);
}
```

### 步骤五：解决 CSS 隔离问题

**问题：** 开启样式隔离后，Modal/Dropdown 等弹窗挂载到 body，导致样式失效。

**解决方案：** 使用 `getPopupContainer` 将弹窗挂载到子应用容器内。

```jsx
const containerRef = useRef(null);

<div ref={containerRef}>
  <Modal
    getContainer={() => containerRef.current}
    // ...
  >
    {/* 弹窗内容 */}
  </Modal>
</div>
```

**qiankun 样式隔离配置：**

```javascript
start({
  sandbox: {
    // 实验性样式隔离（推荐）
    experimentalStyleIsolation: true,
    // 或严格隔离（Shadow DOM，兼容性较差）
    // strictStyleIsolation: true,
  },
});
```

---

## 功能演示

| 功能 | 操作 | 预期结果 |
|------|------|----------|
| 子应用加载 | 点击左侧菜单"子应用" | 子应用内容显示在主应用中 |
| 主→子通信 | 主应用首页发送消息 | 子应用页面显示收到的消息 |
| 子→主通信 | 子应用页面发送消息 | 浏览器控制台显示主应用收到 |
| CSS 隔离测试 | 子应用中点击"打开弹窗测试" | 弹窗样式正常显示 |

---

## 后续学习建议

### 1. 深入理解 qiankun 原理

- **JS 沙箱机制**：了解 `SnapshotSandbox`、`ProxySandbox` 的实现原理
- **CSS 隔离机制**：理解 `experimentalStyleIsolation` 如何通过添加选择器前缀实现隔离
- **HTML Entry**：研究 qiankun 如何解析子应用的 HTML 入口

**实践建议**：在子应用中添加全局变量，观察沙箱如何隔离

```javascript
// 在子应用中
window.microAppData = 'test';
// 切换到主应用，检查 window.microAppData 是否存在
```

### 2. 多子应用场景

在本项目基础上添加第二个子应用：

```javascript
registerMicroApps([
  { name: 'micro-app', entry: '//localhost:3001', ... },
  { name: 'micro-app-2', entry: '//localhost:3002', ... },
]);
```

**学习要点**：
- 多应用切换时的状态保持（`prefetch`、`singular` 配置）
- 应用间如何共享依赖（`externals` + CDN）

### 3. 路由系统深入

**当前项目使用 Hash 路由匹配，可尝试：**

- 子应用内部路由配置
- 主子应用路由联动
- `activeRule` 函数式匹配

```javascript
activeRule: (location) => location.pathname.startsWith('/micro')
```

### 4. 公共依赖提取

减少重复加载 React、Ant Design 等公共库：

```javascript
// webpack.config.js
externals: {
  react: 'React',
  'react-dom': 'ReactDOM',
}
```

配合 HTML 中引入 CDN 链接。

### 5. 生产环境部署

- **独立部署**：主应用和子应用部署到不同服务器/域名
- **跨域配置**：子应用需配置 CORS
- **静态资源路径**：子应用需配置 `publicPath`

```javascript
// 动态设置 publicPath
if (window.__POWERED_BY_QIANKUN__) {
  __webpack_public_path__ = window.__INJECTED_PUBLIC_PATH_BY_QIANKUN__;
}
```

### 6. 进阶主题

| 主题 | 说明 |
|------|------|
| 应用预加载 | `start({ prefetch: true })` |
| 应用保活 | 使用 `loadMicroApp` 手动控制 |
| 全局错误处理 | `addGlobalUncaughtErrorHandler` |
| 性能优化 | 按需加载、资源缓存策略 |

---

## 踩坑记录

### 坑点一：全局状态监听器被覆盖

**现象**：子应用调用 `setGlobalState` 后，主应用的 `onGlobalStateChange` 监听器不触发。

**原因**：qiankun 内部使用 id 作为 key 存储监听器：

```javascript
deps[id] = callback;  // 同一个 id 会覆盖
```

如果主应用通过 `props: { actions }` 把同一个 actions 对象传给子应用，当子应用调用 `props.actions.onGlobalStateChange` 时，会使用相同的 id，**覆盖**主应用之前注册的监听器。

**解决方案**：

1. 主应用**不要**在 `registerMicroApps` 的 `props` 中传递 `actions`
2. 子应用使用 qiankun **自动注入**的 `props.setGlobalState` 和 `props.onGlobalStateChange`

```javascript
// ❌ 错误写法 - 主应用
registerMicroApps([{
  props: { actions }  // 不要传递
}]);

// ❌ 错误写法 - 子应用
props.actions.setGlobalState({ ... });
props.actions.onGlobalStateChange((state) => { ... });

// ✅ 正确写法 - 子应用（使用 qiankun 自动注入的方法）
props.setGlobalState({ ... });
props.onGlobalStateChange((state) => { ... });
```

---

### 坑点二：路由刷新后导航菜单不同步

**现象**：在 `/micro` 路由刷新页面，导航菜单高亮的是"主应用首页"而不是"子应用"。

**原因**：使用了 `defaultSelectedKeys`，这是静态默认值，刷新后不会根据当前 URL 更新。

**解决方案**：使用 `selectedKeys` 动态绑定，根据 `location.pathname` 计算当前选中项。

```jsx
// ❌ 错误写法
<Menu defaultSelectedKeys={['home']}>

// ✅ 正确写法
const location = useLocation();
const selectedKey = location.pathname.startsWith('/micro') ? 'micro' : 'home';

<Menu selectedKeys={[selectedKey]}>
```

注意：`useLocation` 必须在 `<BrowserRouter>` 内部使用，需要调整组件结构。

---

### 坑点三：CSS 隔离后弹窗样式失效

**现象**：开启 `experimentalStyleIsolation` 后，Modal 弹窗内的自定义样式不生效。

**原因**：qiankun 的实验性样式隔离会给子应用的 CSS 添加前缀选择器：

```css
/* 原始样式 */
.custom-text { color: red; }

/* 隔离后 */
div[data-qiankun="micro-app"] .custom-text { color: red; }
```

而 Modal/Dropdown 等组件默认挂载到 `body` 下，不在 `div[data-qiankun]` 容器内，导致样式选择器无法匹配。

**注意**：antd 的全局样式不受影响，只有**子应用自定义的 CSS** 会出现此问题。

**解决方案**：使用 `getContainer` / `getPopupContainer` 将弹窗挂载到子应用容器内。

```jsx
const containerRef = useRef(null);

<div ref={containerRef}>
  {/* Modal 使用 getContainer */}
  <Modal getContainer={() => containerRef.current}>

  {/* Select/Dropdown 使用 getPopupContainer */}
  <Select getPopupContainer={() => containerRef.current}>
</div>
```

---

## 常见问题

### Q1: 子应用资源加载 404

检查子应用 `webpack.config.js` 中的 `publicPath` 是否配置正确。

### Q2: 子应用样式污染主应用

开启样式隔离：

```javascript
start({ sandbox: { experimentalStyleIsolation: true } });
```

### Q3: 子应用挂载后白屏

1. 检查子应用是否导出了生命周期钩子
2. 检查子应用 `output.libraryTarget` 是否为 `umd`
3. 检查挂载容器 DOM 是否存在

### Q4: 开发环境跨域问题

子应用 devServer 需配置：

```javascript
headers: { 'Access-Control-Allow-Origin': '*' }
```

---

## 参考资料

- [qiankun 官方文档](https://qiankun.umijs.org/zh)
- [single-spa 文档](https://single-spa.js.org/)
- [微前端架构实践](https://micro-frontends.org/)
