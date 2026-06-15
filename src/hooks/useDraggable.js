import { useRef, useCallback, useEffect, useState } from 'react';

export const useDraggable = (initialPosition = { x: 0, y: 0 }) => {
  const [position, setPosition] = useState(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const elementRef = useRef(null);

  const handleMouseDown = useCallback((e) => {
    if (!elementRef.current) return;
    
    // Only drag from header/handle, not from content
    const dragHandle = e.target.closest('.panel-drag-handle');
    if (!dragHandle) return;
    
    // Don't drag if clicking the close button
    if (e.target.closest('.close-btn')) return;
    
    setIsDragging(true);
    const rect = elementRef.current.getBoundingClientRect();
    dragOffsetRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }, []);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e) => {
      if (!elementRef.current) return;
      
      // Get the parent workspace bounds
      const workspace = elementRef.current.parentElement;
      if (!workspace) return;

      const workspaceRect = workspace.getBoundingClientRect();
      let newX = e.clientX - workspaceRect.left - dragOffsetRef.current.x;
      let newY = e.clientY - workspaceRect.top - dragOffsetRef.current.y;

      // Clamp to viewport bounds with some padding
      const elementWidth = elementRef.current?.offsetWidth || 0;
      const elementHeight = elementRef.current?.offsetHeight || 0;
      
      newX = Math.max(0, Math.min(newX, workspaceRect.width - elementWidth));
      newY = Math.max(0, Math.min(newY, workspaceRect.height - elementHeight));

      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  return {
    elementRef,
    position,
    setPosition,
    isDragging,
    handleMouseDown,
    style: {
      position: 'absolute',
      left: `${position.x}px`,
      top: `${position.y}px`,
      cursor: isDragging ? 'grabbing' : 'grab',
    },
  };
};

export default useDraggable;
