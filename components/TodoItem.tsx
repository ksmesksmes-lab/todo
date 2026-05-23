'use client'

import { useState, useRef, useEffect, KeyboardEvent } from 'react'
import type { Todo } from '@/types/todo'

interface Props {
  todo: Todo
  onToggle: (id: string) => void
  onUpdate: (id: string, text: string) => void
  onDelete: (id: string) => void
}

export function TodoItem({ todo, onToggle, onUpdate, onDelete }: Props) {
  const [editing, setEditing] = useState(false)
  const [editValue, setEditValue] = useState(todo.text)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing) inputRef.current?.focus()
  }, [editing])

  function handleEditStart() {
    setEditValue(todo.text)
    setEditing(true)
  }

  function handleEditSave() {
    if (editValue.trim()) onUpdate(todo.id, editValue)
    setEditing(false)
  }

  function handleEditCancel() {
    setEditValue(todo.text)
    setEditing(false)
  }

  return (
    <li className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm">
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => onToggle(todo.id)}
        className="h-4 w-4 cursor-pointer accent-blue-500"
        aria-label={`${todo.text} 완료 토글`}
      />
      {editing ? (
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={e => setEditValue(e.target.value)}
          onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter') handleEditSave()
            if (e.key === 'Escape') handleEditCancel()
          }}
          onBlur={handleEditSave}
          maxLength={200}
          className="flex-1 rounded border border-blue-400 px-2 py-0.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
        />
      ) : (
        <span
          onDoubleClick={handleEditStart}
          className={`flex-1 text-sm ${todo.completed ? 'text-gray-400 line-through' : 'text-gray-800'}`}
        >
          {todo.text}
        </span>
      )}
      <div className="flex shrink-0 gap-1">
        {editing ? (
          <>
            <button onClick={handleEditSave} className="rounded px-2 py-1 text-xs text-blue-600 hover:bg-blue-50">저장</button>
            <button onClick={handleEditCancel} className="rounded px-2 py-1 text-xs text-gray-500 hover:bg-gray-100">취소</button>
          </>
        ) : (
          <>
            <button onClick={handleEditStart} className="rounded px-2 py-1 text-xs text-gray-500 hover:bg-gray-100">수정</button>
            <button onClick={() => onDelete(todo.id)} className="rounded px-2 py-1 text-xs text-red-400 hover:bg-red-50">삭제</button>
          </>
        )}
      </div>
    </li>
  )
}
