import React, {Component} from 'react'
import {mapStateToProps, mapDispatchToProps, enhanceVisitWithBrowserBehavior} from '@jho406/breezy'
import {connect} from 'react-redux'
import TodosForm from 'components/TodosForm'
import TodoItem from 'components/TodoItem'
import classNames from 'classnames'

class TodosIndex extends Component{
  static defaultProps = {
    todos: []
  }

  formRef = React.createRef()

  constructor(props) {
    super(props)
    const visit = enhanceVisitWithBrowserBehavior(props.visit)
    this.enhancedVisit = visit.bind(this)
  }

  filterParams() {
    return `?filter=${this.props.filter}`
  }

  createTodo (todo) {
    const options = {
      method: 'POST',
      body: JSON.stringify({todo})
    }
    const url = this.props.todos_path + this.filterParams()

    this.enhancedVisit(url, options)
  }

  deleteTodo(todo) {
    return this.enhancedVisit(
      todo.todo_path + this.filterParams(),
      {method: 'DELETE'},
    ).then( rsp => {
      setSubmitting(false)
      if (this.props.errors) {
        this.formRef.current.setErrors(this.props.errors)
      }
    })

  }

  updateTodo(todo) {
    const options = {
      method: 'PATCH',
      body: JSON.stringify({todo})
    }

    return this.enhancedVisit(
      todo.todo_path + this.filterParams(),
      options,
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
            ref={this.formRef}
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
              onClick={() => this.enhancedVisit(this.props.todos_path)}
            >
              All
            </a>
          </li>
          {' '}
          <li>
            <a
              className={classNames({selected: this.props.filter === 'active'})}
              onClick={() => this.enhancedVisit(this.props.todos_path + '?filter=active')}
            >
              Active
            </a>
          </li>
          {' '}
          <li>
            <a
              className={classNames({selected: this.props.filter === 'completed'})}
              onClick={() => this.enhancedVisit(this.props.todos_path + '?filter=completed')}
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
  mapDispatchToProps,
)(TodosIndex)
