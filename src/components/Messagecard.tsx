'use client';
import React from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from './ui/button';
import { X } from 'lucide-react';
import { Message } from '@/model/User';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import { Apiresponse } from '@/types/Apiresponse';
import dayjs from 'dayjs';

type messagecardprops = {
    message : Message;
    onmessagedelete: (messageid: string) => void
}

function Messagecard({message, onmessagedelete} : messagecardprops) {
    
    const {toast} = useToast();
    const handledeleteconfirm = async()=>{
        try {
            const response = await axios.delete<Apiresponse>(`/api/delete-message/${message._id}`);
            toast({
                description : response.data.message
            });
            onmessagedelete(`${message._id}`);
        } catch (error :any) {
            console.error(error)
            toast({
                description: error.message,
                variant : 'destructive'
            })
        }
    }

  return (
<Card className="card-bordered">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>{message.content}</CardTitle>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant='destructive'>
                <X className="w-5 h-5" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete
                  this message.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction onClick={handledeleteconfirm}>
                  Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        <div className="text-sm">
          {dayjs(message.createdAt).format('MMM D, YYYY h:mm A')}
        </div>
      </CardHeader>
      <CardContent></CardContent>
    </Card>
  );
}

export default Messagecard
