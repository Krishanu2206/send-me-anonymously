"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from 'zod';
import Link from 'next/link';
import { useState } from "react";
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { signinschema } from "@/schemas/signinschema";
import { signIn } from "next-auth/react";

function Signinpage() {
  // const [username, setusername] = useState("");
  const [issubmiting, setissubmiting] = useState(false);
  // const debouncedusername = useDebounceValue(username, 300)
  const {toast} = useToast();
  const router = useRouter();

  //zod implementation
  const form = useForm<z.infer<typeof signinschema>>({
    resolver : zodResolver(signinschema),
    defaultValues : {
      identifier : '',
      password : ''
    }
  })

  const onSubmit = async(data : z.infer<typeof signinschema>)=>{
    try {
      setissubmiting(true)
      console.log(data);
        const result = await signIn('credentials', {
        redirect : false,
        identifier : data.identifier,
        password : data.password
      })
      console.log(result);
      if(result?.error){
        if(result.error == 'CredentialsSignin'){
          toast({
          title : 'Login Error',
          description : 'Invalid username/email or password',
          variant : 'destructive'
        })
        }else{
        toast({
          title : 'Login Error',
          description : result.error,
          variant : 'destructive'
        })
        }
      }
      if(result?.ok && result?.url){
        router.replace('/dashboard');
        toast({
          title : 'Login Success',
          description : 'You have successfully logged in',
        })
      }
      setissubmiting(false)
    } catch (error:any) {
      console.error(error)
        toast({
            description: error.message
          })
        setissubmiting(false)
    }
    
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-800">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
            Join Send-me-anonymously
          </h1>
          <p className="mb-4">Sign in to start sending anonymous messages</p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            <FormField
            control={form.control}
            name="identifier"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email/Username</FormLabel>
                <FormControl>
                  <Input placeholder="Email/Username" {...field} onChange={(e)=>{field.onChange(e)}}/>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
            <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type='password' placeholder="Password" {...field} onChange={(e)=>{field.onChange(e)}}/>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={issubmiting}>
            {issubmiting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin">Please Wait</Loader2>
              </>
            ) : ('Sign in')}
          </Button>
          </form>
        </Form>
        <p>
            Want to be a member?{' '}
            <Link href="/sign-up" className="text-blue-600 hover:text-blue-800">
              Sign up
            </Link>
          </p>
      </div>
    </div>
  )
}

export default Signinpage;

