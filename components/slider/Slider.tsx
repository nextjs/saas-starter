"use client";

import React, { useEffect, useRef, useState } from "react";
import styles from "./slider.module.css";
import { videos } from "./videos";

export default function Slider() {
  const gridRef = useRef<HTMLDivElement | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.grid} ref={gridRef}>
        {videos.map((video) => (
          <article className={styles.card} key={video.id}>
            <header className={styles.cardInfo}>
              <div className={styles.cardItem}>
                <p>{video.date}</p>
              </div>
              <div className={styles.cardItem}>
                <p>{video.title}</p>
              </div>
              <div className={styles.cardItem}>
                <p>{video.category}</p>
              </div>
            </header>

            <div className={styles.media}>
              {isClient &&
                (video.src ? (
                  <video
                    src={video.src}
                    className={`${styles.mediaEl} ${styles.mediaVideo}`}
                    autoPlay
                    loop
                    muted
                    playsInline
                  />
                ) : (
                  <iframe
                    src={`https://player.vimeo.com/video/${video.id}?background=1&autoplay=1&loop=1&muted=1`}
                    allow="autoplay; fullscreen; picture-in-picture"
                    className={styles.mediaEl}
                    title={video.title}
                  />
                ))}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
