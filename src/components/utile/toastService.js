// src/components/utile/toastService.js
import { toast } from 'react-toastify';

const ToastService = {
  success: (message) => {
    toast.success(message, {
        position: "top-right",  // Ensure this is correct
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
    });
  },
  error: (message) => {
    toast.error(message, {
       position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
    });
  },
  info: (message) => {
    toast.info(message, {
       position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
    });
  },
  warning: (message) => {
    toast.warning(message, {
       position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
    });
  },
};

export default ToastService;
