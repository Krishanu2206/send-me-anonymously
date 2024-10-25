import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import { NextResponse } from 'next/server';

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const prompt = "Create a list of three open-ended and engaging questions formatted as a single string. Each question should be separated by '||'. Like this : 'Who is your crsuh?' || 'If you could have dinner with any historical figure, who would it be?' || 'I love you' || 'I am your biggest fan' or any confession or question'. Send different questions, not the same question"

    const { text } = await generateText({
        model: google('gemini-1.5-pro-latest'),
        prompt:prompt
    });
    const suggestedmessages = text.split('||')
    console.log(suggestedmessages);

    return NextResponse.json({
        success : true,
        message : "Questions generated successfully",
        questions : suggestedmessages
    })

  } catch (error : any) {
    const {name, status, headers, message} = error;
    return NextResponse.json({
        success : false,
        message : "Error in response",
        name, status, headers, errormessage : message
    }, {status : 200})
  }
}