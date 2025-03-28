import { Button } from '@/components/ui/button'
import React from 'react'
import Link from 'next/link'

export default function Nav() {
  return (
    <div className='flex items-center gap-4 text-white text-sm'>
      {/* <Link href='/pricing'>Pricing</Link> */}
      <Button className='bg-white text-black h-auto hover:bg-gray-100'>
        <Link href='/home'>Luanch App</Link>
      </Button>
    </div>
  )
}
