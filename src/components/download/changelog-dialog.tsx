'use client'

import { FileText, LoaderCircle } from 'lucide-react'
import { useEffect, useState } from 'react'

import { Button } from '~/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog'
import {
  changelogApiPath,
  changelogSchema,
  type ChangelogChannel,
} from '~/lib/changelog'
import { m } from '~/paraglide/messages'
import { getLocale } from '~/paraglide/runtime'

interface ChangelogDialogProps {
  channel: ChangelogChannel
  version: string
}

export const ChangelogDialog = ({ channel, version }: ChangelogDialogProps) => {
  const [open, setOpen] = useState(false)
  const [html, setHtml] = useState<string>()
  const [failed, setFailed] = useState(false)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (!open || html !== undefined) {
      return
    }

    const controller = new AbortController()
    setFailed(false)

    const load = async () => {
      try {
        const response = await fetch(changelogApiPath(channel, getLocale()), {
          signal: controller.signal,
        })
        if (!response.ok) {
          throw new Error(`Changelog responded with ${response.status}`)
        }
        setHtml(changelogSchema.parse(await response.json()).html)
      } catch {
        if (!controller.signal.aborted) {
          setFailed(true)
        }
      }
    }

    void load()

    return () => controller.abort()
  }, [attempt, channel, html, open])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          data-testid={`changelog-${channel}`}
        >
          <FileText className="h-4 w-4" />
          {m.changelog()}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{m.changelog()}</DialogTitle>
          <DialogDescription>
            {channel === 'beta' ? m.beta() : m.stable()} &middot; {version}
          </DialogDescription>
        </DialogHeader>
        {html !== undefined ? (
          <div
            className="prose prose-sm max-h-[60vh] max-w-none overflow-y-auto dark:prose-invert"
            // The markup is produced and sanitized on the server by
            // renderChangelog, mirroring how the explore page renders content.
            dangerouslySetInnerHTML={{ __html: html }}
          />
        ) : failed ? (
          <div className="flex h-40 flex-col items-center justify-center gap-4">
            <p className="text-sm">{m.errorMessage()}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAttempt((current) => current + 1)}
            >
              {m.reload()}
            </Button>
          </div>
        ) : (
          <div className="flex h-40 flex-col items-center justify-center gap-3 text-muted-foreground">
            <LoaderCircle className="h-6 w-6 animate-spin" />
            <span className="text-sm">{m.nowLoading()}</span>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
