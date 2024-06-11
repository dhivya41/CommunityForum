// TopicDetail.js
import React from 'react';
import './TopicDetail.css'; // Add this CSS file for styling

function TopicDetail({ topic }) {
    if (!topic) return null; // If no topic is passed, don't render anything

    return (
        <div className="topic-detail">
            <h2>{topic.title}</h2>
            <p>{topic.description}</p>
            <small>posted by {topic.author} {new Date(topic.createdAt).toLocaleTimeString()} ago</small>
            <div className="topic-actions">
                <button>
                    <img src={dwnldlogo} alt="Download" className="icon" />
                </button>
                <button onClick={() => handleCommentClick(topic._id)}>
                    <img src={cmtlogo} alt="Comment" className="icon" />
                    <span className="comment-count">{topic.commentCount}</span>
                </button>
                <button onClick={() => handleLike(topic._id)}>
                    <img src={likelogo} alt="Like" className="icon" />
                    <span className="like-count">{topic.likeCount}</span>
                </button>
                <button onClick={() => handleUnlike(topic._id)}>
                    <img src={unlikelogo} alt="Unlike" id="unlikeicon" className="icon" />
                </button>
                <button onClick={() => handleDelete(topic._id)}>
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
                        <button className="send-icon" onClick={() => handleCommentSubmit(topic._id)}>
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
    );
}

export default TopicDetail;
