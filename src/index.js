import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import TiqBizAPI from './tiqbiz.js';

let tiqbiz = new TiqBizAPI();

ReactDOM.render(<App tiqbiz={tiqbiz} />, document.getElementById('root'));
registerServiceWorker();
