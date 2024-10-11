import { auth } from "@/../auth"
 
export default async function Page() {
  const session = await auth()
 
  if (!session) {
    return <div>Not authenticated</div>
  }
 
  return (
    <div className="container">
      <pre>{session}</pre>
    </div>
  )
}