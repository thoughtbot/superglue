import React, {Component} from 'react'
import classNames from 'classnames'

const ENTER_KEY = 13
const ESCAPE_KEY = 27

export default class TodoItem extends Component {
  handleEdit() {
    this.setState({
      editing: true,
    })
  }

  handleCancel() {
    this.setState({
      editing: false,
      description: this.props.todo.description,
    })
  }

  handleSubmit(value) {
    this.props.updateTodo({...this.props.todo, description: value})
    this.setState({editing: false})
  }

  handleChange(value) {
    this.setState({
      description: value,
    })
  }

  handleKeyDown(event) {
    if (event.which === ESCAPE_KEY) {
      this.handleCancel()
    } else if (event.which === ENTER_KEY){
      this.handleSubmit(event.target.value)
    }
  }

  handleDelete() {
    this.props.deleteTodo(this.props.todo)
  }

  handleToggle() {
    const todo = this.props.todo
    this.props.updateTodo({...todo, completed: !todo.completed})
  }

  constructor(props) {
    super(props)

    this.state = {
      editing: false,
      description: props.todo.description,
    }
  }

  componentWillReceiveProps(props) {
    this.setState({
      description: props.todo.description,
    })
  }

  render() {
    const {todo} = this.props
    return (
      <li
        key={todo.id}
        className={classNames({
          completed: todo.completed,
          editing: this.state.editing,
        })}
      >
        <div className="view">
          <input
            className="toggle"
            type="checkbox"
            checked={todo.completed}
            onChange={this.handleToggle.bind(this)}
          />
          <label onDoubleClick={this.handleEdit.bind(this)}>
            {todo.description}
          </label>
          <button
            className="destroy"
            onClick={this.handleDelete.bind(this)}
          />
        </div>
        <input
          className="edit"
          value={this.state.description}
          autoFocus={true}
          onBlur={event => this.handleSubmit(event.target.value)}
          onChange={event =>
            this.setState({description: event.target.value})
          }
          onKeyDown={this.handleKeyDown.bind(this)}
        />
      </li>
    )
  }
}
