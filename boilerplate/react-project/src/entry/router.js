import React from 'react';
import { hashHistory, Router, Route, IndexRoute } from 'react-router';
import Main from '../layout/main';
import Index from '../pages/index';

function RouterConfig() {
  return (
    <Router history={hashHistory}>
      <Route path="/" component={Main}>
        <IndexRoute component={Index} />
        <Route path="index" component={Index} />
      </Route>
    </Router>
  );
}

export default RouterConfig;
