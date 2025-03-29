import { useRef } from "react";
import { useInView } from "motion/react";
import { motion } from "motion/react";
import Typewriter from 'typewriter-effect';

// 创建一个动画包装组件
export default function AnimateOnView({
  children,
  animation = "fade-up",
  delay = 0,
  className,
  typewriter = false, // 新增打字机效果选项
  typewriterStrings = [],
}: {
  children: React.ReactNode;
  animation?: "fade-up" | "fade-left" | "fade-right" | "fade" | "scale";
  delay?: number;
  className?: string;
  typewriter?: boolean;
  typewriterStrings?: string[];
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, {});

  // 如果启用打字机效果且children是文本
  if (typewriter) {
    return (
      <motion.div
        className={className}
        ref={ref}
        initial={{ opacity: 0 }}
        animate={{ opacity: isInView ? 1 : 0 }}
        transition={{ duration: 0.5, delay }}
      >
        <Typewriter
          options={{
            strings: typewriterStrings,
            autoStart: true,
            loop: false,
          }}
        />
      </motion.div>
    );
  }

  const getAnimationProps = () => {
    switch (animation) {
      case "fade-up":
        return {
          initial: { y: 100, opacity: 0 },
          animate: {
            y: isInView ? 0 : 100,
            opacity: isInView ? 1 : 0,
          },
        };
      case "fade-left":
        return {
          initial: { x: -100, opacity: 0 },
          animate: {
            x: isInView ? 0 : -100,
            opacity: isInView ? 1 : 0,
          },
        };
      case "fade-right":
        return {
          initial: { x: 100, opacity: 0 },
          animate: {
            x: isInView ? 0 : 100,
            opacity: isInView ? 1 : 0,
          },
        };
      case "fade":
        return {
          initial: { opacity: 0 },
          animate: {
            opacity: isInView ? 1 : 0,
          },
        };
      case "scale":
        return {
          initial: { scale: 0 },
          animate: {
            scale: isInView ? 1 : 0,
          },
        };
    }
  };

  return (
    <motion.div
      className={className}
      ref={ref}
      {...getAnimationProps()}
      transition={{ duration: 0.5, delay }}
    >
      {children}
    </motion.div>
  );
};
