import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'

import { LoginRequest } from '@/main/api/current-user'
import { Loader } from '@/renderer/components/loader'
import { Button } from '@/renderer/components/ui/button'
import { Card, CardContent, CardTitle } from '@/renderer/components/ui/card'
import { Input } from '@/renderer/components/ui/input'
import { Label } from '@/renderer/components/ui/label'
import { useAuth } from '@/renderer/hooks/use-auth'

const formSchema = z.object({
  username: z.string(),
  password: z.string(),
})

type FormValues = z.infer<typeof formSchema>

export function Login() {
  const { isAuthenticated, login } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated) 
      navigate('/')
  
  }, [isAuthenticated, navigate])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  })

  const { mutate, isPending } = useMutation({
    mutationFn: (data: LoginRequest) => window.api.redmine.currentUser(data),
    onSuccess: (data) => {
      console.log(data);
      login(data.user.api_key)
    },
    onError: (error: AxiosError) => {
      console.log("ERROR", error);
    },
  })

  const onSubmit = (data: FormValues) => {
    mutate(data)
  }

  return (
    <div className="flex items-center justify-center my-36">
      <Card className="max-w-sm w-full p-6 rounded-lg">
        <CardContent>
          <CardTitle className="text-2xl font-bold">Entrar</CardTitle>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 my-4">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="email"
                type="text"
                placeholder="Digite seu username"
                className="mt-1"
                {...register('username')}
              />
              {errors.username && (
                <p className="text-red-500 text-sm">{errors.username.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="Digite sua senha"
                className="mt-1"
                {...register('password')}
              />
              {errors.password && (
                <p className="text-red-500 text-sm">
                  {errors.password.message}
                </p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={isPending} >
              {isPending ? <Loader /> : 'Entrar'}
            </Button>
          </form>
          <span className="mt-6 font-xs">
            Não possui uma conta?{' '}
            <Button variant="link" className="p-0" asChild>
              <Link to="/sign-up">Cadastre-se</Link>
            </Button>
          </span>
        </CardContent>
      </Card>
    </div>
  )
}