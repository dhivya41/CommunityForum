import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Loginpage from "./Loginpage";
import SignupPage from "./SignupPage";
import Dashboard from "./Dashboard";
import Exploretopics from "./Exploretopics";
import TopicDetail from "./TopicDetail";
import TopicsList from "./TopicList";
import Chat from "./Chat";
import { UserProvider } from './UserContext'; 
import AskQuestionForm from "./AskQuestionForm";
import CreatePost from "./CreatePost";

const container = document.getElementById("root");
const root = createRoot(container);

root.render(
  <UserProvider>
  <Router>
    <Routes>  
    <Route path="/" Component={Dashboard} /> 
      <Route path="/login" Component={Loginpage } />
      <Route path="/signup" Component={SignupPage } />   
      <Route path="/explore"Component={Exploretopics} />  
      <Route path="/topics/category/:category" Component={TopicsList}/>
      <Route path="/topics/:id" Component={TopicDetail}/>
      <Route path="chat"Component={Chat}/>
      <Route path="questions"Component={AskQuestionForm}/>
      <Route path="topics"Component={CreatePost}/>

    </Routes>
  </Router>
  </UserProvider>
);
