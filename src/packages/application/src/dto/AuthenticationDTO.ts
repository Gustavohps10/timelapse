import { MemberDTO } from '@/dto/MemberDTO'

export interface AuthenticationDTO {
  member: MemberDTO
  token: string
}
