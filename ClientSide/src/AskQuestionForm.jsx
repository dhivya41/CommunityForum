import React, { useState } from 'react';
import axios from 'axios';
import './AskQuestion.css';

function AskQuestionForm({ onQuestionSubmit }) {
  const [questionTitle, setQuestionTitle] = useState('');
  const [questionDescription, setQuestionDescription] = useState('');
  const [category, setCategory] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const author = localStorage.getItem('username');

    const newQuestion = {
      title: questionTitle,
      description: questionDescription,
      category: category.split(',').map(tag => tag.trim()),
      author
    };

    try {
      const response = await axios.post('http://localhost:4500/questions', newQuestion);
      onQuestionSubmit(response.data);
      setQuestionTitle('');
      setQuestionDescription('');
      setCategory('');
    } catch (error) {
      console.error('Error creating question:', error);
    }
  };

  return (
    <form className="ask-question-form" onSubmit={handleSubmit}>
      <h2>Ask a Question</h2>
      <div className="form-group">
        <label htmlFor="questionTitle">Question Title</label>
        <input
          type="text"
          id="questionTitle"
          value={questionTitle}
          onChange={(e) => setQuestionTitle(e.target.value)}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="questionDescription">Question Description</label>
        <textarea
          id="questionDescription"
          value={questionDescription}
          onChange={(e) => setQuestionDescription(e.target.value)}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="category">Category</label>
        <input
          type="text"
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />
      </div>
      <button type="submit">Ask on Community</button>
      
    </form>
  );
}

export default AskQuestionForm;