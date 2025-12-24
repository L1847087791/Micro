import React, { useState, useEffect, useRef } from 'react';
import { Card, Button, Tag, Modal, Input, Space, Alert, message, Divider, Switch } from 'antd';
import { SmileOutlined, SendOutlined, ExperimentOutlined } from '@ant-design/icons';
import './custom.css'; // 引入自定义样式

const App = ({ qiankunProps = {} }) => {
  const [globalState, setGlobalState] = useState({});
  const [inputMsg, setInputMsg] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [useCustomContainer, setUseCustomContainer] = useState(true); // 是否使用自定义容器
  const containerRef = useRef(null);

  useEffect(() => {
    // 使用 qiankun 自动注入的 onGlobalStateChange（不是 qiankunProps.actions）
    if (qiankunProps.onGlobalStateChange) {
      qiankunProps.onGlobalStateChange((state) => {
        console.log('[子应用] 收到全局状态:', state);
        setGlobalState(state);
      }, true);
    }
  }, [qiankunProps.onGlobalStateChange]);

  // 子应用向主应用发送消息
  const sendToMain = () => {
    if (!inputMsg.trim()) {
      message.warning('请输入消息');
      return;
    }
    // 使用 qiankun 自动注入的 setGlobalState（不是 qiankunProps.actions）
    if (qiankunProps.setGlobalState) {
      qiankunProps.setGlobalState({
        message: inputMsg,
        from: '子应用',
        timestamp: Date.now(),
      });
      message.success('消息已发送到主应用');
      setInputMsg('');
    } else {
      message.error('未检测到 qiankun 环境，无法发送');
    }
  };

  // 获取弹窗挂载容器（解决 CSS 隔离问题）
  const getPopupContainer = () => {
    return containerRef.current || document.body;
  };

  return (
    <div ref={containerRef} style={{ padding: 24 }}>
      <Card title="子应用内容" extra={<Tag color="blue">micro-app</Tag>}>
        <p><SmileOutlined /> 这是子应用的页面内容</p>
        <p>运行环境: {window.__POWERED_BY_QIANKUN__ ? 'qiankun 微前端' : '独立运行'}</p>
      </Card>

      <Card title="通信功能演示" style={{ marginTop: 16 }}>
        <Alert
          message="收到的全局状态"
          description={
            <pre style={{ margin: 0 }}>
              {JSON.stringify(globalState, null, 2) || '暂无数据'}
            </pre>
          }
          type="info"
          style={{ marginBottom: 16 }}
        />
        <Space>
          <Input
            placeholder="输入要发送给主应用的消息"
            value={inputMsg}
            onChange={(e) => setInputMsg(e.target.value)}
            onPressEnter={sendToMain}
            style={{ width: 300 }}
          />
          <Button type="primary" icon={<SendOutlined />} onClick={sendToMain}>
            发送到主应用
          </Button>
        </Space>
      </Card>

      <Card title="CSS 隔离问题演示" style={{ marginTop: 16 }}>
        <Alert
          message="问题说明"
          description={
            <div>
              <p>qiankun 的 experimentalStyleIsolation 会给子应用样式加前缀：</p>
              <code>div[data-qiankun="micro-app"] .custom-modal-text {'{...}'}</code>
              <p style={{ marginTop: 8 }}>当 Modal 挂载到 body 时，不在这个选择器范围内，自定义样式失效。</p>
            </div>
          }
          type="warning"
          style={{ marginBottom: 16 }}
        />

        <Space direction="vertical" style={{ width: '100%' }}>
          <Space>
            <span>使用 getContainer 挂载到子应用容器：</span>
            <Switch
              checked={useCustomContainer}
              onChange={setUseCustomContainer}
              checkedChildren="开启"
              unCheckedChildren="关闭"
            />
            <Tag color={useCustomContainer ? 'green' : 'red'}>
              {useCustomContainer ? '样式生效' : '样式可能失效'}
            </Tag>
          </Space>

          <Button
            type="primary"
            icon={<ExperimentOutlined />}
            onClick={() => setModalVisible(true)}
          >
            打开弹窗测试（查看自定义样式）
          </Button>
        </Space>

        <Modal
          title="CSS 隔离测试弹窗"
          open={modalVisible}
          onOk={() => setModalVisible(false)}
          onCancel={() => setModalVisible(false)}
          getContainer={useCustomContainer ? getPopupContainer : undefined}
        >
          {/* 使用自定义 CSS 类 */}
          <div className="custom-modal-text">
            这段文字使用了自定义样式 .custom-modal-text
          </div>

          <div className="custom-box" style={{ marginTop: 12 }}>
            <p className="custom-highlight">这是 .custom-highlight 样式</p>
            <p>如果看到红色渐变背景文字和绿色虚线边框，说明样式生效</p>
          </div>

          <Divider />

          <Alert
            message={useCustomContainer ? '当前：挂载到子应用容器' : '当前：挂载到 body'}
            description={
              useCustomContainer
                ? '弹窗在 qiankun 隔离范围内，自定义样式生效'
                : '弹窗在 body 下，不在隔离范围内，自定义样式可能失效（取决于隔离模式）'
            }
            type={useCustomContainer ? 'success' : 'warning'}
          />

          <Divider />
          <p>解决方案代码：</p>
          <pre style={{ background: '#f5f5f5', padding: 8, fontSize: 12 }}>
{`// 1. 获取容器的函数
const getPopupContainer = () => {
  return containerRef.current || document.body;
};

// 2. Modal 使用 getContainer
<Modal getContainer={getPopupContainer}>

// 3. Select/Dropdown 使用 getPopupContainer
<Select getPopupContainer={getPopupContainer}>`}
          </pre>
        </Modal>
      </Card>
    </div>
  );
};

export default App;
