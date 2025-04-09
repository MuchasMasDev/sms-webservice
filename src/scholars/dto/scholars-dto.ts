import {
  public_users,
  scholar_state,
  scholars,
  public_users as User,
} from '@prisma/client';

export class ScholarsDto {
  id: string;
  user_id: string;
  dob: Date;
  gender: string | null;
  has_disability: boolean | null;
  disability_description: string | null;
  number_of_children: number | null;
  ingress_date: Date | null;
  egress_date: Date | null;
  egress_comments: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  emergency_contact_relationship: string | null;
  dui: string | null;
  state: scholar_state;
  created_at: Date;
  created_by: string;
  user: User;

  static fromPrisma(
    scholar: scholars & { users_scholars_user_idTousers: public_users },
  ): ScholarsDto {
    const dto = new ScholarsDto();
    dto.id = scholar.id;
    dto.user_id = scholar.user_id;
    dto.dob = scholar.dob;
    dto.gender = scholar.gender;
    dto.has_disability = scholar.has_disability;
    dto.disability_description = scholar.disability_description;
    dto.number_of_children = scholar.number_of_children;
    dto.ingress_date = scholar.ingress_date;
    dto.egress_date = scholar.egress_date;
    dto.egress_comments = scholar.egress_comments;
    dto.emergency_contact_name = scholar.emergency_contact_name;
    dto.emergency_contact_phone = scholar.emergency_contact_phone;
    dto.emergency_contact_relationship = scholar.emergency_contact_relationship;
    dto.dui = scholar.dui;
    dto.state = scholar.state;
    dto.created_at = scholar.created_at;
    dto.created_by = scholar.created_by;

    // Mapeo del usuario
    dto.user = {
      id: scholar.users_scholars_user_idTousers.id,
      ref_code: scholar.users_scholars_user_idTousers.ref_code,
      first_name: scholar.users_scholars_user_idTousers.first_name,
      last_name: scholar.users_scholars_user_idTousers.last_name,
      email: scholar.users_scholars_user_idTousers.email,
      role: scholar.users_scholars_user_idTousers.role,
    };

    return dto;
  }
}
