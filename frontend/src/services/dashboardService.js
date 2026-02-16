// Simulated API calls (replace with real API later)

export const fetchUserProfile = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        name: "John Doe",
        department: "Computer Science",
        year: "3rd Year"
      });
    }, 800);
  });
};

export const fetchCourses = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(["React Basics", "Data Structures"]);
    }, 800);
  });
};

export const fetchPeers = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { name: "Priya Sharma", department: "AI & ML" },
        { name: "Rahul Verma", department: "Data Science" },
        { name: "Ananya Rao", department: "Cyber Security" }
      ]);
    }, 800);
  });
};
