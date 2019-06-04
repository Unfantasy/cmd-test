/**
 * @name: Main组件
 * @description: 主layout组件
 */

import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Link } from 'react-router';
import { Layout, Menu } from 'antd';
import { COMPANY } from 'src/constants';

import './style.scss';

const { Header, Content, Footer } = Layout;

@inject('layoutStore')
@observer
export default class extends Component {
  render() {
    console.log('layoutStore:', this.props.layoutStore.values.kk);
    return (
      <Layout>
        <Header className="layout-header">
          <div className="logo"><a>{COMPANY}</a></div>
          <Menu
            mode="horizontal"
            defaultSelectedKeys={['1']}
            style={{ lineHeight: '64px' }}
          >
            <Menu.Item key="1"><Link to="/index">关于</Link></Menu.Item>
            <Menu.Item key="5"><Link to="/index">产品</Link></Menu.Item>
            <Menu.Item key="4"><Link to="/index">联系我们</Link></Menu.Item>
          </Menu>
        </Header>
        <Content className="layout-content">
          {this.props.children}
        </Content>
        <Footer className="layout-footer">
          <span>contributors：</span>
          <a href="https://github.com/Unfantasy" target="_blank" rel="noopener noreferrer" title="岳霖">岳霖</a>
        </Footer>
      </Layout>
    );
  }
}
