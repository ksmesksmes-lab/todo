'use client'

import { useTodos } from '@/hooks/useTodos'
import { TodoInput } from './TodoInput'
import { TodoList } from './TodoList'

export function TodoApp() {
  const { todos, addTodo, deleteTodo, updateTodo, toggleTodo } = useTodos()
  const completed = todos.filter(t => t.completed).length

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto w-full max-w-lg">
        <h1 className="mb-6 text-2xl font-bold text-gray-800">Todo</h1>
        <div className="flex flex-col gap-4">
          <TodoInput onAdd={addTodo} />
          {todos.length > 0 && (
            <p className="text-xs text-gray-400">
              전체 {todos.length}개 · 완료 {completed}개 · 남은 항목 {todos.length - completed}개
            </p>
          )}
          <TodoList
            todos={todos}
            onToggle={toggleTodo}
            onUpdate={updateTodo}
            onDelete={deleteTodo}
          />
        </div>
      </div>
    </div>
  )
}
