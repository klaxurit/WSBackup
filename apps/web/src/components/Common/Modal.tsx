import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string; // pour custom box si besoin
  overlayClassName?: string; // pour custom overlay si besoin
}

export const Modal: React.FC<ModalProps> = ({ open, onClose, children, className = '', overlayClassName = '' }) => {
  const [show, setShow] = useState(open);
  const [isAnimatedOpen, setIsAnimatedOpen] = useState(false);
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setShow(true);
      setTimeout(() => {
        setIsOverlayOpen(true);
        setIsAnimatedOpen(true);
      }, 10);
    } else {
      setIsAnimatedOpen(false);
      setIsOverlayOpen(false);
    }
  }, [open]);

  useEffect(() => {
    const handleTransitionEnd = () => {
      if (!open) {
        setIsOverlayOpen(false);
        setShow(false);
      }
    };
    const node = boxRef.current;
    if (node) {
      node.addEventListener('transitionend', handleTransitionEnd);
    }
    return () => {
      if (node) {
        node.removeEventListener('transitionend', handleTransitionEnd);
      }
    };
  }, [open]);

  if (!show) return null;

  const modalRoot = typeof window !== 'undefined' ? document.getElementById('modal-root') : null;

  const overlayClass = `ModalOverlay${isOverlayOpen ? ' open' : ''} ${overlayClassName}`;
  const boxClass = `ModalBox${isAnimatedOpen ? ' open' : ''} ${className}`;

  return ReactDOM.createPortal(
    <div className={overlayClass} onClick={onClose}>
      <div className={boxClass} onClick={e => e.stopPropagation()} ref={boxRef}>
        {children}
      </div>
    </div>,
    modalRoot || document.body
  );
}; 