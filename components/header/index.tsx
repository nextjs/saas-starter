'use client';

import Link from 'next/link'
import React, { Suspense } from 'react'
import { CircleIcon } from 'lucide-react'

import UserMenu from '../user-menu'

const Header = () => {
    return (
        <header className="border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                <Link href="/" className="flex items-center">
                    <CircleIcon className="h-6 w-6 text-orange-500" />
                    <span className="ml-2 text-xl font-semibold text-gray-900">ACME</span>
                </Link>
                <div className="flex items-center space-x-4">
                    <Suspense fallback={<div className="h-9" />}>
                        <UserMenu />
                    </Suspense>
                </div>
            </div>
        </header>
    )
}

export default Header
