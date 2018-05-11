import React, {Component} from 'react'
import {mapStateToProps, mapDispatchToProps} from '@jho406/breezy'
import {connect} from 'react-redux'
import BaseScreen from 'components/BaseScreen'
import TodosForm from 'components/TodosForm'
import TodoItem from 'components/TodoItem'
import classNames from 'classnames'

class TodosIndex extends BaseScreen {
  static defaultProps = {
    todos: []
  }

  filterParams() {
    return `?filter=${this.props.filter}`
  }

  createTodo (todo) {
    return super.handleSubmit(
      this.props.meta.todos_path + this.filterParams(),
      {todo},
      'POST'
    )
  }

  deleteTodo(todo) {
    return super.handleSubmit(
      todo.meta.todo_path + this.filterParams(),
      {},
      'DELETE'
    )
  }

  updateTodo(todo) {
    return super.handleSubmit(
      todo.meta.todo_path + this.filterParams(),
      todo,
      'PATCH'
    )
  }

  render () {
    const todoItems = this.props.todos.map((todo, key) => {
      return (
        <TodoItem key={key}
          todo={todo}
          updateTodo={this.updateTodo.bind(this)}
          deleteTodo={this.deleteTodo.bind(this)}
        />
      )
    })

    return (
      <div>
        <header className="header">
          <h1>Todos</h1>
          <TodosForm
            onSubmit={(args) => {
              this.createTodo(args)
            }}
          />
        </header>
        <section className="main">
          <input
            id="toggle-all"
            className="toggle-all"
            type="checkbox"
          />
          <label
            htmlFor="toggle-all"
          />
          <ul className="todo-list">
            {todoItems}
          </ul>
          {this.renderFooter()}
        </section>
      </div>
    )
  }

  renderFooter() {
    return (
      <footer className="footer">
        <span className="todo-count">
          <strong>{this.props.count}</strong> todo left
        </span>
        <ul className="filters">
          <li>
            <a
              className={classNames({selected: !this.props.filter})}
              onClick={() => this.handleClick(this.props.meta.todos_path)}
            >
              All
            </a>
          </li>
          {' '}
          <li>
            <a
              className={classNames({selected: this.props.filter === 'active'})}
              onClick={() => this.handleClick(this.props.meta.todos_path + '?filter=active')}
            >
              Active
            </a>
          </li>
          {' '}
          <li>
            <a
              className={classNames({selected: this.props.filter === 'completed'})}
              onClick={() => this.handleClick(this.props.meta.todos_path + '?filter=completed')}
            >
              Completed
            </a>
          </li>
        </ul>
      </footer>
    )
  }
}

export default connect(
  mapStateToProps,
  {...mapDispatchToProps},
)(TodosIndex)
