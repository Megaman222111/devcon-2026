import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface MarkdownRendererProps {
  content: string
}

const availableLessonImages = new Set([
  'c02-complaint-process-flow.png',
])

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ children }) => <h1 className="font-display font-bold text-3xl text-black mb-6">{children}</h1>,
        h2: ({ children }) => <h2 className="font-display font-semibold text-2xl text-black mt-8 mb-4">{children}</h2>,
        h3: ({ children }) => <h3 className="font-semibold text-xl text-black mt-6 mb-3">{children}</h3>,
        p: ({ children }) => <p className="text-black leading-relaxed mb-4">{children}</p>,
        ul: ({ children }) => <ul className="list-disc pl-6 text-black space-y-2 mb-5">{children}</ul>,
        ol: ({ children }) => <ol className="list-decimal pl-6 text-black space-y-2 mb-5">{children}</ol>,
        li: ({ children }) => <li>{children}</li>,
        strong: ({ children }) => <strong className="text-black font-semibold">{children}</strong>,
        em: ({ children }) => <em className="text-black italic">{children}</em>,
        blockquote: ({ children }) => (
          <blockquote className="border-l-4 border-amber-500 bg-amber-50 px-4 py-3 rounded-r-lg text-black mb-5">
            {children}
          </blockquote>
        ),
        code: ({ children }) => (
          <code className="bg-navy-700 text-amber-300 px-1.5 py-0.5 rounded text-sm">{children}</code>
        ),
        a: ({ href, children }) => (
          <a href={href} className="text-amber-400 hover:text-amber-300 underline" target="_blank" rel="noreferrer">
            {children}
          </a>
        ),
        img: ({ src, alt }) => {
          const rawSrc = typeof src === 'string' ? src : ''
          const fileName = rawSrc.split('/').pop() ?? ''

          if (!availableLessonImages.has(fileName)) {
            return (
              <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                Image not available yet: {alt ?? fileName}
              </div>
            )
          }

          return (
            <figure className="mb-5">
              <img
                src={`/lesson-images/${fileName}`}
                alt={alt ?? fileName}
                className="max-w-full h-auto rounded-lg border border-navy-300"
              />
              {alt && <figcaption className="mt-2 text-sm text-navy-700">{alt}</figcaption>}
            </figure>
          )
        },
        hr: () => <hr className="border-navy-600 my-8" />,
      }}
    >
      {content}
    </ReactMarkdown>
  )
}
