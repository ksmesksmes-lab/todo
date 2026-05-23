'use client'

import { useState, useEffect } from 'react'
import type { Todo } from '@/types/todo'

const STORAGE_KEY = 'todos'

function loadFromStorage(): Todo[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Todo[]) : []
  } catch {
    return []
  }
}

function saveToStorage(todos: Todo[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
  } catch (e) {
    console.error('localStorage 저장 실패:', e)
  }
}

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([])

  useEffect(() => {
    setTodos(loadFromStorage())
  }, [])

  useEffect(() => {
    saveToStorage(todos)
  }, [todos])

  function addTodo(text: string) {
    const trimmed = text.trim()
    if (!trimmed) return
    const now = Date.now()
    setTodos(prev => [
      { id: crypto.randomUUID(), text: trimmed, completed: false, createdAt: now, updatedAt: now },
      ...prev,
    ])
  }

  function deleteTodo(id: string) {
    setTodos(prev => prev.filter(t => t.id !== id))
  }

  function updateTodo(id: string, text: string) {
    const trimmed = text.trim()
    if (!trimmed) return
    setTodos(prev =>
      prev.map(t => t.id === id ? { ...t, text: trimmed, updatedAt: Date.now() } : t)
    )
  }

  function toggleTodo(id: string) {
    setTodos(prev =>
      prev.map(t => t.id === id ? { ...t, completed: !t.completed, updatedAt: Date.now() } : t)
    )
  }

  return { todos, addTodo, deleteTodo, updateTodo, toggleTodo }
}
