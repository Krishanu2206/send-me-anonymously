"use client"
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast"
import { verifyschema } from "@/schemas/verifyschema";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useParams, useRouter } from 'next/navigation'
import React from 'react'
import { useForm } from "react-hook-form";
import * as z from "zod";

function Verifyaccountpage() {

    const router = useRouter();
    const {username} = useParams<{username : string}>();
    const {toast} = useToast();

    //zod implementation
    const form = useForm<z.infer<typeof verifyschema>>({
        resolver : zodResolver(verifyschema),
        defaultValues : {
            code : ''
        }
    })

    const onSubmit = async(data: z.infer<typeof verifyschema>)=>{
        try {
            const response = await axios.post('/api/verify-code', {
            username : username,
            code : data.code
            });
            toast({
                description : response.data.message
            });
            if(response.data.success === true){
                router.replace('/sign-in');
            }
        } catch (error : any) {
            console.error(error)
            toast({
                description: error.message
            })
        }
    }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
            Verify Your Account
          </h1>
          <p className="mb-4">Enter the verification code sent to your email</p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              name="code"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Verification Code</FormLabel>
                  <Input {...field} onChange={(e)=>field.onChange(e)}/>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Verify</Button>
          </form>
        </Form>
      </div>
    </div>
  )
}

export default Verifyaccountpage
