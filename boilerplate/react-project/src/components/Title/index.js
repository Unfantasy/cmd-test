import React from 'react';
import './style.scss';

function Title(props) {
  const { align = 'center' } = props;
  return (
    <div className={align === 'center' ? 'self-title' : 'self-title self-title-left'}>
      <div className="title-content">{props.title || ''}</div>
    </div>
  );
}

export default Title;
