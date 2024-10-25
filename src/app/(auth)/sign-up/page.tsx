"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from 'zod';
import Link from 'next/link';
import axios from 'axios';
import { useEffect, useState } from "react";
import { useDebounceCallback } from 'usehooks-ts'
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation";
import { signupschema } from "@/schemas/signupschema";
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

function Signuppage() {
  const [username, setusername] = useState<string>("");
  const [usernamemessage, setusernamemessage] = useState<string>("");
  const [ischeckingusername, setischeckingusername] = useState<boolean>(false);
  const [issubmitingusername, setissubmitingusername] = useState<boolean>(false);
  const debounced = useDebounceCallback(setusername, 500)
  const {toast} = useToast();
  const router = useRouter();

  //zod implementation
  const form = useForm<z.infer<typeof signupschema>>({
    resolver : zodResolver(signupschema),
    defaultValues : {
      username : '',
      email : '',
      password : ''
    }
  })

  useEffect(()=>{
    const checkusernameuniqueness = async()=>{
      if(username){
        setischeckingusername(true);
        setusernamemessage('');
        try {
          const response = await axios.get(`/api/checkusernameunique?username=${username}`)
          if(response.data.success === false){
            setusernamemessage(response.data.message);
            setischeckingusername(false);
            toast({
              description: response.data.message,
              variant : 'destructive',
            })
          }else{
            setusernamemessage(response.data.message);
            setischeckingusername(false);
            toast({
              description: response.data.message
            })
          }
        } catch (error : any) {
          console.error(error)
          toast({
              description: error.message
            })
          setusernamemessage(error.message)
          setischeckingusername(false)
        } finally {
          setischeckingusername(false)
        }
      }
    };
    checkusernameuniqueness();
  }, [username])

  const onSubmit = async(data : z.infer<typeof signupschema>)=>{
    setissubmitingusername(true);
    try {
      const response = await axios.post('/api/signup', {
        username : data.username,
        email : data.email,
        password : data.password
      })
      if(response.data.success === true){
        toast({
          description: response.data.message
        })
        setissubmitingusername(false)
        router.push(`/verify/${username}`)
      } else{
        toast({
          description: response.data.message,
          variant : 'destructive'
        })
        setissubmitingusername(false)
      }
    } catch (error : any) {
      console.error(error)
        toast({
            description: error.message
          })
        setissubmitingusername(false)
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-800">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
            Join Send-me-anonymously
          </h1>
          <p className="mb-4">Sign up to start sending anonymous messages</p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder="Username" {...field} onChange={(e)=>{field.onChange(e), debounced(e.target.value)}}/>
                </FormControl>
                {ischeckingusername && (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin">Please Wait</Loader2>
                    </>
                )}
                <FormDescription>
                  {usernamemessage && <span className="text-red-500">{usernamemessage}</span>}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
            <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="Email" {...field} onChange={(e)=>{field.onChange(e)}}/>
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
          <Button type="submit" disabled={issubmitingusername}>
            {issubmitingusername ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin"/>Please Wait
              </>
            ) : ('Signup')}
          </Button>
          </form>
        </Form>
        <p>
            Already a member?{' '}
            <Link href="/sign-in" className="text-blue-600 hover:text-blue-800">
              Sign in
            </Link>
          </p>
      </div>
    </div>
  )
}

export default Signuppage
