'use client'

import { addFriendValidator } from '@/schema'
import axios, { AxiosError } from 'axios'
import { FC, useState } from 'react'
import { Button } from '@/components/ui/button'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

/** Props for {@link AddFriendButton}. Currently empty — the component takes no props. */
interface AddFriendButtonProps {}

/** Form shape inferred from {@link addFriendValidator}: `{ email: string }`. */
type FormData = z.infer<typeof addFriendValidator>

/**
 * Email form that sends a friend request via `POST /api/friends/add`.
 *
 * Validation runs client-side through {@link addFriendValidator} (zod) via
 * react-hook-form; zod and axios failures surface as an inline error message
 * under the input. On success the form swaps to a "Friend request sent!"
 * message (which does not reset on further submits).
 */
const AddFriendButton: FC<AddFriendButtonProps> = ({}) => {
  const [showSuccessState, setShowSuccessState] = useState<boolean>(false)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(addFriendValidator),
  })

  // DOCUMENTED, NOT FIXED: `parse` already returns `{ email: string }`, so
  // posting `{ email: validatedEmail }` double-wraps the body to
  // `{ email: { email: string } }`. Left as-is — /api/friends/add has no route
  // under src/app/api, so the expected server contract is unconfirmed.
  const addFriend = async (email: string) => {
    try {
      const validatedEmail = addFriendValidator.parse({ email })

      await axios.post('/api/friends/add', {
        email: validatedEmail,
      })

      setShowSuccessState(true)
    } catch (error) {
      if (error instanceof z.ZodError) {
        setError('email', { message: error.message })
        return
      }

      if (error instanceof AxiosError) {
        setError('email', { message: error.response?.data })
        return
      }

      setError('email', { message: 'Something went wrong.' })
    }
  }

  const onSubmit = (data: FormData) => {
    addFriend(data.email)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='max-w-sm'>
      <label
        htmlFor='email'
        className='block text-sm font-medium leading-6 text-gray-900'>
        Add friend by E-Mail
      </label>

      <div className='mt-2 flex gap-4'>
        <input
          {...register('email')}
          type='text'
          className='block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
          placeholder='you@example.com'
        />
        <Button>Add</Button>
      </div>
      <p className='mt-1 text-sm text-red-600'>{errors.email?.message}</p>
      {showSuccessState ? (
        <p className='mt-1 text-sm text-green-600'>Friend request sent!</p>
      ) : null}
    </form>
  )
}

export default AddFriendButton