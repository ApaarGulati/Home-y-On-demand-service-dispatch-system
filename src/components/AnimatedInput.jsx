import React from 'react'


import { useState, useEffect } from "react";

export const AnimatedInput = ({ 
  placeholders = ["Search...", "Find products...", "Get help..."], 
  type = "text", 
  className = "",onChange, 
  ...passedProps 
}) => {
  const [currentText, setCurrentText] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentWord = placeholders[wordIndex];
    
    // Determine the next action: typing, deleting, or pausing
    const timeout = setTimeout(() => {
      if (!isDeleting && charIndex < currentWord.length) {
        // 1. Typing: Add next character
        setCurrentText(currentWord.slice(0, charIndex + 1));
        setCharIndex((prev) => prev + 1);
      } else if (isDeleting && charIndex > 0) {
        // 2. Deleting: Remove character
        setCurrentText(currentWord.slice(0, charIndex - 1));
        setCharIndex((prev) => prev - 1);
      } else if (!isDeleting && charIndex === currentWord.length) {
        // 3. Pause at the end: Start deleting after 2s
        setTimeout(() => setIsDeleting(true), 2000);
      } else if (isDeleting && charIndex === 0) {
        // 4. Word finished: Move to next word in array
        setIsDeleting(false);
        setWordIndex((prev) => (prev + 1) % placeholders.length);
      }
    }, isDeleting ? 50 : 150); // Faster speed for deleting

    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, wordIndex, placeholders]);

  return (
    <input
      type={type}
      onChange={onChange}
      placeholder={currentText}
      className={`p-2 border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-blue-500 transition-all ${className}`}
      {...passedProps}
    />
  );
};
