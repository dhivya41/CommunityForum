import React, { useState } from 'react';
import './ExploreTopics.css';
import TopicList from './TopicList'; 

const topicCategories = [
    { name: 'Technology', color: 'red' },
    { name: 'Social media', color: 'cyan' },
    { name: 'Culture', color: 'green' },
    { name: 'History', color: 'blue' },
    { name: 'Philosophy', color: 'lime' },
    { name: 'Climate', color: 'green' },
    { name: 'Mental health', color: 'blue' },
    { name: 'Politics', color: 'orange' },
    { name: 'Economy', color: 'blue' },
    { name: 'Art', color: 'lime' },
    { name: 'Space exploration', color: 'purple' },
    { name: 'Education', color: 'blue' },
    { name: 'Sports', color: 'purple' },
    { name: 'Business', color: 'red' },
    { name: 'AI and ethics', color: 'red' },
    { name: 'Health', color: 'yellow' },
    { name: 'Public opinion', color: 'green' },
    { name: 'Science', color: 'purple' },
];

function Exploretopics() {
    const [selectedTopic, setSelectedTopic] = useState(null);

    const handleTopicClick = (category) => {
        setSelectedTopic(category);
    };

    return (
        <div className="explore-topics-page">
            <main className="explore-content">
                <h2>Select A Topic To Explore</h2>
                <div className="topics-list1">
                    {topicCategories.map((category, index) => (
                        <div
                            key={index}
                            className="topic-item"
                            style={{ color: category.color }}
                            onClick={() => handleTopicClick(category.name)}
                        >
                            {category.name}
                        </div>
                    ))}
                </div>
            </main>
            {selectedTopic && (
                <TopicList category={selectedTopic} />
            )}
        </div>
    );
}

export default Exploretopics;
