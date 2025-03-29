'use client';
import React, { memo } from 'react'
import '@/app/assets/scss/bg-animate.scss';

function BgAnimate() {
  return (
    <div className='w-full h-full fixed top-0 left-0 z-[-1]'>
      <div className="bg-animate-container will-change-auto"></div>
    </div>
  )
}

export default memo(BgAnimate);