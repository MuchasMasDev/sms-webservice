import {
  public_users,
  scholar_state,
  scholars,
  scholar_addresses,
  scholar_phone_numbers,
  banks,
  bank_account_type,
  municipalities,
  departments,
  public_users as User,
  districts,
} from '@prisma/client';

// Interface for Scholar Address relation
export interface ScholarAddressDto {
  id: number;
  street_line_1: string;
  street_line_2: string | null;
  is_urban: boolean;
  is_current: boolean;
  district: string;
  municipality: string;
  department: string;
}

// Interface for Scholar Phone Number relation
export interface ScholarPhoneNumberDto {
  id: number;
  is_current: boolean;
  number: string;
}

// Interface for Bank Account data
export interface BankAccountDto {
  account_number: string;
  account_holder: string;
  account_type: bank_account_type;
  bank: {
    name: string | null;
    logo: string | null;
  };
}

// Main Scholar DTO
export class EnhancedScholarsDto {
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
  origin_scholar_address: ScholarAddressDto | null;
  current_scholar_address: ScholarAddressDto | null;
  scholar_phone_numbers: ScholarPhoneNumberDto[];
  bank_account: BankAccountDto;

  static fromPrisma(
    scholar: scholars & {
      users_scholars_user_idTousers: public_users;
      scholar_addresses_scholars_current_addressToscholar_addresses:
        | (scholar_addresses & {
            districts: districts & {
              municipalities: municipalities & {
                departments: departments;
              };
            };
          })
        | null;
      scholar_addresses_scholars_origin_addressToscholar_addresses:
        | (scholar_addresses & {
            districts: districts & {
              municipalities: municipalities & {
                departments: departments;
              };
            };
          })
        | null;
      scholar_phone_numbers?: scholar_phone_numbers[];
      banks?: banks;
    },
  ): EnhancedScholarsDto {
    const dto = new EnhancedScholarsDto();
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

    // Map user information
    dto.user = {
      id: scholar.users_scholars_user_idTousers.id,
      ref_code: scholar.users_scholars_user_idTousers.ref_code,
      first_name: scholar.users_scholars_user_idTousers.first_name,
      last_name: scholar.users_scholars_user_idTousers.last_name,
      email: scholar.users_scholars_user_idTousers.email,
      roles: scholar.users_scholars_user_idTousers.roles,
      profile_img_src: scholar.users_scholars_user_idTousers.profile_img_src,
    };

    // Map scholar addresses
    const originAddress =
      scholar.scholar_addresses_scholars_origin_addressToscholar_addresses;
    dto.origin_scholar_address = null;
    if (originAddress) {
      dto.origin_scholar_address = {
        id: originAddress.id,
        street_line_1: originAddress.street_line_1,
        street_line_2: originAddress.street_line_2,
        is_urban: originAddress.is_urban,
        is_current: originAddress.is_current,
        district: originAddress.districts.name,
        municipality: originAddress.districts.municipalities.name,
        department: originAddress.districts.municipalities.departments.name,
      };
    }

    const currentAddress =
      scholar.scholar_addresses_scholars_current_addressToscholar_addresses;
    dto.current_scholar_address = null;
    if (currentAddress) {
      dto.current_scholar_address = {
        id: currentAddress.id,
        street_line_1: currentAddress.street_line_1,
        street_line_2: currentAddress.street_line_2,
        is_urban: currentAddress.is_urban,
        is_current: currentAddress.is_current,
        district: currentAddress.districts.name,
        municipality: currentAddress.districts.municipalities.name,
        department: currentAddress.districts.municipalities.departments.name,
      };
    }

    // Map scholar phone numbers
    dto.scholar_phone_numbers =
      scholar.scholar_phone_numbers?.map((scholarPhoneNumber) => ({
        id: scholarPhoneNumber.id,
        is_current: scholarPhoneNumber.is_current,
        number: scholarPhoneNumber.number,
      })) || [];

    // Map bank account
    dto.bank_account = {
      account_number: scholar.bank_account_number,
      account_holder: scholar.bank_account_holder,
      account_type: scholar.bank_account_type,
      bank: {
        name: scholar.banks?.name || null,
        logo: scholar.banks?.logo_src || null,
      },
    };

    return dto;
  }
}
