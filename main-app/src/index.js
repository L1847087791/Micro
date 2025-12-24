import React from 'react';
import ReactDOM from 'react-dom';
import { registerMicroApps, start, initGlobalState } from 'qiankun';
import App from './App';
import 'antd/dist/antd.css';

// 初始化全局状态（用于主子应用通信）
const initialState = {
  user: '主应用用户',
  message: '来自主应用的消息',
};

const actions = initGlobalState(initialState);

// 监听全局状态变化
actions.onGlobalStateChange((state, prev) => {
  console.log('[主应用] 全局状态变化:', state, prev);
}, true); // true: 立即执行一次，验证监听器是否注册成功

// 导出 actions 供其他组件使用
window.qiankunActions = actions;

// 注册子应用
registerMicroApps([
  {
    name: 'micro-app',
    entry: '//localhost:3001',
    container: '#micro-container',
    activeRule: '/micro',
    // 不传递 props.actions，qiankun 会自动注入 setGlobalState 和 onGlobalStateChange
  },
]);

// 启动 qiankun
start({
  sandbox: {
    experimentalStyleIsolation: true, // 实验性样式隔离
  },
});

ReactDOM.render(<App />, document.getElementById('root'));
