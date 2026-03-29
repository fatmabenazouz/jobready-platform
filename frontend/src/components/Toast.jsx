   import React, { useEffect, useState } from 'react';
   import './Toast.css';
   
   const Toast = ({ message, onClose }) => {
     const [visible, setVisible] = useState(false);
   
     useEffect(() => {
       if (message) {
         setVisible(true);
         const timer = setTimeout(() => {
           setVisible(false);
           setTimeout(onClose, 300);
         }, 3000);
         return () => clearTimeout(timer);
       }
     }, [message, onClose]);
   
     if (!message) return null;
   
     return (
       <div className={`toast ${visible ? 'toast--show' : ''}`}>
         <span className="toast__msg">{message}</span>
       </div>
     );
   };
   
   export default Toast;