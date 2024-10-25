'use client'

import React from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { User } from 'next-auth'
import { useToast } from '@/hooks/use-toast'
import { Button } from './ui/button'

function Navbar() {

  const {toast} = useToast();
  const {data:session, status}= useSession({required:false, onUnauthenticated(){
    toast({
        title : 'Authentication failed',
        description : 'You need to be logged in to access this page'
    })
  }});
//   if(status === 'loading') {
//     toast({
//         title : 'Loading',
//         description : 'Please wait while we load your details'
//     })
//   }
//   if(status === 'authenticated'){
//     toast({
//         title : 'Authentication successful',
//         description : 'You are logged in'
//     })
//   }
  const user: User = session?.user as User;

  return (
    <nav className="p-4 md:p-6 shadow-md bg-gray-900 text-white">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
            <a href='#' className="text-xl font-bold mb-4 md:mb-0">Send-me-anonymously</a>
            {
                session? (
                    <>
                        <span className="mr-4">
                            Welcome {user?.username?.toUpperCase() || user?.email} 
                        </span>
                        <Button onClick={()=>signOut()} className="w-full md:w-auto bg-slate-100 text-black" variant='outline'>Logout</Button>
                    </>
                ):(
                    <Link href='sign-in'>
                        <Button className="w-full md:w-auto bg-slate-100 text-black" variant={'outline'}>
                            Login
                        </Button>
                    </Link>
                )
            }
        </div>
    </nav>
  )
}

export default Navbar;