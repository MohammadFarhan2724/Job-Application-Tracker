import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="bg-blue-500 min-h-screen">
      <h1 className="text-5xl text-white font-bold">
        Tailwind Test
      </h1>
    </div>
  )
}

export default App
