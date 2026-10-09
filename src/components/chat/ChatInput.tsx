'use client'

import axios from 'axios'
import { FC, useRef, useState } from 'react'
import { toast } from 'sonner'
import TextareaAutosize from 'react-textarea-autosize'
import { Button } from '@/components/ui/button'

/**
 * Props for {@link ChatInput}.
 */
interface ChatInputProps {
  /** Conversation partner; their name appears in the input's placeholder. */
  chatPartner: User
  /** ID of the chat session that outgoing messages are posted to. */
  chatId: string
}

/**
 * Message composer for a chat session: an auto-growing textarea with a Post button.
 *
 * Enter (without Shift) sends and Shift+Enter makes a newline. On send, `{ text, chatId }`
 * is POSTed to `/api/message/send` and the textarea is cleared and refocused; while the
 * request is in flight the Post button is disabled.
 */
const ChatInput: FC<ChatInputProps> = ({ chatPartner, chatId }) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [input, setInput] = useState<string>('')

  /**
   * POSTs the current input to `/api/message/send`, then clears and refocuses the
   * textarea. No-op on empty input; failures degrade to a generic toast — the thrown
   * error is swallowed, so nothing is logged or surfaced beyond that message.
   */
  const sendMessage = async () => {
    if(!input) return
    setIsLoading(true)

    try {
      // NOTE: there is no route handler under src/app/api/message/send, so this request fails.
      await axios.post('/api/message/send', { text: input, chatId })
      setInput('')
      textareaRef.current?.focus()
    } catch {
      toast.error('Something went wrong. Please try again later.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='border-t border-gray-200 px-4 pt-4 mb-2 sm:mb-0'>
      <div className='relative flex-1 overflow-hidden rounded-lg shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-indigo-600'>
        <TextareaAutosize
          ref={textareaRef}
          onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              sendMessage()
            }
          }}
          rows={1}
          value={input}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInput(e.target.value)}
          placeholder={`Message ${chatPartner.name}`}
          className='block w-full resize-none border-0 bg-transparent text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:py-1.5 sm:text-sm sm:leading-6'
        />

        <div
          onClick={() => textareaRef.current?.focus()}
          className='py-2'
          aria-hidden='true'>
          <div className='py-px'>
            <div className='h-9' />
          </div>
        </div>

        <div className='absolute right-0 bottom-0 flex justify-between py-2 pl-3 pr-2'>
          <div className='flex-shrink-0'>
            <Button disabled={isLoading} onClick={sendMessage} type='submit'>
              Post
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatInput