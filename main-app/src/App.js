import React, { useState } from 'react';
import { Layout, Menu, Card, Input, Button, Space, message } from 'antd';
import { BrowserRouter, Route, Switch, Link } from 'react-router-dom';
import {
  HomeOutlined,
  AppstoreOutlined,
  SendOutlined,
} from '@ant-design/icons';

const { Header, Sider, Content } = Layout;

// 主应用首页 - 包含通信功能演示
const Home = () => {
  const [inputMsg, setInputMsg] = useState('');

  const sendToMicro = () => {
    if (!inputMsg.trim()) {
      message.warning('请输入消息');
      return;
    }
    if (window.qiankunActions) {
      window.qiankunActions.setGlobalState({
        message: inputMsg,
        from: '主应用',
        timestamp: Date.now(),
      });
      message.success('消息已发送到全局状态');
      setInputMsg('');
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>欢迎来到微前端主应用</h2>
      <Card title="主应用通信面板" style={{ marginTop: 16 }}>
        <p>通过全局状态向子应用发送消息：</p>
        <Space>
          <Input
            placeholder="输入要发送的消息"
            value={inputMsg}
            onChange={(e) => setInputMsg(e.target.value)}
            onPressEnter={sendToMicro}
            style={{ width: 300 }}
          />
          <Button type="primary" icon={<SendOutlined />} onClick={sendToMicro}>
            发送
          </Button>
        </Space>
        <p style={{ marginTop: 16, color: '#666' }}>
          提示：发送后请切换到子应用页面查看接收效果（打开浏览器控制台查看日志）
        </p>
      </Card>
    </div>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <Layout style={{ minHeight: '100vh' }}>
        <Header style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>
            微前端演示系统
          </div>
        </Header>
        <Layout>
          <Sider width={200} style={{ background: '#fff' }}>
            <Menu
              mode="inline"
              defaultSelectedKeys={['home']}
              style={{ height: '100%', borderRight: 0 }}
            >
              <Menu.Item key="home" icon={<HomeOutlined />}>
                <Link to="/">主应用首页</Link>
              </Menu.Item>
              <Menu.Item key="micro" icon={<AppstoreOutlined />}>
                <Link to="/micro">子应用</Link>
              </Menu.Item>
            </Menu>
          </Sider>
          <Content style={{ padding: 24, margin: 0, minHeight: 280, background: '#fff' }}>
            <Switch>
              <Route exact path="/" component={Home} />
              {/* 子应用挂载容器 */}
              <Route path="/micro">
                <div id="micro-container"></div>
              </Route>
            </Switch>
          </Content>
        </Layout>
      </Layout>
    </BrowserRouter>
  );
};

export default App;
