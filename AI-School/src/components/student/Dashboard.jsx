import React from "react";
import CourseList from "./CourseList"; 
import Categories from "./Categories";
import MainContent from "./MainContent";


const Dashboard = () => {
  return (
    <div className="p-6 w-[ calc(100vw - 300px)] max-w-[calc(100vw - 300px)] ml-[300px] overflow-auto mt-[25px] overflow-x-hidden">
      <MainContent />
      <div className="mt-10">
        <CourseList />
      </div>
      <div className="mt-10">
        <Categories />
      </div>
    </div>
  );
};

export default Dashboard;
