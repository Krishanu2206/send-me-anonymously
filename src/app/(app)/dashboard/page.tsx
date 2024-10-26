"use client";

import Messagecard from '@/components/Messagecard';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Message } from '@/model/User';
import { acceptmessagesschema } from '@/schemas/acceptmessageschema';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { Loader2, RefreshCcw } from 'lucide-react';
import { User } from 'next-auth';
import { useSession } from 'next-auth/react';
import React, { useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form';
import * as z from 'zod';

function Dashboardpage() {

  const [messages, setmessages] = useState<Message[]>([]);
  const [isloading, setisloading] = useState<boolean>(false);
  const [isswitchloading, setisswitchloading] = useState<boolean>(false);
  const [profileUrl, setprofileUrl] = useState<string>('');

  const {toast} = useToast();

  const handledeletemessages = (messageid : string)=>{
    setmessages(messages.filter((m)=>m._id !== messageid))
  }

  const {data:session} = useSession({required:false, onUnauthenticated(){
    toast({
      title : 'Authentication failed',
      description : 'You need to be logged in to access this page'
    })
  }})

  const form = useForm<z.infer<typeof acceptmessagesschema>>({
    resolver : zodResolver(acceptmessagesschema),
    defaultValues : {
      acceptmessages : false,
    }
  })
  console.log(form);
  const {register, watch, setValue} = form;

  const acceptmessages = watch('acceptmessages');

  const acceptfetchmessages = useCallback(async()=>{
    setisswitchloading(true);
    try {
      const response = await axios.get('/api/accept-message')
      if(response.data.success === true){
        setValue('acceptmessages', response?.data?.isacceptingmessages)
        toast({
          title : 'Current message acceptance status',
          description : response?.data?.isacceptingmessages? 'You are accepting messages' : 'You are not accepting messages'
        })
      }else{
        toast({
          title : 'Error',
          description : response.data.message
        })
      }
      
    } catch (error:any) {
      console.error(error)
      toast({
          title: 'Internal Server Error',
          description: error.message,
          variant : 'destructive'
      })
    } finally{
      setisswitchloading(false);
    }
  }, [setValue, setisswitchloading, toast]);

  const fetchmessages = useCallback(async(refresh : boolean = false)=>{
    setisloading(true);
    setisswitchloading(false);
    try {
      const response = await axios.get('/api/get-messages')
      if(response.data.success === true){
        setmessages(response?.data?.messages)
        if(refresh){
          toast({
          title : response.data.message,
          description : response.data.messages.length + 'messages'
        })
        }
      }else{
        toast({
          description : response.data.message
        })
      }
      
    } catch (error:any) {
      console.error(error)
      toast({
          title: 'Internal Server Error',
          description: error.message,
          variant : 'destructive'
      })
    } finally{
      setisloading(false);
      setisswitchloading(false);
    }
  }, [setmessages, setisloading, toast])

  useEffect(()=>{
    if(!session || !session.user){
      return;
    }
    acceptfetchmessages();
    fetchmessages();
  }, [session, setValue, acceptfetchmessages, fetchmessages, toast])

  //handle switch change
  const handleswitchchange = async()=>{
    setisswitchloading(true);
    try {
      const response = await axios.post('/api/accept-message', {acceptmessages : !acceptmessages});
      if(response.data.success === true){
        setValue('acceptmessages', !acceptmessages)
        toast({
          title : response.data.message,
          description : response?.data?.isacceptingmessages? 'You are accepting messages' : 'You are not accepting messages'
        })
      }else{
        toast({
          title : 'Error in switching',
          description : response.data.message
        })
      }
    } catch (error : any) {
      console.error(error)
      toast({
          title: 'Internal Server Error',
          description: error.message,
          variant : 'destructive'
      })
    } finally {
      setisswitchloading(false);
    }
  }

  const user : User = session?.user as User;
  const username = user?.username;
  useEffect(()=>{
    const baseurl = `${window.location.protocol}://${window.location.host}`;
    setprofileUrl(`${baseurl}/u/${username}`);
  }, [user])

  const copytoclipboard = () => {
    window.navigator.clipboard.writeText(profileUrl).then(() => {
      toast({
        title: 'Link Copied',
        description: `Your unique link for sending message to @${username} has been copied to your clipboard`,
      });
    });
  }

  return (
    <div className="my-8 mx-4 md:mx-8 lg:mx-auto p-6 bg-white rounded w-full max-w-6xl">
      <h1 className="text-4xl font-bold mb-4">User Dashboard</h1>

      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Copy Your Unique Link for sending message to @{username}.</h2>{' '}
        <div className="flex items-center">
          <input
            type="text"
            value={profileUrl}
            disabled
            className="input input-bordered w-full p-2 mr-2"
          />
          <Button onClick={copytoclipboard}>Copy</Button>
        </div>
      </div>

      <div className="mb-4">
        <Switch
          {...register('acceptmessages')}
          checked={acceptmessages}
          onCheckedChange={handleswitchchange}
          disabled={isswitchloading}
        />
        <span className="ml-2">
          Accept Messages: {acceptmessages ? 'On' : 'Off'}
        </span>
      </div>
      <Separator />

      <Button
        className="mt-4"
        variant="outline"
        onClick={(e) => {
          e.preventDefault();
          fetchmessages(true);
        }}
      >
        {isloading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <RefreshCcw className="h-4 w-4" />
        )}
      </Button>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
        {messages.length > 0 ? (
          messages.map((message, index) => (
            <Messagecard
              key={index}
              message={message}
              onmessagedelete={(messageid)=>handledeletemessages(messageid)}
            />
          ))
        ) : (
          <p>No messages to display.</p>
        )}
      </div>
    </div>
  );
}


export default Dashboardpage
