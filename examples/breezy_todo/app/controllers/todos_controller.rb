class TodosController < ApplicationController
  before_action :set_todo, only: [:show, :edit, :update, :destroy]
  # `use_breezy_html` returns a blank template, allowing for JS to take over
  # on application.html.erb
  before_action :use_breezy

  # GET /todos
  def index
    if params['filter'] == 'active'
      @todos = Todo.where(completed: [false, nil]).order(created_at: :desc)
    elsif params['filter'] == 'completed'
      @todos = Todo.where(completed: true).order(created_at: :desc)
    else
      @todos = Todo.order(created_at: :desc)
    end
  end

  # POST /todos
  def create
    @todo = Todo.new(todo_params)

    if @todo.save
      redirect_to todos_url(filter: params['filter'])
    else
      response.set_header("content-location", new_todo_path)
      render :index
    end
  end

  # PATCH/PUT /todos/1
  def update
    if @todo.update(todo_params)
      redirect_to todos_url(filter: params['filter'])
    else
      response.set_header("content-location", edit_todo_path(@todo))
      render :index
    end
  end

  # DELETE /todos/1
  def destroy
    @todo.destroy
    redirect_to todos_url(filter: params['filter'])
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_todo
      @todo = Todo.find(params[:id])
    end

    # Only allow a trusted parameter "white list" through.
    def todo_params
      params.require(:todo).permit(:description, :completed)
    end
end
