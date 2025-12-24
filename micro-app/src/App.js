import React, { useState, useEffect, useRef } from 'react';
import { Card, Button, Tag, Modal, Input, Space, Alert, message, Divider } from 'antd';
import { SmileOutlined, SendOutlined, ExperimentOutlined } from '@ant-design/icons';

const App = ({ qiankunProps = {} }) => {
  const [globalState, setGlobalState] = useState({});
  const [inputMsg, setInputMsg] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    // 监听全局状态变化
    if (qiankunProps.actions) {
      qiankunProps.actions.onGlobalStateChange((state) => {
        console.log('[子应用] 收到全局状态:', state);
        setGlobalState(state);
      }, true);
    }
  }, [qiankunProps.actions]);

  // 子应用向主应用发送消息
  const sendToMain = () => {
    if (!inputMsg.trim()) {
      message.warning('请输入消息');
      return;
    }
    if (qiankunProps.actions) {
      qiankunProps.actions.setGlobalState({
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
    // 在 qiankun 环境下，将弹窗挂载到子应用容器内，而非 body
    // 这样可以保证弹窗内的样式生效
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
          description="当开启 CSS 隔离时，Modal/Dropdown 等弹窗默认挂载到 body 下，会导致弹窗内的自定义样式失效。解决方案是使用 getPopupContainer 将弹窗挂载到子应用容器内。"
          type="warning"
          style={{ marginBottom: 16 }}
        />
        <Space>
          <Button
            type="primary"
            icon={<ExperimentOutlined />}
            onClick={() => setModalVisible(true)}
          >
            打开弹窗测试
          </Button>
        </Space>

        {/* 使用 getContainer 解决 CSS 隔离问题 */}
        <Modal
          title="CSS 隔离测试弹窗"
          open={modalVisible}
          onOk={() => setModalVisible(false)}
          onCancel={() => setModalVisible(false)}
          getContainer={getPopupContainer}
        >
          <p style={{ color: '#1890ff', fontWeight: 'bold' }}>
            这是弹窗内的自定义样式文字
          </p>
          <p>如果样式正常显示（蓝色加粗），说明 CSS 隔离问题已解决</p>
          <Divider />
          <p>解决方案：</p>
          <pre style={{ background: '#f5f5f5', padding: 8 }}>
{`<Modal
  getContainer={getPopupContainer}
  ...
/>`}
          </pre>
        </Modal>
      </Card>
    </div>
  );
};

export default App;
