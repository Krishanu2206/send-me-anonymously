import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
export { default } from "next-auth/middleware"
import { getToken } from 'next-auth/jwt'

export const config = {
  matcher: [
    '/sign-in',
    '/sign-up',
    '/',
    '/dashboard/:path*',
    '/verify/:path*',
  ]
}
 
export async function middleware(request: NextRequest) {

    let token = await getToken({req: request})
    console.log("TOKEN INFORMATION", token);
    const url = request.nextUrl

    if(url.pathname === '/'){
      return NextResponse.redirect(new URL('/sign-in', request.url));
    }

    if(token && (
        url.pathname.startsWith('/sign-in') ||
        url.pathname.startsWith('/sign-up') ||
        url.pathname.startsWith('/verify')
    )){
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    if(!token && url.pathname.startsWith('/dashboard')){
        return NextResponse.redirect(new URL('/sign-in', request.url))
    }
    return NextResponse.next()
}
 
