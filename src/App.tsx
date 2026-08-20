import { useEffect, useState } from 'react'
import {
  AlertCircle,
  Check,
  Copy,
  ExternalLink,
  Link2,
  LoaderCircle,
} from 'lucide-react'
import {
  ApiRequestError,
  NetworkRequestError,
  getApiHealth,
  shortenUrl,
} from './api/urlShortenerApi'
import type { ApiHealth, ShortLink } from './types/url'
import { getShortCode, isHttpUrl } from './utils/url'

type ShortenState =
  | 'idle'
  | 'typing'
  | 'invalid'
  | 'loading'
  | 'success'
  | 'api-error'
  | 'network-error'

type CopyState = 'idle' | 'copying' | 'copied' | 'error'

const apiStatusText: Record<ApiHealth, string> = {
  checking: 'Checking API',
  online: 'API online',
  offline: 'API offline',
}

function App() {
  const [originalUrl, setOriginalUrl] = useState('')
  const [shortLink, setShortLink] = useState<ShortLink | null>(null)
  const [apiHealth, setApiHealth] = useState<ApiHealth>('checking')
  const [shortenState, setShortenState] = useState<ShortenState>('idle')
  const [copyState, setCopyState] = useState<CopyState>('idle')
  const [message, setMessage] = useState('Paste a full URL to begin.')

  const trimmedUrl = originalUrl.trim()
  const isLoading = shortenState === 'loading'

  useEffect(() => {
    let isMounted = true

    getApiHealth()
      .then(() => {
        if (isMounted) {
          setApiHealth('online')
        }
      })
      .catch(() => {
        if (isMounted) {
          setApiHealth('offline')
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  const handleUrlChange = (value: string) => {
    setOriginalUrl(value)
    setCopyState('idle')

    const nextUrl = value.trim()

    if (!nextUrl) {
      setShortenState('idle')
      setShortLink(null)
      setMessage('Paste a full URL to begin.')
      return
    }

    if (nextUrl !== shortLink?.originalUrl) {
      setShortLink(null)
    }

    setShortenState('typing')
    setMessage('Ready when the URL starts with http:// or https://.')
  }

  const handleUrlBlur = () => {
    if (trimmedUrl && !isHttpUrl(trimmedUrl)) {
      setShortenState('invalid')
      setMessage('Enter a valid http:// or https:// URL.')
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!trimmedUrl) {
      setShortenState('idle')
      setMessage('Paste a URL before shortening.')
      return
    }

    if (!isHttpUrl(trimmedUrl)) {
      setShortenState('invalid')
      setMessage('Enter a valid http:// or https:// URL.')
      return
    }

    setShortenState('loading')
    setMessage('Creating a short link...')
    setCopyState('idle')

    try {
      const nextShortLink = await shortenUrl(trimmedUrl)
      setShortLink(nextShortLink)
      setShortenState('success')
      setMessage('Short URL created.')
    } catch (error) {
      if (error instanceof NetworkRequestError) {
        setShortenState('network-error')
        setMessage('Network failure. Confirm the backend URL and try again.')
        return
      }

      setShortenState('api-error')
      setMessage(
        error instanceof ApiRequestError
          ? error.message
          : 'API failure. The URL could not be shortened.',
      )
    }
  }

  const copyShortUrl = async () => {
    if (!shortLink) {
      return
    }

    setCopyState('copying')

    try {
      await navigator.clipboard.writeText(shortLink.shortUrl)
      setCopyState('copied')
      window.setTimeout(() => setCopyState('idle'), 1800)
    } catch {
      setCopyState('error')
    }
  }

  const buttonLabel =
    shortenState === 'loading'
      ? 'Shortening...'
      : shortenState === 'success'
        ? 'Shortened'
        : 'Shorten URL'

  const copyLabel =
    copyState === 'copying' ? 'Copying...' : copyState === 'copied' ? 'Copied' : 'Copy'

  const isProblemState =
    shortenState === 'invalid' ||
    shortenState === 'api-error' ||
    shortenState === 'network-error' ||
    copyState === 'error'

  return (
    <main className="min-h-svh bg-[#f7f7f4] px-4 py-6 text-[#17202a] sm:px-6 sm:py-8">
      <div className="mx-auto flex min-h-[calc(100svh-3rem)] w-full max-w-[760px] flex-col sm:min-h-[calc(100svh-4rem)]">
        <header className="flex items-center justify-between gap-4">
          <a
            className="group flex min-w-0 items-center gap-3 text-[#17202a] no-underline outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb]/30"
            href="/"
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-[#d9ded6] bg-white text-[#2563eb] transition-colors group-hover:border-[#b9c7da]">
              <Link2 size={18} strokeWidth={2.4} aria-hidden="true" />
            </span>
            <span className="truncate text-[15px] font-semibold">URL Shortner</span>
          </a>

          <div className="flex shrink-0 items-center gap-2 rounded-full border border-[#d9ded6] bg-white px-3 py-1.5 text-[12px] font-medium text-[#5d675d]">
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                apiHealth === 'online'
                  ? 'bg-[#16833b]'
                  : apiHealth === 'offline'
                    ? 'bg-[#d64545]'
                    : 'bg-[#a1a79d]'
              }`}
            />
            {apiStatusText[apiHealth]}
          </div>
        </header>

        <section className="flex flex-1 items-center py-12 sm:py-16">
          <div className="w-full">
            <div className="mb-8 max-w-[560px]">
              <p className="mb-3 text-[13px] font-medium text-[#2563eb]">
                Developer links, cleaned up
              </p>
              <h1 className="text-[34px] font-semibold leading-[1.12] text-[#111816] sm:text-[42px]">
                Shorten your links.
              </h1>
              <p className="mt-4 max-w-[520px] text-[16px] leading-7 text-[#5f685e] sm:text-[17px]">
                Paste a long URL and get a compact short link you can copy in
                one click.
              </p>
            </div>

            <form
              className="overflow-hidden rounded-lg border border-[#d9ded6] bg-white shadow-[0_1px_2px_rgba(22,24,22,0.04)]"
              onSubmit={handleSubmit}
            >
              <div className="border-b border-[#e6e9e1] px-4 py-3 sm:px-5">
                <div className="flex items-center justify-between gap-3">
                  <label
                    className="text-[13px] font-semibold text-[#18201b]"
                    htmlFor="original-url"
                  >
                    Long URL
                  </label>
                  <span className="hidden text-[12px] font-medium text-[#7b8378] sm:inline">
                    Enter to shorten
                  </span>
                </div>
              </div>

              <div className="grid gap-0 sm:grid-cols-[1fr_auto]">
                <div className="flex min-h-[60px] items-center gap-3 px-4 sm:px-5">
                  <Link2
                    className="shrink-0 text-[#7c867a]"
                    size={19}
                    aria-hidden="true"
                  />
                  <input
                    aria-describedby="url-status"
                    aria-invalid={shortenState === 'invalid'}
                    autoComplete="url"
                    className="h-[60px] min-w-0 flex-1 border-0 bg-transparent text-[16px] font-medium text-[#111816] outline-none placeholder:text-[#9aa196]"
                    id="original-url"
                    name="originalUrl"
                    onBlur={handleUrlBlur}
                    onChange={(event) => handleUrlChange(event.target.value)}
                    placeholder="https://example.com/a/very/long/url"
                    type="url"
                    value={originalUrl}
                  />
                </div>

                <button
                  className="mx-3 mb-3 inline-flex h-11 items-center justify-center gap-2 rounded-md bg-[#2563eb] px-5 text-[14px] font-semibold text-white transition-[background-color,transform] duration-150 hover:-translate-y-px hover:bg-[#1f57d6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb]/30 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0 sm:mx-2 sm:my-2 sm:h-auto sm:min-w-[142px]"
                  disabled={isLoading || !trimmedUrl}
                  type="submit"
                >
                  {isLoading ? (
                    <LoaderCircle
                      className="animate-spin"
                      size={17}
                      aria-hidden="true"
                    />
                  ) : null}
                  {buttonLabel}
                </button>
              </div>

              <div
                className={`flex min-h-11 items-center gap-2 border-t px-4 py-3 text-[13px] font-medium sm:px-5 ${
                  isProblemState
                    ? 'border-[#f0d2cd] bg-[#fff8f7] text-[#b42318]'
                    : 'border-[#e6e9e1] bg-[#fbfbf8] text-[#657064]'
                }`}
                id="url-status"
                role="status"
              >
                {isProblemState ? (
                  <AlertCircle size={15} aria-hidden="true" />
                ) : shortenState === 'success' || copyState === 'copied' ? (
                  <Check size={15} aria-hidden="true" />
                ) : null}
                <span>
                  {copyState === 'error'
                    ? 'Copy failed. Select the short URL and copy it manually.'
                    : copyState === 'copied'
                      ? 'Short URL copied.'
                      : message}
                </span>
              </div>

              <div className="border-t border-[#e6e9e1] bg-white px-4 py-4 sm:px-5">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <p className="text-[13px] font-semibold text-[#18201b]">
                    Short URL
                  </p>
                  {shortLink ? (
                    <span className="rounded-md bg-[#eef3ff] px-2 py-1 text-[12px] font-semibold text-[#2563eb]">
                      {getShortCode(shortLink.shortUrl)}
                    </span>
                  ) : null}
                </div>

                {shortLink ? (
                  <div className="animate-[result-in_160ms_ease-out] rounded-md border border-[#d9ded6] bg-[#fbfbf8] p-2">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                      <a
                        className="min-w-0 flex-1 truncate rounded-sm px-2 py-2 text-[15px] font-semibold text-[#174ea6] no-underline outline-none [font-family:'JetBrains_Mono',ui-monospace,SFMono-Regular,Consolas,monospace] hover:underline focus-visible:ring-2 focus-visible:ring-[#2563eb]/30"
                        href={shortLink.shortUrl}
                        target="_blank"
                      >
                        {shortLink.shortUrl}
                      </a>
                      <div className="grid grid-cols-[1fr_auto] gap-2 sm:flex">
                        <button
                          className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-[#cfd7cc] bg-white px-4 text-[13px] font-semibold text-[#17202a] transition-colors hover:border-[#b9c7da] hover:bg-[#f5f7fb] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb]/30"
                          onClick={copyShortUrl}
                          type="button"
                        >
                          {copyState === 'copied' ? (
                            <Check size={15} aria-hidden="true" />
                          ) : (
                            <Copy size={15} aria-hidden="true" />
                          )}
                          {copyLabel}
                        </button>
                        <a
                          className="grid h-10 w-10 place-items-center rounded-md border border-[#cfd7cc] bg-white text-[#17202a] transition-colors hover:border-[#b9c7da] hover:bg-[#f5f7fb] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb]/30"
                          href={shortLink.shortUrl}
                          target="_blank"
                          aria-label="Open short URL"
                        >
                          <ExternalLink size={16} aria-hidden="true" />
                        </a>
                      </div>
                    </div>
                    <p className="mt-2 truncate px-2 text-[12px] font-medium text-[#7a8377]">
                      Destination: {shortLink.originalUrl}
                    </p>
                  </div>
                ) : (
                  <div className="rounded-md border border-dashed border-[#d9ded6] bg-[#fbfbf8] px-4 py-5 text-[14px] font-medium text-[#7a8377]">
                    Your shortened link will appear here.
                  </div>
                )}
              </div>
            </form>

            <p className="mt-4 text-[12px] font-medium text-[#7a8377]">
              Only complete HTTP and HTTPS URLs are accepted.
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}

export default App