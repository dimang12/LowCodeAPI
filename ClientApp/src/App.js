import React, { Component, Fragment } from 'react';
import { Route, Routes } from 'react-router-dom';
import AppRoutes from './AppRoutes';
import { Layout } from './components/Layout';
import './custom.css';

const layouts = {
  shell: Layout,
  blank: Fragment
};

export default class App extends Component {
  static displayName = App.name;

  render() {
    return (
      <Routes>
        {AppRoutes.map((route, index) => {
          const { element, layout = 'shell', ...rest } = route;
          const LayoutComponent = layouts[layout] || Fragment;
          return (
            <Route
              key={index}
              {...rest}
              element={<LayoutComponent>{element}</LayoutComponent>}
            />
          );
        })}
      </Routes>
    );
  }
}
