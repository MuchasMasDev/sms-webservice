import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { Prisma, public_users as User } from '@prisma/client';
import { AuthService } from 'src/auth/auth.service';
import { PaginationResultDto, SearchQueryDto } from 'src/common/dtos';
import { RoleEnum } from 'src/common/enums';
import { buildPaginationOptions } from 'src/common/utils/build-pagination-options';
import { PrismaService } from 'src/configs/prisma/prisma.service';
import { CreateScholarDto } from './dto/create-scholar.dto';
import { EnhancedScholarsDto } from './dto/scholar-detail.dto';
import { ScholarsDto } from './dto/scholars-dto';
import { UpdateScholarDto } from './dto/update-scholar.dto';

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
  ) {}

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
              roles: [RoleEnum.SCHOLAR],
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
                  district_id: addressData.districtId,
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
                  // The second address is the current
                  is_current: createScholarDto.addresses[1] === addressData,
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
                  account_holder: bankAccountData.accountHolder,
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

  async update(id: string, updateDto: UpdateScholarDto, updatedBy: User) {
    const _scholar = await this.findOne(id);

    return await this.prismaService.$transaction(async (prisma) => {
      // 1. Update user record
      await prisma.public_users.update({
        where: { id: _scholar.user_id },
        data: {
          email: updateDto.email?.toLowerCase(),
          first_name: updateDto.firstName,
          last_name: updateDto.lastName,
        },
      });

      // 2. Update the scholar record
      await prisma.scholars.update({
        where: { id },
        data: {
          dob: updateDto.dob,
          gender: updateDto.gender,
          has_disability: updateDto.hasDisability,
          disability_description: updateDto.disabilityDescription,
          number_of_children: updateDto.numberOfChildren,
          ingress_date: updateDto.ingressDate,
          emergency_contact_name: updateDto.emergencyContactName,
          emergency_contact_phone: updateDto.emergencyContactPhone,
          emergency_contact_relationship:
            updateDto.emergencyContactRelationship,
          dui: updateDto.dui,
          state: updateDto.state,
        },
      });

      // 3. Update addresses
      if (updateDto.addresses) {
        const oldAddressLinks = await prisma.scholar_addresses.findMany({
          where: { scholar_id: id },
          select: { address_id: true },
        });

        await prisma.scholar_addresses.deleteMany({
          where: { scholar_id: id },
        });

        // Clean up orphan addresses
        await prisma.addresses.deleteMany({
          where: {
            id: { in: oldAddressLinks.map((link) => link.address_id) },
            scholar_addresses: { none: {} },
          },
        });

        for (const [index, address] of updateDto.addresses.entries()) {
          const newAddress = await prisma.addresses.create({
            data: {
              street_line_1: address.streetLine1,
              street_line_2: address.streetLine2,
              district_id: address.districtId,
              is_urban: address.isUrban,
              created_at: new Date(),
              created_by: updatedBy.id,
            },
          });

          const isLast = index === updateDto.addresses.length - 1;
          const isCurrent = updateDto.addresses.length === 1 || isLast;

          await prisma.scholar_addresses.create({
            data: {
              scholar_id: id,
              address_id: newAddress.id,
              is_current: isCurrent,
              created_at: new Date(),
              created_by: updatedBy.id,
            },
          });
        }
      }

      // 4. Update phone numbers
      if (updateDto.phoneNumbers) {
        const oldPhoneLinks = await prisma.scholar_phone_numbers.findMany({
          where: { scholar_id: id },
          select: { phone_number_id: true },
        });

        await prisma.scholar_phone_numbers.deleteMany({
          where: { scholar_id: id },
        });

        // Clean up orphan phone numbers
        await prisma.phone_numbers.deleteMany({
          where: {
            id: { in: oldPhoneLinks.map((link) => link.phone_number_id) },
            scholar_phone_numbers: { none: {} },
          },
        });

        for (const phone of updateDto.phoneNumbers) {
          const phoneRecord = await prisma.phone_numbers.upsert({
            where: { number: phone.number },
            update: {},
            create: { number: phone.number },
          });

          await prisma.scholar_phone_numbers.create({
            data: {
              scholar_id: id,
              phone_number_id: phoneRecord.id,
              is_current: phone.isCurrent,
            },
          });
        }
      }

      // 5. Update bank accounts
      if (updateDto.bankAccounts) {
        await prisma.bank_accounts.deleteMany({ where: { scholar_id: id } });

        for (const account of updateDto.bankAccounts) {
          await prisma.bank_accounts.create({
            data: {
              account_holder: account.accountHolder,
              account_number: account.accountNumber,
              account_type: account.accountType,
              bank_id: account.bankId,
              scholar_id: id,
              is_primary: account.isPrimary,
            },
          });
        }
      }

      // Create an entry in the logbook for this update
      await prisma.scholars_logbook.create({
        data: {
          scholar_id: id,
          log: 'Scholar information updated',
          created_by: updatedBy.id,
          created_at: new Date(),
          date: new Date(),
        },
      });

      // 6. Return scholar
      return await prisma.scholars.findUnique({
        where: { id },
        include: {
          users_scholars_user_idTousers: true,
          bank_accounts: true,
          scholar_addresses: { include: { addresses: true } },
          scholar_phone_numbers: { include: { phone_numbers: true } },
          scholars_logbook: true,
        },
      });
    });
  }

  async findAll(
    queryDto: SearchQueryDto,
  ): Promise<PaginationResultDto<ScholarsDto>> {
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
                districts: {
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
