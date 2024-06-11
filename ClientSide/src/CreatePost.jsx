import React, { useState } from 'react';
import axios from 'axios'; // Don't forget to import axios
import './CreatePost.css'
const CreatePost = ({ onPostSubmit, onCancel }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [filepath, setFilepath] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const author = localStorage.getItem('username');
        const newPost = {
            title: title,
            description: description,
            category: category.split(',').map(tag => tag.trim()),
            author,
            filepath: filepath
        };
        try {
            const response = await axios.post('http://localhost:4500/topics', newPost);
            onPostSubmit(response.data);
            setTitle('');
            setDescription('');
            setCategory('');
            setFilepath('');
        } catch (error) {
            console.error('Error creating posts:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        switch (name) {
            case 'title':
                setTitle(value);
                break;
            case 'description':
                setDescription(value);
                break;
            case 'category':
                setCategory(value);
                break;
            case 'filepath':
                setFilepath(value);
                break;
            default:
                break;
        }
    };

    return (
        <form className="create-post-form" onSubmit={handleSubmit}>
            <h2>Create Post</h2>
            <div className="form-group">
                <label htmlFor="title">Title</label>
                <input
                    type="text"
                    name="title"
                    placeholder="Title"
                    value={title}
                    onChange={handleChange}
                    required
                />
            </div>
            <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                    name="description"
                    placeholder="Description"
                    value={description}
                    onChange={handleChange}
                    required
                ></textarea>
            </div>
            <div className="form-group">
                <label htmlFor="category">Category</label>
                <input
                    type="text"
                    name="category"
                    placeholder="Category"
                    value={category}
                    onChange={handleChange}
                    required
                />
            </div>
            <div className="form-group">
                <label htmlFor="filepath">Filepath</label>
                <input
                    type="text"
                    name="filepath"
                    placeholder="Filepath"
                    value={filepath}
                    onChange={handleChange}
                    required
                />
            </div>
            <button type="submit" className='custom-btn btn-1'>Create Post</button>
            <button type="button" className='custom-btn btn-1' onClick={onCancel}>Cancel</button>
        </form>
    );
}

export default CreatePost;
