'use client'

import type { Todo } from '@/types/todo'
import { TodoItem } from './TodoItem'

interface Props {
  todos: Todo[]
  onToggle: (id: string) => void
  onUpdate: (id: string, text: string) => void
  onDelete: (id: string) => void
}

export function TodoList({ todos, onToggle, onUpdate, onDelete }: Props) {
  if (todos.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-gray-400">
        할 일이 없습니다. 새 항목을 추가해보세요.
      </p>
    )
  }
  return (
    <ul className="flex flex-col gap-2">
      {todos.map(todo => (
        <TodoItem key={todo.id} todo={todo} onToggle={onToggle} onUpdate={onUpdate} onDelete={onDelete} />
      ))}
    </ul>
  )
}
