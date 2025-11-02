// components/modals/LLMModal.jsx
import React, { useState, useEffect } from 'react';
import { Loader2, Copy, Check, X, RefreshCw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
// If your Markdown may contain raw HTML you trust, uncomment rehypeRaw below
// import rehypeRaw from 'rehype-raw';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
// import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'; // optional theme

const LLMModal = ({ 
  isOpen, 
  onClose, 
  title, 
  description,
  fetchFunction,
  icon: Icon,
  gradient = 'from-blue-500 to-indigo-500'
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState('');
  const [error, setError] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchResponse();
    }
    return () => {
      setResponse('');
      setError('');
      setIsCopied(false);
    };
  }, [isOpen]);

  const fetchResponse = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await fetchFunction();
      setResponse(
        data?.response ??
        data?.steps ??
        data?.message ??
        data?.data?.chat ??
        JSON.stringify(data, null, 2)
      );
    } catch (err) {
      console.error('Error fetching LLM response:', err);
      setError(err?.response?.data?.message || 'Failed to generate response. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(String(response ?? ''));
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-fadeIn">
        {/* Header */}
        <div className={`bg-gradient-to-r ${gradient} p-6 text-white`}>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              {Icon && (
                <div className="bg-white/20 p-2 rounded-lg">
                  <Icon size={24} />
                </div>
              )}
              <div>
                <h3 className="text-2xl font-bold">{title}</h3>
                <p className="text-white/90 text-sm mt-1">{description}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors p-1"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
              <p className="text-gray-600 font-medium">Generating AI response...</p>
              <p className="text-gray-400 text-sm mt-2">This may take a few moments</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 text-center">
              <div className="text-red-600 mb-3">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-red-700 font-medium mb-4">{error}</p>
              <button
                onClick={fetchResponse}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                <RefreshCw size={16} />
                Try Again
              </button>
            </div>
          ) : response ? (
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl p-6 border-2 border-blue-100">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    AI Generated Response
                  </h4>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors font-medium"
                  >
                    {isCopied ? (
                      <>
                        <Check size={16} className="text-green-600" />
                        <span className="text-green-600">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={16} />
                        Copy
                      </>
                    )}
                  </button>
                </div>

                {/* Render Markdown */}
                <div className="bg-white rounded-lg p-4 border border-gray-200 overflow-x-auto">
                  {/* Wrap with your styling element instead of using className on ReactMarkdown */}
                  <div className="prose max-w-none prose-pre:whitespace-pre-wrap">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      // rehypePlugins={[rehypeRaw]} // ⚠️ enable only for trusted HTML in Markdown
                      components={{
                        // v9/v10: no className prop; inspect node.properties.className instead
                        code({ node, inline, children, ...props }) {
                          const cls = node?.properties?.className;
                          const langMatch = Array.isArray(cls)
                            ? /language-(\w+)/.exec(cls[0] || '')
                            : null;

                          if (!inline && langMatch) {
                            return (
                              <SyntaxHighlighter
                                language={langMatch[1]}
                                PreTag="div"
                                // style={oneDark} // optional theme
                                {...props}
                              >
                                {String(children).replace(/\n$/, '')}
                              </SyntaxHighlighter>
                            );
                          }

                          return (
                            <code className="px-1 py-0.5 rounded bg-gray-100" {...props}>
                              {children}
                            </code>
                          );
                        },
                      }}
                    >
                      {String(response ?? '')}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-center">
                <button
                  onClick={fetchResponse}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <RefreshCw size={16} />
                  Regenerate Response
                </button>
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full px-4 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default LLMModal;
