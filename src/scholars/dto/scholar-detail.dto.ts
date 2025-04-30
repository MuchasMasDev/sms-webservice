import {
  public_users,
  scholar_state,
  scholars,
  scholar_addresses,
  addresses,
  scholar_phone_numbers,
  phone_numbers,
  bank_accounts,
  banks,
  bank_account_type,
  municipalities,
  departments,
  public_users as User,
  districts,
} from '@prisma/client';

// Interface for Address data
export interface AddressDto {
  street_line_1: string;
  street_line_2: string | null;
  is_urban: boolean;
  district: string;
  municipality: string;
  department: string;
}

// Interface for Scholar Address relation
export interface ScholarAddressDto {
  is_current: boolean;
  addresses: AddressDto;
}

// Interface for Scholar Phone Number relation
export interface ScholarPhoneNumberDto {
  is_current: boolean;
  number: string;
}

// Interface for Bank Account data
export interface BankAccountDto {
  account_number: string;
  is_primary: boolean;
  account_type: bank_account_type;
  bank: {
    name: string;
    logo: string;
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
  scholar_addresses: ScholarAddressDto[];
  scholar_phone_numbers: ScholarPhoneNumberDto[];
  bank_accounts: BankAccountDto[];

  static fromPrisma(
    scholar: scholars & {
      users_scholars_user_idTousers: public_users;
      scholar_addresses?: (scholar_addresses & {
        addresses: addresses & {
          districts: districts & {
            municipalities: municipalities & {
              departments: departments;
            };
          };
        };
      })[];
      scholar_phone_numbers?: (scholar_phone_numbers & {
        phone_numbers: phone_numbers;
      })[];
      bank_accounts?: (bank_accounts & {
        banks: banks;
      })[];
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
    dto.scholar_addresses =
      scholar.scholar_addresses?.map((scholarAddress) => ({
        is_current: scholarAddress.is_current,
        addresses: {
          street_line_1: scholarAddress.addresses.street_line_1,
          street_line_2: scholarAddress.addresses.street_line_2,
          is_urban: scholarAddress.addresses.is_urban,
          district: scholarAddress.addresses.districts.name,
          municipality: scholarAddress.addresses.districts.municipalities.name,
          department:
            scholarAddress.addresses.districts.municipalities.departments.name,
        },
      })) || [];

    // Map scholar phone numbers
    dto.scholar_phone_numbers =
      scholar.scholar_phone_numbers?.map((scholarPhoneNumber) => ({
        is_current: scholarPhoneNumber.is_current,
        number: scholarPhoneNumber.phone_numbers.number,
      })) || [];

    // Map bank accounts
    dto.bank_accounts =
      scholar.bank_accounts?.map((bankAccount) => ({
        account_number: bankAccount.account_number,
        account_holder: bankAccount.account_holder,
        is_primary: bankAccount.is_primary,
        account_type: bankAccount.account_type,
        bank: {
          name: bankAccount.banks.name,
          logo: bankAccount.banks.logo_src,
        },
      })) || [];

    return dto;
  }
}
