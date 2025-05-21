import { Injectable } from '@nestjs/common';
import { format } from 'date-fns';
import { PrismaService } from 'src/configs/prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private readonly prismaService: PrismaService) {}

  async createUsersReport() {
    const allUsers = await this.prismaService.public_users.findMany();

    const formattedUsers = allUsers
      .map((user) => {
        const formattedRoles = user.roles.flatMap((role) => {
          switch (role) {
            case 'ACADEMIC':
              return ['Académica'];
            case 'ADMIN':
              return ['Administradora'];
            case 'FINANCE':
              return ['Financiera'];
            case 'PSY':
              return ['Psicóloga'];
            case 'SCHOLAR':
              return ['Becaria'];
            case 'SPC':
              return ['Coordinadora de programa'];
            case 'SPCA':
              return ['Técnica de programa'];
            case 'TUTOR':
              return ['Tutor/Tutora'];
            default:
              return [];
          }
        });

        return {
          'Código de usuario': user.ref_code,
          Nombres: user.first_name,
          Apellidos: user.last_name,
          'Correo electrónico': user.email,
          'Rol(es)': formattedRoles.join(', '),
        };
      })
      // TODO: Dynamic sorting based on request
      .sort((a, b) => {
        const aName = a.Apellidos?.toLowerCase() ?? '';
        const bName = b.Apellidos?.toLowerCase() ?? '';
        if (aName < bName) return -1;
        if (aName > bName) return 1;
        return 0;
      });

    return formattedUsers;
  }

  async createScholarsReport() {
    const allScholars = await this.prismaService.scholars.findMany({
      select: {
        users_scholars_user_idTousers: {
          select: {
            first_name: true,
            last_name: true,
            ref_code: true,
            email: true,
          },
        },
        dob: true,
        dui: true,
        scholar_phone_numbers: {
          select: {
            number: true,
            is_current: true,
          },
          where: {
            is_current: true,
          },
        },
        scholar_addresses_scholars_origin_addressToscholar_addresses: {
          select: {
            street_line_1: true,
            street_line_2: true,
            is_urban: true,
            districts: {
              select: {
                name: true,
                municipalities: {
                  select: {
                    name: true,
                    departments: {
                      select: {
                        name: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        emergency_contact_name: true,
        emergency_contact_phone: true,
        emergency_contact_relationship: true,
        emergency_contact_address: true,
        bank_account_holder: true,
        bank_account_number: true,
        bank_account_type: true,
        banks: {
          select: {
            name: true,
          },
        },
      },
    });

    return allScholars
      .map((scholar) => {
        const today = new Date();
        const birthDate = new Date(scholar.dob);
        let scholarAge = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        // Adjust age if birthday hasn't occurred yet this year
        if (
          monthDiff < 0 ||
          (monthDiff === 0 && today.getDate() < birthDate.getDate())
        )
          scholarAge--;

        return {
          'Código de becaria': scholar.users_scholars_user_idTousers?.ref_code,
          Nombre: `${scholar.users_scholars_user_idTousers?.first_name} ${scholar.users_scholars_user_idTousers?.last_name}`,
          'Correo electrónico': scholar.users_scholars_user_idTousers?.email,
          'Fecha de nacimiento': format(new Date(scholar.dob), 'dd/MM/yyyy'),
          Edad: scholarAge,
          Dui: scholar.dui,
          'Teléfono(s)': scholar.scholar_phone_numbers
            .map((phone) => phone.number)
            .join(', '),
          'Dirección de origen':
            scholar.scholar_addresses_scholars_origin_addressToscholar_addresses,
          'Contacto de emergencia': {
            Nombre: scholar.emergency_contact_name,
            Teléfono: scholar.emergency_contact_phone,
            Relación: scholar.emergency_contact_relationship,
          },
          'Cuenta bancaria': {
            'Nombre del titular': scholar.bank_account_holder,
            'Número de cuenta': scholar.bank_account_number,
            'Tipo de cuenta':
              scholar.bank_account_type === 'SAVINGS' ? 'Ahorro' : 'Corriente',
            'Nombre del banco': scholar.banks?.name,
          },
        };
      })
      .sort((a, b) => {
        const aName = a.Nombre?.toLowerCase() ?? '';
        const bName = b.Nombre?.toLowerCase() ?? '';
        if (aName < bName) return -1;
        if (aName > bName) return 1;
        return 0;
      });
  }
}
