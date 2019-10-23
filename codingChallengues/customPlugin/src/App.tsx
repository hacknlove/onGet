import React from 'react';
import './App.scss';

import Header from './components/Header'
import Menu from './components/Menu'
import Grid from './components/Cards'

const App: React.FC = () => {
  return (
    <div>
      <Header/>
      <Menu />
      <Grid />
    </div>
  );
}

export default App;
