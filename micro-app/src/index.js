import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import 'antd/dist/antd.css';

let root = null;
let qiankunProps = {};

// 渲染函数
function render(props = {}) {
  const { container } = props;
  qiankunProps = props;
  const dom = container ? container.querySelector('#micro-root') : document.getElementById('micro-root');
  ReactDOM.render(<App qiankunProps={props} />, dom);
  root = dom;
}

// 独立运行时直接渲染
if (!window.__POWERED_BY_QIANKUN__) {
  render();
}

// qiankun 生命周期钩子 - bootstrap
export async function bootstrap() {
  console.log('[micro-app] bootstrap');
}

// qiankun 生命周期钩子 - mount
export async function mount(props) {
  console.log('[micro-app] mount', props);
  // 监听全局状态变化
  if (props.actions) {
    props.actions.onGlobalStateChange((state, prev) => {
      console.log('[子应用] 全局状态变化:', state, prev);
    }, true); // true 表示立即执行一次
  }
  render(props);
}

// qiankun 生命周期钩子 - unmount
export async function unmount(props) {
  console.log('[micro-app] unmount');
  if (root) {
    ReactDOM.unmountComponentAtNode(root);
    root = null;
  }
}
