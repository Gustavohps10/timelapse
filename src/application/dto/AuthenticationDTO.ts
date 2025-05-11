import { MemberDTO } from '@/application/dto/MemberDTO'

export interface AuthenticationDTO {
  member: MemberDTO
  token: string
}
