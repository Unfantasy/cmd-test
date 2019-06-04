import { observable, action } from 'mobx';
import { hashHistory } from 'react-router';

class LayoutStore {
  namespace = 'layoutStore'
  @observable values = {
    key: '',
    kk: hashHistory.getCurrentLocation().pathname,
  };

  @action setKey(name) {
    this.values.key = name;
  }

  @action reset() {
    this.values.key = 'index';
  }
}

export default new LayoutStore();
