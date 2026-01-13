'use client'

import Link from 'next/link'
import { ArrowLeft, AlertCircle } from 'lucide-react'
import { Card } from './Card'
import { Layout } from './Layout'

interface PageTemplateProps {
  title: string
  description: string
  children?: React.ReactNode
  showBack?: boolean
  backLink?: string
}

export function PageTemplate({
  title,
  description,
  children,
  showBack = true,
  backLink = '/preview',
}: PageTemplateProps) {
  return (
    <Layout>
      <div className="p-6">
        <div className="max-w-2xl mx-auto">
        {showBack && (
          <Link
            href={backLink}
            className="flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-8 transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Route Hub
          </Link>
        )}

        <Card
          title={title}
          description={description}
          footer={
            <div className="flex items-center gap-2 text-amber-400">
              <AlertCircle size={16} />
              <span className="text-sm">This is a stub page. Implementation coming soon.</span>
            </div>
          }
        >
          {children ? (
            children
          ) : (
            <div className="space-y-4">
              <p className="text-gray-300">
                This page is ready for implementation. Add your content and functionality here.
              </p>
              <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                <p className="text-sm text-gray-400 font-mono">
                  Route: <code className="text-blue-300">{title}</code>
                </p>
              </div>
            </div>
          )}
        </Card>
        </div>
      </div>
    </Layout>
  )
}
