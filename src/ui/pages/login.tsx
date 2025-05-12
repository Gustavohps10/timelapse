import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { Loader } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'

import { client } from '@/ui/client/client'
import { Button } from '@/ui/components/ui/button'
import { Card, CardContent, CardTitle } from '@/ui/components/ui/card'
import { Input } from '@/ui/components/ui/input'
import { Label } from '@/ui/components/ui/label'
import { useAuth } from '@/ui/hooks/use-auth'

const formSchema = z.object({
  username: z.string().min(1, 'Username é obrigatório'),
  password: z.string().min(1, 'Senha é obrigatória'),
})

type FormValues = z.infer<typeof formSchema>

export function Login() {
  const { isAuthenticated, login } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated) navigate('/')
  }, [isAuthenticated, navigate])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  })

  const { mutate, isPending } = useMutation({
    mutationFn: ({ username, password }: FormValues) =>
      client.services.auth.login({ body: { login: username, password } }),
    onSettled: (response) => {
      if (!response?.isSuccess || !response.data) {
        console.log('Falha na autenticação EXIBIR EM TELA', response?.error)
        return
      }

      const { member, token } = response.data

      login(member, token)
    },
  })

  const onSubmit = (data: FormValues) => {
    mutate(data)
  }

  return (
    <div className="my-36 flex items-center justify-center">
      <Card className="w-full max-w-sm rounded-lg p-6">
        <CardContent>
          <CardTitle className="text-2xl font-bold">Entrar</CardTitle>
          <form onSubmit={handleSubmit(onSubmit)} className="my-4 space-y-4">
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
                <p className="text-sm text-red-500">
                  {errors.username.message}
                </p>
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
                <p className="text-sm text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? <Loader /> : 'Entrar'}
            </Button>
          </form>
          <span className="font-xs mt-6">
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
