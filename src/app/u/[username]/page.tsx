"use client"
import { useToast } from '@/hooks/use-toast';
import { messagesschema } from '@/schemas/messageschema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams } from 'next/navigation';
import React, { useState } from 'react'
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from "@/components/ui/button"
import { Separator } from '@/components/ui/separator';
import { CardHeader, CardContent, Card } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea"
import axios from 'axios';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

function UserPage() {

  const params = useParams<{username : string}>();
  console.log(params);
  const username = params.username;
  const {toast} = useToast();

  const [issendingmessage, setissendingmessage] = useState<boolean>(false);
  const [issuggestingmessage, setissuggestingmessage] = useState<boolean>(false);
  const [suggestedmessages, setsuggestedmessages] = useState<string[]>([]);

  //zod implementation
  const form = useForm<z.infer<typeof messagesschema>>({
    resolver: zodResolver(messagesschema),
    defaultValues: {
      content : ''
    }
  })
  const {watch, setValue} = form;
  const content = watch('content');

  const onSubmit = async(data : z.infer<typeof messagesschema>)=>{
    try {
      setissendingmessage(true);
      console.log(typeof(data.content));
      const response = await axios.post('/api/send-messages', {
        username : username,
        content : data.content
      });
      if(response.data.success === false){
        toast({
          title : "Error in sending messages",
          description : response.data.message,
          variant : 'destructive'
        })
      }else{
        toast({
          title : response.data.message,
          description : `Your message has been sent to ${username}`,
          variant :'default'
        })
      }
    } catch (error : any) {
      console.error(error)
        toast({
            description: error.message
          })
        setissendingmessage(false)
    } finally { 
      setissendingmessage(false);
    }
  }

  const handlesuggestmessages = async()=>{
    try {
      setissuggestingmessage(true);
      const response= await axios.post('/api/suggest-messages');
      if(response.data.success === false){
        toast({
          title : "Error in suggesting messages",
          description : response.data.errormessage,
          variant : 'destructive'
        })
      }else{
        toast({
          title : 'Messages generated successfully',
          variant : 'default'
        })
        setsuggestedmessages(response?.data?.questions);
      }
      console.log(suggestedmessages);
    } catch (error : any) {
      console.error(error)
        toast({
            description: error.message
          })
        setissuggestingmessage(false)
    } finally {
      setissuggestingmessage(false);
    }
  }
  
  //when user clicks on a suggestion, it gets displayed in the textarea
  const handlemessageclick = async(message:string)=>{
    try {
      setValue('content', message);
    } catch (error) {
      console.error(error);
      toast({
        description : "Unable to copy message! Some error occurred!"
      })
    }
  }

  return (
    <div className="container mx-auto my-8 p-6 bg-white rounded max-w-4xl">
      <h1 className="text-4xl font-bold mb-6 text-center">
        Public Profile Link
      </h1>
      <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Send anonymous message to @{username}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Send your message"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              {content && content.length >=10? (
              <FormDescription>
                Press the button below to send your message!
              </FormDescription>
              ) : null}
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-center">
        {issendingmessage? (
          <Button disabled className='w-full'>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Please wait
          </Button>
        ) : (
          <Button type="submit" className='w-full' disabled={issendingmessage}>
            Send It
          </Button>
        )}</div>
      </form>
      </Form>

      <div className="space-y-4 my-8">
        <div className="space-y-2">
          <Button
            onClick={handlesuggestmessages}
            className="my-4"
            disabled={issuggestingmessage}
          >
            Suggest Messages
          </Button>
          <p>Click on any suggested message below to select it.</p>
        </div>
        <Card>
          <CardHeader>
            <h3 className="text-xl font-semibold">Suggested Messages</h3>
          </CardHeader>
          <CardContent className="flex flex-col space-y-4">
            {suggestedmessages.length>0 ? (
              suggestedmessages.map((message : string, index)=>(
                <Button
                  key={index}
                  variant="outline"
                  className="mb-2"
                  onClick={()=>handlemessageclick(message)}
                >
                  {message}
                </Button>
              ))
            ) : (
              <p className="text-red-500">OOPS! No suggested messages found!</p>
            )}
          </CardContent>
        </Card>
      </div>
      <Separator className="my-6" />
      <div className="text-center">
        <div className="mb-4">Get Your Message Board</div>
        <Link href={'/sign-up'}>
          <Button>Create Your Account</Button>
        </Link>
      </div>

    </div>
  )
}

export default UserPage
