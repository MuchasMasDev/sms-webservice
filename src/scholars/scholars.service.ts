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
import { CreateAddressDto } from './dto/create-address.dto';

type ScholarWithRelations = Prisma.scholarsGetPayload<{
  include: {
    users_scholars_user_idTousers: true;
    scholar_addresses_scholars_origin_addressToscholar_addresses: true;
    scholar_addresses_scholars_current_addressToscholar_addresses: true;
    scholar_phone_numbers: true;
    scholars_logbook: true;
    banks: true;
  };
}>;

const publicUserFields = Object.values(Prisma.Public_usersScalarFieldEnum);
const scholarFields = Object.values(Prisma.ScholarsScalarFieldEnum);

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
              dob: createScholarDto.dob,
              password: createScholarDto.password,
              firstName: createScholarDto.firstName,
              lastName: createScholarDto.lastName,
              roles: [RoleEnum.SCHOLAR],
            },
            new Date(createScholarDto.dob),
          );

          // 2. Create current address
          let currentAddressId: number | null = null;
          if (createScholarDto.currentAddressId) {
            currentAddressId = createScholarDto.currentAddressId;
          } else if (createScholarDto.currentAddress) {
            currentAddressId = await this.createOrUpdateAddress(
              prisma,
              null,
              createScholarDto.currentAddress,
              user.id,
              true,
            );
          }

          // 3. Create origin address
          let originAddressId: number | null = null;
          if (createScholarDto.originAddress) {
            originAddressId = await this.createOrUpdateAddress(
              prisma,
              null,
              createScholarDto.originAddress,
              user.id,
              true,
            );
          }

          // 3. Create the scholar record
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
              bank_account_holder: createScholarDto.bankAccount.accountHolder,
              bank_account_number: createScholarDto.bankAccount.accountNumber,
              bank_account_type: createScholarDto.bankAccount.accountType,
              bank_id: createScholarDto.bankAccount.bankId,
              current_address: currentAddressId,
              origin_address: originAddressId,
              dui: createScholarDto.dui,
              state: createScholarDto.state,
              created_at: new Date(),
              created_by: user.id,
            },
          });

          // 4. Create phone numbers if provided
          if (
            createScholarDto.phoneNumbers &&
            createScholarDto.phoneNumbers.length > 0
          ) {
            for (const phoneData of createScholarDto.phoneNumbers) {
              await prisma.scholar_phone_numbers.create({
                data: {
                  scholar_id: scholar.id,
                  number: phoneData.number,
                  is_current: phoneData.isCurrent,
                },
              });
            }
          }

          // Return the created scholar with related data
          const result = await prisma.scholars.findUnique({
            where: { id: scholar.id },
            include: {
              users_scholars_user_idTousers: true,
              scholar_addresses_scholars_current_addressToscholar_addresses:
                true,
              scholar_addresses_scholars_origin_addressToscholar_addresses:
                true,
              scholar_phone_numbers: true,
              banks: true,
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
      // 1. Update user record (PATCH semantics: only include defined fields)
      const userData: Prisma.public_usersUpdateInput = {};
      if (updateDto.email !== undefined)
        userData.email = updateDto.email.toLowerCase();
      if (updateDto.firstName !== undefined)
        userData.first_name = updateDto.firstName;
      if (updateDto.lastName !== undefined)
        userData.last_name = updateDto.lastName;
      if (Object.keys(userData).length) {
        await prisma.public_users.update({
          where: { id: _scholar.user_id },
          data: userData,
        });
      }

      // 2. Handle addresses (optimized as before)
      let currentAddressId = _scholar.current_scholar_address?.id ?? null;
      if (updateDto.currentAddressId !== undefined) {
        currentAddressId = updateDto.currentAddressId;
      } else if (updateDto.currentAddress) {
        currentAddressId = await this.createOrUpdateAddress(
          prisma,
          _scholar.current_scholar_address?.id ?? null,
          updateDto.currentAddress,
          updatedBy.id,
          true,
        );
      }

      let originAddressId = _scholar.origin_scholar_address?.id ?? null;
      if (updateDto.originAddress) {
        originAddressId = await this.createOrUpdateAddress(
          prisma,
          _scholar.origin_scholar_address?.id ?? null,
          updateDto.originAddress,
          updatedBy.id,
          true,
        );
      }

      // 3. Update the scholar record with PATCH semantics
      const scholarData: Prisma.scholarsUpdateInput = {};
      const fields = {
        dob: updateDto.dob,
        gender: updateDto.gender,
        has_disability: updateDto.hasDisability,
        disability_description: updateDto.disabilityDescription,
        number_of_children: updateDto.numberOfChildren,
        ingress_date: updateDto.ingressDate,
        emergency_contact_name: updateDto.emergencyContactName,
        emergency_contact_phone: updateDto.emergencyContactPhone,
        emergency_contact_relationship: updateDto.emergencyContactRelationship,
        bank_account_holder: updateDto.bankAccount?.accountHolder,
        bank_account_number: updateDto.bankAccount?.accountNumber,
        bank_account_type: updateDto.bankAccount?.accountType,
        bank_id: updateDto.bankAccount?.bankId,
        current_address: currentAddressId,
        origin_address: originAddressId,
        dui: updateDto.dui,
        state: updateDto.state,
      };
      for (const [key, value] of Object.entries(fields)) {
        if (value !== undefined) scholarData[key] = value;
      }
      if (Object.keys(scholarData).length) {
        await prisma.scholars.update({
          where: { id },
          data: scholarData,
        });
      }

      // 4. Update phone numbers (replace full list if provided)
      if (updateDto.phoneNumbers) {
        // Optional: delete removed phones or handle diff
        for (const phone of updateDto.phoneNumbers) {
          if (phone.id) {
            await prisma.scholar_phone_numbers.update({
              where: { id: phone.id },
              data: { number: phone.number, is_current: phone.isCurrent },
            });
          } else {
            await prisma.scholar_phone_numbers.create({
              data: {
                scholar_id: _scholar.id,
                number: phone.number,
                is_current: phone.isCurrent,
              },
            });
          }
        }
      }

      // 5. Logbook entry
      await prisma.scholars_logbook.create({
        data: {
          scholar_id: id,
          log: 'Scholar information updated',
          created_by: updatedBy.id,
          created_at: new Date(),
          date: new Date(),
        },
      });

      // 6. Return updated scholar
      return prisma.scholars.findUnique({
        where: { id },
        include: {
          users_scholars_user_idTousers: true,
          scholar_addresses_scholars_current_addressToscholar_addresses: true,
          scholar_addresses_scholars_origin_addressToscholar_addresses: true,
          scholar_phone_numbers: true,
          banks: true,
          scholars_logbook: true,
        },
      });
    });
  }

  async findAll(
    queryDto: SearchQueryDto,
  ): Promise<PaginationResultDto<ScholarsDto>> {
    const { skip, take, where, orderBy, pageIndex, pageSize } =
      buildPaginationOptions(
        queryDto,
        this.buildScholarWhere,
        this.buildScholarOrder,
      );

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
        scholar_addresses_scholars_current_addressToscholar_addresses: {
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
        scholar_addresses_scholars_origin_addressToscholar_addresses: {
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
        scholar_phone_numbers: true,
        banks: true,
        users_scholars_user_idTousers: true,
      },
    });

    return EnhancedScholarsDto.fromPrisma(scholar);
  }

  async findOneByUserId(user_id: string) {
    const scholar = await this.prismaService.scholars.findFirstOrThrow({
      where: { user_id },
      include: {
        scholar_addresses_scholars_current_addressToscholar_addresses: {
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
        scholar_addresses_scholars_origin_addressToscholar_addresses: {
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
        scholar_phone_numbers: true,
        banks: true,
        users_scholars_user_idTousers: true,
      },
    });

    return EnhancedScholarsDto.fromPrisma(scholar);
  }

  // NOTE: this service shall only be used in dev
  async remove(id: string): Promise<void> {
    const scholar = await this.findOne(id);

    await this.prismaService.$transaction(async (prisma) => {
      // DLETE AUTH USER
      await this.authService.delete(scholar.user_id);

      // 1. Delete scholar <-> phone number links and orphan phone numbers
      await prisma.scholar_phone_numbers.deleteMany({
        where: { scholar_id: id },
      });

      // 2. Delete scholar logbook entries
      await prisma.scholars_logbook.deleteMany({
        where: { scholar_id: id },
      });

      // 3. Delete scholar record
      await prisma.scholars.delete({
        where: { id },
      });

      // 4. Delete the associated public user
      await prisma.public_users.delete({
        where: { id: scholar.user_id },
      });
    });
  }

  // NOTE: this service shall only be used in dev
  async deleteAllScholars() {
    return await this.prismaService.$transaction(async (prisma) => {
      // 1. Eliminar registros relacionados (orden es importante)
      await prisma.scholar_phone_numbers.deleteMany({});
      await prisma.scholars_logbook.deleteMany({});

      // 2. Eliminar los scholars
      await prisma.scholars.deleteMany({});

      // Puedes eliminar direcciones si solo se usan por los scholars (cuida si hay foreign keys en cascada)
      await prisma.scholar_addresses.deleteMany({});

      // 3. Eliminar los usuarios relacionados (opcional, si solo los usan los scholars)
      await prisma.public_users.deleteMany({
        where: {
          roles: {
            has: RoleEnum.SCHOLAR,
          },
        },
      });

      return {
        message: 'All scholars and related data were deleted successfully',
      };
    });
  }

  async removePhoneNumber(scholar_id: string, id: number): Promise<void> {
    await this.prismaService.scholar_phone_numbers.findFirstOrThrow({
      where: { id, scholar_id },
    });
    await this.prismaService.scholar_phone_numbers.delete({ where: { id } });
  }

  private async createOrUpdateAddress(
    prisma: Prisma.TransactionClient,
    existingAddressId: number | null,
    addressDto: CreateAddressDto,
    userId: string,
    isCurrent = false,
  ): Promise<number> {
    if (existingAddressId) {
      await prisma.scholar_addresses.update({
        where: { id: existingAddressId },
        data: {
          street_line_1: addressDto.streetLine1,
          street_line_2: addressDto.streetLine2,
          district_id: addressDto.districtId,
          is_urban: addressDto.isUrban,
          is_current: isCurrent,
        },
      });
      return existingAddressId;
    }

    const newAddress = await prisma.scholar_addresses.create({
      data: {
        street_line_1: addressDto.streetLine1,
        street_line_2: addressDto.streetLine2,
        district_id: addressDto.districtId,
        is_urban: addressDto.isUrban,
        is_current: isCurrent,
        created_at: new Date(),
        created_by: userId,
      },
    });

    return newAddress.id;
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
        {
          users_scholars_user_idTousers: {
            last_name: {
              contains: query,
              mode: 'insensitive',
            },
          },
        },
        {
          users_scholars_user_idTousers: {
            ref_code: {
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

  private buildScholarOrder = (key?: string, order: 'asc' | 'desc' = 'asc') => {
    if (!key) return undefined;

    if (publicUserFields.includes(key as any)) {
      return {
        users_scholars_user_idTousers: {
          [key]: order,
        },
      };
    }

    if (scholarFields.includes(key as any)) {
      return {
        [key]: order,
      };
    }

    throw new BadRequestException('Order key does not exists');
  };
}
