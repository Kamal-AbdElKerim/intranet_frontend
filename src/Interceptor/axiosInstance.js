import axios from 'axios';


const axiosInstance = axios.create({
    baseURL: 'http://localhost:8000/api/v1/',
    // timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    // withCredentials: true, // This is important for cookies
  });


  axiosInstance.interceptors.request.use(
    (config) => {
      // Get token from localStorage instead of cookies
      const token = localStorage.getItem('access_token');
      
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );


axiosInstance.interceptors.response.use(
  (response) => {
    return response; 
  },
  (error) => {
  
    if (error.response && error.response.status === 401) {
    
      console.error('Unauthorized access');
    }
    return Promise.reject(error); 
  }
);

export default axiosInstance;