import { checkAdmin } from "@/middleware/checkAdmin";

// GET request handler to check if user is admin
export async function GET(req) {
  // Apply the middleware to check if the user is an admin
  const adminCheckResponse = await checkAdmin(req, () => {})

  // If the checkAdmin middleware return unauthorised, return 
  if (adminCheckResponse) {
    return adminCheckResponse
  }

  // If the middleware confirms the user is an admin, return a success response
  return new Response(JSON.stringify({ message: 'Admin verified successfully' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}
