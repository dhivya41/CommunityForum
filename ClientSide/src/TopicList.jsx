import React, { useEffect, useState } from 'react';
import axios from 'axios';
import TopicDetail from './TopicDetail';
import './TopicList.css';

function TopicList({ category }) { // Use the category prop
    const [topics, setTopics] = useState([]);
    const [selectedTopic, setSelectedTopic] = useState(null);

    useEffect(() => {
        const fetchTopics = async () => {
            try {
                const response = await axios.get(`http://localhost:4500/topics/category/${category}`);
                setTopics(response.data);
            } catch (error) {
                console.error('Error fetching topics:', error);
            }
        };
        fetchTopics();
    }, [category]);

    const handleTopicClick = (topic) => {
        setSelectedTopic(topic);
    };

    return (
        <div className="topics-list-page">
            <h2>Topics in {category}</h2>
            {topics.length > 0 && (
                <div className="topics-list2">
                    {topics.map(topic => (
                        <div
                            key={topic._id}
                            className="topic-item2"
                            onClick={() => handleTopicClick(topic)}
                        >
                            <h3>{topic.title}</h3>
                            <p>{topic.description}</p>
                            <small>by {topic.author}</small>
                        </div>
                    ))}
                </div>
            )}
            {topics.length === 0 && !selectedTopic && ( // Check for selectedTopic too
                <p>No topics found in this category.</p>
            )}
            {selectedTopic && <TopicDetail topic={selectedTopic} />}
        </div>
    );
}

export default TopicList;
