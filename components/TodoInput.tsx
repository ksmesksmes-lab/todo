'use client'

import { useState, KeyboardEvent } from 'react'

interface Props {
  onAdd: (text: string) => void
}

export function TodoInput({ onAdd }: Props) {
  const [value, setValue] = useState('')

  function handleAdd() {
    if (!value.trim()) return
    onAdd(value)
    setValue('')
  }

  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && handleAdd()}
        maxLength={200}
        placeholder="할 일을 입력하세요..."
        className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
      <button
        onClick={handleAdd}
        className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 active:bg-blue-700"
      >
        추가
      </button>
    </div>
  )
}
