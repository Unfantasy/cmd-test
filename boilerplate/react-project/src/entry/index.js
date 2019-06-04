import React from 'react';
import ReactDOM from 'react-dom';
import { useStrict } from 'mobx';
import { Provider } from 'mobx-react';
import { LocaleProvider } from 'antd';
import moment from 'moment';
import zhCN from 'antd/lib/locale-provider/zh_CN';
import RouterConfig from './router';
import 'moment/locale/zh-cn';
import stores from '../stores';
import './index.css';

moment.locale('zh-cn');
// import 'antd/dist/antd.css';


useStrict(true);
ReactDOM.render(<LocaleProvider locale={zhCN}><Provider {...stores}><RouterConfig /></Provider></LocaleProvider>, document.getElementById('root'));
