import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { Prisma, public_users as User } from '@prisma/client';
import { PrismaService } from 'src/configs/prisma/prisma.service';
import { CreateScholarDto } from './dto/create-scholar.dto';
import { UpdateScholarDto } from './dto/update-scholar.dto';
import { AuthService } from 'src/auth/auth.service';
import { RoleEnum } from 'src/common/enums';
import { ScholarsDto } from './dto/scholars-dto';
import { SearchQueryDto } from 'src/common/dtos';
import { buildPaginationOptions } from 'src/common/utils/build-pagination-options';
import { EnhancedScholarsDto } from './dto/scholar-detail.dto';

type ScholarWithRelations = Prisma.scholarsGetPayload<{
  include: {
    users_scholars_user_idTousers: true;
    bank_accounts: true;
    scholar_addresses: {
      include: {
        addresses: true;
      };
    };
    scholar_phone_numbers: {
      include: {
        phone_numbers: true;
      };
    };
    scholars_logbook: true;
  };
}>;

@Injectable()
export class ScholarsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly authService: AuthService,
  ) { }

  async create(createScholarDto: CreateScholarDto, user: User) {
    try {
      // Use a transaction to ensure all related data is created together
      return await this.prismaService.$transaction<ScholarWithRelations>(
        async (prisma) => {
          // 1. Create the user record
          const userCreated = await this.authService.signUp(
            {
              email: createScholarDto.email.toLocaleLowerCase(),
              password: createScholarDto.password,
              firstName: createScholarDto.firstName,
              lastName: createScholarDto.lastName,
              role: RoleEnum.SCHOLAR,
            },
            createScholarDto.ingressDate,
          );

          // 2. Create the scholar record
          const scholar = await prisma.scholars.create({
            data: {
              user_id: userCreated.id,
              dob: createScholarDto.dob,
              gender: createScholarDto.gender,
              has_disability: createScholarDto.hasDisability,
              disability_description: createScholarDto.disabilityDescription,
              number_of_children: createScholarDto.numberOfChildren,
              ingress_date: createScholarDto.ingressDate,
              emergency_contact_name: createScholarDto.emergencyContactName,
              emergency_contact_phone: createScholarDto.emergencyContactPhone,
              emergency_contact_relationship:
                createScholarDto.emergencyContactRelationship,
              dui: createScholarDto.dui,
              state: createScholarDto.state,
              created_at: new Date(),
              created_by: user.id,
            },
          });

          // 3. Create addresses if provided
          if (
            createScholarDto.addresses &&
            createScholarDto.addresses.length > 0
          ) {
            for (const addressData of createScholarDto.addresses) {
              // Create the address first
              const address = await prisma.addresses.create({
                data: {
                  street_line_1: addressData.streetLine1,
                  street_line_2: addressData.streetLine2,
                  apartment_number: addressData.apartmentNumber,
                  postal_code: addressData.postalCode,
                  municipality_id: addressData.municipalityId,
                  is_urban: addressData.isUrban,
                  created_at: new Date(),
                  created_by: user.id,
                },
              });

              // Then create the scholar_address relationship
              await prisma.scholar_addresses.create({
                data: {
                  scholar_id: scholar.id,
                  address_id: address.id,
                  is_current: true,
                  created_at: new Date(),
                  created_by: user.id,
                },
              });
            }
          }

          // 4. Create phone numbers if provided
          if (
            createScholarDto.phoneNumbers &&
            createScholarDto.phoneNumbers.length > 0
          ) {
            for (const phoneData of createScholarDto.phoneNumbers) {
              // Create or find the phone number first
              const phone = await prisma.phone_numbers.upsert({
                where: { number: phoneData.number },
                update: {},
                create: {
                  number: phoneData.number,
                },
              });

              // Then create the scholar_phone_number relationship
              await prisma.scholar_phone_numbers.create({
                data: {
                  scholar_id: scholar.id,
                  phone_number_id: phone.id,
                  is_mobile: phoneData.isMobile,
                  is_current: phoneData.isCurrent,
                },
              });
            }
          }

          // 5. Create bank accounts if provided
          if (
            createScholarDto.bankAccounts &&
            createScholarDto.bankAccounts.length > 0
          ) {
            for (const bankAccountData of createScholarDto.bankAccounts) {
              await prisma.bank_accounts.create({
                data: {
                  account_number: bankAccountData.accountNumber,
                  account_type: bankAccountData.accountType,
                  bank_id: bankAccountData.bankId,
                  scholar_id: scholar.id,
                  is_primary: bankAccountData.isPrimary,
                },
              });
            }
          }

          // Return the created scholar with related data
          const result = await prisma.scholars.findUnique({
            where: { id: scholar.id },
            include: {
              users_scholars_user_idTousers: true,
              bank_accounts: true,
              scholar_addresses: {
                include: {
                  addresses: true,
                },
              },
              scholar_phone_numbers: {
                include: {
                  phone_numbers: true,
                },
              },
              scholars_logbook: true,
            },
          });

          if (!result) {
            throw new Error('Failed to retrieve created scholar');
          }

          return result;
        },
      );
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException(
            'A record with the same unique constraints already exists',
          );
        }

        if (error.code === 'P2003') {
          throw new BadRequestException(
            'Invalid reference to a related entity',
          );
        }
      }

      throw error;
    }
  }

  async findAll(queryDto: SearchQueryDto) {
    const { skip, take, where, orderBy, pageIndex, pageSize } =
      buildPaginationOptions(queryDto, this.buildScholarWhere);

    const [scholars, totalCount] = await this.prismaService.$transaction([
      this.prismaService.scholars.findMany({
        where,
        skip,
        take,
        orderBy,
        include: {
          users_scholars_user_idTousers: true,
        },
      }),
      this.prismaService.scholars.count({ where }),
    ]);

    return {
      data: scholars.map((s) => ScholarsDto.fromPrisma(s)),
      total: totalCount,
      pageIndex,
      pageSize,
    };
  }

  async findOne(id: string) {
    const scholar = await this.prismaService.scholars.findUniqueOrThrow({
      where: { id },
      include: {
        scholar_addresses: {
          include: {
            addresses: {
              include: {
                municipalities: {
                  include: {
                    departments: true,
                  },
                },
              },
            },
          },
        },
        scholar_phone_numbers: {
          include: {
            phone_numbers: true,
          },
        },
        bank_accounts: {
          include: {
            banks: true,
          },
        },
        users_scholars_user_idTousers: true,
      },
    });

    return EnhancedScholarsDto.fromPrisma(scholar);
  }

  update(id: number, updateScholarDto: UpdateScholarDto) {
    console.log(updateScholarDto);
    return `This action updates a #${id} scholar`;
  }

  private buildScholarWhere = (query: string, status: string) => {
    const where: any = {};

    if (query) {
      where.OR = [
        {
          users_scholars_user_idTousers: {
            first_name: {
              contains: query,
              mode: 'insensitive',
            },
          },
        },
      ];
    }

    if (status !== 'all') {
      where.state = status;
    }

    return where;
  };
}
