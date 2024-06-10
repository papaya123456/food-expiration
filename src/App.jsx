import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaTrashAlt } from 'react-icons/fa';
import "./styles.css";

export default function App() {
  const [newItem, setNewItem] = useState("");
  const [newExpiryDate, setNewExpiryDate] = useState(null);
  const [todos, setTodos] = useState(() => {
    const savedTodos = localStorage.getItem("todos");
    return savedTodos ? JSON.parse(savedTodos) : [];
  });

  useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(todos));
  }, [todos]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      todos.forEach(todo => {
        const expiryDate = new Date(todo.expiryDate);
        const daysBeforeExpiry = (expiryDate - now) / (1000 * 60 * 60 * 24);
        if (daysBeforeExpiry <= 2 && daysBeforeExpiry > 1) {
          notifyUser(todo.title);
        }
      });
    }, 24 * 60 * 60 * 1000); // Check once a day

    return () => clearInterval(interval);
  }, [todos]);

  function handleSubmit(e) {
    e.preventDefault();

    setTodos(currentTodos => [
      ...currentTodos,
      {
        id: crypto.randomUUID(),
        title: newItem,
        expiryDate: newExpiryDate,
        completed: false
      }
    ]);

    setNewItem("");
    setNewExpiryDate(null);
  }

  function toggleTodo(id, completed) {
    setTodos(currentTodos =>
      currentTodos.map(todo => {
        if (todo.id === id) {
          return { ...todo, completed };
        }
        return todo;
      })
    );
  }

  function deleteTodo(id) {
    setTodos(currentTodos => currentTodos.filter(todo => todo.id !== id));
  }

  function notifyUser(title) {
    alert(`Reminder: The food item "${title}" is about to expire in 2 days!`);
    // For real notifications, integrate with a notification service like Firebase
  }

  return (
    <div className="container">
      <form onSubmit={handleSubmit} className="new-item-form">
        <div className="form-row">
          <label htmlFor="item">New Food Item</label>
          <input
            value={newItem}
            onChange={e => setNewItem(e.target.value)}
            type="text"
            id="item"
            required
          />
        </div>
        <div className="form-row">
          <label htmlFor="expiry">Expiry Date</label>
          <DatePicker
            selected={newExpiryDate}
            onChange={date => setNewExpiryDate(date)}
            dateFormat="yyyy/MM/dd"
            id="expiry"
            required
          />
        </div>
        <button className="btn">Add</button>
      </form>
      <h1 className="header">Food Items</h1>
      <ul className="list">
        {todos.length === 0 && "No Items"}
        {todos.map(todo => (
          <li key={todo.id}>
            <label>
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={e => toggleTodo(todo.id, e.target.checked)}
              />
              {todo.title}
              <span>Expires on: {new Date(todo.expiryDate).toLocaleDateString()}</span>
            </label>
            <FaTrashAlt 
              onClick={() => deleteTodo(todo.id)} 
              className="delete-icon" 
              title="Delete"
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
