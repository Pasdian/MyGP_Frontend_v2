import { GPServer } from '@/axios-instance';

export function GET(){
  return Response.json({msg: "Hello world"})
}

export async function POST(req: Request) {
  const data =  await req.json()
  console.log(data)
  await GPServer.post("/api/auth/login", data).then((res) => {
  return Response.json(res.data.user)

  }).catch((error) => {
    return Response.json({error: error})
  })
  return Response.json({})
}
