'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import styles from './confetti.module.css';
import { Book } from 'lucide-react';

// Increase colors for more variety
const CONFETTI_COLORS = [
  '#FF577F', '#FF884B', '#FFDF6B', '#A2FF86', '#83C0C1', '#4E9BA5', 
  '#6F61C0', '#A084E8', '#8BE8E5', '#FF8AAE', '#FB9470', '#FEC868',
  '#EBF400', '#5FBDFF', '#7091F5', '#97FFF4', '#FFABE1', '#F1F7B5'
];

// Add more shapes for variety
const SHAPES = ['square', 'circle', 'triangle', 'star', 'heart', 'diamond'];

export default function Confetti() {
  const [confetti, setConfetti] = useState<JSX.Element[]>([]);
  const [showMessage, setShowMessage] = useState(false);
  const searchParams = useSearchParams();
  const success = searchParams.get('success');

  useEffect(() => {
    // Only trigger confetti if success parameter is 'true'
    if (success !== 'true') return;

    const pieces: JSX.Element[] = [];
    // Increase number of pieces for more impact
    const TOTAL_PIECES = 300;
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    
    // Create more confetti pieces
    for (let i = 0; i < TOTAL_PIECES; i++) {
      // Create a random angle and distance from center for explosion effect
      const angle = Math.random() * Math.PI * 2; // 0 to 2π
      const maxDistance = Math.min(window.innerWidth, window.innerHeight) * 0.7;
      const distance = Math.random() * maxDistance;
      
      // Calculate final position based on angle and distance
      const finalX = Math.cos(angle) * distance;
      const finalY = Math.sin(angle) * distance;
      
      // Random size between 5px and 15px
      const size = Math.floor(Math.random() * 10) + 5;
      
      // Random shape
      const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
      
      // Random color
      const color = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
      
      // Random rotation
      const rotationStart = Math.random() * 360;
      const rotationEnd = rotationStart + Math.random() * 720 - 360; // -360 to 360 degrees more
      
      // Random duration between 3 and 7 seconds
      const duration = Math.random() * 4 + 3;
      
      // Add delay for some pieces to create more natural effect (0-0.5s)
      const delay = Math.random() * 0.5;
      
      const style = {
        '--final-left': `${finalX}px`,
        '--final-top': `${finalY}px`,
        '--rotation-start': `${rotationStart}deg`,
        '--rotation-end': `${rotationEnd}deg`,
        'left': `${centerX}px`,
        'top': `${centerY}px`,
        'width': `${size}px`,
        'height': `${size}px`,
        'backgroundColor': color,
        'color': color,
        '--duration': `${duration}s`,
        'animationDelay': `${delay}s`,
        'zIndex': `${Math.floor(Math.random() * 10) + 9990}`
      } as React.CSSProperties;

      pieces.push(
        <div
          key={i}
          className={`${styles.confettiPiece} ${styles[shape]} ${styles.animate}`}
          style={style}
        />
      );
    }

    setConfetti(pieces);
    
    // Show success message
    setShowMessage(true);
    
    // Hide confetti after 7 seconds to clean up
    const timeout = setTimeout(() => {
      setConfetti([]);
      setShowMessage(false);
    }, 7000);
    
    return () => clearTimeout(timeout);
  }, [success]); // Add success as a dependency

  // Don't render anything if confetti should not be shown
  if (!showMessage || !confetti.length) return null;

  return (
    <div className={styles.confettiContainer}>
      {confetti}
      {showMessage && (
        <div className={styles.successMessage}>
          <Book className="mr-2" size={24} /> Lesson completed!
        </div>
      )}
    </div>
  );
} 