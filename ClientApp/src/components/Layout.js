import  { Component } from 'react';

export class Layout extends Component {
  static displayName = Layout.name;

  render() {
    return (
      <div className="h-full w-full flex flex-col">
        <main className="flex-1 m-0">
          {this.props.children}
        </main>
      </div>
    );
  }
}
