import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import dwnldlogo from './download logo.png';
import cmtlogo from './comment logo.png';
import likelogo from './like logo.png';
import unlikelogo from './unlikelogo.png';
import deletelogo from './delete logo.png';
import sendlogo from './send cmt logo.png';
import ExploreTopics from './Exploretopics';
import Chat from './Chat';
import AskQuestionForm from './AskQuestionForm';
import CreatePost from './CreatePost';

function Dashboard() {
    const navigate = useNavigate();
    const [topics, setTopics] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [commentText, setCommentText] = useState('');
    const [commentBoxVisible, setCommentBoxVisible] = useState({});
    const [comments, setComments] = useState({});
    const [activePage, setActivePage] = useState('home');
    const [showQuestionForm, setShowQuestionForm] = useState(false);
    const [showCreatePostForm, setShowCreatePostForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchTopics = async () => {
            try {
                const response = await axios.get('http://localhost:4500/topics');
                setTopics(response.data);
            } catch (error) {
                console.error("There was an error fetching the topics!", error);
            }
        };
        fetchTopics();

        const fetchQuestions = async () => {
            try {
                const response = await axios.get('http://localhost:4500/questions');
                setQuestions(response.data);
            } catch (error) {
                console.error("There was an error fetching the questions!", error);
            }
        };
        fetchQuestions();
    }, []);

    const fetchCommentsForTopic = async (topicId) => {
        try {
            const response = await axios.get(`http://localhost:4500/topics/${topicId}/comments`);
            setComments((prevComments) => ({
                ...prevComments,
                [topicId]: response.data,
            }));
        } catch (error) {
            console.error(`There was an error fetching comments for topic ${topicId}!`, error);
        }
    };

    const fetchCommentsForQuestion = async (questionId) => {
        try {
            const response = await axios.get(`http://localhost:4500/questions/${questionId}/comments`);
            setComments((prevComments) => ({
                ...prevComments,
                [questionId]: response.data,
            }));
        } catch (error) {
            console.error(`There was an error fetching comments for question ${questionId}!`, error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        navigate('/login');
    };

    const handleDelete = async (id, isQuestion) => {
        try {
            const url = isQuestion ? `http://localhost:4500/questions/${id}` : `http://localhost:4500/topics/${id}`;
            await axios.delete(url);
            if (isQuestion) {
                setQuestions((questions) => questions.filter((question) => question._id !== id));
            } else {
                setTopics((topics) => topics.filter((topic) => topic._id !== id));
            }
        } catch (error) {
            console.error('Error deleting item:', error);
        }
    };

   

   

    const handleCommentClick = (id, isQuestion) => {
        setCommentBoxVisible((prevState) => {
            const isVisible = !prevState[id];
            if (isVisible) {
                isQuestion ? fetchCommentsForQuestion(id) : fetchCommentsForTopic(id);
            }
            return {
                ...prevState,
                [id]: isVisible,
            };
        });
    };

    const handleCommentSubmit = async (id, isQuestion) => {
        if (!commentText.trim()) return;

        try {
            const author = localStorage.getItem('username');
            const url = isQuestion ? `http://localhost:4500/questions/${id}/comments` : `http://localhost:4500/topics/${id}/comments`;
            const response = await axios.post(url, { text: commentText, author });
            setComments((prevComments) => ({
                ...prevComments,
                [id]: [...(prevComments[id] || []), response.data],
            }));
            setCommentText('');
            if (!isQuestion) {
                setTopics((prevTopics) =>
                    prevTopics.map((topic) =>
                        topic._id === id ? { ...topic, commentCount: topic.commentCount + 1 } : topic
                    )
                );
            }
        } catch (error) {
            console.error('Error submitting comment:', error);
        }
    };

    const handleLike = async (id, isQuestion) => {
        try {
            const url = isQuestion ? `http://localhost:4500/questions/${id}/like` : `http://localhost:4500/topics/${id}/like`;
            await axios.post(url);
            if (isQuestion) {
                setQuestions((prevQuestions) =>
                    prevQuestions.map((question) =>
                        question._id === id ? { ...question, likeCount: question.likeCount + 1 } : question
                    )
                );
            } else {
                setTopics((prevTopics) =>
                    prevTopics.map((topic) =>
                        topic._id === id ? { ...topic, likeCount: topic.likeCount + 1 } : topic
                    )
                );
            }
        } catch (error) {
            console.error('Error liking item:', error);
        }
    };

    const handleUnlike = async (id, isQuestion) => {
        try {
            const url = isQuestion ? `http://localhost:4500/questions/${id}/unlike` : `http://localhost:4500/topics/${id}/unlike`;
            await axios.post(url);
            if (isQuestion) {
                setQuestions((prevQuestions) =>
                    prevQuestions.map((question) =>
                        question._id === id ? { ...question, likeCount: question.likeCount - 1 } : question
                    )
                );
            } else {
                setTopics((prevTopics) =>
                    prevTopics.map((topic) =>
                        topic._id === id ? { ...topic, likeCount: topic.likeCount - 1 } : topic
                    )
                );
            }
        } catch (error) {
            console.error('Error unliking item:', error);
        }
    };

    const handleQuestionSubmit = async (newQuestion) => {
        try {
            const author = localStorage.getItem('username');
            const response = await axios.post('http://localhost:4500/questions', { ...newQuestion, author });
            setQuestions((prevQuestions) => [...prevQuestions, response.data]);
            setShowQuestionForm(false);
            setActivePage('home');
        } catch (error) {
            console.error("There was an error creating the question!", error);
        }
    };
    const handlePostSubmit = async (newPost) => {
        try {
            const author = localStorage.getItem('username');
            const response = await axios.post('http://localhost:4500/topics', { ...newPost, author });
            setTopics((prevTopics) => [...prevTopics, response.data]);
            setShowCreatePostForm(false);
            setActivePage('home');
        } catch (error) {
            console.error("There was an error creating the post!", error);
        }
    };
    const handleCancel = () => {
        setShowQuestionForm(false);
        setShowCreatePostForm(false);
    };

    const renderQuestionActions = (question) => (
        <div className="question-actions">
            <button onClick={() => handleCommentClick(question._id, true)}>
                <img src={cmtlogo} alt="Comment" className="icon" />
                <span className="comment-count">{question.commentCount}</span>
            </button>
            <button onClick={() => handleLike(question._id, true)}>
                <img src={likelogo} alt="Like" className="icon" />
                <span className="like-count">{question.likeCount}</span>
            </button>
            <button onClick={() => handleUnlike(question._id, true)}>
                <img src={unlikelogo} alt="Unlike" id="unlikeicon" className="icon" />
            </button>
            <button onClick={() => handleDelete(question._id, true)}>
                <img src={deletelogo} alt="Delete" className="icon" />
            </button>
        </div>
    );

    const handleDownload = async (topicId) => {
        console.log(`Download button clicked for topic ID: ${topicId}`);
        try {
            const response = await axios.get(`http://localhost:4500/download/post/${topicId}`, {
                responseType: 'blob',
            });

            if (response.status === 200) {
                console.log('Response received:', response);
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', 'file.pdf');
                document.body.appendChild(link);
                link.click();
                link.remove();
                console.log(`Download completed for topic ID: ${topicId}`);
            } else {
                console.error(`Error downloading file: ${response.status} ${response.statusText}`);
            }
        } catch (error) {
            console.error('Error downloading file:', error.response ? error.response.data : error.message);
        }
    };

    const renderContent = () => {
        const filteredTopics = topics.filter(topic =>
            topic.title.toLowerCase().includes(searchTerm.toLowerCase())
        );
        switch (activePage) {
            case 'home':
        return (
            <>
               
                <div className="topics-list">
                    {filteredTopics.map(topic => (
                        <div key={topic._id} className="topic">
                            <h2>{topic.title}</h2>
                            <p>{topic.description}</p>
                            <small>posted by {topic.author} {new Date(topic.createdAt).toLocaleTimeString()} ago</small>
                            <div className="topic-actions">
                                <button onClick={() => handleDownload(topic._id)}>
                                    <img src={dwnldlogo} alt="Download" className="icon" />
                                </button>
                                <button onClick={() => handleCommentClick(topic._id, false)}>
                                    <img src={cmtlogo} alt="Comment" className="icon" />
                                    <span className="comment-count">{topic.commentCount}</span>
                                </button>
                                <button onClick={() => handleLike(topic._id, false)}>
                                    <img src={likelogo} alt="Like" className="icon" />
                                    <span className="like-count">{topic.likeCount}</span>
                                </button>
                                <button onClick={() => handleUnlike(topic._id, false)}>
                                    <img src={unlikelogo} alt="Unlike" id="unlikeicon" className="icon" />
                                </button>
                                <button onClick={() => handleDelete(topic._id, false)}>
                                    <img src={deletelogo} alt="Delete" className="icon" />
                                </button>
                            </div>
                            {commentBoxVisible[topic._id] && (
                                <div>
                                    <div className="comment-box">
                                        <textarea
                                            value={commentText}
                                            onChange={(e) => setCommentText(e.target.value)}
                                            placeholder="Write a comment..."
                                        />
                                        <button className="send-icon" onClick={() => handleCommentSubmit(topic._id, false)}>
                                            <img src={sendlogo} alt="Send" className="icon" />
                                        </button>
                                    </div>
                                    <div className="comments-list">
                                        {comments[topic._id] && comments[topic._id].map(comment => (
                                            <div key={comment._id} className="comment">
                                                <p>{comment.text}</p>
                                                <small>commented by {comment.author}</small>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
                <div className="questions-list">
                    {questions.map(question => (
                        <div key={question._id} className="question">
                            <h2>{question.title}</h2>
                            <p>{question.description}</p>
                            <small>asked by {question.author} {new Date(question.createdAt).toLocaleTimeString()} ago</small>
                            {renderQuestionActions(question)}
                            {commentBoxVisible[question._id] && (
                                <div>
                                    <div className="comment-box">
                                        <textarea
                                            value={commentText}
                                            onChange={(e) => setCommentText(e.target.value)}
                                            placeholder="Write a comment..."
                                        />
                                        <button className="send-icon" onClick={() => handleCommentSubmit(question._id, true)}>
                                            <img src={sendlogo} alt="Send" className="icon" />
                                        </button>
                                    </div>
                                    <div className="comments-list">
                                        {comments[question._id] && comments[question._id].map(comment => (
                                            <div key={comment._id} className="comment">
                                                <p>{comment.text}</p>
                                                <small>commented by {comment.author}</small>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </>
        );
        case 'explore':
                return <ExploreTopics />;
            case 'chat':
                return <Chat />;
                case 'myQuestions':
                return (
                    <div className="questions-list">
                        {questions.map(question => (
                            <div key={question._id} className="question">
                                <h2>{question.title}</h2>
                                <p>{question.description}</p>
                                <small>asked by {question.author} {new Date(question.createdAt).toLocaleTimeString()} ago</small>
                                {renderQuestionActions(question)}
                                {commentBoxVisible[question._id] && (
                                    <div>
                                        <div className="comment-box">
                                            <textarea
                                                value={commentText}
                                                onChange={(e) => setCommentText(e.target.value)}
                                                placeholder="Write a comment..."
                                            />
                                            <button className="send-icon" onClick={() => handleCommentSubmit(question._id, true)}>
                                                <img src={sendlogo} alt="Send" className="icon" />
                                            </button>
                                        </div>
                                        <div className="comments-list">
                                            {comments[question._id] && comments[question._id].map(comment => (
                                                <div key={comment._id} className="comment">
                                                    <p>{comment.text}</p>
                                                    <small>commented by {comment.author}</small>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="forum-page">
            <header className="forum-header">
                <div className="forum-header-left">
                    <h1>C-Forum</h1>
                </div>
                <div className="forum-header-center">
                    <div className="search-bar">
                        <input
                            type="text"
                            placeholder="Search for Topics"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button>
                            <span role="img" aria-label="search">🔍</span>
                        </button>
                    </div>
                </div>
                <div className="forum-header-right">
                    <button onClick={handleLogout}>Logout</button>
                    <div className="profile-icon"><svg xmlns="http://www.w3.org/2000/svg" width="49" height="49" viewBox="1 -16 49 49" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-user-round"><path d="M18 20a6 6 0 0 0-12 0"/><circle cx="12" cy="10" r="4"/><circle cx="12" cy="12" r="10"/></svg></div>
                </div>
            </header>
            <aside className="forum-sidebar">
                <nav>
                    <ul>
                        <li className={activePage === 'home' ? 'active' : ''} onClick={() => setActivePage('home')}>Home</li>
                        <li className={activePage === 'explore' ? 'active' : ''} onClick={() => setActivePage('explore')}>Explore Topics</li>
                        <li className={activePage === 'chat' ? 'active' : ''} onClick={() => setActivePage('chat')}>Chats</li>
                        <li className={activePage === 'myQuestions' ? 'active' : ''} onClick={() => setActivePage('myQuestions')}>My Qns</li>
                    </ul>
                </nav>
            </aside>
            <main className="forum-main">
            {showQuestionForm ? (
  <AskQuestionForm   onQuestionSubmit={handleQuestionSubmit} onCancel={handleCancel} />
) : showCreatePostForm ? (
  <CreatePost onPostSubmit={handlePostSubmit} onCancel={handleCancel} />
) : (
  renderContent()
)}
            </main>
            <aside className="right-sidebar">
                    <button onClick={() => setShowQuestionForm(true)}><span>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"></path><path fill="currentColor" d="M11 11V5h2v6h6v2h-6v6h-2v-6H5v-2z"></path></svg> Question
  </span></button>
                    <button className='post' onClick={() => setShowCreatePostForm(true)}> <span>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"></path><path fill="currentColor" d="M11 11V5h2v6h6v2h-6v6h-2v-6H5v-2z"></path></svg> Create
  </span> </button>
                </aside>
        </div>
    );
}

export default Dashboard;
